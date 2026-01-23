# maplibre-tianditu

简单集成了 maplibre-gl 和天地图瓦片服务.

## 快速开始

### Node.js:

```shell
$ npm i --save maplibre-tianditu
```

```javascript
import { createTianDiTuMap } from "maplibre-tianditu";
import "maplibre-tianditu/dist/maplibre-tianditu.css";
var mapManager = createTianDiTuMap({
  container: "maplibre-map", // 对应模板中的div id
  tiandituKey: "你的天地图密钥", //
  serviceType: ["vec", "cva"], //矢量底图+矢量注记
  center: [104.0665, 30.657],
  zoom: 9,
  minZoom: 3,
  maxZoom: 18,
});
var map = mapManager.map;
```

### HTML

在你的 HTML 文件的 `<head>` 中包含 JavaScript 和 CSS 文件。

```html
<script src="/dist/maplibre-tianditu.umd.js"></script>
<link href="/dist/maplibre-tianditu.css" rel="stylesheet" />
```

```html
<script>
  var mapManager = MaplibreTDT.createTianDiTuMap({
    container: "maplibre-map", // 对应模板中的div id
    tiandituKey: "你的天地图密钥", //
    serviceType: ["vec", "cva"], //矢量底图+矢量注记
    center: [104.0665, 30.657],
    zoom: 9,
    minZoom: 3,
    maxZoom: 18,
  });
  var map = mapManager.map;
</script>
```

## API

### createTianDiTuMap 的参数

| 参数名      | 解释说明                                                            |
| ----------- | ------------------------------------------------------------------- |
| tiandituKey | 天地图的 key，需要自己申请。                                        |
| serviceType | ['vec','cva'] 或者'vec'\| 'img' \| 'ter' \| 'cia' \| 'cta' \| 'cva' |
| 其他        | **[maplibre-gl](https://maplibre.org/maplibre-gl-js/docs/API/)**    |
