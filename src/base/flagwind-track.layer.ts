/// <reference path="./flagwind-group.layer.ts" />

namespace flagwind {
    export const TRACK_LAYER_OPTIONS: any = {
        // 路径求解方式
        solveMode: "Line",
        // 行驶速度
        speed: 100,
        onPointChanged: (index: number, model: any) => {
            console.log(`onPointChanged index:${index}`);
        },
        onMessageEvent: function (name: string, message: string) {
            console.log("onMessageEvent");
        },
        onMoveEvent: (lineName: string, segmentIndex: number, xy: Array<any>, angle: number) => {
            console.log("onMoveEvent");
        },
        onLineEndEvent: (lineName: string, segmentIndex: number, trackLine: TrackLine) => {
            console.log("onLineEndEvent");
        }
    };

    export class FlagwindTrackLayer implements IFlagwindCombineLayer{

        private _trackToolBox: HTMLElement;
        private _playButton: HTMLElement;
        private _pauseButton: HTMLElement;
        private _speedUpButton: HTMLElement;
        private _speedDownButton: HTMLElement;
        private _clearButton: HTMLElement;
        private _toolBoxText: HTMLElement;

        public activedTrackLineName: string;

        public isShow: boolean = true;
        public id: string;

        public constructor(public businessLayer: FlagwindBusinessLayer, public routeLayer: FlagwindRouteLayer, public options: any) {
            this.options = { ...TRACK_LAYER_OPTIONS, ...options };
            this.businessLayer.removeFormMap();
            this.businessLayer.addToMap();
            this.id = this.options.id || "flagwind_track_layer";
            if (this.id) {
                this.activedTrackLineName = this.id + "_track";
            }

            /**
             * 当轨迹上的移动物体进出卡口点事件回调
             */
            routeLayer.options.onStationEvent = (name: string, index: number, graphic: any, isStartPoint: boolean, trackline: TrackLine) => {
                if (index === 0 && isStartPoint) {
                    this.businessLayer.saveGraphicList([graphic.attributes.__model]);
                    this.options.onPointChanged(index, graphic.attributes.__model);
                }
                if (!isStartPoint) { // 出站
                    this.businessLayer.saveGraphicList([graphic.attributes.__model]);
                    this.options.onPointChanged(index + 1, graphic.attributes.__model);
                }
            };
            routeLayer.options.onMoveEvent = (lineName: string, segmentIndex: number, xy: Array<any>, angle: number) => {
                this.options.onMessageEvent("info", "正在播放");
                this.options.onMoveEvent(lineName, segmentIndex, xy, angle);
            };
            routeLayer.options.onLineEndEvent = (lineName: string, segmentIndex: number, trackLine: TrackLine) => {
                this.options.onMessageEvent("success", "播放结束");
                this.options.onLineEndEvent(lineName, segmentIndex, trackLine);
            };
            routeLayer.options.onMovingClick = (evt: any) => {
                if (this.trackLine.isRunning) {
                    this.stop();
                } else {
                    this.continue();
                }
            };
        }

        // #region 属性

        public get toolBoxId(): string {
            return this.id + "_toolbox";
        }

        public get flagwindMap(): FlagwindMap {
            return this.businessLayer.flagwindMap;
        }

        /**
         * 移动要素是否正在跑
         */
        public get isRunning(): boolean {
            if (!this.trackLine) return false;
            return this.trackLine.isRunning;
        }

        /**
         * 移动要素是否跑完
         */
        public get isCompleted(): boolean {
            if (!this.trackLine) return false;
            return this.trackLine.isCompleted;
        }

        /**
         * 移动要素是否隐藏
         */
        public get isMovingGraphicHide(): boolean {
            if (!this.trackLine) return false;
            return this.trackLine.isMovingGraphicHide;
        }

        public get trackLine(): TrackLine {
            if (this.activedTrackLineName) {
                return this.routeLayer.getTrackLine(this.activedTrackLineName);
            } else {
                return null;
            }
        }

