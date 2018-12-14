
namespace flagwind {

    export const SELECT_BOX_OPTIONS: any = {
        id: "select-box",
        selectMode: 2,
        onDrawStart: function () {
            // console.log("onCheckChanged");
        },
        onDrawEnd: function () {
            // console.log("onCheckChanged");
        },
        onCheckChanged: function (checkItems: Array<any>, layer: FlagwindBusinessLayer) {
            // console.log("onCheckChanged");
        }
    };
    /**
     * 线
     */
    export class MinemapSelectBox extends EventProvider implements IFlagwindSelectBox {

        private edit: any;

        public id: string;

        public element: HTMLDivElement;

        public options: SelectBoxOptions;

        public isActive: boolean = false;

        public mode: string;

        public layers: Array<FlagwindBusinessLayer> = [];

        public constructor(public flagwindMap: FlagwindMap, options: any) {
            super(null);
            options = { ...SELECT_BOX_OPTIONS, ...options };
            this.options = options;
            this.id = options.id;
            this.edit = new minemap.edit.init(flagwindMap.map, {
                boxSelect: true,
                touchEnabled: false,
                displayControlsDefault: true,
                showButtons: false
            });
 
            this.flagwindMap.map.on("edit.record.create", (evt: any) => {
                this.onCreateRecord(this, evt);
            });

        }

        public onCreateRecord(me: this, e: any): void {
            let polygon = new MinemapPolygon(null);
            polygon.addRing(e.record.features[0].geometry.coordinates[0]);

            me.layers.forEach(layer => {
                let checkGrahpics: Array<any> = [];
                layer.graphics.forEach(g => {
                    if (polygon.inside([g.geometry.x, g.geometry.y])) {
                        console.log(g);
                        checkGrahpics.push(g);
                    }
                });
                let checkItems = checkGrahpics.map(g => g.attributes);
                layer.setSelectStatusByModels(checkItems, false);
                this.options.onCheckChanged(checkItems,layer);
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

        public deleteSelectBar(): void {
            if(this.element) this.element.remove();
        }

        public show(): void {
            this.element.style.display = "block";
        }

        public hide(): void {
            this.element.style.display = "none";
        }

        public showSelectBar(): void {
            if (this.element) {
                console.log("绘制控件已经创建，不可重复创建！");
                this.show();
                return;
            }

            let mapEle = this.flagwindMap.map._container;
            this.element = document.createElement("div");
            this.element.setAttribute("id", this.id);
            this.element.classList.add("fm-select-box");
            this.element.innerHTML =
               `<div class="fm-btn circle" title="画圆" data-operate="circle"><i class="icon iconfont icon-circle"></i></div>
                <div class="fm-btn rectangle" title="画矩形" data-operate="rectangle"><i class="icon iconfont icon-rectangle"></i></div>
                <div class="fm-btn polygon" title="画多边形" data-operate="polygon"><i class="icon iconfont icon-polygon"></i></div>`;
            mapEle.appendChild(this.element);
            let operateBtns = document.querySelectorAll("#" + this.id + " .fm-btn") as NodeListOf<HTMLElement>;
            let me = this;
            for (let i = 0; i < operateBtns.length; i++) {
                operateBtns[i].onclick = function () {
                    me.active((<any>this).dataset.operate);
                };
            }
        }

        public clear() {
            if (this.edit) {
                this.edit.onBtnCtrlActive("trash");
                this.mode = "trash";
                this.isActive = true;
                this.options.onDrawEnd();
            }
        }

        public active(mode: string) {
            if (this.edit && mode) {
                this.edit.onBtnCtrlActive(mode);
                this.mode = mode;
                this.isActive = true;
                this.options.onDrawStart();
            }
        }

        public destroy(): void {
            this.clear();
            this.deleteSelectBar();
        }
    }

}
