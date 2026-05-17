import { type TDTServiceType } from './../lib/sources/tianditu';
export type * from 'maplibre-gl';

// 天地图API响应基础类型
export interface TiandituResponse {
    status: string;
    msg: string;
    [key: string]: any;
}

export * from "./../lib/tdt-api/search"


export { TDTServiceType }

