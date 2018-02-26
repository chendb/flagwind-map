namespace flagwind {
    export class MinemapVehicleRouteLayer extends MinemapRouteLayer {

        private stops: Array<any> = [];
        private trackName: string;
        
        public showTrack(trackName: string, stopList: Array<any>, options: any): void {
            let stops = this.getStopsGraphicList(stopList);
            this.solveSegment(trackName, stops, options);
            this.trackName = trackName;
            this.stops = stops;
        }

        public getStopsGraphicList(stopList: Array<any>) {
            return stopList.map(item => {
                return new flagwind.MinemapMarkerGraphic({
                    id: item.tollCode,
                    symbol: this.options.symbol,
                    point: new flagwind.MinemapPoint(item.tollLongitude, item.tollLatitude),
                    attributes: item
                });
            });
        }

        public showTrackToolBox(mapId: string): void {
            let me = this;
            let mapEle = document.getElementById(mapId);
            let container = document.createElement("div");
            container.setAttribute("id", "route-ctrl-group");
            container.innerHTML = `<div class="route-btn" title="求解" data-operate="solveSegment"><span class="iconfont icon-show">求解</span></div>
                <div class="route-btn" title="播放" data-operate="start"><span class="iconfont icon-start">播放</span></div>
                <div class="route-btn" title="暂停" data-operate="pause"><span class="iconfont icon-pause">暂停</span></div>
                <div class="route-btn" title="继续" data-operate="continue"><span class="iconfont icon-continue">继续</span></div>
                <div class="route-btn" title="隐藏" data-operate="hide"><span class="iconfont icon-hide">隐藏</span></div>
                <div class="route-btn" title="清除" data-operate="clear"><span class="iconfont icon-clear">清除</span></div>`;
            mapEle.appendChild(container);
            let operateBtns = document.querySelectorAll(`#${mapId} .route-btn`) as NodeListOf<HTMLElement>;
            for (let i = 0; i < operateBtns.length; i++) {
                operateBtns[i].onclick = function () {
                    if (this.dataset.operate === "solveSegment") {
                        me[this.dataset.operate](me.trackName, me.stops, {});
                    } else if (this.dataset.operate === "hide") {
                        me[this.dataset.operate]();
                    } else {
                        me[this.dataset.operate](me.trackName);
                    }
                };
            }
        }

    }
}
