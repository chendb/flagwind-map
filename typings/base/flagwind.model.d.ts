declare namespace flagwind {
    class TrackSegmentOptions {
        numsOfKilometer: number;
        speed: number;
        autoShowLine: boolean;
        constructor(numsOfKilometer: number, speed?: number, autoShowLine?: boolean);
        onShowSegmentLineEvent(segment: TrackSegment): void;
        onMoveStartEvent(target: any, startGraphic: any, angle: number): void;
        onMoveEndEvent(target: any, endGraphic: any, angle: number): void;
        onMoveEvent(target: any, point: any, angle: number): void;
    }
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
