declare namespace flagwind {
    const flagwindRouteOptions: any;
    const lineOptions: any;
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
        protected onCreateSegmentComplete(segment: TrackSegment): void;
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
