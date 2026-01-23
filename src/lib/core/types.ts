import { type TDTServiceType } from '../sources/tianditu';
import { type MapOptions } from 'maplibre-gl';

export interface TianDiTuMapOptions extends Omit<MapOptions, 'style' | 'container'> {
    /** 天地图API密钥 (必须) */
    tiandituKey: string;
    /** 天地图服务类型，默认矢量地图 */
    serviceType?: TDTServiceType | TDTServiceType[];
    /** 初始中心点 [经度, 纬度]，默认北京 */
    center?: [number, number];
    /** 初始缩放级别，默认10 */
    zoom?: number;
}
