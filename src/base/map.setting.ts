namespace flagwind {
    export interface IMapSetting {
        mapType: String;
        wkid: number; // 生产环境使用
        extent: Array<number>;
        units: number;// 用于地图距离求解单位控件参数
        center: Array<number>; // 中心坐标
        wkidFromApp: number; // app中使用的空间投影（允许业务中使用的投影与地图的不一样，程序会自动转换）
        minZoom: number;
        maxZoom: number;
        zoom: number;
        logo: boolean;  // 是否显示logo
        slider: boolean; // 是否显示放大缩小按钮
        sliderPosition: string;
    }
}
