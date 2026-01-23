import { type TDTServiceType } from './../lib/sources/tianditu';
import { type MapOptions } from 'maplibre-gl';
export type * from 'maplibre-gl';

// 天地图API响应基础类型
export interface TiandituResponse {
    status: string;
    msg: string;
    [key: string]: any;
}

export interface TianDiTuMapOptions extends Omit<MapOptions, 'style'> {
    /** 天地图API密钥 (必须) */
    tiandituKey: string;
    /** 天地图服务类型，默认矢量地图 */
    serviceType?: TDTServiceType | TDTServiceType[];
    /** 初始中心点 [经度, 纬度] */
    center?: [number, number];
    /** 初始缩放级别，默认10 */
    zoom?: number;
    /** 地图编码URL */
    geocoderUrl?: string;

}

export * from "./../lib/tdt-api/search"


export { TDTServiceType }

