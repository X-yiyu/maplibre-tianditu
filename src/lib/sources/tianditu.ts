// 天地图服务类型
export type TDTServiceType = 'vec' | 'img' | 'ter' | 'cia' | 'cta' | 'cva';

/**
 * 创建天地图服务源（Source）配置
 * @param key 天地图API密钥（tk）
 * @param type 服务类型: 'vec'(矢量), 'img'(影像), 'ter'(地形), 'cia'(影像注记), 'cta'(矢量注记)
 * @param options 其他选项，如子域名、坐标系等
 * @returns MapLibre GL 兼容的 Source 配置对象
 */
export function createTianDiTuSource(
    key: string,
    type: TDTServiceType = 'vec',
    options: {
        subdomains?: string[];
        coordinateSystem?: 'wgs84' | 'gcj02';
    } = {}
) {
    const { subdomains = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'], coordinateSystem = 'wgs84' } = options;

    // 定义服务类型与图层名的映射
    const layerMap: Record<TDTServiceType, string> = {
        vec: 'vec',
        img: 'img',
        ter: 'ter',
        cia: 'cia',
        cta: 'cta',
        cva: 'cva'
    };

    const layerName = layerMap[type];
    const domain = coordinateSystem === 'gcj02' ? 't1.tianditu.gov.cn' : '{s}.tianditu.gov.cn';

    return {
        type: 'raster' as const,
        tiles: subdomains.map(s =>
            `//${domain.replace('{s}', s)}/${layerName}_w/wmts?` +
            `SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&` +
            `LAYER=${layerName}&STYLE=default&TILEMATRIXSET=w&` +
            `FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
        ),
        tileSize: 256,
    };
}
