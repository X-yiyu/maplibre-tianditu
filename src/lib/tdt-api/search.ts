import { TiandituResponse } from '../../types';

export interface MapSearchPostStr {
    keyWord: string,//搜索的关键字
    mapBound?: string,//查询的地图范围(“minx,miny,maxx,maxy”),-180,-90至180,90。
    level?: string,//目前查询的级别1-18级
    specify?: string,//指定行政区的国标码（行政区划编码表）严格按照行政区划编码表中的（名称，gb码）。如指定的行政区划编码是省以上级别则返回是统计数据（不包括直辖市）
    queryRadius?: string,//查询半径,单位:米 （10公里内）
    pointLonlat?: string,//点坐标,中心点，经纬度坐标
    queryType?: string,//搜索类型1:普通搜索（含地铁公交） 7：地名搜索
    start: string,//返回结果起始位（用于分页和缓存）默认0
    count: string,//返回的结果数量（用于分页和缓存）
    dataTypes?: string,//数据分类（分类编码表）
    show?: string,//返回poi结果信息类别
}

export interface MapSearchOptions {
    tk: string,
    url?: string
}

export default class MapSearch {
    private tk: string;
    private baseURL: string;

    constructor(options: MapSearchOptions) {
        this.tk = options.tk;
        this.baseURL = options.url ?? 'http://api.tianditu.gov.cn/v2/search';
    }
    public async search(postStr: MapSearchPostStr): Promise<TiandituResponse> {
        const params = new URLSearchParams({
            postStr: JSON.stringify(postStr),
            type: 'query',
            tk: this.tk,
        });
        try {
            const url = `${this.baseURL}?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }
            const data: TiandituResponse = await response.json();
            return data;
        } catch (error) {
            console.error('搜索请求失败:', error);
            throw new Error(`搜索请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
}
