import maplibregl, {
  Map,
  type MapOptions,
  Marker,
  type StyleSpecification,
  type LngLatLike,
  type MarkerOptions,
  type MapEventType,
  type MapMouseEvent,
  type MapTouchEvent,
  type MapGeoJSONFeature,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createTianDiTuSource, type TDTServiceType } from "../sources/tianditu";
import Geocoder from "../tdt-api/geocoder";
import MapSearch, { type MapSearchPostStr } from "../tdt-api/search";
import { type TiandituResponse } from "../../types";

// ==================== 类型定义 ====================

export interface TianDiTuMapOptions extends Omit<
  MapOptions,
  "style" | "center"
> {
  /** 天地图API密钥 (必须) */
  tiandituKey: string;
  /** 天地图服务类型，默认矢量地图 */
  serviceType?: TDTServiceType | TDTServiceType[];
  /** 初始中心点 [经度, 纬度]，默认成都 */
  center?: [number, number];
  /** 初始缩放级别，默认10 */
  zoom?: number;
  /** 地图编码URL */
  geocoderUrl?: string;
  /** 地图搜索URL */
  searchUrl?: string;
}

export interface IconConfig {
  /** 图标id */
  id: string;
  /** 图标所在的路径 */
  url: string;
}

export type EventCallback<T extends keyof MapEventType> = (
  ev: MapEventType[T],
) => void;

export type LayerEventCallback<T extends keyof MapEventType> = (
  ev: MapEventType[T] & { features?: MapGeoJSONFeature[] },
) => void;

// ==================== 主类 ====================

export class TianDiTuMapManager {
  public readonly map: Map;
  private _marker: Marker | null = null;
  public readonly geocoder: Geocoder;
  public readonly mapSearch: MapSearch;

  /** 事件监听代理，完全保持 Map 的 on 方法类型 */
  public readonly on: Map["on"];

  /** 成都中心坐标常量 */
  private static readonly DEFAULT_CENTER: [number, number] = [104.0665, 30.657];
  private static readonly DEFAULT_ZOOM = 10;

  private static _handleError(error: unknown, operation: string): never {
    console.error(`${operation}失败:`, error);
    throw new Error(
      `${operation}失败：${error instanceof Error ? error.message : String(error)}`,
    );
  }

  constructor(options: TianDiTuMapOptions) {
    const {
      container,
      tiandituKey,
      serviceType = "vec",
      center = TianDiTuMapManager.DEFAULT_CENTER,
      zoom = TianDiTuMapManager.DEFAULT_ZOOM,
      geocoderUrl,
      searchUrl,
      ...mapOptions
    } = options;

    // 验证必要参数
    if (!tiandituKey || tiandituKey.trim() === "") {
      throw new Error("天地图API密钥(tiandituKey)是必需的");
    }

    if (!container) {
      throw new Error("地图容器(container)是必需的");
    }

    // 构建地图样式并初始化
    const style = this.buildStyle(tiandituKey, serviceType);

    this.map = new maplibregl.Map({
      container,
      style,
      center,
      zoom,
      attributionControl: false, // 天地图可能有自己的版权信息
      ...mapOptions,
    });

    // 初始化API客户端
    this.geocoder = new Geocoder({
      tk: tiandituKey,
      url: geocoderUrl,
    });

    this.mapSearch = new MapSearch({
      tk: tiandituKey,
      url: searchUrl,
    });

    // 绑定事件方法
    this.on = this.map.on.bind(this.map);
  }

  // ==================== 地图样式管理 ====================

  /** 构建包含天地图源的地图样式 */
  private buildStyle(
    key: string,
    serviceType: TDTServiceType | TDTServiceType[],
  ): StyleSpecification {
    const types = Array.isArray(serviceType) ? serviceType : [serviceType];

    const sources: Record<string, maplibregl.SourceSpecification> = {};
    const layers: maplibregl.LayerSpecification[] = [];

    types.forEach((type) => {
      const sourceId = `tdt-${type}`;
      sources[sourceId] = createTianDiTuSource(key, type);

      layers.push({
        id: `tdt-layer-${type}`,
        type: "raster",
        source: sourceId,
        layout: {
          visibility: "visible",
        },
      });
    });

    return {
      version: 8,
      sources,
      layers,
    };
  }

  // ==================== 公共方法 ====================

