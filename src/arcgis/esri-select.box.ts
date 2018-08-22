/// <reference path="../events/EventProvider" />
namespace flagwind {
    export const SELECT_BOX_OPTIONS_ESRI: any = {
        id: "select-box",
        selectMode: 2,
        onCheckChanged: function(
            checkItems: Array<any>,
            layer: FlagwindBusinessLayer
        ) {
            // console.log("onCheckChanged");
        }
    };
    /**
     * 地图选择组件
     */
    export class EsriSelectBox extends EventProvider
        implements IFlagwindSelectBox {
        private draw: any;

        public element: HTMLDivElement;

        public options: SelectBoxOptions;

        public mode: string;

        public id: string;

        public layers: Array<FlagwindBusinessLayer> = [];

        public constructor(public flagwindMap: FlagwindMap, options: any) {
            super(null);
            options = { ...SELECT_BOX_OPTIONS_ESRI, ...options };
            this.options = options;

            this.id = options.id || "select-box";

            this.flagwindMap.featureLayers.forEach(layer => {
                if (layer instanceof FlagwindBusinessLayer) {
                    this.addLayer(<FlagwindBusinessLayer>layer);
                }
            });

            this.draw = new esri.toolbars.Draw(flagwindMap.map, {
                drawTime: 75,
                showTooltips: true,
                tolerance: 8,
                tooltipOffset: 15
            });

            this.draw.on("draw-complete", (evt: any) => {
                this.onCreateRecord(this, evt);
            });

            if (options.element) {
                this.element = options.element;
            } else {
                this.showSelectBar();
            }
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

        public getLayerById(id: string) {
            let layers = this.layers.filter(layer => layer.id === id);
            return layers.length > 0 ? layers[0] : null;
        }

        public addLayer(layer: FlagwindBusinessLayer): void {
            layer.options.selectMode = this.options.selectMode;
            layer.options.showInfoWindow = false;
            this.layers.push(layer);
        }

        public removeLayer(layer: FlagwindBusinessLayer): void {
            layer.options.selectMode = SelectMode.none;
            let index = this.layers.indexOf(layer);
            if (index >= 0) {
                this.layers.splice(index, 1);
            }
        }

        public show(): void {
            this.element.style.display = "black";
        }

        public hide(): void {
            this.element.style.display = "none";
        }

        public deleteSelectBar(): void {
            if (this.element) this.element.remove();
        }

        public showSelectBar(): void {
            if (this.element) {
                console.log("绘制控件已经创建，不可重复创建！");
                this.element.style.display = "block";
                return;
            }
            let me = this;
            let mapEle = this.flagwindMap.innerMap.root;
            this.element = document.createElement("div");
            this.element.setAttribute("id", this.id);
            this.element.innerHTML = `<div class="edit-btn" title="画圆" data-operate="circle"><span class="iconfont icon-draw-circle"></span></div>
                <div class="edit-btn" title="画矩形" data-operate="rectangle"><span class="iconfont icon-draw-square"></span></div>
                <div class="edit-btn" title="画多边形" data-operate="polygon"><span class="iconfont icon-draw-polygon1"></span></div>`;
            mapEle.appendChild(this.element);
            let operateBtns = document.querySelectorAll(
                "#" + this.element.id + " .edit-btn"
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

        public destroy() {
            this.clear();
            this.deleteSelectBar();
        }
    }
}
