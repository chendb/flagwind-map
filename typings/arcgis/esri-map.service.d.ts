declare let esri: any;
declare let dojo: any;
declare let dijit: any;
declare namespace flagwind {
    class EsriMapService implements IMapService {
        ROUTE_MAP: Map<FlagwindRouteLayer, EsriRouteService>;
        GRAPHIC_SYMBOL_MAP: Map<any, any>;
        getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): any;
        getStandardStops(name: string, stops: Array<any>): Array<any>;
        showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;
        solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;
        setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: {
            points: Array<any>;
            spatial: any;
        }, segment: TrackSegment): void;
        setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: {
            polyline: any;
            length: number;
        }, segment: TrackSegment): void;
        createMarkerSymbol(options: any): any;
        showTitle(graphic: any, flagwindMap: FlagwindMap): void;
        hideTitle(flagwindMap: FlagwindMap): void;
        createTiledLayer(options: {
            url: string;
            id: string;
        }): any;
        clearLayer(layer: any): void;
        removeLayer(layer: any, map: any): void;
        addLayer(layer: any, map: any): void;
        showLayer(layer: any): void;
        hideLayer(layer: any): void;
        getGraphicListByLayer(lay: any): Array<any>;
        createGraphicsLayer(options: any): any;
        removeGraphic(graphic: any, layer: any): void;
        addGraphic(graphic: any, layer: any): void;
        showGraphic(graphic: any): void;
        hideGraphic(graphic: any): void;
        setGeometryByGraphic(graphic: any, geometry: any): void;
        setSymbolByGraphic(graphic: any, symbol: any): void;
        getGraphicAttributes(graphic: any): any;
        addEventListener(target: any, eventName: string, callback: Function): void;
        centerAt(map: any, point: any): void;
        createPoint(options: any): any;
        createSpatial(wkid: any): any;
        getInfoWindow(map: any): any;
        hideInfoWindow(map: any): void;
        formPoint(point: any, flagwindMap: FlagwindMap): {
            longitude: number;
            latitude: number;
        };
        toPoint(item: any, flagwindMap: FlagwindMap): any;
        createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer>;
        createMap(setting: IMapSetting, flagwindMap: FlagwindMap): any;
        createContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }, flagwindMap: FlagwindMap): void;
        /**
         * 获取菜单单击的坐标信息
         *
         * @param {any} box
         * @returns {*}
         * @memberof FlagwindMap
         */
        protected getMapPointFromMenuPosition(box: any, map: any): any;
        /**
         * tileInfo必须是单例模式，否则地图无法正常显示
         *
         * @returns
         * @memberof FlagwindMap
         */
        protected getTileInfo(flagwindMap: FlagwindMap): any;
    }
}