        // #endregion

        // #region TrackToolBox

        /**
         * 删除播放控件
         */
        public deleteTrackToolBox(): void {
            if (this._trackToolBox) this._trackToolBox.parentNode.removeChild(this._trackToolBox);
            this._trackToolBox = null;
            this._playButton = null;
            this._pauseButton = null;
            this._speedUpButton = null;
            this._speedDownButton = null;
            this._clearButton = null;
            this._toolBoxText = null;
        }

        /**
         * 显示播放控件
         */
        public showTrackToolBox(): void {
            if (document.getElementById(this.toolBoxId)) {
                console.log("TrackToolBox已经创建，不可重复创建！");
                document.getElementById(this.toolBoxId).style.display = "block";
                return;
            }
            this._trackToolBox = document.createElement("div");
            this._trackToolBox.setAttribute("id", this.toolBoxId);
            this._trackToolBox.classList.add("fm-track-box");
            this._trackToolBox.innerHTML =
                `<div class="fm-btn-group">
                    <div class="fm-btn route-btn continue" title="播放" data-operate="continue"><i class="icon iconfont icon-play"></i></div>
                    <div class="fm-btn route-btn pause" title="暂停" data-operate="pause" style="display:none;"><i class="icon iconfont icon-pause"></i></div>
                    <div class="fm-btn route-btn down" title="减速" data-operate="down"><i class="icon iconfont icon-speed-down"></i></div>
                    <div class="fm-btn route-btn up" title="加速" data-operate="up"><i class="icon iconfont icon-speed-up"></i></div>
                    <div class="fm-btn route-btn clear" title="清除轨迹" data-operate="clear"><i class="icon iconfont icon-clear"></i></div>
                </div>
                <div class="route-text"></div>`;
            this.flagwindMap.innerMap.container.appendChild(this._trackToolBox);

            this._playButton = document.querySelector("#" + this.toolBoxId + " .continue");
            this._pauseButton = document.querySelector("#" + this.toolBoxId + " .pause");
            this._speedUpButton = document.querySelector("#" + this.toolBoxId + " .up");
            this._speedDownButton = document.querySelector("#" + this.toolBoxId + " .down");
            this._clearButton = document.querySelector("#" + this.toolBoxId + " .clear");
            this._toolBoxText = document.querySelector("#" + this.toolBoxId + " .route-text");
            this._playButton.onclick = () => {
                this.continue();
            };
            this._pauseButton.onclick = () => {
                this.pause();
            };
            this._speedUpButton.onclick = () => {
                this.speedUp();
            };
            this._speedDownButton.onclick = () => {
                this.speedDown();
            };
            this._clearButton.onclick = () => {
                this.clear();
            };
        }

        // #endregion

        // #region 公共方法

        /**
         * 显示轨迹线路（不播放）
         * @param stopList 停靠点原型数据集合
         * @param trackLineName 线路名称
         * @param options 轨迹构建参数
         */
        public showTrack(stopList: Array<any>, trackLineName?: string, options?: any): void {
            if (trackLineName) {
                this.activedTrackLineName = trackLineName;
            } else {
                trackLineName = this.activedTrackLineName;
            }

            if (!this.isShow) {
                this.show();
            }

            let trackOptions = { ...this.options, ...options };
            if (trackOptions.solveMode === "Segment") {
                this.routeLayer.solveSegment(trackLineName, stopList, trackOptions);
            } else {
                this.routeLayer.solveLine(trackLineName, stopList, trackOptions);
            }
        }

