namespace flagwind {
    export interface IMapService {

        // #region 图层

        createTiledLayer(options: { url: string; id: string }): any;
        createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer>;
        clearLayer(layer: any): void;
        removeLayer(layer: any, map: any): void;
        addLayer(layer: any, map: any): void;
        showLayer(layer: any): void;
        hideLayer(layer: any): void;

        //#endregion

        //#region 要素

        getGraphicListByLayer(lay: any): Array<any>;

        createGraphicsLayer(options: any): any;

        removeGraphic(graphic: any, layer: any): void;

        addGraphic(graphic: any, layer: any): void;

        showGraphic(graphic: any): void;

        hideGraphic(graphic: any): void;

        setGeometryByGraphic(graphic: any, geometry: any): void;

        setSymbolByGraphic(graphic: any, symbol: any): void;

        createMarkerSymbol(options: any): any;

        getGraphicAttributes(graphic: any): any;

        //#endregion

        //#region 地图
        addEventListener(target: any, eventName: string, callback: Function): void;

        centerAt(point: any, map: any): void;

        createPoint(options: any): any;

        createSpatial(wkid: any): any;

        getInfoWindow(map: any): any;

        // showInfoWindow(map: any): void;

        // hideInfoWindow(map: any): void;

        formPoint(point: any, flagwindMap: FlagwindMap): { longitude: number; latitude: number };

        toPoint(item: any, flagwindMap: FlagwindMap): any;

        createMap(setting: IMapSetting, flagwindMap: FlagwindMap): any;

        createContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }, flagwindMap: FlagwindMap): void;

        showTitle(graphic: any, flagwindMap: FlagwindMap): void;

        hideTitle(flagwindMap: FlagwindMap): void;

        //#endregion

        // #region 轨迹

        setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: { points: Array<any>; spatial: any }, segment: TrackSegment): void;

        setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: { polyline: any; length: number }, segment: TrackSegment): void;

        solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;

        solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;

        getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): any;

        getStandardStops(name: string, stops: Array<any>): Array<any>;

        showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): any;

        //#endregion
    }

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
