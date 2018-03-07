/// <reference path="./flagwind-group.layer.ts" />

namespace flagwind {
    export const ROUTE_LAYER_OPTIONS: any = {

        routeType: "Line",
        movingImageUrl: "",

        onLineStartEvent(lineName: string, segmentIndex: number, trackLine: TrackLine) {
            console.log("onLineStartEvent");
        },

        onLineEndEvent(lineName: string, segmentIndex: number, trackLine: TrackLine) {
            console.log("onLineEndEvent");
        },

        onMoveEvent(lineName: string, segmentIndex: number, xy: Array<any>, angle: number) {
            console.log("onMoveEvent");
        },

        onStationEvent(lineName: string, segmentIndex: number, graphic: any, enter: boolean, trackLine: TrackLine) {
            console.log("onStationEvent");
        }

    };

    export const TRACKLINE_OPTIONS: any = {
        markerUrl: "",
        markerLabel: "",
        markerHeight: 48,
        markerWidth: 48
    };

    export abstract class FlagwindRouteLayer {

        public moveLineLayer: FlagwindGroupLayer;
        public moveMarkLayer: FlagwindGroupLayer;
        // public moveMarkLayer: { graphics: any; remove: (arg0: any) => void; _map: null; clear: () => void; id: any; add: (arg0: any) => void; show: () => void; hide: () => void; };

        public trackLines: Array<TrackLine> = [];
        public activedtrackLineName: string = "";

        public constructor(public flagwindMap: FlagwindMap, public layerName: string, public options: any) {
            this.options = { ...ROUTE_LAYER_OPTIONS, ...options };
            // this.mapService = flagwindMap.mapService;

            this.moveLineLayer = this.onCreateLineLayer(layerName + "LineLayer");

            // 移动小车
            this.moveMarkLayer = this.onCreateMovingLayer(layerName + "MarkerLayer");

            this.onAddLayerBefor();
            this.moveLineLayer.appendTo(this.flagwindMap.innerMap);
            this.moveMarkLayer.appendTo(this.flagwindMap.innerMap);
            this.onAddLayerAfter();
            const me = this;
            // 当地图已经加载时直接执行_onLoad方法

            if (this.flagwindMap.loaded) {
                me.onLoad();
            } else {
                this.flagwindMap.on("load", function () {
                    me.onLoad();
                }, this);
            }
        }

        public abstract onCreateLineLayer(id: string): FlagwindGroupLayer;

        public abstract onCreateMovingLayer(id: string): FlagwindGroupLayer;

        public abstract onEqualGraphic(originGraphic: any, targetGraphic: any): boolean;

        public abstract onShowSegmentLine(segment: TrackSegment): void;

        public abstract onGetStandardStops(name: String, stops: Array<any>): Array<any>;

        public abstract onSetSegmentByLine(options: any, segment: TrackSegment): any;

        // public mapService: IMapService;
        public abstract onSetSegmentByPoint(options: any, segment: TrackSegment): any;

        /**
         * 由网络分析服务来求解轨迹并播放
         * 
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        public abstract onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;

        /**
         * 由连线求解轨迹
         * @param segment
         */
        public abstract onSolveByJoinPoint(segment: TrackSegment): void;

        // public abstract onAddEventListener(moveMarkLayer: FlagwindGroupLayer, eventName: string, callBack: Function): void;

        /**
         * 创建移动要素
         * @param {*} trackline 线路
         * @param {*} graphic 要素
         * @param {*} angle 偏转角
         */
        public abstract onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number): any;

        public get spatial(): any {
            return this.flagwindMap.spatial;
        }

        public show(): void {
            if (this.moveMarkLayer) {// 移动小车 
                this.moveMarkLayer.show();
            }

            if (this.moveLineLayer != null) {
                this.moveLineLayer.show();
            }
        }

        public hide(): void {
            if (this.moveMarkLayer) {// 移动小车 {
                this.moveMarkLayer.hide();
            }

            if (this.moveLineLayer) {
                this.moveLineLayer.hide();
            }
        }

        /**
         * 获取指定名称的线路
         * @param name 指定名称
         */
        public getTrackLine(name: string): TrackLine | null {
            let lines = this.trackLines.filter(g => g.name === name);
            return lines && lines.length > 0 ? lines[0] : null;
        }

