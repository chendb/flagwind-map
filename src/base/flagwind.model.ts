namespace flagwind {

    export const TRACKSEGMENT_OPTIONS = {
        speed: 100,
        maxSpeed: 800,
        numsOfKilometer: 50,
        autoShowLine: false,

        onShowSegmentLineEvent(segment: TrackSegment) {
            console.log("onShowSegmentLineEvent");
        },

        onMoveStartEvent(target: any, startGraphic: any, angle: number) {
            console.log("onMoveStartEvent");
        },
        onMoveEndEvent(target: any, endGraphic: any, angle: number) {
            console.log("onMoveEndEvent");
        },
        onMoveEvent(target: any, point: any, angle: number) {
            console.log("onMoveEvent");
        }
    };

    /**
     * 地图图形要素
     */
    // tslint:disable-next-line:interface-name
    export interface FlagwindGraphic {
        attributes: any;
        geometry: any;
        symbol: any;
        show(): void;
        hide(): void;
        setAngle(angle: number): void;
        setSymbol(symbol: any): void;
        setGeometry(geometry: any): void;
    }

    /**
     * 地图右键菜单创建事件参数
     */
    // tslint:disable-next-line:interface-name
    export interface ContextMenuCreateEventArgs{
        contextMenu: Array<any>;
        contextMenuClickEvent: any;
    }

    /**
     * 地图点类型定义
     */
    // tslint:disable-next-line:interface-name
    export interface FlagwindPoint {
        x: number;
        y: number;
        spatial: any;
    }

    /**
     * 地图打开事件参数
     */
    export interface InfoWindowShowEventArgs {
        graphic: any;
        context: { type: string; title: any; content: any };
        options?: any;
    }

    export enum SelectMode {
        single = 1, multiple = 2
    }

    export enum LayerType {
        point = "point", polyline = "polyline", polygon = "polygon"
    }

    /**
     * 对轨迹播放中线路的路段的定义
     * 
     * @export
     * @class TrackSegment
     */
    export class TrackSegment {
        public timer: any;
        /**
         * 移动要素在该路段点集合的位置
         */
        public position = -1;
        
        /**
         * 线段长度
         */
        public length: number | null;

        /**
         * 线段速度
         */
        public speed: number | null;

        /**
         * 是否播放完成
         */
        public isCompleted = false;

        /**
         * 是否正在运行
         */
        public isRunning = false;

        /**
         * 线路点集合
         */
        public line: Array<any>;

        /**
         * 几何线
         */
        public polyline: any | null;

        /**
         * 定时器时间（ms）
         */
        public time = 200;

        /**
         * 要素线（由外部使用）
         * 
         * @type {*}
         * @memberof TrackSegment
         */
        public lineGraphic: any;

        /**
         * 
         * 途经的点
         * 
         * @type {any[]}
         * @memberof TrackSegment
         */
        public waypoints: Array<any> = [];

        public constructor(
            public flagwindRouteLayer: FlagwindRouteLayer,
            public index: number,    // 线路对应路段索引
            public name: string,         // 线路名
            public startGraphic: FlagwindGraphic,     // 起点要素
            public endGraphic: FlagwindGraphic,       // 终点要素
            public options: any) {
            this.options = { ...TRACKSEGMENT_OPTIONS, ...options };
        }

        /**
         * 设置拆线
         * @param polyline 几何拆线
         * @param length 线的长度
         */
        public setPolyLine(polyline: any, length: number) {
            this.flagwindRouteLayer.onSetSegmentByLine({
                polyline: polyline,
                length: length
            }, this);
            if (!this.speed) this.changeSpeed();
            this.options.onShowSegmentLineEvent(this);
        }

        /**
         * 设置直线
         * @param points 几何点集
         */
        public setMultPoints(points: Array<any>) {

            this.flagwindRouteLayer.onSetSegmentByPoint({
                points: points,
                spatial: this.flagwindRouteLayer.flagwindMap.spatial
            }, this);
            if (!this.speed) this.changeSpeed();
            console.debug("路段" + this.index + "长度：" + this.length + "km");
            console.debug("路段" + this.index + "取点：" + this.line.length + "个");
            console.debug("路段" + this.index + "速度：" + this.speed + "km/h");
            console.debug("路段" + this.index + "定时：" + this.time + "ms");
            this.options.onShowSegmentLineEvent(this);
        }

        /**
         * 变换速度
         * @param speed 速度值 
         */
        public changeSpeed(speed: number | null = null) {
            if (this.options.numsOfKilometer === 0) {
                this.speed = 10000000;
                this.time = 1;
            } else {
                this.speed = (speed || this.options.speed);
                this.time = (this.length || 0) * 3600 / ((this.speed || 100) * 15 * this.line.length);
            }

            // 若正在跑，则暂停，改变速度后再执行
            if (this.timer) {
                this.pause();
                this.start();
            }
        }

        /**
         * 播放移动要素（起点为上次终点）
         */
        public move() {
            this.position = this.position + 1;
            let angle = 0;
            if (this.position === 0) {
                if (this.line.length > 1) {
                    angle = MapUtils.getAngle(this.startGraphic.geometry, {
                        x: this.line[0][0], y: this.line[0][1]
                    }) || 0;
                }
                this.options.onMoveStartEvent(this, this.startGraphic, angle);
                this.options.onMoveEvent(this, [this.startGraphic.geometry.x, this.startGraphic.geometry.y], angle);
                return;
            }

            if (this.position >= this.line.length) {
                if (this.line.length > 1) {
                    angle = MapUtils.getAngle({
                        x: this.line[this.line.length - 1][0],
                        y: this.line[this.line.length - 1][1]
                    }, this.endGraphic.geometry) || 0;
                }
                this.isCompleted = true;
                this.stop();
                this.options.onMoveEvent(this, [this.endGraphic.geometry.x, this.endGraphic.geometry.y], angle);
                this.options.onMoveEndEvent(this, this.endGraphic, angle);
                return;
            }

            angle = MapUtils.getAngle(
                {
                    x: this.line[this.position - 1][0],
                    y: this.line[this.position - 1][1]
                },
                {
                    x: this.line[this.position][0],
                    y: this.line[this.position][1]
                });
            const xx = parseFloat(this.line[this.position - 1][0]).toFixed(5);
            const yy = parseFloat(this.line[this.position - 1][1]).toFixed(5);
            this.options.onMoveEvent(this, [xx, yy], angle);

        }

        /**
         * 播放移动要素（起点为路段的始点）
         */
        public start() {
            this.isRunning = true;
            this.timer = window.setInterval(() => {
                if (!this.line) {
                    console.log("线路" + this.name + "的第" + (this.index + 1) + "路段等待设置");
                } else {
                    this.move();
                }
            }, this.time);
            return true;
        }
        /**
         * 当定时器为空，且运行状态为true时表示是暂停
         */
        public get isPaused(): boolean {
            return (!this.timer) && this.isRunning;
        }

        /**
         * 暂停
         */
        public pause() {
            window.clearInterval(this.timer);
            this.timer = null;
        }

        /**
         * 停止
         */
        public stop() {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = null;
            this.isRunning = false;
            this.position = -1;
        }

        /**
         * 重置
         */
        public reset() {
            this.timer = null;
            this.isRunning = false;
            this.position = -1;
            this.isCompleted = false;
        }
    }

    /**
     * 对轨迹播放中线路的定义（它由多个路段组成）
     * 
     * @export
     * @class TrackLine
     */
    export class TrackLine {

        /**
         * 设置线路上移动要素(如：车辆图标)
         */
        public markerGraphic: FlagwindGraphic;

        /**
         * 路段集合
         */
        public segments: Array<TrackSegment> = [];

        /**
         * 移动要素是否隐藏
         */
        public isMovingGraphicHide = false;

        /**
         * 当前速度
         */
        public speed: number | null;

        public constructor(
            public flagwindMap: FlagwindMap,
            public name: string,
            public options: any) {
            this.options = { ...TRACKSEGMENT_OPTIONS, ...options };
        }

        // #region 属性

        /**
         * 获取监控最近播放完成的路段线路
         */
        public get activeCompletedSegment(): TrackSegment | null {
            let line = null;
            if (this.segments.length === 0) return undefined;

            for (let i = 0; i < this.segments.length; i++) {
                let rl = this.segments[i];
                if (rl.isCompleted && (line == null || rl.index > line.index)) {
                    line = rl;
                }
            }
            return line;
        }

        /**
         * 计算线路的下一个路段索引
         */
        public get nextSegmentIndex(): number {
            if (this.segments.length === 0) return 0;

            let startLineIndex = 0;
            for (let i = 0; i < this.segments.length; i++) {
                let rl = this.segments[i];
                if (rl.index > startLineIndex) {
                    startLineIndex = rl.index;
                }
            }
            if (startLineIndex > 0) {
                startLineIndex += 1;
            }
            return startLineIndex;
        }
        /**
         * 获取最后的一个路段
         */
        public get lastSegment(): TrackSegment | null {
            if (this.segments.length === 0) return null;
            let segment = null;
            for (let i = 0; i < this.segments.length; i++) {
                let rl = this.segments[i];
                if ((!segment) || rl.index > segment.index) {
                    segment = rl;
                }
            }
            return segment;
        }

        /**
         * 若有一个路段正在跑，代表该线路是正在运行
         */
        public get isRunning(): boolean {
            if (this.segments.length === 0) return false;
            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                if (segemtn.isRunning === true) {
                    return true;
                }
            }
            return false;
        }
        /**
         * 当所有的路段完成时，说明线路是跑完状态
         */
        public get isCompleted(): boolean {
            if (this.segments.length === 0) return false;
            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                if (segemtn.isCompleted === false) {
                    return false;
                }
            }
            return true;
        }

        // #endregion

        // #region 方法

        /**
         * 隐藏移动要素
         * 
         * @memberof TrackLine
         */
        public hideMovingGraphic(): void {
            this.isMovingGraphicHide = true;
            this.markerGraphic.hide();
        }

        /**
         * 显示移动要素
         * 
         * @memberof TrackLine
         */
        public showMovingGraphic(): void {
            if (this.isMovingGraphicHide) {
                this.isMovingGraphicHide = false;
                this.markerGraphic.show();
            }
        }

        /**
         * 调速
         */
        public changeSpeed(speed: number): void {
            if (this.segments.length === 0) return;
            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                segemtn.changeSpeed(speed);
            }
        }
        /**
         * 增速
         */
        public speedUp(): string {
            if (!this.speed) this.speed = this.options.speed;
            if (this.speed < this.options.maxSpeed) {
                this.speed = Math.max(this.speed * 2, this.options.speed);
                this.changeSpeed(this.speed);
            }
            return `当前状态：${this.speed / this.options.speed}倍播放`;
        }
        /**
         * 减速
         */
        public speedDown(): string {
            if (!this.speed) this.speed = this.options.speed;
            this.speed = Math.max(this.speed / 2, this.options.speed);
            this.changeSpeed(this.speed);
            return `当前状态：${this.speed / this.options.speed}倍播放`;
        }
        /**
         * 启动线路播放（从第一个路段的起点开始）
         */
        public start(): void {
            if (this.isRunning) return;

            let playSegment = this.segments[0];
            for (let i = 0; i < this.segments.length; i++) {
                const segemtn = this.segments[i];
                if (playSegment.index > segemtn.index) {
                    playSegment = segemtn;
                }
            }
            playSegment.start();
        }
        /**
         * 停止线路
         */
        public stop(): void {

            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                segemtn.stop();
            }

        }
        /**
         * 重置
         */
        public reset(): void {

            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                segemtn.reset();
            }
        }

        /**
         * 暂停
         */
        public pause(): void {
            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                if (segemtn.isRunning) {
                    segemtn.pause();
                    return;
                }
            }
        }

        /**
         * 继续（与 暂停 是操作对，只能是在调用了暂停 才可以启用它）
         */
        public continue(): void {

            // 若没有路段进行运行，则启动线路
            if (!this.isRunning) {
                this.start();
            }

            // 找到暂停路段，并启动路段
            for (let i = 0; i < this.segments.length; i++) {
                let segemtn = this.segments[i];
                if (segemtn.isRunning && (!segemtn.timer)) {
                    segemtn.start();
                    return;
                }
            }
        }

        /**
         * 移动(起点为上一次的终点，如果之前没有播放过，则从线路的起点开始)
         */
        public move(): void {
            // 若没有路段进行运行，则启动线路
            if (this.isRunning) {
                return;
            }

            let segment = this.activeCompletedSegment;
            let playSegment = null;
            if (!segment) {
                playSegment = this.getSegment(0);
            } else {
                playSegment = this.getSegment(segment.index + 1);
            }
            if (playSegment) {
                playSegment.start();
            }
        }
        
        /**
         * 增加路段
         */
        public add(segment: TrackSegment): void {
            this.segments.push(segment);
        }

        /**
         * 获取线路的下一路段
         * @param index 路段索引
         */
        public getNextSegment(index: number): TrackSegment | null {
            if (this.segments.length === 0) return null;
            return this.getSegment(index + 1);
        }

        /**
         * 获取线路的指定索引路段
         */
        public getSegment(index: number): TrackSegment | null {

            let line = null;
            if (this.segments.length === 0) return null;

            for (let i = 0; i < this.segments.length; i++) {
                const rl = this.segments[i];
                if (rl.name === this.name && rl.index === index) {
                    line = rl;
                }
            }
            return line;
        }

        // #endregion

    }
}
