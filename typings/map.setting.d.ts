declare namespace flagwind {
    interface IMapSetting {
        baseUrl: string;
        mapDomain: string;
        mapVersion: string;
        accessToken: string;
        arcgisApi: string;
        wkid: number;
        routeUrl: string;
        extent: Array<number>;
        basemap: string;
        webTiledUrl: string;
        units: number;
        center: Array<number>;
        wkidFromApp: number;
        is25D: boolean;
        minZoom: number;
        maxZoom: number;
        zoom: number;
        logo: boolean;
        slider: boolean;
    }
    /**
     * 地图配置
     *
     * @export
     * @class MapSetting
     */
    const MapSetting: any;
}
