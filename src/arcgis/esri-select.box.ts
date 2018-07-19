/// <reference path="../events/EventProvider" />
namespace flagwind {
    export const SELECT_BOX_OPTIONS_ESRI: any = {
        onCheckChanged: function (checkItems: Array<any>, layer: FlagwindBusinessLayer) {
            // console.log("onCheckChanged");
        }
    };
    /**
     * 地图选择组件
     */
    export class EsriSelectBox extends EventProvider {
        private draw: any;

        public mode: string;

        public layers: Array<FlagwindBusinessLayer> = [];

        public constructor(
            public flagwindMap: FlagwindMap,
            public options: any
        ) {
            super(null);
            options = { ...SELECT_BOX_OPTIONS_ESRI, ...options };
            this.options = options;
            this.draw = new esri.toolbars.Draw(flagwindMap.map, {
                drawTime: 75,
                showTooltips: true,
                tolerance: 8,
                tooltipOffset: 15
            });
            const me = this;
            this.draw.on("draw-complete", function(evt: any) {
                me.onCreateRecord(me, evt);
            });
        }

        public onCreateRecord(me: this, e: any): void {
            let polygon = e.geometry;

            me.layers.forEach(layer => {
                let checkGrahpics: Array<any> = [];
                layer.graphics.forEach(g => {
                    if (polygon.contains(g.geometry)) {
                        console.log(g);
                        checkGrahpics.push(g);
                    }
                });
                let checkItems = checkGrahpics.map(g => g.attributes);
                layer.setSelectStatusByModels(checkItems, false);
                this.options.onCheckChanged(checkItems, layer);
            });

            me.clear();
        }

        public addLayer(layer: FlagwindBusinessLayer): void {
            layer.options.enableSelectMode = true;
            this.layers.push(layer);
        }

        public deleteSelectBar(): void {
            let ele = document.getElementById("edit-ctrl-group");
            if (ele) ele.remove();
        }

        public showSelectBar(): void {
            if (document.getElementById("edit-ctrl-group")) {
                console.log("绘制控件已经创建，不可重复创建！");
                document.getElementById("edit-ctrl-group").style.display =
                    "block";
                return;
            }
            let me = this;
            let mapEle = this.flagwindMap.innerMap.root;
            let container = document.createElement("div");
            container.setAttribute("id", "edit-ctrl-group");
            container.innerHTML = `<div class="edit-btn" title="画圆" data-operate="circle"><span class="iconfont icon-draw-circle"></span></div>
                <div class="edit-btn" title="画矩形" data-operate="rectangle"><span class="iconfont icon-draw-square"></span></div>
                <div class="edit-btn" title="画多边形" data-operate="polygon"><span class="iconfont icon-draw-polygon1"></span></div>`;
            mapEle.appendChild(container);
            let operateBtns = document.querySelectorAll(
                "#edit-ctrl-group .edit-btn"
            ) as NodeListOf<HTMLElement>;
            for (let i = 0; i < operateBtns.length; i++) {
                operateBtns[i].onclick = function() {
                    me.active(this.dataset.operate);
                };
            }
        }

        public clear() {
            if (this.draw) {
                this.draw.deactivate();
                this.flagwindMap.map.enableMapNavigation();
                this.mode = "trash";
            }
        }

        public active(mode: string) {
            if (this.draw && mode) {
                let tool = mode.toUpperCase().replace(/ /g, "_");
                this.flagwindMap.map.disableMapNavigation();
                this.draw.activate(esri.toolbars.Draw[tool]);
                this.mode = mode;
            }
        }
    }
}