  /** 等待地图加载完成 */
  public waitForLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.map.loaded()) {
        resolve();
      } else {
        const onLoad = () => {
          this.map.off("error", onError);
          resolve();
        };
        const onError = (e: Error) => {
          this.map.off("load", onLoad);
          reject(new Error(`地图加载失败: ${e.message}`));
        };
        this.map.once("load", onLoad);
        this.map.once("error", onError);
      }
    });
  }

  /** 添加标注点 */
  public addMarker(coordinates: LngLatLike, options?: MarkerOptions): Marker {
    try {
      this.removeMarker();

      this._marker = new maplibregl.Marker({
        color: "#FF0000",
        draggable: false,
        ...options,
      })
        .setLngLat(coordinates)
        .addTo(this.map);

      return this._marker;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "添加标记");
    }
  }

  /** 获取当前标记 */
  public getMarker(): Marker | null {
    return this._marker;
  }

  /** 移除标记 */
  public removeMarker(): void {
    try {
      if (this._marker) {
        this._marker.remove();
        this._marker = null;
      }
    } catch (error) {
      console.warn("移除标记失败:", error);
    }
  }

  /** 预加载图标到地图样式 */
  public async loadIcons(icons: IconConfig[]): Promise<void> {
    try {
      await this.waitForLoad();

      const loadPromises = icons.map(async (icon) => {
        try {
          const image = await this.map.loadImage(icon.url);
          this.map.addImage(icon.id, image.data);
        } catch (error) {
          console.warn(`图标加载失败: ${icon.id}`, error);
        }
      });

      await Promise.all(loadPromises);
    } catch (error) {
      console.error("图标加载失败:", error);
      throw error;
    }
  }

  // ==================== 地理编码相关 ====================

  /** 地理编码：地址转坐标 */
  public async getGeocode(address: string): Promise<TiandituResponse> {
    if (!address?.trim()) {
      throw new Error("地址不能为空");
    }
    try {
      return await this.geocoder.getGeocode(address);
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "地理编码");
    }
  }

  /** 反地理编码：坐标转地址 */
  public async getReverseGeocode(
    lng: number | string,
    lat: number | string,
  ): Promise<TiandituResponse> {
    const longitude = typeof lng === "string" ? parseFloat(lng) : lng;
    const latitude = typeof lat === "string" ? parseFloat(lat) : lat;

    if (isNaN(longitude) || isNaN(latitude)) {
      throw new Error("无效的坐标参数");
    }
    try {
      return await this.geocoder.getReverseGeocode(longitude, latitude);
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "反向地理编码");
    }
  }

  /** 地图搜索 */
  public async search(postStr: MapSearchPostStr): Promise<TiandituResponse> {
    try {
      return await this.mapSearch.search(postStr);
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "地图搜索");
    }
  }

  // ==================== 视图控制 ====================

  /** 飞行动画到指定位置 */
  public flyTo(options: maplibregl.FlyToOptions): this {
    try {
      this.map.flyTo(options);
      return this;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "飞行动画");
    }
  }

  /** 跳转到指定位置 */
  public jumpTo(options: maplibregl.JumpToOptions): this {
    try {
      this.map.jumpTo(options);
      return this;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "跳转");
    }
  }

  /** 设置中心点 */
  public setCenter(center: [number, number]): this {
    try {
      this.map.setCenter(center);
      return this;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "设置中心点");
    }
  }

  /** 设置缩放级别 */
  public setZoom(zoom: number): this {
    try {
      this.map.setZoom(zoom);
      return this;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "设置缩放级别");
    }
  }

  /** 添加点击事件监听器（便捷方法） */
  public onClick(
    callback: (ev: MapMouseEvent) => void,
    layerId?: string,
  ): this {
    try {
      if (layerId) {
        this.map.on("click", layerId, callback);
      } else {
        this.map.on("click", callback);
      }
      return this;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "绑定点击事件");
    }
  }

  /** 添加触摸事件监听器 */
  public onTouch(
    callback: (ev: MapTouchEvent) => void,
    layerId?: string,
  ): this {
    try {
      if (layerId) {
        this.map.on("touchstart", layerId, callback);
      } else {
        this.map.on("touchstart", callback);
      }
      return this;
    } catch (error) {
      return TianDiTuMapManager._handleError(error, "绑定触摸事件");
    }
  }

  /** 移除事件监听器 */
  public off<K extends keyof MapEventType>(
    type: K,
    listener: (ev: MapEventType[K]) => void,
  ): this;
  public off<K extends keyof MapEventType>(
    type: K,
    layerId: string,
    listener: (ev: MapEventType[K]) => void,
  ): this;
  public off(type: any, layerIdOrListener: any, listener?: any): this {
    if (listener) {
      this.map.off(type, layerIdOrListener, listener);
    } else {
      this.map.off(type, layerIdOrListener);
    }
    return this;
  }

  /** 获取底层 MapLibre 实例 */
  public getMapInstance(): Map {
    return this.map;
  }

  /** 销毁地图，释放资源 */
  public destroy(): void {
    try {
      this.removeMarker();
      this.map.remove();
    } catch (error) {
      TianDiTuMapManager._handleError(error, "销毁地图");
    }
  }

  /** 别名：销毁地图 */
  public remove(): void {
    this.destroy();
  }
}
