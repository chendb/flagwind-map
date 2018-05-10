/// <reference path="./flagwind-group.layer.ts" />

namespace flagwind {
    export const TRACK_LAYER_OPTIONS: any = {
        // 路径求解方式
        solveMode: "Line",
        // 行驶速度
        speed: 100,
        onPointChanged: function (index: number, model: any) {
            console.log(`onPointChanged index:${index}`);
        },
        onMessageEvent: function (name: string, message: string) {
            console.log("onMessageEvent");
        }
    };

    export class FlagwindTrackLayer {

        public activedTrackLineName: string;

        public isShow: boolean = true;

        public constructor(public businessLayer: FlagwindBusinessLayer, public routeLayer: FlagwindRouteLayer, public options: any) {
            this.options = { ...TRACK_LAYER_OPTIONS, ...options };
            this.businessLayer.removeFormMap();
            this.businessLayer.addToMap();
            if (this.options.id) {
                this.activedTrackLineName = this.options.id + "_track";
            }

            /**
             * 当轨迹上的移动物体进出卡口点事件回调
             */
            routeLayer.options.onStationEvent = (name: string, index: number, graphic: any, isStartPoint: boolean, trackline: TrackLine) => {
                if (index === 0) {
                    this.flagwindMap.centerAt(graphic.geometry.x, graphic.geometry.y);
                }
                if (index === 0 && isStartPoint) {
                    this.businessLayer.saveGraphicByModel(graphic.attributes.__model);
                    this.options.onPointChanged(index, graphic.attributes.__model);
                }
                if (!isStartPoint) { // 出站
                    this.businessLayer.saveGraphicByModel(graphic.attributes.__model);
                    this.options.onPointChanged(index + 1, graphic.attributes.__model);
                }
            };
            routeLayer.options.onMoveEvent = (lineName: string, segmentIndex: number, xy: Array<any>, angle: number) => {
                this.options.onMessageEvent("info", "正在播放");
            };
            routeLayer.options.onLineEndEvent = (lineName: string, segmentIndex: number, trackLine: TrackLine) => {
                this.options.onMessageEvent("success", "播放结束");
            };
            routeLayer.options.onMovingClick = (evt: any) => {
                if (this.trackLine.isRunning) {
                    this.stop();
                } else {
                    this.continue();
                }
            };
        }

        public get flagwindMap(): FlagwindMap {
            return this.businessLayer.flagwindMap;
        }

        public showTrack(stopList: Array<any>, trackLineName?: string, options?: any): void {
            if (trackLineName) {
                this.activedTrackLineName = trackLineName;
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
            this.flagwindMap.innerMap.container.appendChild(trackToolBox);

            let playBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-continue");
            let pauseBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-pause");
            let speedUpBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-speedUp");
            let speedDownBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-speedDown");
            let clearBtn: HTMLElement = document.querySelector("#route-ctrl-group .icon-clear");
            let toolBoxTextEle: HTMLElement = document.querySelector("#route-ctrl-group .tool-text span");
            playBtn.onclick = function () {
                me.routeLayer.continue(me.activedTrackLineName);
                playBtn.style.display = "none";
                pauseBtn.style.display = "block";
                toolBoxTextEle.innerHTML = "当前状态：正在播放";
            };
            pauseBtn.onclick = function () {
                me.routeLayer.pause(me.activedTrackLineName);
                playBtn.style.display = "block";
                pauseBtn.style.display = "none";
                toolBoxTextEle.innerHTML = "当前状态：已暂停";
            };
            speedUpBtn.onclick = function () {
                toolBoxTextEle.innerHTML = me.routeLayer.speedUp(me.activedTrackLineName);
            };
            speedDownBtn.onclick = function () {
                toolBoxTextEle.innerHTML = me.routeLayer.speedDown(me.activedTrackLineName);
            };
            clearBtn.onclick = function () {
                me.routeLayer.clearAll();
                toolBoxTextEle.innerHTML = "";
            };

        }

        public get trackLine(): TrackLine {
            if (this.activedTrackLineName) {
                return this.routeLayer.getTrackLine(this.activedTrackLineName);
            } else {
                return null;
            }
        }

        /**
         * 启动线路播放（起点为线路的始点）
         */
        public startTrack(list: Array<any>, name?: string, options?: any) {
            if (name) {
                this.activedTrackLineName = name;
            }
            this.routeLayer.stop(this.activedTrackLineName);
            this.clear();
            if (list == null || list.length === 0) {
                this.options.onMessageEvent("warning", "没有轨迹数据");
                console.warn("没有轨迹数据！");
                return;
            }
            this.showTrack(list, name, options);
            // 启动线路播放（起点为线路的始点）
            this.routeLayer.start(this.activedTrackLineName);
        }

        /**
         * 启动线路播放（起点为上次播放的终点）
         */
        public move(list: Array<any>, name?: string): void {
            if (name) {
                this.activedTrackLineName = name;
            }
            this.showTrack(list, name);
            this.routeLayer.move(this.activedTrackLineName);
        }

        /**
         * 清除要素
         */
        public clear(): void {
            this.routeLayer.clearAll();
            this.businessLayer.clear();
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
         * 重新播放
         */
        public start(): void {
            this.options.onMessageEvent("info", "播放");
            this.routeLayer.start(this.activedTrackLineName);
        }

        /**
         * 停止
         */
        public stop(): void {
            this.options.onMessageEvent("info", "已停止");
            this.routeLayer.stop(this.activedTrackLineName);
        }

        /**
         * 暂停
         */
        public pause(): void {
            this.options.onMessageEvent("info", "已暂停");
            this.routeLayer.pause(this.activedTrackLineName);
        }

        /**
         * 继续
         */
        public continue(): void {
            this.routeLayer.continue(this.activedTrackLineName);
        }

        /**
         * 加速
         */
        public speedUp(): void {
            this.routeLayer.speedUp(this.activedTrackLineName);
        }

        /**
         * 减速
         */
        public speedDown(): void {
            this.routeLayer.speedDown(this.activedTrackLineName);
        }

        /**
         * 调速
         */
        public changeSpeed(speed: number): void {
            this.routeLayer.changeSpeed(this.activedTrackLineName, speed);
        }

        /**
         * 切换线路
         * @param name 线路
         */
        public changeTrackLine(name: string): void {
            this.activedTrackLineName = name;
        }
    }
}
