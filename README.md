# @cdxyy/maplibre-tianditu

简单集成了 [maplibre-gl](https://maplibre.org/) 和天地图瓦片服务，提供便捷的地图初始化、地理编码、POI 搜索等功能。

## 特性

- 支持天地图多种底图类型（矢量、影像、地形及对应注记）
- 封装了地理编码（正向/反向）和 POI 搜索 API
- 提供便捷的标记点管理、视图控制、事件监听
- 完整的 TypeScript 类型支持
- 支持 UMD 和 ESM 两种模块格式

## 安装

```shell
npm i --save @cdxyy/maplibre-tianditu
```

## 快速开始

### Node.js / 构建工具

```javascript
import { createTianDiTuMap } from "@cdxyy/maplibre-tianditu";
import "@cdxyy/maplibre-tianditu/dist/maplibre-tianditu.css";

const mapManager = createTianDiTuMap({
  container: "maplibre-map", // 可传入 DOM 元素或 div 的 id
  tiandituKey: "你的天地图密钥",
  serviceType: ["vec", "cva"], // 矢量底图 + 矢量注记
  center: [104.0665, 30.657],
  zoom: 9,
  minZoom: 3,
  maxZoom: 18,
});

// 获取底层 MapLibre 实例
const map = mapManager.map;
```

### HTML 直接引用

在你的 HTML 文件的 `<head>` 中包含 JavaScript 和 CSS 文件：

```html
<script src="/dist/maplibre-tianditu.umd.js"></script>
<link href="/dist/maplibre-tianditu.css" rel="stylesheet" />
```

```html
<script>
  var mapManager = MaplibreTDT.createTianDiTuMap({
    container: "maplibre-map",
    tiandituKey: "你的天地图密钥",
    serviceType: ["vec", "cva"],
    center: [104.0665, 30.657],
    zoom: 9,
    minZoom: 3,
    maxZoom: 18,
  });
  var map = mapManager.map;
</script>
```

## API 文档

### createTianDiTuMap(options)

创建并返回一个 `TianDiTuMapManager` 实例。

#### 参数

| 参数名       | 类型                          | 必填 | 默认值          | 说明                                       |
| ------------ | ----------------------------- | ---- | --------------- | ------------------------------------------ |
| container    | `string \| HTMLElement`       | 是   | -               | 地图容器，可传入 DOM 元素或 div 的 id      |
| tiandituKey  | `string`                      | 是   | -               | 天地图 API 密钥（需自行申请）              |
| serviceType  | `TDTServiceType \| TDTServiceType[]` | 否 | `'vec'` | 底图类型，见下方服务类型表                 |
| center       | `[number, number]`            | 否   | `[104.0665, 30.657]` | 初始中心点 [经度, 纬度]，默认成都          |
| zoom         | `number`                      | 否   | `10`            | 初始缩放级别                               |
| geocoderUrl  | `string`                      | 否   | 天地图默认地址   | 自定义地理编码 API 地址                    |
| searchUrl    | `string`                      | 否   | 天地图默认地址   | 自定义搜索 API 地址                        |
| 其他参数     | -                             | 否   | -               | 支持所有 [maplibre-gl MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/types/MapOptions/) |

#### 天地图服务类型 (TDTServiceType)

| 类型   | 说明       |
| ------ | ---------- |
| `vec`  | 矢量底图   |
| `img`  | 影像底图   |
| `ter`  | 地形底图   |
| `cia`  | 影像注记   |
| `cta`  | 地形注记   |
| `cva`  | 矢量注记   |

### TianDiTuMapManager 实例方法

#### 地图生命周期

| 方法              | 返回值              | 说明           |
| ----------------- | ------------------- | -------------- |
| `waitForLoad()`   | `Promise<void>`     | 等待地图加载完成 |
| `destroy()`       | `void`              | 销毁地图，释放资源 |
| `remove()`        | `void`              | `destroy()` 的别名 |
| `getMapInstance()`| `Map`               | 获取底层 MapLibre 实例 |

#### 标记点管理

| 方法                              | 返回值     | 说明           |
| --------------------------------- | ---------- | -------------- |
| `addMarker(coordinates, options)` | `Marker`   | 添加标注点     |
| `getMarker()`                     | `Marker \| null` | 获取当前标记 |
| `removeMarker()`                  | `void`     | 移除标记       |

```javascript
// 添加标记
mapManager.addMarker([104.0665, 30.657], {
  color: "#FF0000",
  draggable: true,
});

// 移除标记
mapManager.removeMarker();
```

#### 图标加载

| 方法                | 返回值         | 说明           |
| ------------------- | -------------- | -------------- |
| `loadIcons(icons)`  | `Promise<void>`| 预加载图标到地图样式 |

```javascript
await mapManager.loadIcons([
  { id: "my-icon", url: "/path/to/icon.png" },
]);
```

#### 视图控制

| 方法                          | 返回值     | 说明           |
| ----------------------------- | ---------- | -------------- |
| `flyTo(options)`              | `this`     | 飞行动画到指定位置 |
| `jumpTo(options)`             | `this`     | 立即跳转到指定位置 |
| `setCenter(center)`           | `this`     | 设置中心点     |
| `setZoom(zoom)`               | `this`     | 设置缩放级别   |

```javascript
mapManager.flyTo({ center: [116.4074, 39.9042], zoom: 11, duration: 2000 });
mapManager.jumpTo({ center: [104.0665, 30.657], zoom: 10 });
mapManager.setCenter([121.4737, 31.2304]);
mapManager.setZoom(12);
```

#### 事件监听

| 方法                          | 返回值     | 说明           |
| ----------------------------- | ---------- | -------------- |
| `on`                          | `Map['on']`| 绑定地图事件（同 maplibre-gl） |
| `onClick(callback, layerId?)` | `this`     | 添加点击事件   |
| `onTouch(callback, layerId?)` | `this`     | 添加触摸事件   |
| `off(type, layerId?, listener)`| `this`    | 移除事件监听   |

```javascript
// 点击地图
mapManager.onClick((e) => {
  console.log(`经度: ${e.lngLat.lng}, 纬度: ${e.lngLat.lat}`);
});

// 点击特定图层
mapManager.onClick((e) => {
  console.log("点击了图层:", e.features);
}, "my-layer-id");

// 使用原生 on 方法
mapManager.on("mousemove", (e) => {
  console.log(e.lngLat);
});

// 移除事件
mapManager.off("click", clickHandler);
```

#### 地理编码

| 方法                              | 返回值               | 说明           |
| --------------------------------- | -------------------- | -------------- |
| `getGeocode(address)`             | `Promise<TiandituResponse>` | 正向地理编码（地址→坐标） |
| `getReverseGeocode(lng, lat)`     | `Promise<TiandituResponse>` | 反向地理编码（坐标→地址） |

```javascript
// 正向地理编码
const result = await mapManager.getGeocode("成都市天府广场");
console.log(result);

// 反向地理编码
const result = await mapManager.getReverseGeocode(104.0665, 30.657);
console.log(result);
```

#### 地图搜索

| 方法                      | 返回值               | 说明           |
| ------------------------- | -------------------- | -------------- |
| `search(postStr)`         | `Promise<TiandituResponse>` | POI 搜索 |

```javascript
const result = await mapManager.search({
  keyWord: "酒店",
  start: "0",
  count: "10",
  queryType: "1",
});
console.log(result);
```

**search 参数 (MapSearchPostStr)**

| 参数名       | 类型     | 必填 | 说明                                       |
| ------------ | -------- | ---- | ------------------------------------------ |
| keyWord      | `string` | 是   | 搜索关键字                                 |
| start        | `string` | 是   | 返回结果起始位（用于分页），默认 `0`       |
| count        | `string` | 是   | 返回结果数量                               |
| mapBound     | `string` | 否   | 查询的地图范围 `"minx,miny,maxx,maxy"`     |
| level        | `string` | 否   | 当前查询级别 1-18                          |
| specify      | `string` | 否   | 指定行政区的国标码                         |
| queryRadius  | `string` | 否   | 查询半径（米），10公里内                   |
| pointLonlat  | `string` | 否   | 中心点坐标                                 |
| queryType    | `string` | 否   | 搜索类型：`1` 普通搜索，`7` 地名搜索       |
| dataTypes    | `string` | 否   | 数据分类                                   |
| show         | `string` | 否   | 返回 POI 结果信息类别                      |

### 导出内容

```javascript
// 核心类
import { TianDiTuMapManager, createTianDiTuMap } from "@cdxyy/maplibre-tianditu";

// 天地图源创建函数
import { createTianDiTuSource } from "@cdxyy/maplibre-tianditu";

// 完整导出 maplibre-gl 的所有内容
import { Map, Marker, Popup, NavigationControl, ... } from "@cdxyy/maplibre-tianditu";
```

## 类型定义

```typescript
// 天地图服务类型
type TDTServiceType = 'vec' | 'img' | 'ter' | 'cia' | 'cta' | 'cva';

// 天地图 API 响应
interface TiandituResponse {
  status: string;
  msg: string;
  [key: string]: any;
}

// 地图配置选项
interface TianDiTuMapOptions extends Omit<MapOptions, 'style' | 'center'> {
  tiandituKey: string;
  serviceType?: TDTServiceType | TDTServiceType[];
  center?: [number, number];
  zoom?: number;
  geocoderUrl?: string;
  searchUrl?: string;
}
```

## 开发

```shell
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 注意事项

1. **天地图 API Key**：需要到 [天地图官网](https://console.tianditu.gov.cn/) 申请
2. **坐标系**：默认使用 WGS84 坐标系，如需使用 GCJ02 需自行修改源配置
3. **跨域问题**：天地图 API 支持跨域请求，可直接在浏览器中使用

## License

**@cdxyy/maplibre-tianditu** is licensed under the [3-Clause BSD license](./LICENSE).
