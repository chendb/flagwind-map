declare namespace flagwind {
    /**
     * 动画对象
     */
    abstract class Animation {
        abstract updateGraphic(): void;
        readonly abstract id: string;
    }
    /**
     * 亮光动画对象
     */
    class LightingAnimation extends Animation {
        graphic: any;
        options: any;
        private _fadeIn;
        private _alpha;
        private _id;
        attributes: any;
        readonly id: string;
        constructor(item: any, graphic: any, options: any);
        updateGraphic(): void;
        getSymbol(): any;
        getColor(): any;
    }
    /**
     * 闪烁星星
     */
    class StarAnimation extends Animation {
        graphic: any;
        options: {
            height: number;
            width: number;
            images: Array<any>;
        };
        id: string;
        index: number;
        attributes: any;
        /**
         * 构造函数
         * @param {*} item 实体
         * @param {*} graphic 地图初始要素
         * @param {height:number,width:number,images:[]} options 动画属性
         */
        constructor(item: any, graphic: any, options: {
            height: number;
            width: number;
            images: Array<any>;
        });
        getRandomNum(min: number, max: number): number;
        updateGraphic(): void;
    }
    /**
     * 动画图层
     */
    class AnimationLayer {
        options: any;
        private _timer;
        animations: Array<Animation>;
        isRunning: boolean;
        constructor(options: any);
        getRandomNum(min: number, max: number): number;
        getAnimationId(id: string): Animation;
        start(): void;
        stop(): void;
        add(animation: Animation): void;
        removeAnimationById(id: string): void;
        clear(): void;
    }
}
declare namespace flagwind {
    /**
     * 底图包装类
     *
     * @export
     * @class FlagwindTiledLayer
     */
    class FlagwindTiledLayer {
        mapService: IMapService;
        id: string;
        url: string | null;
        title: string | null;
        layer: any;
        isShow: boolean;
        constructor(mapService: IMapService, id: string, url: string | null, title: string | null);
        appendTo(map: any): void;
        removeLayer(map: any): void;
        show(): void;
        hide(): void;
    }
    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    class FlagwindFeatureLayer {
        mapService: IMapService;
        id: string;
        title: string | null;
        protected layer: any;
        isShow: boolean;
        constructor(mapService: IMapService, id: string, title: string | null);
        createGraphicsLayer(options: any): any;
        readonly graphics: Array<any>;
        readonly items: Array<any>;
        appendTo(map: any): void;
        removeLayer(map: any): void;
        readonly count: number;
        clear(): void;
        show(): void;
        hide(): void;
        /**
         * 获取资源要素点
         */
        getGraphicById(key: string): any;
        /**
         * 删除资源要素点
         */
        removeGraphicById(key: string): void;
    }
    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     *
     * @export
     * @class FlagwindGroupLayer
     */
    class FlagwindGroupLayer {
        mapService: IMapService;
        id: string;
        layer: any;
        isShow: boolean;
        constructor(mapService: IMapService, id: string);
        readonly graphics: any[];
        appendTo(map: any): void;
        removeLayer(map: any): void;
        clear(): void;
        show(): void;
        hide(): void;
        setGeometry(name: string, geometry: any): void;
        setSymbol(name: string, symbol: any): void;
        showGraphice(name: string): void;
        hideGraphice(name: string): void;
        addGraphice(name: string, graphics: Array<any>): void;
        getMasterGraphicByName(name: string): any;
        /**
         * 获取资源要素点
         */
        getGraphicByName(name: String): Array<any>;
        /**
         * 删除资源要素点
         */
        removeGraphicByName(name: string): void;
    }
}
declare namespace flagwind {
    class EsriEditLayer extends FlagwindFeatureLayer implements IFlagwindEditLayer {
        editObj: any;
        options: any;
        businessLayer: FlagwindBusinessLayer;
        flagwindMap: FlagwindMap;
        mapService: IMapService;
        constructor(flagwindMap: FlagwindMap, businessLayer: FlagwindBusinessLayer, options: any);
        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        activateEdit(key: string): void;
        /**
         * 取消编辑要素
         */
        cancelEdit(key: string): void;
        bindModifyEvent(modifySeletor: string): void;
        bindDeleteEvent(deleteSeletor: string): void;
        onLoad(): void;
        readonly map: any;
        readonly spatial: any;
        onChanged(options: any, isSave: boolean): Promise<boolean>;
        protected registerEvent(): void;
        protected onLayerClick(editLayer: this, evt: any): void;
    }
}
declare namespace flagwind {
    class EsriLocationLayer extends FlagwindFeatureLayer implements IFlagwindLocationLayer {
        flagwindMap: FlagwindMap;
        options: any;
        private timer;
        graphic: any;
        mapService: IMapService;
        constructor(flagwindMap: FlagwindMap, options: any);
        readonly map: any;
        readonly spatial: any;
        protected onLoad(): void;
        protected createAnimation(): void;
        protected onMapClick(evt: any): void;
        protected createSymbol(color: any): any;
        protected creatGraphic(pt: any): any;
    }
}
declare let esri: any;
declare let dojo: any;
declare let dijit: any;
declare namespace flagwind {
    class EsriMapService implements IMapService {
        ROUTE_MAP: Map<FlagwindRouteLayer, EsriRouteService>;
        GRAPHIC_SYMBOL_MAP: Map<any, any>;
        showInfoWindow(evt: {
            graphic: any;
            mapPoint: any;
        }): void;
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
            title: string;
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
declare namespace flagwind {
    const ROUTE_LAYER_OPTIONS: any;
    const TRACKLINE_OPTIONS: any;
    abstract class FlagwindRouteLayer {
        flagwindMap: FlagwindMap;
        layerName: string;
        options: any;
        mapService: IMapService;
        moveLineLayer: FlagwindGroupLayer;
        moveMarkLayer: FlagwindGroupLayer;
        trackLines: Array<TrackLine>;
        constructor(flagwindMap: FlagwindMap, layerName: string, options: any);
        abstract equalGraphic(originGraphic: any, targetGraphic: any): boolean;
        abstract showSegmentLine(segment: TrackSegment): void;
        /**
         * 创建移动要素
         * @param {*} trackline 线路
         * @param {*} graphic 要素
         * @param {*} angle 偏转角
         */
        abstract createMoveMark(trackline: TrackLine, graphic: any, angle: number): any;
        readonly spatial: any;
        show(): void;
        hide(): void;
        /**
         * 获取指定名称的线路
         * @param name 指定名称
         */
        getTrackLine(name: string): TrackLine | null;
        /**
         * 向指定线路中增加路段
         */
        addTrackSegment(name: any, segment: TrackSegment, lineOptions: any): void;
        /**
         * 计算线路的下一个路段索引
         */
        getNextSegmentIndex(name: string): number;
        /**
         * 获取线路的下一路段
         */
        getNextSegment(name: string, index: number): TrackSegment;
        /**
         * 获取线路中的最后一路段
         */
        getLastSegment(name: string): TrackSegment;
        /**
         * 获取监控最近播放完成的路段线路
         */
        getActiveCompletedSegment(name: string): TrackSegment;
        /**
         * 判断线路是否在运行
         */
        getIsRunning(name: string): boolean;
        /*********************轨迹线路**************************/
        /*********************播放控制**************************/
        stop(name: string): void;
        /**
         * 启动线路播放（起点为上次播放的终点）
         */
        move(name: string): void;
        /**
         * 启动线路播放（起点为线路的始点）
         */
        start(name: string): void;
        /**
         * 暂停
         */
        pause(name: string): void;
        /**
         * 继续
         */
        continue(name: string): void;
        /**
         * 调速
         */
        changeSpeed(name: string, speed: number): void;
        clear(name: string): void;
        clearLine(name: string): void;
        /**
         * 清除所有
         */
        clearAll(): void;
        /*********************播放控制**************************/
        /**
         * 求解最短路径（与solve不同，它求解的是一个路段，该路段起点为stops[0],终点为stops[stops.length-1]
         *
         * @param {any} name  线路名称
         * @param {any} stops 经过的站点
         * @param {any} options 可选参数
         */
        solveSegment(name: string, stops: Array<any>, options: any): void;
        /**
         * 发送路由请求
         * @ index:路段索引
         * @ name:线路名称
         * @ start:开始要素
         * @ end:终点要素
         * @ lineOptions:线路控制的参数
         * @ waypoints:经过的点
         */
        post(index: number, name: string, start: any, end: any, lineOptions: any, waypoints?: Array<any>): void;
        /**
         * 由网络分析服务来求解轨迹并播放
         *
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        /**
         * 由连线求解轨迹
         * @param segment
         */
        solveByJoinPoint(segment: TrackSegment): void;
        /**
         * 路由分析完成回调
         */
        solveComplete(options: {
            polyline: any;
            length: number;
        }, segment: TrackSegment): void;
        /**
         * 路由分析失败回调
         */
        errorHandler(err: any, segment: TrackSegment): void;
        /**
         * 线段创建完成事件回调
         * @param {*} segment
         */
        protected onCreateSegmentLineComplete(segment: TrackSegment): void;
        protected checkMapSetting(): void;
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        protected changeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number): void;
        /**
         *
         * 显示路段事件
         *
         * @protected
         * @memberof flagwindRoute
         */
        protected onShowSegmentLineEvent(flagwindRoute: this, segment: TrackSegment, lineOptions: any): void;
        /**
         * 线段播放开始事故
         */
        protected onMoveStartEvent(flagwindRoute: this, segment: TrackSegment, graphic: any, angle: number): void;
        /**
         * 线段播放完成事件
         */
        protected onMoveEndEvent(flagwindRoute: this, segment: TrackSegment, graphic: any, angle: number): void;
        /**
         * 移动回调事件
         */
        protected onMoveEvent(flagwindRoute: this, segment: any, xy: any, angle: number): void;
        protected onAddLayerBefor(): void;
        protected onAddLayerAfter(): void;
        protected onLoad(): void;
    }
}
declare namespace flagwind {
    class EsriRouteLayer extends FlagwindRouteLayer {
        flagwindMap: FlagwindMap;
        layerName: string;
        options: any;
        mapService: IMapService;
        moveLineLayer: FlagwindGroupLayer;
        moveMarkLayer: FlagwindGroupLayer;
        trackLines: Array<TrackLine>;
        constructor(flagwindMap: FlagwindMap, layerName: string, options: any);
        showSegmentLine(segment: TrackSegment): void;
        createMoveMark(trackline: TrackLine, graphic: any, angle: number): any;
        equalGraphic(originGraphic: any, targetGraphic: any): boolean;
        /**
         * 由网络分析服务来求解轨迹并播放
         *
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        /**
         * 由连线求解轨迹
         * @param segment
         */
        solveByJoinPoint(segment: TrackSegment): void;
    }
}
declare namespace flagwind {
    class EsriRouteService {
        flagwindRouteLayer: FlagwindRouteLayer;
        constructor(flagwindRouteLayer: FlagwindRouteLayer);
        showSegmentLine(segment: TrackSegment): void;
        /**
         * 由连线求解轨迹
         * @param segment
         */
        solveByJoinPoint(segment: TrackSegment): void;
        solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        setSegmentByLine(options: {
            points: Array<any>;
            spatial: any;
        }, segment: TrackSegment): void;
        setSegmentByPolyLine(options: {
            polyline: any;
            length: number;
        }, segment: TrackSegment): void;
        getSpatialReferenceFormNA(): any;
        protected cloneStopGraphic(graphic: any): any;
        protected getLength(tmppolyline: any, units: number): number;
        /**
         * 把一个直线，切成多个点
         * @param start 始点
         * @param end 终点
         * @param n 点数
         */
        static extractPoints(start: {
            x: number;
            y: number;
        }, end: {
            x: number;
            y: number;
        }, n: number): {
            x: number;
            y: number;
        }[];
        /**
         * 线段抽稀操作
         * @param paths  线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        static vacuate(paths: Array<any>, length: number, numsOfKilometer: number): any[];
        /**
         * 线路上移动要素的构建（子）
         */
        static getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): any;
        /**
         * 标准化停靠点
         */
        static getStandardStops(name: string, stops: Array<any>, stopSymbol: any): any[];
    }
}
declare namespace flagwind {
    /**
     * 业务图层数据服务接口
     */
    interface IBusinessService {
        changeStandardModel(model: any): any;
        getInfoWindowContext(mode: any): {
            title: string;
            content: string;
        };
        /**
         * 获取图层
         */
        getDataList(): Promise<Array<any>>;
        /**
         * 获取最新图层数据状态
         */
        getLastStatus(): Promise<Array<any>>;
    }
}
declare namespace flagwind {
    const BUSINESS_LAYER_OPTIONS: any;
    /**
     * 业务图层
     */
    abstract class FlagwindBusinessLayer extends FlagwindFeatureLayer {
        flagwindMap: FlagwindMap;
        id: string;
        options: any;
        constructor(flagwindMap: FlagwindMap, id: string, options: any);
        abstract showInfoWindow(evt: any): void;
        abstract onCreatGraphicByModel(item: any): any;
        abstract onUpdateGraphicByModel(item: any): void;
        abstract addEventListener(eventName: string, callback: Function): void;
        readonly map: any;
        readonly spatial: any;
        gotoCenterById(key: string): void;
        saveGraphicList(dataList: Array<any>): void;
        updateGraphicList(dataList: Array<any>): void;
        setSelectStatusByModels(dataList: Array<any>): void;
        /**
         * 保存要素（如果存在，则修改，否则添加）
         */
        saveGraphicByModel(item: any): void;
        addGraphicByModel(item: any): void;
        creatGraphicByModel(item: any): any;
        /**
         * 修改要素
         */
        updateGraphicByModel(item: any, graphic?: any | null): void;
        clearSelectStatus(): void;
        getSelectedGraphics(): Array<any>;
        /**
         * 创建点要素（把业务数据的坐标转换成地图上的点）
         */
        getPoint(item: any): any;
        /**
         * 把地图上的点转换成业务的坐标
         * @param {*} point
         */
        formPoint(point: any): any;
        protected onAddLayerBefor(): void;
        protected onAddLayerAfter(): void;
        protected onInit(): void;
        protected onLoad(): void;
        protected onMapLoad(): void;
        protected registerEvent(): void;
        protected onLayerClick(deviceLayer: this, evt: any): void;
        protected fireEvent(eventName: string, event: any): void;
        protected validModel(item: any): any;
        /**
         * 变换成标准实体（最好子类重写）
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        protected changeStandardModel(item: any): any;
        protected setSelectStatus(item: any, selected: boolean): void;
    }
}
declare namespace flagwind {
    const EDIT_LAYER_OPTIONS: any;
    interface IFlagwindEditLayer {
        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        activateEdit(key: string): void;
        /**
         * 取消编辑要素
         */
        cancelEdit(key: string): void;
        onChanged(options: any, isSave: boolean): Promise<boolean>;
    }
}
declare namespace flagwind {
    /**
     * 地图要素服务
     */
    interface IFlagwindGraphicService {
        removeGraphic(graphic: any, layer: any): void;
        addGraphic(graphic: any, layer: any): void;
        showGraphic(graphic: any): void;
        hideGraphic(graphic: any): void;
        setGeometryByGraphic(graphic: any, geometry: any): void;
        setSymbolByGraphic(graphic: any, symbol: any): void;
        createMarkerSymbol(options: any): any;
        getGraphicAttributes(graphic: any): any;
    }
}
declare namespace flagwind {
    /**
     * 图层操作服务
     */
    interface IFlaywindLayerService {
        createTiledLayer(options: {
            url: string | null;
            id: string;
            title: string | null;
        }): any;
        createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer>;
        createGraphicsLayer(options: any): any;
        clearLayer(layer: any): void;
        removeLayer(layer: any, map: any): void;
        addLayer(layer: any, map: any): void;
        showLayer(layer: any): void;
        hideLayer(layer: any): void;
        getGraphicListByLayer(lay: any): Array<any>;
    }
}
declare namespace flagwind {
    const locationLayerOptions: {
        onMapClick: (evt: any) => void;
    };
    interface IFlagwindLocationLayer {
        clear(): void;
    }
}
declare namespace flagwind {
    interface IFlagwindMapService {
        addEventListener(target: any, eventName: string, callback: Function): void;
        centerAt(point: any, map: any): void;
        createPoint(options: any): any;
        createSpatial(wkid: any): any;
        getInfoWindow(map: any): any;
        showInfoWindow(evt: {
            graphic: any;
            mapPoint: any;
        }): void;
        formPoint(point: any, flagwindMap: FlagwindMap): {
            longitude: number;
            latitude: number;
        };
        toPoint(item: any, flagwindMap: FlagwindMap): any;
        createMap(setting: IMapSetting, flagwindMap: FlagwindMap): any;
        createContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }, flagwindMap: FlagwindMap): void;
        showTitle(graphic: any, flagwindMap: FlagwindMap): void;
        hideTitle(flagwindMap: FlagwindMap): void;
    }
}
declare namespace flagwind {
    interface IFlagwindRouteService {
        setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: {
            points: Array<any>;
            spatial: any;
        }, segment: TrackSegment): void;
        setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: {
            polyline: any;
            length: number;
        }, segment: TrackSegment): void;
        solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;
        getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): any;
        getStandardStops(name: string, stops: Array<any>): Array<any>;
        showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): any;
    }
}
declare namespace flagwind {
    const MAP_OPTIONS: {
        onMapLoad(): void;
        onMapZoomEnd(level: number): void;
        onMapClick(evt: any): void;
    };
    class FlagwindMap {
        mapService: IMapService;
        mapSetting: IMapSetting;
        private options;
        private baseLayers;
        private featureLayers;
        mapEl: any;
        spatial: any;
        innerMap: any;
        constructor(mapService: IMapService, mapSetting: IMapSetting, mapEl: any, options: any);
        goToCenter(): void;
        getBaseLayerById(id: string): FlagwindTiledLayer | null;
        formPoint(point: any): {
            longitude: number;
            latitude: number;
        };
        /**
         * 中心定位
         */
        centerAt(x: number, y: number): void;
        /**
         *
         * 创建菜单
         *
         * @param {{ contextMenu: any[], contextMenuClickEvent: any }} options
         * @memberof FlagwindMap
         */
        createContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }): void;
        /**
         * 创建点要素
         */
        getPoint(item: any): any;
        createBaseLayer(): void;
        addFeatureLayer(deviceLayer: FlagwindFeatureLayer): void;
        /**
         * 鼠标移动到点要素时显示title
         */
        showTitle(graphic: any): void;
        hideTitle(): void;
        protected onMapLoad(): void;
        protected showBaseLayer(id: string): boolean;
        protected getFeatureLayerById(id: string): FlagwindFeatureLayer | null;
        protected showFeatureLayer(id: string): boolean;
        protected removeFeatureLayer(id: string): boolean;
        readonly map: any;
        protected onMapZoomEnd(evt: any): void;
        protected createMap(): void;
    }
}
declare namespace flagwind {
    const TRACKSEGMENT_OPTIONS: {
        speed: number;
        numsOfKilometer: number;
        autoShowLine: boolean;
        onShowSegmentLineEvent(segment: TrackSegment): void;
        onMoveStartEvent(target: any, startGraphic: any, angle: number): void;
        onMoveEndEvent(target: any, endGraphic: any, angle: number): void;
        onMoveEvent(target: any, point: any, angle: number): void;
    };
    /**
     * 对轨迹播放中线路的路段的定义
     *
     * @export
     * @class TrackSegment
     */
    class TrackSegment {
        flagwindRouteLayer: FlagwindRouteLayer;
        index: number;
        name: string;
        startGraphic: any;
        endGraphic: any;
        options: any;
        mapService: IMapService;
        timer: any;
        position: number;
        length: number | null;
        speed: number | null;
        isCompleted: boolean;
        isRunning: boolean;
        line: any | null;
        polyline: any | null;
        time: number;
        /**
         * 由外部使用
         *
         * @type {*}
         * @memberof TrackSegment
         */
        lineGraphic: any;
        /**
         *
         * 途经的点
         *
         * @type {any[]}
         * @memberof TrackSegment
         */
        waypoints: Array<any>;
        constructor(flagwindRouteLayer: FlagwindRouteLayer, index: number, name: string, startGraphic: any, endGraphic: any, options: any);
        /**
         * 设置拆线
         */
        setPolyLine(polyline: any, length: number): void;
        /**
         * 设置直线
         */
        setLine(points: Array<any>): void;
        changeSpeed(speed?: number | null): void;
        move(segment: TrackSegment): void;
        start(): boolean;
        /**
         * 当定时器为空，且运行状态为true时表示是暂停
         */
        readonly isPaused: boolean;
        pause(): void;
        stop(): void;
        reset(): void;
    }
    /**
     * 对轨迹播放中线路的定义（它由多个路段组成）
     *
     * @export
     * @class TrackLine
     */
    class TrackLine {
        flagwindMap: FlagwindMap;
        name: string;
        options: any;
        /**
         * 设置线路上移动要素(如：车辆图标)
         */
        markerGraphic: any;
        mapService: IMapService;
        segments: Array<TrackSegment>;
        isMovingGraphicHide: boolean;
        constructor(flagwindMap: FlagwindMap, name: string, options: any);
        /**
         * 隐藏移动要素
         *
         * @memberof TrackLine
         */
        hideMovingGraphic(): void;
        /**
         * 显示移动要素
         *
         * @memberof TrackLine
         */
        showMovingGraphic(): void;
        /**
         * 若有一个路段正在跑，代表该线路是正在运行
         */
        readonly isRunning: boolean;
        /**
         * 当所有的路段完成时，说明线路是跑完状态
         */
        readonly isCompleted: boolean;
        /**
         * 调速
         */
        changeSpeed(speed: number): void;
        /**
         * 启动线路播放（从第一个路段的起点开始）
         */
        start(): void;
        /**
         * 停止线路
         */
        stop(): void;
        reset(): void;
        /**
         * 暂停
         */
        pause(): void;
        /**
         * 继续（与 暂停 是操作对，只能是在调用了暂停 才可以启用它）
         */
        continue(): void;
        /**
         * 移动(起点为上一次的终点，如果之前没有播放过，则从线路的起点开始)
         */
        move(): void;
        /**
         * 增加路段
         */
        add(segment: TrackSegment): void;
        /**
         * 计算线路的下一个路段索引
         */
        readonly nextSegmentIndex: number;
        /**
         * 获取最后的一个路段
         */
        readonly lastSegment: TrackSegment | null;
        /**
         * 获取线路的下一路段
         */
        getNextSegment(index: number): TrackSegment | null;
        /**
         * 获取线路的路段
         */
        getSegment(index: number): TrackSegment | null;
        /**
         * 获取监控最近播放完成的路段线路
         */
        readonly activeCompletedSegment: TrackSegment | null;
    }
}
declare namespace flagwind {
    interface IMapService extends IFlagwindGraphicService, IFlagwindMapService, IFlagwindRouteService, IFlaywindLayerService {
    }
}
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
}
declare namespace flagwind {
    class MapUtils {
        static PI: number;
        static X_PI: number;
        /**
         * 判断原始点坐标与目标点坐标是否一样
         *
         * @static
         * @param {*} originGeometry 原始点
         * @param {*} targetGeometry 要比较的目标点
         * @returns {boolean} true:一样,false:不一样
         * @memberof MapUtils
         */
        static isEqualPoint(originGeometry: any, targetGeometry: any): boolean;
        /**
         * 获取角度的方法
         */
        static getAngle(pt1: {
            x: number;
            y: number;
        }, pt2: {
            x: number;
            y: number;
        }): number;
        static validGeometryModel(item: any): any;
        static delta(lat: any, lon: any): {
            "lat": number;
            "lon": number;
        };
        static point25To2(x: number, y: number): {
            "lat": number;
            "lon": number;
        };
        static point2To25(x: number, y: number): {
            "lat": number;
            "lon": number;
        };
        static mercatorUnproject(lng: number, lat: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * WGS-84 to GCJ-02
         */
        static gcj_encrypt(wgsLat: number, wgsLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * GCJ-02 to WGS-84
         */
        static gcj_decrypt(gcjLat: number, gcjLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * GCJ-02 to WGS-84 exactly
         */
        static gcj_decrypt_exact(gcjLat: number, gcjLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * GCJ-02 to BD-09
         */
        static bd_encrypt(gcjLat: number, gcjLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * BD-09 to GCJ-02
         */
        static bd_decrypt(bdLat: number, bdLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         *  WGS-84 to Web mercator
         * mercatorLat -> y mercatorLon -> x
         */
        static mercator_encrypt(wgsLat: number, wgsLon: number): {
            "lat": number;
            "lon": number;
        };
        static lonlat2mercator(lat: number, lon: number): {
            "lon": number;
            "lat": number;
        };
        static mercator2lonlat(mercatorLat: number, mercatorLon: number): {
            "lon": number;
            "lat": number;
        };
        /**
         * Web mercator to WGS-84
         * mercatorLat -> y mercatorLon -> x
         */
        static mercator_decrypt(mercatorLat: number, mercatorLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * 求解两点距离
         */
        static distance(latA: number, lonA: number, latB: number, lonB: number): number;
        static outOfChina(lat: number, lon: number): boolean;
        static transformLat(x: number, y: number): number;
        static transformLon(x: number, y: number): number;
    }
}
declare namespace flagwind {
    /**
     * 表示一个默认的枚举器。
     * @class
     * @version 1.0.0
     */
    class Enumerator<T> implements IEnumerator<T> {
        private _items;
        private _current;
        private _index;
        /**
         * 获取当前遍历的值。
         * @summary 如果已经遍历结束，则返回 undefined。
         * @property
         * @returns T
         */
        readonly current: T;
        /**
         * 初始化 Enumerator<T> 类的新实例。
         * @constructor
         * @param  {Array<T>} items 要枚举的元素。
         */
        constructor(items: Array<T>);
        /**
         * 将枚举数推进到集合的下一个元素。
         * @returns boolean 如果枚举数已成功地推进到下一个元素，则为 true；如果枚举数传递到集合的末尾，则为 false。
         */
        next(): boolean;
    }
}
declare namespace flagwind {
    /**
     * 表示实现该接口的是一个可枚举的类型。
     * @interface
     * @version 1.0.0
     */
    interface IEnumerable<T> {
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        getEnumerator(): IEnumerator<T>;
        /**
         * 对 IEnumerable<T> 进行迭代处理。
         * @param  {Function} callback 每次迭代中执行的回掉函数，当前迭代项将传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (item: T, source: IEnumerable<T>) => void, scope?: any): void;
    }
}
declare namespace flagwind {
    /**
     * 支持对泛型集合的简单迭代。
     * @interface
     * @version 1.0.0
     */
    interface IEnumerator<T> {
        /**
         * 获取当前遍历的值。
         * @summary 如果已经遍历结束，则返回 undefined。
         * @property
         * @returns T
         */
        current: T;
        /**
         * 将枚举数推进到集合的下一个元素。
         * @returns boolean 如果枚举数已成功地推进到下一个元素，则为 true；如果枚举数传递到集合的末尾，则为 false。
         */
        next(): boolean;
    }
}
declare namespace flagwind {
    /**
     * 表示一个用于存储键值对的数据结构。
     * @interface
     * @description IMap 类似于对象，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。
     * @version 1.0.0
     */
    interface IMap<K, V> extends IEnumerable<KeyValuePair<K, V>> {
        /**
         * 获取 IMap<K, V> 中实际包含的成员总数。
         * @property
         * @returns number
         */
        size: number;
        /**
         * 设置键名 key 对应的键值为 value，然后返回整个 IMap<K, V> 结构。
         * 如果 key 已经有值，则键值会被更新，否则就新生成该键。
         * @param  {K} key 键。
         * @param  {V} value 值。
         * @returns void
         */
        set(key: K, value: V): IMap<K, V>;
        /**
         * 读取 key 对应的键值，如果找不到 key，返回 undefined。
         * @param  {K} key 键。
         * @returns V
         */
        get(key: K): V;
        /**
         * 确定 IMap<K, V> 是否包含指定的键。
         * @param  {K} key 键。
         * @returns boolean 如果 Map<K, V> 包含具有指定键的成员，则为 true；否则为 false。
         */
        has(key: K): boolean;
        /**
         * 从 IMap<K, V> 中删除指定的键对应的项。
         * @param  {K} key 键。
         * @returns boolean  如果成功找到并移除该项，则为 true；否则为 false。
         */
        delete(key: K): boolean;
        /**
         * 清除所有键和值。
         * @returns void
         */
        clear(): void;
        /**
         * 获取包含 IMap<K, V> 中的键列表。
         * @returns Array
         */
        keys(): Array<K>;
        /**
         * 获取包含 IMap<K, V> 中的值列表。
         * @returns Array
         */
        values(): Array<V>;
        /**
         * 获取包含 IMap<K, V> 中的成员列表。
         * @returns Array
         */
        entries(): Array<KeyValuePair<K, V>>;
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        getEnumerator(): IEnumerator<KeyValuePair<K, V>>;
        /**
         * 对 IEnumerable<T> 进行迭代处理。
         * @param  {Function} callback 每次迭代中执行的回掉函数，当前迭代项将传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (item: KeyValuePair<K, V>, source: IEnumerable<KeyValuePair<K, V>>) => void, scope?: any): void;
    }
}
declare namespace flagwind {
    /**
     * 表示一个强类型列表。提供用于对列表进行搜索、排序和操作的方法。
     * @interface
     * @description ISet<T> 接受 null 作为引用类型的有效值，但是不允许有重复的元素。
     * @version 1.0.0
     */
    interface ISet<T> extends IEnumerable<T> {
        /**
         * 获取 ISet<T> 中实际包含的元素总数。
         * @property
         * @returns number
         */
        size: number;
        /**
         * 将元素添加到 ISet<T> 的结尾处。
         * @param  {Array<T>} ...values 要添加到 ISet<T> 末尾处的元素。
         * @returns Set
         */
        add(...values: Array<T>): ISet<T>;
        /**
         * 获取指定索引处的元素。
         * @param  {number} index 要获得或设置的元素从零开始的索引。
         * @returns T 指定索引处的元素。
         */
        get(index: number): T;
        /**
         * 设置指定索引处的元素。
         * @param  {number} index 设置的元素从零开始的索引。
         * @param  {T} value 元素值。
         * @returns void
         */
        set(index: number, value: T): void;
        /**
         * 从 ISet<T> 中移除特定元素的匹配项。
         * @param  {T} value 要从 ISet<T> 中移除的元素。
         * @returns boolean 如果成功移除 value，则为 true；否则为 false。如果在 ISet<T> 中没有找到 value，该方法也会返回 false。
         */
        delete(value: T): boolean;
        /**
         * 移除 ISet<T> 的指定索引处的元素。
         * @param  {number} index 要移除的元素的从零开始的索引。
         * @returns void
         */
        deleteAt(index: number): void;
        /**
         * 从 ISet<T> 中移除所有元素。
         * @returns void
         */
        clear(): void;
        /**
         * 搜索指定的元素，并返回整个 ISet<T> 中第一个匹配项的从零开始的索引。
         * @param  {T} value 要在 ISet<T> 中定位的元素。对于引用类型，该值可以为 null。
         * @param  {number} index? 从零开始的搜索的起始索引。
         * @returns number 如果在整个 ISet<T> 中找到 value 的第一个匹配项，则为该项的从零开始的索引；否则为 -1。
         */
        indexOf(value: T, index?: number): number;
        /**
         * 确定某元素是否在 ISet<T> 中。
         * @param  {T} value 要在 ISet<T> 中定位的元素。对于引用类型，该值可以为 null。
         * @returns boolean 如果在 ISet<T> 中找到 value，则为 true，否则为 false。
         */
        has(value: T): boolean;
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        getEnumerator(): IEnumerator<T>;
        /**
         * 对 IEnumerable<T> 进行迭代处理。
         * @param  {(item:T,source:IEnumerable<T>)=>void} callback 每次迭代中执行的回掉函数，当前迭代项将传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (item: T, source: IEnumerable<T>) => void, scope?: any): void;
        /**
         * 对 ISet<T> 进行迭代处理。
         * @param  {(value:T,index:number,set:ISet<T>)=>void} callback 每次迭代中执行的回掉函数，当前迭代项及它的索引号将被作为参数传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (value: T, index: number, set: ISet<T>) => void, scope?: any): void;
        /**
         * 搜索与指定谓词所定义的条件相匹配的元素，并返回 ISet<T> 中第一个匹配元素。
         * @param  {(value:T,index:number,set:ISet<T>)=>boolean} callback 定义要搜索的元素的条件。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns T
         */
        find(callback: (value: T, index: number, set: ISet<T>) => boolean, scope?: any): T;
        /**
         * 使用指定的比较器对整个 ISet<T> 中的元素进行排序。
         * @param  {(a:T,b:T)=>number} comparer? 比较元素时要使用的比较器函数。
         * @returns void
         */
        sort(comparer?: (a: T, b: T) => number): void;
        /**
         * 将指定的 ISet<T> 合并到当前 ISet<T> 中。
         * @param  {ISet<T>} second 需要合并的数据源。
         * @returns ISet
         */
        union(source: ISet<T>): ISet<T>;
        /**
         * 获取包含 ISet<T> 中的值列表。
         * @returns Array
         */
        values(): Array<T>;
    }
}
declare namespace flagwind {
    /**
     * 定义可设置或检索的键/值对。
     * @class
     * @version 1.0.0
     */
    class KeyValuePair<K, V> {
        private _key;
        private _value;
        /**
         * 获取键/值对中的键。
         * @property
         * @returns K
         */
        readonly key: K;
        /**
         * 获取键/值对中的值。
         * @property
         * @returns V
         */
        readonly value: V;
        /**
         * 初始化 KeyValuePair<K, V> 类的新实例。
         * @param  {K} key 每个键/值对中定义的对象。
         * @param  {V} value 与 key 相关联的定义。
         */
        constructor(key: K, value: V);
        /**
         * 使用键和值的字符串表示形式返回 KeyValuePair<K, V> 的字符串表示形式。
         * @override
         * @returns string
         */
        toString(): string;
    }
}
declare namespace flagwind {
    /**
     * 表示一个用于存储键值对的数据结构。
     * @class
     * @description Map 类似于对象，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。
     * @version 1.0.0
     */
    class Map<K, V> implements IMap<K, V> {
        private _keys;
        private _values;
        /**
         * 获取 Map<K, V> 中实际包含的成员总数。
         * @property
         * @returns number
         */
        readonly size: number;
        /**
         * 设置键名 key 对应的键值为 value，然后返回整个 Map<K, V> 结构。
         * 如果 key 已经有值，则键值会被更新，否则就新生成该键。
         * @param  {K} key 键。
         * @param  {V} value 值。
         * @returns void
         */
        set(key: K, value: V): Map<K, V>;
        /**
         * 读取 key 对应的键值，如果找不到 key，返回 undefined。
         * @param  {K} key 键。
         * @returns V
         */
        get(key: K): V;
        /**
         * 确定 Map<K, V> 是否包含指定的键。
         * @param  {K} key 键。
         * @returns boolean 如果 Map<K, V> 包含具有指定键的成员，则为 true；否则为 false。
         */
        has(key: K): boolean;
        /**
         * 从 Map<K, V> 中删除指定的键对应的项。
         * @param  {K} key 键。
         * @returns boolean  如果成功找到并移除该项，则为 true；否则为 false。
         */
        delete(key: K): boolean;
        /**
         * 清除所有键和值。
         * @returns void
         */
        clear(): void;
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        getEnumerator(): IEnumerator<KeyValuePair<K, V>>;
        /**
         * 对 IEnumerable<T> 进行迭代处理。
         * @param  {Function} callback 每次迭代中执行的回掉函数，当前迭代项将传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (item: KeyValuePair<K, V>, source: IEnumerable<KeyValuePair<K, V>>) => void, scope?: any): void;
        /**
         * 获取包含 Map<K, V> 中的键列表。
         * @returns Array
         */
        keys(): Array<K>;
        /**
         * 获取包含 Map<K, V> 中的值列表。
         * @returns Array
         */
        values(): Array<V>;
        /**
         * 获取包含 Map<K, V> 中的成员列表。
         * @returns Array
         */
        entries(): Array<KeyValuePair<K, V>>;
        /**
         * 返回 Map<K, V> 的字符串表示形式。
         * @override
         * @returns string
         */
        toString(): string;
    }
}
declare namespace flagwind {
    /**
     * 表示一个强类型列表。提供用于对列表进行搜索、排序和操作的方法。
     * @class
     * @description Set<T> 接受 null 作为引用类型的有效值，但是不允许有重复的元素。
     * @version 1.0.0
     */
    class Set<T> implements ISet<T> {
        private _values;
        /**
         * 获取 Set<T> 中实际包含的元素总数。
         * @property
         * @returns number
         */
        readonly size: number;
        /**
         * 初始化 Set<T> 的新实例。
         * @param  {Array<T>} ...values
         */
        constructor(...values: Array<T>);
        /**
         * 将元素添加到 Set<T> 的结尾处。
         * @param  {T[]} ...values 要添加到 Set<T> 末尾处的元素。
         * @returns Set
         */
        add(...values: Array<T>): Set<T>;
        /**
         * 获取指定索引处的元素。
         * @param  {number} index 要获得或设置的元素从零开始的索引。
         * @returns T 指定索引处的元素。
         */
        get(index: number): T;
        /**
         * 设置指定索引处的元素。
         * @param  {number} index 设置的元素从零开始的索引。
         * @param  {T} value 元素值。
         * @returns void
         */
        set(index: number, value: T): void;
        /**
         * 从 Set<T> 中移除特定元素的匹配项。
         * @param  {T} value 要从 Set<T> 中移除的元素。
         * @returns boolean 如果成功移除 value，则为 true；否则为 false。如果在 Set<T> 中没有找到 value，该方法也会返回 false。
         */
        delete(value: T): boolean;
        /**
         * 移除 Set<T> 的指定索引处的元素。
         * @param  {number} index 要移除的元素的从零开始的索引。
         * @returns void
         */
        deleteAt(index: number): void;
        /**
         * 从 Set<T> 中移除所有元素。
         * @returns void
         */
        clear(): void;
        /**
         * 搜索指定的元素，并返回整个 Set<T> 中第一个匹配项的从零开始的索引。
         * @param  {T} value 要在 Set<T> 中定位的元素。对于引用类型，该值可以为 null。
         * @param  {number} index? 从零开始的搜索的起始索引。
         * @returns number 如果在整个 Set<T> 中找到 value 的第一个匹配项，则为该项的从零开始的索引；否则为 -1。
         */
        indexOf(value: T, index?: number): number;
        /**
         * 确定某元素是否在 Set<T> 中。
         * @param  {T} value 要在 Set<T> 中定位的元素。对于引用类型，该值可以为 null。
         * @returns boolean 如果在 Set<T> 中找到 value，则为 true，否则为 false。
         */
        has(value: T): boolean;
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        getEnumerator(): IEnumerator<T>;
        /**
         * 对 Set<T> 进行迭代处理。
         * @param  {(item:T,index:number,set:Set<T>)=>void} callback 每次迭代中执行的回掉函数，当前迭代项及它的索引号将被作为参数传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (item: T, index: number, set: Set<T>) => void, scope?: any): void;
        /**
         * 对 IEnumerable<T> 进行迭代处理。
         * @param  {(value:T,source:IEnumerable<T>)=>void} callback 每次迭代中执行的回掉函数，当前迭代项将传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        forEach(callback: (value: T, source: IEnumerable<T>) => void, scope?: any): void;
        /**
         * 搜索与指定谓词所定义的条件相匹配的元素，并返回 Set<T> 中第一个匹配元素。
         * @param  {Function} callback 定义要搜索的元素的条件。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns T
         */
        find(callback: (value: T, index: number, set: Set<T>) => boolean, scope?: any): T;
        /**
         * 使用指定的比较器对整个 Set<T> 中的元素进行排序。
         * @param  {Function} comparer? 比较元素时要使用的比较器函数。
         * @returns void
         */
        sort(comparer?: (a: T, b: T) => number): void;
        /**
         * 将指定的 ISet<T> 合并到当前 ISet<T> 中。
         * @param  {ISet<T>} second 需要合并的数据源。
         * @returns ISet
         */
        union(source: ISet<T>): ISet<T>;
        /**
         * 获取包含 Set<T> 中的值列表。
         * @returns Array
         */
        values(): Array<T>;
        /**
         * 返回 Set<T> 的字符串表示形式。
         * @override
         * @returns string
         */
        toString(): string;
    }
}
declare namespace flagwind {
    /**
     * 表示在应用程序执行期间发生的错误。
     * @class
     * @version 1.0.0
     */
    class Exception extends Error {
        constructor(message?: string);
    }
}
declare namespace flagwind {
    /**
     * 当向方法提供的参数之一无效时引发的异常。
     * @class
     * @version 1.0.0
     */
    class ArgumentException extends Exception {
        constructor(message?: string);
    }
}
declare namespace flagwind {
    /**
     * 当方法调用对于对象的当前状态无效时引发的异常。
     * @class
     * @version 1.0.0
     */
    class InvalidOperationException extends Exception {
        constructor(message?: string);
    }
}
declare namespace flagwind {
    /**
     * 卡口
     */
    class MinemapTollgateLayer extends FlagwindBusinessLayer {
        businessService: IBusinessService;
        isLoading: boolean;
        constructor(businessService: IBusinessService, flagwindMap: FlagwindMap, id: string, options: any);
        onEditInfo(evt: any, isSave: boolean): void;
        createGraphicsLayer(options: any): any;
        showInfoWindow(evt: any): void;
        openInfoWindow(id: string, context: any): void;
        /**
         * 加载并显示设备点位
         *
         * @memberof TollgateLayer
         */
        showDataList(): void;
        /**
         * 把实体转换成标准的要素属性信息
         * @param item 实体信息
         */
        changeStandardModel(item: any): any;
        /**
         * 开启定时器
         */
        start(): void;
        /**
         * 关闭定时器
         */
        stop(): void;
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        onCreatGraphicByModel(item: any): any;
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        onUpdateGraphicByModel(item: any): void;
        /**
         * 图层事件处理
         * @param eventName 事件名称
         * @param callback 回调
         */
        addEventListener(eventName: string, callback: Function): void;
        /**
         * 更新设备状态
         */
        private updateStatus();
    }
}
declare namespace flagwind {
    /**
     * 坐标点
     */
    class MinemapPoint {
        x: number;
        y: number;
        spatial: any;
        constructor(x: number, y: number, spatial: any);
        geometry: MinemapGeometry;
    }
    /**
     * 几何对象
     */
    class MinemapGeometry {
        type: string;
        coordinates: Array<any>;
        constructor(type: string, coordinates: Array<any>);
    }
    /**
     * 空间投影
     */
    class MinemapSpatial {
        wkid: number;
        constructor(wkid: number);
    }
    interface IMinemapGraphic {
        id: string;
        attributers: any;
        isShow: boolean;
        isInsided: boolean;
        kind: string;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: {
            type: string;
            coordinates: Array<any>;
        }): void;
        addTo(map: any): void;
    }
    class MinemapMarker implements IMinemapGraphic {
        private _kind;
        /**
         * 是否在地图上
         */
        private _isInsided;
        private _geometry;
        id: string;
        isShow: boolean;
        symbol: any;
        marker: any;
        element: any;
        attributers: any;
        layer: MinemapMarkerLayer;
        constructor(options: any);
        readonly kind: string;
        readonly isInsided: boolean;
        onCallback(eventName: string, arg: any): void;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        geometry: MinemapGeometry;
        setGeometry(geometry: {
            type: string;
            coordinates: Array<any>;
        }): void;
        addTo(map: any): void;
    }
    class MinemapGeoJson implements IMinemapGraphic {
        private _kind;
        /**
         * 是否在地图上
         */
        _isInsided: boolean;
        id: string;
        isShow: boolean;
        data: {
            type: string;
            geometry: {
                type: string;
                coordinates: Array<any>;
            };
        };
        type: string;
        layout: any;
        paint: any;
        layer: MinemapMarkerLayer;
        attributers: any;
        readonly kind: string;
        readonly isInsided: boolean;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: {
            type: string;
            coordinates: Array<any>;
        }): void;
        addTo(map: any): void;
        addLayer(map: any): void;
    }
    interface IMinemapGraphicsLayer {
        graphics: Array<any>;
        show(): void;
        hide(): void;
        add(graphic: any): void;
        remove(graphic: any): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
        on(eventName: string, callBack: Function): void;
    }
    class MinemapMarkerLayer implements IMinemapGraphicsLayer {
        options: any;
        private GRAPHICS_MAP;
        private EVENTS_MAP;
        /**
         * 是否在地图上
         */
        _isInsided: boolean;
        id: string;
        map: any;
        readonly isInsided: boolean;
        constructor(options: any);
        readonly graphics: (() => MinemapMarker[])[];
        getCallBack(eventName: string): Function;
        on(eventName: string, callBack: Function): void;
        show(): void;
        hide(): void;
        remove(graphic: IMinemapGraphic): void;
        clear(): void;
        add(graphic: MinemapMarker): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
    }
    class MinemapGeoJsonLayer implements IMinemapGraphicsLayer {
        private GRAPHICS_MAP;
        /**
         * 是否在地图上
         */
        _isInsided: boolean;
        id: string;
        map: any;
        readonly isInsided: boolean;
        constructor(options: any);
        readonly graphics: (() => MinemapGeoJson[])[];
        show(): void;
        hide(): void;
        remove(graphic: IMinemapGraphic): void;
        clear(): void;
        add(graphic: MinemapGeoJson): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
        on(eventName: string, callBack: Function): void;
    }
}
declare var minemap: any;
declare namespace flagwind {
    class MinemapService implements IMapService {
        createTiledLayer(options: {
            url: string;
            id: string;
            title: string;
        }): void;
        createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer>;
        createGraphicsLayer(options: any): MinemapMarkerLayer | MinemapGeoJsonLayer;
        clearLayer(layer: any): void;
        removeLayer(layer: any, map: any): void;
        addLayer(layer: any, map: any): void;
        showLayer(layer: any): void;
        hideLayer(layer: any): void;
        getGraphicListByLayer(layer: any): Array<any>;
        removeGraphic(graphic: any, layer: any): void;
        addGraphic(graphic: any, layer: any): void;
        showGraphic(graphic: any): void;
        hideGraphic(graphic: any): void;
        setGeometryByGraphic(graphic: any, geometry: any): void;
        setSymbolByGraphic(graphic: any, symbol: any): void;
        createMarkerSymbol(options: any): void;
        getGraphicAttributes(graphic: any): any;
        addEventListener(target: any, eventName: string, callback: Function): void;
        centerAt(point: any, map: any): void;
        createPoint(options: any): MinemapPoint;
        createSpatial(wkid: any): MinemapSpatial;
        getInfoWindow(map: any): void;
        showInfoWindow(evt: {
            graphic: any;
            mapPoint: any;
        }): void;
        formPoint(point: any, flagwindMap: FlagwindMap): {
            longitude: number;
            latitude: number;
        };
        toPoint(item: any, flagwindMap: FlagwindMap): MinemapPoint;
        createMap(setting: IMapSetting, flagwindMap: FlagwindMap): any;
        createContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }, flagwindMap: FlagwindMap): void;
        showTitle(graphic: any, flagwindMap: FlagwindMap): void;
        hideTitle(flagwindMap: FlagwindMap): void;
        setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: {
            points: Array<any>;
            spatial: any;
        }, segment: TrackSegment): void;
        setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: {
            polyline: any;
            length: number;
        }, segment: TrackSegment): void;
        solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;
        getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): void;
        getStandardStops(name: string, stops: Array<any>): Array<any>;
        showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;
    }
}
declare var minemap: any;
declare namespace flagwind {
    class MinemapSetting implements IMapSetting {
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
}