        /**
         * 启动线路播放（起点为线路的始点）
         * @param stopList 停靠点原型数据集合
         * @param trackLineName 线路名称
         * @param options 轨迹构建参数
         */
        public startTrack(stopList: Array<any>, trackLineName?: string, options?: any) {
            if (trackLineName) {
                this.activedTrackLineName = trackLineName;
            } else {
                trackLineName = this.activedTrackLineName;
            }
            this.routeLayer.stop(this.activedTrackLineName);
            this.clear();
            if (stopList == null || stopList.length === 0) {
                this.options.onMessageEvent("warning", "没有轨迹数据");
                console.warn("没有轨迹数据！");
                return;
            }
            this.showTrack(stopList, trackLineName, options);
            // 启动线路播放（起点为线路的始点）
            this.start();
            // this.routeLayer.start(this.activedTrackLineName);
        }

        /**
         * 启动线路播放（起点为上次播放的终点）
         * @param stopList 停靠点原型数据集合
         * @param trackLineName 线路名称
         */
        public moveTrack(stopList: Array<any>, trackLineName?: string): void {
            if (name) {
                this.activedTrackLineName = trackLineName;
            } else {
                trackLineName = this.activedTrackLineName;
            }
            this.showTrack(stopList, trackLineName);
            this.move();
        }

        /**
         * 显示所有
         */
        public clearAll(): void {
            this.clear();
        }

        /**
         * 清除要素
         */
        public clear(): void {
            this.routeLayer.clearAll();
            this.businessLayer.clear();
            if (this._toolBoxText) {
                this._toolBoxText.innerHTML = "";
            }
        }

        /**
         * 显示图层
         */
        public show(): void {
            this.isShow = true;
            this.routeLayer.show();
            this.businessLayer.show();
        }
        /**
         * 隐藏图层
         */
        public hide(): void {
            this.isShow = false;
            this.routeLayer.hide();
            this.businessLayer.hide();
        }

        /**
         * 继续上次播放
         */
        public move(): void {
            this.options.onMessageEvent("info", "播放");
            this.options.onMessageEvent("start", "播放");
            this.routeLayer.move(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "block";
                this._toolBoxText.innerHTML = "当前状态：正在播放";
            }
        }

        /**
         * 重新播放
         */
        public start(): void {
            this.options.onMessageEvent("info", "播放");
            this.options.onMessageEvent("start", "播放");
            this.routeLayer.start(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "block";
                this._toolBoxText.innerHTML = "当前状态：正在播放";
            }
        }

        /**
         * 停止
         */
        public stop(): void {
            this.options.onMessageEvent("info", "已停止");
            this.options.onMessageEvent("stop", "已停止");
            this.routeLayer.stop(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "block";
                this._pauseButton.style.display = "none";
                this._toolBoxText.innerHTML = "已停止";
            }
        }

        /**
         * 暂停
         */
        public pause(): void {
            this.options.onMessageEvent("info", "已暂停");
            this.options.onMessageEvent("pause", "已暂停");
            this.routeLayer.pause(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "block";
                this._pauseButton.style.display = "none";
                this._toolBoxText.innerHTML = "当前状态：已暂停";
            }
        }

        /**
         * 继续
         */
        public continue(): void {
            this.options.onMessageEvent("continue", "继续");
            this.routeLayer.continue(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "block";
                this._toolBoxText.innerHTML = "当前状态：正在播放";
            }
        }

        public up(): string {
            return this.speedUp();
        }

        public down(): string {
            return this.speedDown();
        }

        /**
         * 加速
         */
        public speedUp(): string {
            this.options.onMessageEvent("speedUp", "加速");
            let msg = this.routeLayer.speedUp(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._toolBoxText.innerHTML = msg;
            }
            return msg;
        }

        /**
         * 减速
         */
        public speedDown(): string {
            this.options.onMessageEvent("speedDown", "减速");
            let msg = this.routeLayer.speedDown(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._toolBoxText.innerHTML = msg;
            }
            return msg;
        }

        /**
         * 调速
         */
        public changeSpeed(speed: number): void {
            this.routeLayer.changeSpeed(this.activedTrackLineName, speed);
        }

        /**
         * 切换线路
         * @param name 线路名称
         */
        public changeTrackLine(name: string): void {
            this.activedTrackLineName = name;
        }

        // #endregion
    }
}
