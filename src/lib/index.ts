// 核心类
import { TianDiTuMapManager, type TianDiTuMapOptions } from './core/MapManager';
export { TianDiTuMapManager }
export type { TianDiTuMapOptions }

import maplibregl from 'maplibre-gl';
export * from "maplibre-gl";
export { maplibregl };
// 天地图服务源
export { createTianDiTuSource } from './sources/tianditu';
export type { TDTServiceType } from './sources/tianditu';

export type { TiandituResponse, MapSearchPostStr } from "./../types";

// 为了方便使用，可以导出一个默认的快速初始化函数
export function createTianDiTuMap(options: TianDiTuMapOptions) {
    return new TianDiTuMapManager(options);
}

