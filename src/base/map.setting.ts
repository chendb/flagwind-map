namespace flagwind {
    export interface IMapSetting {
        baseUrl: string;
        mapDomain: string;
        mapVersion: string;
        accessToken: string;
        arcgisApi: string;
        wkid: number; // 生产环境使用
        routeUrl: string;
        extent: Array<number>;
        // 测试环境配置
        basemap: string; // 底图服务（优先级0）
        webTiledUrl: string;
        units: number;// 用于地图距离求解单位控件参数
        center: Array<number>; // 中心坐标
        wkidFromApp: number; // app中使用的空间投影（允许业务中使用的投影与地图的不一样，程序会自动转换）
        is25D: boolean; // 是否为2.5D地图
        minZoom: number;
        maxZoom: number;
        zoom: number;
        logo: boolean;  // 是否显示logo
        slider: boolean; // 是否显示放大缩小按钮
    }
}
