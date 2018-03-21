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
     * 事件提供程序类。
     * @description 用于添加或删除事件侦听器的方法，检查是否已注册特定类型的事件侦听器，并调度事件。
     * @class
     * @version 1.0.0
     */
    class EventProvider implements IEventProvider {
        private _source;
        private _events;
        /**
         * 初始化事件提供程序的新实例。
         * @param  {any} source? 事件源实例。
         */
        constructor(source?: any);
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        addListener(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        removeListener(type: string, listener: Function, scope?: any): void;
        /**
         * 检查是否为特定事件类型注册了侦听器。
         * @param  {string} type 事件类型。
         * @returns boolean 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
         */
        hasListener(type: string): boolean;
        /**
         * 派发一个指定类型的事件。
         * @param  {string} type 事件类型。
         * @param  {any} data? 事件数据。
         * @returns void
         */
        dispatchEvent(type: string, data?: any): void;
        /**
         * 派发一个指定参数的事件。
         * @param  {EventArgs} eventArgs 事件参数实例。
         * @returns void
         */
        dispatchEvent(args: EventArgs): void;
    }
}
declare namespace flagwind {
    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    abstract class FlagwindFeatureLayer extends EventProvider {
        id: string;
        title: string | null;
        protected layer: any;
        isShow: boolean;
        constructor(id: string, title: string | null);
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
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        abstract onCreateGraphicsLayer(args: any): any;
    }
}
declare let esri: any;
declare let dojo: any;
declare let dijit: any;
declare let HeatmapLayer: any;
declare namespace flagwind {
    class EsriEditLayer extends FlagwindFeatureLayer implements IFlagwindEditLayer {
        editObj: any;
        options: any;
        businessLayer: FlagwindBusinessLayer;
        flagwindMap: FlagwindMap;
        constructor(businessLayer: FlagwindBusinessLayer, options: any);
        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        activateEdit(key: string): void;
        /**
         * 取消编辑要素
         */
        cancelEdit(key: string): void;
        registerModifyEvent(modifySeletor: string): void;
        registerDeleteEvent(deleteSeletor: string): void;
        onLoad(): void;
        readonly map: any;
        readonly spatial: any;
        onCreateGraphicsLayer(args: any): any;
        onChanged(options: any, isSave: boolean): Promise<boolean>;
        protected registerEvent(): void;
        protected onLayerClick(editLayer: this, evt: any): void;
    }
}
declare namespace flagwind {
    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     *
     * @export
     * @class FlagwindGroupLayer
     */
    abstract class FlagwindGroupLayer extends EventProvider {
        options: any;
        layer: any;
        isShow: boolean;
        constructor(options: any);
        readonly graphics: Array<any>;
        appendTo(map: any): void;
        removeLayer(map: any): void;
        clear(): void;
        show(): void;
        hide(): void;
        setGeometry(name: string, geometry: any): void;
        setSymbol(name: string, symbol: any): void;
        showGraphic(name: string): void;
        hideGraphic(name: string): void;
        addGraphic(name: string, ...graphics: Array<any>): void;
        getMasterGraphicByName(name: string): any;
        /**
         * 获取资源要素点
         */
        getGraphicByName(name: String): Array<any>;
        /**
         * 删除资源要素点
         */
        removeGraphicByName(name: string): void;
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        abstract onCreateGraphicsLayer(args: any): any;
    }
}
declare namespace flagwind {
    class EsriGroupLayer extends FlagwindGroupLayer {
        onCreateGraphicsLayer(args: any): any;
    }
}
declare namespace flagwind {
    class EsriHeatmapLayer implements IFlagwindHotmapLayer {
        flagwindMap: FlagwindMap;
        private map;
        options: any;
        heatLayer: any;
        heatContainer: HTMLElement;
        constructor(flagwindMap: FlagwindMap, options: any);
        createHeatLayer(): any;
        resize(): void;
        clear(): void;
        show(): void;
        hide(): void;
        showDataList(data: Array<any>, changeExtent: boolean): void;
        changeStandardData(data: Array<any>): any[];
    }
}
declare namespace flagwind {
    const MAP_OPTIONS: {
        onMapLoad(): void;
        onMapZoomEnd(level: number): void;
        onMapClick(evt: any): void;
        onCreateContextMenu(args: {
            contextMenu: any[];
            contextMenuClickEvent: any;
        }): void;
    };
    abstract class FlagwindMap extends EventProvider {
        mapSetting: IMapSetting;
        mapEl: any;
        private featureLayers;
        protected baseLayers: Array<FlagwindTiledLayer>;
        options: any;
        spatial: any;
        innerMap: any;
        loaded: boolean;
        constructor(mapSetting: IMapSetting, mapEl: any, options: any);
        onInit(): void;
        abstract onCenterAt(point: any): void;
        abstract onCreatePoint(point: any): any;
        onFormPoint(point: any): {
            longitude: number;
            latitude: number;
        };
        onToPoint(item: any): any;
        abstract onCreateMap(): any;
        abstract onShowInfoWindow(evt: any): void;
        abstract onCloseInfoWindow(): void;
        abstract onCreateBaseLayers(): any;
        abstract onShowTooltip(graphic: any): void;
        abstract onHideTooltip(graphic: any): void;
        abstract onCreateContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }): void;
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        closeInfoWindow(): void;
        goToCenter(): void;
        getBaseLayerById(id: string): FlagwindTiledLayer | null;
        /**
         * 中心定位
         */
        centerAt(x: number, y: number): void;
        /**
         * 创建点要素
         */
        getPoint(item: any): any;
        addFeatureLayer(deviceLayer: FlagwindFeatureLayer): void;
        protected onMapLoad(): void;
        protected showBaseLayer(id: string): boolean;
        protected getFeatureLayerById(id: string): FlagwindFeatureLayer | null;
        protected showFeatureLayer(id: string): boolean;
        protected removeFeatureLayer(id: string): boolean;
        readonly map: any;
        protected onMapZoomEnd(evt: any): void;
    }
}
declare namespace flagwind {
    class EsriMap extends FlagwindMap {
        mapSetting: IMapSetting;
        mapEl: any;
        constructor(mapSetting: IMapSetting, mapEl: any, options: any);
        onAddEventListener(eventName: string, callBack: Function): void;
        onCenterAt(point: any): void;
        onCreatePoint(options: any): any;
        onCreateMap(): void;
        onShowInfoWindow(evt: any): void;
        onCloseInfoWindow(): void;
        onCreateBaseLayers(): FlagwindTiledLayer[];
        onShowTooltip(graphic: any): void;
        onHideTooltip(graphic: any): void;
        onCreateContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }): void;
        /**
         * tileInfo必须是单例模式，否则地图无法正常显示
         *
         * @returns
         * @memberof FlagwindMap
         */
        protected getTileInfo(): any;
    }
}
declare namespace flagwind {
    class EsriMarkerGraphic extends EventProvider implements IEsriGraphic {
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
        icon: any;
        attributes: any;
        options: any;
        spatial: any;
        layer: IEsriGraphicsLayer;
        constructor(options: any);
        addClass(className: string): void;
        removeClass(className: string): void;
        /**
         * 复制节点
         * @param id 元素ID
         */
        clone(id: string): EsriMarkerGraphic;
        readonly kind: string;
        readonly isInsided: boolean;
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setAngle(angle: number): void;
        setSymbol(symbol: any): void;
        draw(): void;
        geometry: EsriPoint;
        setGeometry(value: EsriGeometry): void;
        addTo(layer: any): void;
        protected registerEvent(ele: HTMLElement, evt: string): void;
        protected fireEvent(type: string, data?: any): void;
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
        onInit(): void;
        abstract onShowInfoWindow(evt: any): void;
        abstract onCreatGraphicByModel(item: any): any;
        abstract onUpdateGraphicByModel(item: any): void;
        onAddLayerBefor(): void;
        onAddLayerAfter(): void;
        readonly map: any;
        readonly spatial: any;
        closeInfoWindow(): void;
        gotoCenterById(key: string): void;
        saveGraphicList(dataList: Array<any>): void;
        updateGraphicList(dataList: Array<any>): void;
        setSelectStatusByModels(dataList: Array<any>, refresh: boolean): void;
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
        protected onLoad(): void;
        protected onMapLoad(): void;
        protected registerEvent(): void;
        protected onLayerClick(deviceLayer: this, evt: any): void;
        protected fireEvent(eventName: string, event: any): void;
        protected setSelectStatus(item: any, selected: boolean): void;
        /**
         * 变换成标准实体（最好子类重写）
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        protected abstract onChangeStandardModel(item: any): any;
        protected onValidModel(item: any): any;
    }
}
declare namespace flagwind {
    /**
     * 点图层
     */
    class EsriPointLayer extends FlagwindBusinessLayer {
        businessService: IFlagwindBusinessService;
        isLoading: boolean;
        constructor(businessService: IFlagwindBusinessService, flagwindMap: FlagwindMap, id: string, options: any);
        onCreateGraphicsLayer(options: any): EsriGraphicsLayer;
        openInfoWindow(id: string, context: any, options: any): void;
        onShowInfoWindow(evt: any): void;
        /**
         * 把实体转换成标准的要素属性信息
         * @param item 实体信息
         */
        onChangeStandardModel(item: any): any;
        getImageUrl(item: any): string;
        getClassName(item: any): string;
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
         * 加载并显示设备点位
         *
         * @memberof TollgateLayer
         */
        showDataList(): void;
        /**
         * 开启定时器
         */
        start(): void;
        /**
         * 关闭定时器
         */
        stop(): void;
        protected setSelectStatus(item: any, selected: boolean): void;
        protected setGraphicStatus(item: any): void;
        /**
         * 更新设备状态
         */
        private updateStatus();
    }
}
declare namespace flagwind {
    const ROUTE_LAYER_OPTIONS: any;
    const TRACKLINE_OPTIONS: any;
    abstract class FlagwindRouteLayer {
        flagwindMap: FlagwindMap;
        layerName: string;
        options: any;
        moveLineLayer: FlagwindGroupLayer;
        moveMarkLayer: FlagwindGroupLayer;
        trackLines: Array<TrackLine>;
        activedtrackLineName: string;
        constructor(flagwindMap: FlagwindMap, layerName: string, options: any);
        abstract onCreateLineLayer(id: string): FlagwindGroupLayer;
        abstract onCreateMovingLayer(id: string): FlagwindGroupLayer;
        abstract onEqualGraphic(originGraphic: any, targetGraphic: any): boolean;
        abstract onShowSegmentLine(segment: TrackSegment): void;
        abstract onGetStandardStops(name: String, stops: Array<any>): Array<any>;
        abstract onSetSegmentByLine(options: any, segment: TrackSegment): any;
        abstract onSetSegmentByPoint(options: any, segment: TrackSegment): any;
        /**
         * 由网络分析服务来求解轨迹并播放
         *
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        abstract onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        /**
         * 由连线求解轨迹
         * @param segment
         */
        abstract onSolveByJoinPoint(segment: TrackSegment): void;
        /**
         * 创建移动要素
         * @param {*} trackline 线路
         * @param {*} graphic 要素
         * @param {*} angle 偏转角
         */
        abstract onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number): any;
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
        speedUp(name: string): string;
        speedDown(name: string): string;
        clear(name: string): void;
        clearLine(name: string): void;
        /**
         * 清除所有
         */
        clearAll(): void;
        deleteTrackToolBox(): void;
        showTrackToolBox(): void;
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
        protected onMoveEvent(flagwindRoute: this, segment: TrackSegment, xy: any, angle: number): void;
        protected onAddLayerBefor(): void;
        protected onAddLayerAfter(): void;
        protected onLoad(): void;
        protected abstract onChangeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number): void;
    }
}
declare namespace flagwind {
    class EsriRouteLayer extends FlagwindRouteLayer {
        moveLineLayer: FlagwindGroupLayer;
        moveMarkLayer: FlagwindGroupLayer;
        trackLines: Array<TrackLine>;
        onSetSegmentByLine(options: any, segment: TrackSegment): void;
        onSetSegmentByPoint(options: any, segment: TrackSegment): void;
        onShowSegmentLine(segment: TrackSegment): void;
        onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number): void;
        onCreateLineLayer(id: string): FlagwindGroupLayer;
        onCreateMovingLayer(id: string): FlagwindGroupLayer;
        onEqualGraphic(originGraphic: any, targetGraphic: any): boolean;
        onGetStandardStops(name: String, stops: Array<any>): Array<any>;
        onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        onSolveByJoinPoint(segment: TrackSegment): void;
        onAddEventListener(groupLayer: FlagwindGroupLayer, eventName: string, callBack: Function): void;
        getSpatialReferenceFormNA(): any;
        protected getStandardGraphic(graphic: any): any;
        protected cloneStopGraphic(graphic: any): any;
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        protected onChangeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number): void;
    }
}
declare namespace flagwind {
    const SELECT_BOX_OPTIONS_ESRI: any;
    /**
     * 线
     */
    class EsriSelectBox extends EventProvider {
        flagwindMap: FlagwindMap;
        options: any;
        private draw;
        mode: string;
        layers: Array<FlagwindBusinessLayer>;
        constructor(flagwindMap: FlagwindMap, options: any);
        onCreateRecord(me: this, e: any): void;
        addLayer(layer: FlagwindBusinessLayer): void;
        deleteSelectBar(): void;
        showSelectBar(mapId: string): void;
        clear(): void;
        active(mode: string): void;
    }
}
declare namespace flagwind {
    /**
     * 底图包装类
     *
     * @export
     * @class FlagwindTiledLayer
     */
    abstract class FlagwindTiledLayer {
        id: string;
        url: string | null;
        spatial: any;
        title: string | null;
        layer: any;
        isShow: boolean;
        constructor(id: string, url: string | null, spatial: any, title: string | null);
        abstract onCreateTiledLayer(args: any): any;
        appendTo(map: any): void;
        removeLayer(map: any): void;
        show(): void;
        hide(): void;
    }
}
declare namespace flagwind {
    class EsriTiledLayer extends FlagwindTiledLayer {
        onCreateTiledLayer(args: any): any;
    }
}
declare namespace flagwind {
    class EsriVehicleRouteLayer extends EsriRouteLayer {
        showTrack(trackLineName: string, stopList: Array<any>, options: any): void;
        getStopsGraphicList(stopList: Array<any>): any[];
    }
}
declare namespace flagwind {
    /**
     * 几何对象
     */
    abstract class EsriGeometry {
        type: string;
        spatial: EsriSpatial;
        point: any;
        attributes: any;
        constructor(type: string, evt: any, spatial: EsriSpatial);
        abstract toJson(): any;
    }
    /**
     * 线
     */
    /**
     * 面
     */
    /**
     * 圆
     */
    /**
     * 坐标点
     */
    class EsriPoint extends EsriGeometry {
        x: number;
        y: number;
        spatial: EsriSpatial;
        constructor(x: number, y: number, spatial?: EsriSpatial);
        toJson(): {
            "type": string;
            "properties": any;
            "geometry": {
                "type": string;
                "coordinates": number[];
            };
        };
    }
    /**
     * 空间投影
     */
    class EsriSpatial {
        wkid: number;
        spatial: any;
        constructor(wkid: number);
    }
    interface IEsriGraphic {
        id: string;
        attributes: any;
        isShow: boolean;
        isInsided: boolean;
        kind: string;
        layer: IEsriGraphicsLayer;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: EsriGeometry): void;
        addTo(layer: any): void;
    }
    interface IEsriGraphicsLayer {
        map: any;
        layer: any;
        graphics: Array<IEsriGraphic>;
        show(): void;
        hide(): void;
        add(graphic: any): void;
        remove(graphic: any): void;
        addToMap(map: any): void;
        removeFromMap(layer: any): void;
        on(eventName: string, callBack: Function): void;
        dispatchEvent(type: string, data?: any): void;
    }
    class EsriGraphicsLayer extends EventProvider implements IEsriGraphicsLayer {
        options: any;
        private GRAPHICS_MAP;
        /**
         * 是否在地图上
         */
        _isInsided: boolean;
        id: string;
        map: any;
        layer: any;
        readonly isInsided: boolean;
        constructor(options: any);
        readonly graphics: any;
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        show(): void;
        hide(): void;
        remove(graphic: IEsriGraphic): void;
        clear(): void;
        add(graphic: IEsriGraphic): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
    }
}
declare var echarts: any;
declare namespace flagwind {
    class EsriSetting implements IMapSetting {
        baseUrl: string;
        imageUrl: string;
        zhujiImageUrl: string;
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
    /**
     * 业务图层数据服务接口
     */
    interface IFlagwindBusinessService {
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
     * 热力图
     */
    interface IFlagwindHotmapLayer {
        clear(): void;
        show(): void;
        hide(): void;
        resize(): void;
        showDataList(datas: Array<any>, etent: any): void;
    }
}
declare namespace flagwind {
    const LOCATION_LAYER_OPTIONS: {
        onMapClick: (evt: any) => void;
    };
    interface IFlagwindLocationLayer {
        point: any;
        clear(): void;
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
        setMultPoints(points: Array<any>): void;
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
        segments: Array<TrackSegment>;
        isMovingGraphicHide: boolean;
        speed: number | null;
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
         * 增速
         */
        speedUp(): string;
        /**
         * 减速
         */
        speedDown(): string;
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
    interface IMapSetting {
        baseUrl: string;
        imageUrl: string;
        zhujiImageUrl: string;
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
         * 增密
         * @param start 始点
         * @param end 终点
         * @param n 增加的点数
         */
        static density(start: MinemapPoint, end: MinemapPoint, n: number): {
            x: number;
            y: number;
        }[];
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
         * @param paths  多线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        static vacuate(paths: Array<Array<any>>, length: number, numsOfKilometer: number): any[];
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
        static of(...kvs: Array<any>): Map<any, any>;
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
     * EventArgs 类作为创建事件参数的基类，当发生事件时，EventArgs 实例将作为参数传递给事件侦听器。
     * @class
     * @version 1.0.0
     */
    class EventArgs {
        private _type;
        private _source;
        private _data;
        /**
         * 获取一个字符串值，表示事件的类型。
         * @property
         * @returns string
         */
        readonly type: string;
        /**
         * 获取或设置事件源对象。
         * @property
         * @returns any
         */
        source: any;
        /**
         * 获取或设置与事件关联的可选数据。
         * @property
         * @returns any
         */
        data: any;
        /**
         * 初始化 EventArgs 类的新实例。
         * @constructor
         * @param  {string} type 事件类型。
         * @param  {any?} data 可选数据。
         */
        constructor(type: string, data?: any);
    }
}
declare namespace flagwind {
    /**
     * 为可取消的事件提供数据。
     * @class
     * @version 1.0.0
     */
    class CancelEventArgs extends EventArgs {
        private _cancel;
        /**
         * 获取或设置指示是否应取消事件。
         * @property
         * @returns boolean
         */
        cancel: boolean;
    }
}
declare namespace flagwind {
    /**
     * 提供关于事件提供程序的功能。
     * @class
     * @version 1.0.0
     */
    class EventProviderFactory implements IEventProviderFactory {
        private _providers;
        private static _instance;
        /**
         * 获取所有事件提供程序。
         * @property
         * @returns IMap<any, IEventProvider>
         */
        protected readonly providers: IMap<any, IEventProvider>;
        /**
         * 获取事件提供程序工厂的单实例。
         * @static
         * @property
         * @returns EventProviderFactory
         */
        static readonly instance: EventProviderFactory;
        /**
         * 初始化事件提供程序工厂的新实例。
         * @constructor
         */
        constructor();
        /**
         * 获取指定事件源的事件提供程序。
         * @param  {any} source IEventProvider 所抛出事件对象的源对象。
         * @returns IEventProdiver 返回指定名称的事件提供程序。
         */
        getProvider(source: any): IEventProvider;
        /**
         * 根据指定事件源创建一个事件提供程序。
         * @virtual
         * @param  {any} source IEventProvider 所抛出事件对象的源对象。
         * @returns IEventProvider 事件提供程序实例。
         */
        protected createProvider(source: any): IEventProvider;
    }
}
declare namespace flagwind {
    /**
     * 定义用于添加或删除事件侦听器的方法，检查是否已注册特定类型的事件侦听器，并调度事件。
     * @interface
     * @version 1.0.0
     */
    interface IEventProvider {
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        addListener(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        removeListener(type: string, listener: Function, scope?: any): void;
        /**
         * 检查是否为特定事件类型注册了侦听器。
         * @param  {string} type 事件类型。
         * @returns boolean 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
         */
        hasListener(type: string): boolean;
        /**
         * 派发一个指定类型的事件。
         * @param  {string} type 事件类型。
         * @param  {any} data? 事件数据。
         * @returns void
         */
        dispatchEvent(type: string, data?: any): void;
        /**
         * 派发一个指定参数的事件。
         * @param  {EventArgs} eventArgs 事件参数实例。
         * @returns void
         */
        dispatchEvent(args: EventArgs): void;
    }
}
declare namespace flagwind {
    /**
     * 提供关于事件提供程序的功能。
     * @interface
     * @version 1.0.0
     */
    interface IEventProviderFactory {
        /**
         * 获取指定事件源的事件提供程序。
         * @param  {any} source IEventProvider 所抛出事件对象的源对象。
         * @returns IEventProdiver 返回指定名称的事件提供程序。
         */
        getProvider(source: any): IEventProvider;
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
     * 线
     */
    class MinemapCircleGraphic extends EventProvider implements IMinemapGraphic {
        private _geometry;
        private _isInsided;
        id: string;
        attributes: any;
        isShow: boolean;
        symbol: any;
        kind: string;
        circle: any;
        layer: IMinemapGraphicsLayer;
        readonly isInsided: boolean;
        constructor(options: any);
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: MinemapCircle): void;
        addTo(map: any): void;
    }
}
declare namespace flagwind {
    /**
     * 编辑要素图层
     */
    class MinemapEditLayer implements IFlagwindEditLayer {
        businessLayer: MinemapPointLayer;
        private graphic;
        private draggingFlag;
        private cursorOverPointFlag;
        options: any;
        constructor(businessLayer: MinemapPointLayer, options: Object);
        readonly map: any;
        registerEvent(graphic: MinemapMarkerGraphic): void;
        updatePoint(editLayer: this): void;
        mouseMovePoint(e: any): void;
        activateEdit(key: string): void;
        cancelEdit(key: string): void;
        onChanged(options: any, isSave: boolean): Promise<boolean>;
    }
}
declare namespace flagwind {
    class MinemapGroupLayer extends FlagwindGroupLayer {
        addListener(type: string, listener: Function, scope?: any, once?: boolean): void;
        removeListener(type: string, listener: Function, scope?: any): void;
        hasListener(type: string): boolean;
        dispatchEvent(type: string, data?: any): void;
        dispatchEvent(args: EventArgs): void;
        onCreateGraphicsLayer(options: any): MinemapGraphicsLayer;
    }
}
declare namespace flagwind {
    class MinemapHotmapLayer implements IFlagwindHotmapLayer {
        flagwindMap: FlagwindMap;
        private _echartslayer;
        isShow: boolean;
        options: any;
        chartOptions: any;
        readonly echartslayer: any;
        constructor(flagwindMap: FlagwindMap, options: any);
        resize(): void;
        clear(): void;
        show(): void;
        hide(): void;
        showDataList(data: Array<any>): void;
        changeStandardData(data: Array<any>): any[][];
    }
}
declare namespace flagwind {
    /**
     * 文本
     */
    class MinemapLabelGraphic extends EventProvider implements IMinemapGraphic {
        private _geometry;
        private _isInsided;
        id: string;
        attributes: any;
        isShow: boolean;
        symbol: any;
        kind: string;
        label: any;
        layer: IMinemapGraphicsLayer;
        readonly isInsided: boolean;
        constructor(options: any);
        geometry: MinemapPoint;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: MinemapPoint): void;
        addTo(map: any): void;
    }
}
declare namespace flagwind {
    /**
     * 几何对象
     */
    abstract class MinemapGeometry {
        type: string;
        spatial: MinemapSpatial;
        attributes: any;
        constructor(type: string, spatial: MinemapSpatial);
        abstract toJson(): any;
    }
    /**
     * 线
     */
    class MinemapPolyline extends MinemapGeometry {
        path: Array<Array<number>>;
        constructor(spatial?: MinemapSpatial);
        getPoint(pointIndex: number): number[];
        insertPoint(pointIndex: number, point: Array<number>): void;
        removePoint(pointIndex: number): void;
        toJson(): {
            "type": string;
            "data": {
                "type": string;
                "properties": any;
                "geometry": {
                    "type": string;
                    "coordinates": number[][];
                };
            };
        };
    }
    /**
     * 面
     */
    class MinemapPolygon extends MinemapGeometry {
        rings: Array<Array<Array<number>>>;
        constructor(spatial?: MinemapSpatial);
        addRing(path: Array<Array<number>>): void;
        removeRing(ringIndex: number): void;
        getPoint(ringIndex: number, pointIndex: number): number[];
        insertPoint(ringIndex: number, pointIndex: number, point: Array<number>): void;
        removePoint(ringIndex: number, pointIndex: number): void;
        /**
         * 判断点是否在圆里面
         * @param point 点
         */
        inside(point: Array<any>): boolean;
        toJson(): {
            "type": string;
            "data": {
                "type": string;
                "properties": any;
                "geometry": {
                    "type": string;
                    "coordinates": number[][][];
                };
            };
        };
    }
    /**
     * 圆
     */
    class MinemapCircle extends MinemapGeometry {
        center: Array<number>;
        radius: number;
        constructor(spatial?: MinemapSpatial);
        toJson(): {
            "type": string;
            "data": {
                "type": string;
                "properties": any;
                "geometry": {
                    "type": string;
                    "coordinates": number[];
                };
            };
        };
        /**
         * 判断点是否在圆里面
         * @param point 点
         */
        inside(point: Array<any>): boolean;
    }
    /**
     * 坐标点
     */
    class MinemapPoint extends MinemapGeometry {
        x: number;
        y: number;
        spatial: MinemapSpatial;
        constructor(x: number, y: number, spatial?: MinemapSpatial);
        toJson(): {
            "type": string;
            "properties": any;
            "geometry": {
                "type": string;
                "coordinates": number[];
            };
        };
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
        attributes: any;
        isShow: boolean;
        isInsided: boolean;
        kind: string;
        layer: IMinemapGraphicsLayer;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: MinemapGeometry): void;
        addTo(map: any): void;
    }
    interface IMinemapGraphicsLayer {
        map: any;
        graphics: Array<IMinemapGraphic>;
        show(): void;
        hide(): void;
        add(graphic: any): void;
        remove(graphic: any): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
        on(eventName: string, callBack: Function): void;
        dispatchEvent(type: string, data?: any): void;
    }
    class MinemapGraphicsLayer extends EventProvider implements IMinemapGraphicsLayer {
        options: any;
        private GRAPHICS_MAP;
        /**
         * 是否在地图上
         */
        _isInsided: boolean;
        id: string;
        map: any;
        readonly isInsided: boolean;
        constructor(options: any);
        readonly graphics: any;
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        show(): void;
        hide(): void;
        remove(graphic: IMinemapGraphic): void;
        clear(): void;
        add(graphic: IMinemapGraphic): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
    }
}
declare namespace flagwind {
    class MinemapLocationLayer extends MinemapGraphicsLayer implements IFlagwindLocationLayer {
        flagwindMap: FlagwindMap;
        point: MinemapPoint;
        constructor(flagwindMap: FlagwindMap, options: any);
        registerEvent(): void;
        locate(): void;
    }
}
declare namespace flagwind {
    class MinemapMap extends FlagwindMap {
        mapSetting: IMapSetting;
        mapEl: any;
        constructor(mapSetting: IMapSetting, mapEl: any, options: any);
        /**
         * 中心定位
         * @param point 坐标点
         */
        onCenterAt(point: any): void;
        /**
         * 创建点
         * @param options 点属性
         */
        onCreatePoint(options: any): MinemapPoint;
        /**
         * 创建地图对象
         */
        onCreateMap(): any;
        onShowInfoWindow(evt: any): void;
        onCloseInfoWindow(): void;
        /**
         * 创建底图
         */
        onCreateBaseLayers(): FlagwindTiledLayer[];
        onShowTooltip(graphic: any): void;
        onHideTooltip(graphic: any): void;
        onCreateContextMenu(args: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }): void;
    }
}
declare namespace flagwind {
    class MinemapMarkerGraphic extends EventProvider implements IMinemapGraphic {
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
        icon: any;
        attributes: any;
        layer: IMinemapGraphicsLayer;
        constructor(options: any);
        addClass(className: string): void;
        removeClass(className: string): void;
        /**
         * 复制节点
         * @param id 元素ID
         */
        clone(id: string): MinemapMarkerGraphic;
        readonly kind: string;
        readonly isInsided: boolean;
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        on(type: string, listener: Function, scope?: any, once?: boolean): void;
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        off(type: string, listener: Function, scope?: any): void;
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setAngle(angle: number): void;
        setSymbol(symbol: any): void;
        draw(): void;
        geometry: MinemapPoint;
        setGeometry(value: MinemapGeometry): void;
        addTo(map: any): void;
        protected fireEvent(type: string, data?: any): void;
    }
}
declare namespace flagwind {
    /**
     * 点图层
     */
    class MinemapPointLayer extends FlagwindBusinessLayer {
        businessService: IFlagwindBusinessService;
        isLoading: boolean;
        constructor(businessService: IFlagwindBusinessService, flagwindMap: FlagwindMap, id: string, options: any);
        onCreateGraphicsLayer(options: any): MinemapGraphicsLayer;
        openInfoWindow(id: string, context: any, options: any): void;
        onShowInfoWindow(evt: any): void;
        /**
         * 把实体转换成标准的要素属性信息
         * @param item 实体信息
         */
        onChangeStandardModel(item: any): any;
        getImageUrl(item: any): string;
        getClassName(item: any): string;
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
         * 加载并显示设备点位
         *
         * @memberof TollgateLayer
         */
        showDataList(): void;
        /**
         * 开启定时器
         */
        start(): void;
        /**
         * 关闭定时器
         */
        stop(): void;
        protected setSelectStatus(item: any, selected: boolean): void;
        protected setGraphicStatus(item: any): void;
        /**
         * 更新设备状态
         */
        private updateStatus();
    }
}
declare namespace flagwind {
    /**
     * 面
     */
    class MinemapPolygonGraphic extends EventProvider implements IMinemapGraphic {
        private _geometry;
        private _isInsided;
        id: string;
        attributes: any;
        isShow: boolean;
        symbol: any;
        kind: string;
        polygon: any;
        layer: IMinemapGraphicsLayer;
        readonly isInsided: boolean;
        constructor(options: any);
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: MinemapPolygon): void;
        addTo(map: any): void;
    }
}
declare namespace flagwind {
    /**
     * 线
     */
    class MinemapPolylineGraphic extends EventProvider implements IMinemapGraphic {
        private _geometry;
        private _isInsided;
        id: string;
        attributes: any;
        isShow: boolean;
        symbol: any;
        kind: string;
        polyline: any;
        layer: IMinemapGraphicsLayer;
        readonly isInsided: boolean;
        constructor(layer: IMinemapGraphicsLayer, options: any);
        show(): void;
        hide(): void;
        remove(): void;
        delete(): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: MinemapPolyline): void;
        addTo(map: any): void;
    }
}
declare namespace flagwind {
    class MinemapRouteLayer extends FlagwindRouteLayer {
        onSetSegmentByLine(options: any, segment: TrackSegment): void;
        onSetSegmentByPoint(options: any, segment: TrackSegment): void;
        onCreateMovingLayer(id: string): FlagwindGroupLayer;
        onCreateLineLayer(id: string): FlagwindGroupLayer;
        onEqualGraphic(originGraphic: any, targetGraphic: any): boolean;
        onShowSegmentLine(segment: TrackSegment): void;
        onGetStandardStops(name: String, stops: Array<any>): Array<any>;
        /**
         * 由路由服务来路径规划
         * @param segment 路段
         * @param start 开始结点
         * @param end 结束结点
         * @param waypoints  经过点
         */
        onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        /**
         * 由点点连线进行路径规划
         * @param segment 路段
         */
        onSolveByJoinPoint(segment: TrackSegment): void;
        onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number): void;
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        protected onChangeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number): void;
    }
}
declare namespace flagwind {
    /**
     * 思维图新路由结果定义
     */
    class RouteResult {
        success: boolean;
        message: string;
        data: {
            error: string;
            rows: Array<RouteRow>;
        };
        constructor(result: any);
        getLine(spatial: any): MinemapPolyline;
    }
    class RouteItem {
        streetName: string;
        distance: number;
        duration: number;
        guide: string;
        constructor(item: any);
    }
    class RouteRow {
        center: MinemapPoint;
        scale: number;
        distance: number;
        duration: number;
        points: Array<Array<any>>;
        items: Array<RouteItem>;
        constructor(result: any);
        getPoints(spatial: any): Array<MinemapPoint>;
        getLine(spatial: any): MinemapPolyline;
    }
}
declare namespace flagwind {
    const SELECT_BOX_OPTIONS: any;
    /**
     * 线
     */
    class MinemapSelectBox extends EventProvider {
        flagwindMap: FlagwindMap;
        options: any;
        private edit;
        mode: string;
        layers: Array<FlagwindBusinessLayer>;
        constructor(flagwindMap: FlagwindMap, options: any);
        onCreateRecord(me: this, e: any): void;
        addLayer(layer: FlagwindBusinessLayer): void;
        deleteSelectBar(): void;
        showSelectBar(mapId: string): void;
        clear(): void;
        active(mode: string): void;
    }
}
declare namespace flagwind {
    class MinemapVehicleRouteLayer extends MinemapRouteLayer {
        showTrack(trackLineName: string, stopList: Array<any>, options: any): void;
        getStopsGraphicList(stopList: Array<any>): any[];
    }
}
declare var minemap: any;
declare var turf: any;
declare namespace flagwind {
    class MinemapSetting implements IMapSetting {
        baseUrl: string;
        imageUrl: string;
        zhujiImageUrl: string;
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
    class MinemapUtils {
        /**
         * 求两点之间的距离
         * @param from 起点
         * @param to 终点
         */
        static getLength(from: MinemapPoint, to: MinemapPoint): number;
        /**
         * 求多点之间连线的距离
         * @param points 多点集
         * @param count 抽点次数
         */
        static distance(points: Array<MinemapPoint>, count?: number | null): number;
    }
}
declare namespace flagwind {
    /**
     * 提供一种用于释放非托管资源的机制。
     * @interface
     * @version 1.0.0
     */
    interface IDisposable {
        /**
         * 执行与释放或重置非托管资源关联的应用程序定义的任务。
         * @returns void
         */
        dispose(): void;
    }
}
declare namespace flagwind {
    /**
     * 提供一些常用类型检测与反射相关的方法。
     * @static
     * @class
     * @version 1.0.0
     */
    class Type {
        private static readonly _metadatas;
        /**
         * 私有构造方法，使类型成为静态类。
         * @private
         */
        private constructor();
        /**
         * 检测一个值是否为数组。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isArray(value: any): boolean;
        /**
         * 检测一个值是否为对象。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isObject(value: any): boolean;
        /**
         * 检测一个值是否为字符串。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isString(value: any): boolean;
        /**
         * 检测一个值是否为日期。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isDate(value: any): boolean;
        /**
         * 检测一个值是否为正则表达式。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isRegExp(value: any): boolean;
        /**
         * 检测一个值是否为函数。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isFunction(value: any): boolean;
        /**
         * 检测一个值是否为布尔值。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isBoolean(value: any): boolean;
        /**
         * 检测一个值是否为数值。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isNumber(value: any): boolean;
        /**
         * 检测一个值是否为 null。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isNull(value: any): boolean;
        /**
         * 检测一个值是否为 undefined。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isUndefined(value: any): boolean;
        /**
         * 检测一个值是否为 null 或 undefined。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        static isEmptyObject(value: any): boolean;
        /**
         * 表示一个字符串值是否为 null 或 undefined 或 空值。
         * @static
         * @param  {string} value 要检测的字符串实例。
         * @returns boolean
         */
        static isEmptyString(value: string): boolean;
        /**
         * 设置指定类型的元数据。
         * @param  {any} type 目标类型。
         * @param  {any} metadata 元数据。
         * @returns void
         */
        static setMetadata(type: any, metadata: any): void;
        /**
         * 获取指定类型的元数据。
         * @param  {any} type 目标类型。
         * @returns any 元数据。
         */
        static getMetadata(type: any): any;
        /**
         * 返回对象的类型(即构造函数)。
         * @param  {string|any} value 实例或类型路径。
         * @returns Function 如果成功解析则返回类型的构造函数，否则为 undefined。
         */
        static getClassType(value: string | any): Function;
        /**
         * 返回 value 参数指定的对象的类名。
         * @param  {any} value 需要取得类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number)和类对象。
         * @returns string 类名称的字符串。
         */
        static getClassName(value: any): string;
        /**
         * 返回 value 参数指定的对象的完全限定类名。
         * @static
         * @param  {any} value 需要取得完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number)和类对象。
         * @returns string 包含完全限定类名称的字符串。
         */
        static getQualifiedClassName(value: any): string;
        /**
         * 返回 value 参数指定的对象的基类的类名。
         * @param  {any} value 需要取得父类类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number）和类对象。
         * @returns string 基类名称，或 null（如果不存在基类名称）。
         */
        static getSuperclassName(value: any): string;
        /**
         * 返回 value 参数指定的对象的基类的完全限定类名。
         * @param  {any} value 需要取得父类完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number）和类对象。
         * @returns string 完全限定的基类名称，或 null（如果不存在基类名称）。
         */
        static getQualifiedSuperclassName(value: any): string;
        /**
         * 确定指定类型的实例是否可以分配给当前类型的实例。
         * @param  {Function} parentType 指定基类的类型。
         * @param  {Function} subType 指定的实例类型。
         * @returns boolean
         */
        static isAssignableFrom(parentType: Function | String, subType: Function): boolean;
        /**
         * 获取指定值的类型字符串(小写)。
         * @private
         * @static
         * @param  {any} value
         * @returns string
         */
        private static getTypeString(value);
    }
}
