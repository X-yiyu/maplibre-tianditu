# MapLibre-Tianditu AGENTS.md

## 项目概要

MapLibre GL + 天地图瓦片服务集成库。轻量级封装，支持矢量、影像、地形等底图及注记。

---

## 开发工作流

### 构建与运行

```bash
npm install              # 安装依赖
npm run dev              # 启动开发服务器 (http://localhost:3000)
npm run build            # 生产构建 (UMD + ESM)
npm run preview          # 预览构建结果
```

### 环境配置

1. **天地图 API Key**: 从 [天地图控制台](https://console.tianditu.gov.cn/) 申请
2. **国内代理**: 如需推送代码，先设置镜像：
   ```bash
   git remote set-url origin https://ghproxy.net/https://github.com/X-yiyu/maplibre-tianditu.git
   ```

### 构建产物

```
dist/
├── maplibre-tianditu.css      # CSS 样式
├── maplibre-tianditu.es.js    # ESM 模块
└── maplibre-tianditu.umd.js   # UMD (浏览器) 版本
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器，自动托管 demo.html |
| `npm run build` | TypeScript 编译 + Vite 打包 (UMD + ESM) |
| `npm run preview` | 服务构建后的 dist 目录 |

---

## 导入方式

**Node.js / 构建工具:**
```javascript
import { createTianDiTuMap } from "@cdxyy/maplibre-tianditu";
import "@cdxyy/maplibre-tianditu/dist/maplibre-tianditu.css";
const manager = createTianDiTuMap({ 
  container: "map", 
  tiandituKey: "你的密钥", 
  serviceType: ["vec", "cva"],
  center: [104.0665, 30.657],
  zoom: 9,
});
```

**浏览器 (UMD):**
```html
<script src="/dist/maplibre-tianditu.umd.js"></script>
<link href="/dist/maplibre-tianditu.css" rel="stylesheet" />
const manager = MaplibreTDT.createTianDiTuMap({ 
  container: "map", 
  tiandituKey: "你的密钥", 
  serviceType: ["vec", "cva"],
  center: [104.0665, 30.657],
  zoom: 9,
});
```

---

## 核心方法

| 方法 | 说明 |
|------|------|
| `waitForLoad()` | 等待地图加载完成 |
| `addMarker([lng, lat])` | 添加标注点 |
| `removeMarker()` | 移除标注点 |
| `flyTo(options)` | 飞行动画到指定位置 |
| `jumpTo(options)` | 立即跳转到指定位置 |
| `setCenter(center)` | 设置中心点 |
| `setZoom(zoom)` | 设置缩放级别 |
| `getGeocode(address)` | 正向地理编码 (地址→坐标) |
| `getReverseGeocode(lng, lat)` | 反向地理编码 (坐标→地址) |
| `search(postStr)` | POI 搜索（自动补默认值: level=10, queryType=1, mapBound=全国） |
| `loadIcons(icons)` | 预加载图标到地图样式 |
| `getMapInstance()` | 获取底层 MapLibre 实例 |
| `destroy()` | 销毁地图，释放资源 |

---

## 天地图服务类型

- `vec` - 矢量底图
- `img` - 影像底图
- `ter` - 地形底图
- `cia` - 影像注记
- `cta` - 地形注记
- `cva` - 矢量注记

---

## 代码约定

- **错误处理**: 工具类使用 `_request(params, errorLabel)` 模式，Manager 层统一调用 `_handleError(error, "操作名")`
- **导入**: API 模块使用默认导出（Geocoder、MapSearch），核心类使用具名导出
- **类型**: 外部暴露的类型统一在 `src/types/index.ts` 中定义，内部类型在各模块内定义
- **构建**: UMD 全局名称为 `MaplibreTDT`，入口为 `src/lib/index.ts`

---

## 重要注意事项

1. **天地图 API Key**: 必须从 [天地图控制台](https://console.tianditu.gov.cn/) 申请，不能随意使用
2. **坐标系**: 默认 WGS84，GCJ02 需自定义源配置
3. **跨域**: 天地图 API 支持跨域，可直接浏览器使用
4. **搜索 API 默认值**: `search()` 未传入 `level`、`mapBound`、`queryType` 时会自动补默认值
5. **开发时**: 务必设置 `--host` 参数，否则只能本地访问

---

## 项目结构

```
src/
├── lib/
│   ├── core/         # TianDiTuMapManager, types
│   ├── sources/      # WMTS 源配置 (tianditu.ts)
│   ├── tdt-api/      # 地理编码 (Geocoder) 和搜索 API (MapSearch)
│   └── index.ts      # 统一导出入口
├── types/            # TiandituResponse 等公共类型
├── AGENTS.md         # 本文件
├── demo.html         # 全功能演示页面
├── vite.config.ts    # 构建配置 (UMD + ESM)
└── README.md         # 完整文档，含 API 参考
```

---

## 已有文档

- [`README.md`](./README.md) - 完整文档，含 API 参考和示例
- [`LICENSE`](./LICENSE) - BSD-3-Clause 许可证
