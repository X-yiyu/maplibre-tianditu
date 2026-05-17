import { TiandituResponse } from '../../types';

// 正向地理编码结果类型
export interface GeocodeResult {
    location: {
        lng: number;
        lat: number;
        level?: string;
        score?: number;
        keyWord?: string;
    };
    address: string;
    searchVersion?: string;
}

// 逆地理编码结果类型
export interface ReverseGeocodeResult {
    location: {
        lng: number;
        lat: number;
    };
    address: string;
    addressComponent: {
        address: string;//此点最近地点信息
        address_distince: number;//此点距离最近地点信息距离
        address_position: string;//此点在最近地点信息方向
        city: string;//此点所在国家或城市或区县
        poi: string;//距离此点最近poi点
        poi_distince: number;//距离此点最近poi点的距离
        poi_position: string;//此点在最近poi点的方向
        road: string;//距离此点最近的路
        road_distince: number//此点距离此路的距离
    };
}

export interface GeocoderOptions {
    tk: string,
    url?: string
}

export class Geocoder {
    private tk: string;
    private baseURL: string;

    constructor(options: GeocoderOptions) {
        this.tk = options.tk;
        this.baseURL = options.url ?? 'https://api.tianditu.gov.cn/geocoder';
    }

    private async _request(params: URLSearchParams, errorLabel: string): Promise<TiandituResponse> {
        try {
            const response = await fetch(`${this.baseURL}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }
            const data: TiandituResponse = await response.json();
            return data;
        } catch (error) {
            console.error(`${errorLabel}请求失败:`, error);
            throw new Error(`${errorLabel}失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    // 地址 -> 坐标（正向地理编码）
    async getGeocode(address: string): Promise<TiandituResponse> {
        const params = new URLSearchParams({
            ds: JSON.stringify({ keyWord: address }),
            tk: this.tk
        });
        return await this._request(params, '地理编码');
    }

    // 坐标 -> 地址（逆地理编码）
    async getReverseGeocode(lng: number | string, lat: number | string): Promise<TiandituResponse> {
        const params = new URLSearchParams({
            postStr: JSON.stringify({
                lon: Number(lng).toFixed(6),
                lat: Number(lat).toFixed(6),
                ver: 1,
            }),
            type: 'geocode',
            tk: this.tk,
        });
        return await this._request(params, '逆地理编码');
    }

    // 静态方法：创建实例
    static create(options: GeocoderOptions): Geocoder {
        return new Geocoder(options);
    }
}

export default Geocoder;