        /**
         * 向指定线路中增加路段
         */
        public addTrackSegment(name: any, segment: TrackSegment, lineOptions: any) {
            let trackline = this.getTrackLine(name);
            if (!trackline) {
                trackline = new TrackLine(this.flagwindMap, name, lineOptions);
                this.trackLines.push(trackline);
            }
            trackline.add(segment);
        }

        /**
         * 计算线路的下一个路段索引
         */
        public getNextSegmentIndex(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) return trackline.nextSegmentIndex;
            return 0;
        }

        /**
         * 获取线路的下一路段
         */
        public getNextSegment(name: string, index: number) {
            let trackline = this.getTrackLine(name);
            if (trackline) return trackline.getNextSegment(index);
            return undefined;
        }

        /**
         * 获取线路中的最后一路段
         */
        public getLastSegment(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) return trackline.lastSegment;
            return undefined;
        }

        /**
         * 获取监控最近播放完成的路段线路
         */
        public getActiveCompletedSegment(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) return trackline.activeCompletedSegment;
            return undefined;
        }

        /**
         * 判断线路是否在运行
         */
        public getIsRunning(name: string): boolean {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                return trackline.isRunning;
            }
            else {
                return false;
            }
        }

        /*********************轨迹线路**************************/

        /*********************播放控制**************************/

        public stop(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline != null) {
                trackline.stop();
            }
        }
        /**
         * 启动线路播放（起点为上次播放的终点）
         */
        public move(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) trackline.move();
        }
        /**
         * 启动线路播放（起点为线路的始点）
         */
        public start(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.stop();
                trackline.start();
            }
        }
        /**
         * 暂停
         */
        public pause(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.pause();
            }
        }

        /**
         * 继续
         */
        public continue(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.continue();
            }
        }
        /**
         * 调速
         */
        public changeSpeed(name: string, speed: number) {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.changeSpeed(speed);
            }
        }
        public speedUp(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                return trackline.speedUp();
            } else {
                return "当前路线为空！";
            }
        }
        public speedDown(name: string) {
            let trackline = this.getTrackLine(name);
            if (trackline) {
                return trackline.speedDown();
            } else {
                return "当前路线为空！";
            }
        }
        public clear(name: string) {
            if (name) {
                let trackline = this.getTrackLine(name);
                if (trackline == null) return;
                trackline.stop();
                this.moveMarkLayer.removeGraphicByName(name);
                this.moveLineLayer.removeGraphicByName(name);
                trackline.markerGraphic = null;
                let index = this.trackLines.indexOf(trackline);
                if (index >= 0) {
                    this.trackLines.splice(index, 1);
                }
            } else {
                this.moveMarkLayer.clear();
                this.moveLineLayer.clear();
                this.trackLines = [];
            }
        }

        public clearLine(name: string) {
            if (!name) {
                console.error("没有指定清除的线路名称");
                return;
            }
            this.moveLineLayer.removeGraphicByName(name);

        }
        /**
         * 清除所有
         */
        public clearAll() {
            window.stop();

            this.checkMapSetting();
            for (let i = 0; i < this.trackLines.length; i++) {
                let trackline = this.trackLines[i];
                trackline.stop();
                trackline.reset();
            }
            this.trackLines = [];

            if (this.moveMarkLayer) {
                this.moveMarkLayer.clear();
            }

            if (this.moveLineLayer) {
                this.moveLineLayer.clear();
            }
        }

        public deleteTrackToolBox(): void {
            let ele = document.getElementById("route-ctrl-group");
            if (ele) ele.remove();
        }

        public showTrackToolBox(): void {
            if (document.getElementById("route-ctrl-group")) {
                console.log("TrackToolBox已经创建，不可重复创建！");
                document.getElementById("route-ctrl-group").style.display = "block";
                return;
            }
            const me = this;
            let trackToolBox = document.createElement("div");
            trackToolBox.setAttribute("id", "route-ctrl-group");
            trackToolBox.innerHTML = `<div class="tool-btns"><span class="route-btn icon-continue" title="播放" data-operate="continue"></span>
                <span class="route-btn icon-pause" title="暂停" data-operate="pause" style="display:none;"></span>
                <span class="route-btn icon-speedDown" title="减速" data-operate="speedDown"></span>
                <span class="route-btn icon-speedUp" title="加速" data-operate="speedUp"></span>
                <span class="route-btn icon-clear" title="清除轨迹" data-operate="clear"></span></div>
                <div class="tool-text"><span></span></div>`;
            this.flagwindMap.innerMap._container.appendChild(trackToolBox);

            let playBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-continue");
            let pauseBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-pause");
            let speedUpBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-speedUp");
            let speedDownBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-speedDown");
            let clearBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-clear");
            let toolBoxTextEle: HTMLElement = document.querySelector("#route-ctrl-group .tool-text span");
            playBtn.onclick = function () {
                me.continue(me.activedtrackLineName);
                playBtn.style.display = "none";
                pauseBtn.style.display = "block";
                toolBoxTextEle.innerHTML = "当前状态：正在播放";
            };
            pauseBtn.onclick = function () {
                me.pause(me.activedtrackLineName);
                playBtn.style.display = "block";
                pauseBtn.style.display = "none";
                toolBoxTextEle.innerHTML = "当前状态：已暂停";
            };
            speedUpBtn.onclick = function () {
                toolBoxTextEle.innerHTML = me.speedUp(me.activedtrackLineName);
            };
            speedDownBtn.onclick = function () {
                toolBoxTextEle.innerHTML = me.speedDown(me.activedtrackLineName);
            };
            clearBtn.onclick = function () {
                me.clearAll();
                toolBoxTextEle.innerHTML = "";
            };

        }

        /*********************播放控制**************************/

        /**
         * 求解最短路径（与solve不同，它求解的是一个路段，该路段起点为stops[0],终点为stops[stops.length-1]
         *
         * @param {any} name  线路名称
         * @param {any} stops 经过的站点
         * @param {any} options 可选参数
         */
        public solveSegment(name: string, stops: Array<any>, options: any) {
            options = { ...TRACKLINE_OPTIONS, ...options };
            this.checkMapSetting();

            if (stops.length < 1) {
                throw Error("站点不能少于2");
            }
            
            this.activedtrackLineName = name;

            const stopGraphics = this.onGetStandardStops(name, stops);

            const segment = this.getLastSegment(name);
            let startLineIndex = segment ? segment.index + 1 : 0;
            if (segment) {
                const isEqual = this.onEqualGraphic(segment.endGraphic, stopGraphics[0]);
                const isNA = this.options.routeType === "NA";
                // 若是网络分析服务且新增的路段与前一路段没有对接上，则增加一个路段用于连接他们
                if (isNA && !isEqual) {
                    this.post(startLineIndex, name, segment.endGraphic, stopGraphics[0], options);
                    startLineIndex += 1;
                }
            }
            // const start = stopGraphics.splice(0, 1)[0];// 从数组中取出第一个
            // const end = stopGraphics.splice(stopGraphics.length - 1, 1)[0];// 从数组中取出最后一个
            // const waypoints = stopGraphics; //
            // this.post(startLineIndex, name, start, end, options, waypoints);
            for (let i = 0; i < stopGraphics.length - 1; i++) {
                let start = stopGraphics[i];
                let end = stopGraphics[i + 1];
                this.post(startLineIndex + i, name, start, end, options);
            }
        }

        /**
         * 发送路由请求
         * @ index:路段索引
         * @ name:线路名称
         * @ start:开始要素
         * @ end:终点要素
         * @ lineOptions:线路控制的参数
         * @ waypoints:经过的点
         */
        public post(index: number, name: string, start: any, end: any, lineOptions: any, waypoints: Array<any> = []) {

            const flagwindRoute = this;

            const trackSegmentOptions = lineOptions;

            trackSegmentOptions.onShowSegmentLineEvent = function (segment: TrackSegment) {
                flagwindRoute.onShowSegmentLineEvent(flagwindRoute, segment, lineOptions);
            };
            trackSegmentOptions.onMoveStartEvent = function (segment: TrackSegment, graphic: any, angle: number) {
                flagwindRoute.onMoveStartEvent(flagwindRoute, segment, graphic, angle);
            };
            trackSegmentOptions.onMoveEvent = function (segment: TrackSegment, point: any, angle: number) {
                flagwindRoute.onMoveEvent(flagwindRoute, segment, point, angle);
            };
            trackSegmentOptions.onMoveEndEvent = function (segment: TrackSegment, graphic: any, angle: number) {
                flagwindRoute.onMoveEndEvent(flagwindRoute, segment, graphic, angle);
            };

            const segment = new TrackSegment(this, index, name, start, end, trackSegmentOptions);

            if (waypoints) {
                segment.waypoints = waypoints;
            }

            this.addTrackSegment(name, segment, lineOptions);

            if (this.options.routeType === "NA") {
                this.onSolveByService(segment, start, end, waypoints);
            } else {
                this.onSolveByJoinPoint(segment);
            }

        }

        /**
         * 路由分析完成回调
         */
        public solveComplete(options: { polyline: any; length: number }, segment: TrackSegment) {

            const polyline = options.polyline;
            const length = options.length;
            // 设置路段播放线路信息
            segment.setPolyLine(polyline, length);
            this.onCreateSegmentLineComplete(segment);
        }

        /**
         * 路由分析失败回调
         */
        public errorHandler(err: any, segment: TrackSegment) {
            console.log("路由分析异常" + err + "");
            const points = [];
            points.push(segment.startGraphic.geometry);
            if (segment.waypoints) {
                for (let i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }
            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setMultPoints(points);
            this.onCreateSegmentLineComplete(segment);
        }

        /**
         * 线段创建完成事件回调
         * @param {*} segment 
         */
        protected onCreateSegmentLineComplete(segment: TrackSegment): void {
            console.log();
        }

        // 检测地图设置，防止图层未加载到地图上
        protected checkMapSetting() {
            // if (this.moveMarkLayer._map == null) {
            //     this.moveMarkLayer = this.flagwindMap.innerMap.getLayer(this.moveMarkLayer.id);
            // }
        }

        /**
         * 
         * 显示路段事件
         * 
         * @protected
         * @memberof flagwindRoute
         */
        protected onShowSegmentLineEvent(flagwindRoute: this, segment: TrackSegment, lineOptions: any) {
            // 是否自动显示轨迹
            // if (lineOptions.autoShowSegmentLine) {
            flagwindRoute.onShowSegmentLine(segment);
            // }
            // if (lineOptions.onShowSegmentLineEvent) {
            //     lineOptions.onShowSegmentLineEvent(segment);
            // }
        }

        /**
         * 线段播放开始事故
         */
        protected onMoveStartEvent(flagwindRoute: this, segment: TrackSegment, graphic: any, angle: number) {
            let trackline = flagwindRoute.getTrackLine(segment.name);

            if (trackline === undefined) {
                return;
            }

            if (!trackline.markerGraphic) {
                flagwindRoute.onCreateMoveMark(trackline, graphic, angle);
            }
            flagwindRoute.flagwindMap.centerAt(graphic.geometry.x, graphic.geometry.y);

            if (!segment.lineGraphic) {
                flagwindRoute.onShowSegmentLine(segment);
            }

            flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, true, flagwindRoute.getTrackLine(segment.name));
            if (segment.index === 0) {
                // 线路播放开始事故回调
                this.options.onLineStartEvent(segment.name, segment.index, flagwindRoute.getTrackLine(segment.name));
            }
        }

        /**
         * 线段播放完成事件
         */
        protected onMoveEndEvent(flagwindRoute: this, segment: TrackSegment, graphic: any, angle: number) {
            const nextSegment = flagwindRoute.getNextSegment(segment.name, segment.index);
            const currentLine = flagwindRoute.getTrackLine(segment.name);
            if (nextSegment) {
                flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, false, currentLine);
                // 到达站点
                nextSegment.start();
            } else {
                flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, false, currentLine);
                segment.stop();
                // 如果没有下一条线路，说明线路播放结束，此时调用线路播放结束回调
                flagwindRoute.options.onLineEndEvent(segment.name, segment.index, currentLine);
            }
        }

        /**
         * 移动回调事件
         */
        protected onMoveEvent(flagwindRoute: this, segment: TrackSegment, xy: any, angle: number) {
            let point = this.flagwindMap.onCreatePoint({
                x: parseFloat(xy[0]),
                y: parseFloat(xy[1]),
                spatial: flagwindRoute.flagwindMap.spatial
            });
            let trackline = flagwindRoute.getTrackLine(segment.name);
            if (trackline) {
                flagwindRoute.onChangeMovingGraphicSymbol(trackline, point, angle);
                flagwindRoute.options.onMoveEvent(segment.name, segment.index, xy, angle);
            }
        }

        protected onAddLayerBefor() {
            console.log("onAddLayerBefor");
        }

        protected onAddLayerAfter() {
            console.log("onAddLayerAfter");
        }

        protected onLoad(): void {
            const me = this;
            this.moveMarkLayer.on("onClick", function (evt: any) {
                if (me.options.onMovingClick) {
                    me.options.onMovingClick(evt);
                }
            }, this);
        }

        protected abstract onChangeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number): void;
    }
}
