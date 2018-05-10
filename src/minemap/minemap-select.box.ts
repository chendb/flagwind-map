/// <reference path="../events/EventProvider" />
namespace flagwind {

    export const SELECT_BOX_OPTIONS: any = {

        onCheckChanged: function (evt: any) {
            console.log("onCheckChanged");
        }
    };
    /**
     * 线
     */
    export class MinemapSelectBox extends EventProvider {

        private edit: any;

        public mode: string;

        public layers: Array<FlagwindBusinessLayer> = [];

        public constructor(public flagwindMap: FlagwindMap, public options: any) {
            super(null);
            options = { ...SELECT_BOX_OPTIONS, ...options };
            this.options = options;
            this.edit = new minemap.edit.init(flagwindMap.map, {
                boxSelect: true,
                touchEnabled: false,
                displayControlsDefault: true,
                showButtons: false
            });
            const me = this;
            this.flagwindMap.map.on("edit.record.create", function (evt: any) {
                me.onCreateRecord(me, evt);
            });

        }

        public onCreateRecord(me: this, e: any): void {
            // e.record
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
                this.options.onCheckChanged(checkItems);
            });

            me.clear();

        }

        public addLayer(layer: FlagwindBusinessLayer): void {
            layer.options.enableSelectMode = true;
            this.layers.push(layer);
        }

        public deleteSelectBar(): void {
            let ele = document.getElementById("edit-ctrl-group");
            if(ele) ele.remove();
        }

        public showSelectBar(): void {
            if (document.getElementById("edit-ctrl-group")) {
                console.log("绘制控件已经创建，不可重复创建！");
                document.getElementById("edit-ctrl-group").style.display = "block";
                return;
            }
            let me = this;
            // let mapEle = document.getElementById(mapId);
            let mapEle = this.flagwindMap.map._container;
            let container = document.createElement("div");
            container.setAttribute("id", "edit-ctrl-group");
            container.innerHTML = `<div class="edit-btn" title="画圆" data-operate="circle"><span class="iconfont icon-draw-circle"></span></div>
                <div class="edit-btn" title="画矩形" data-operate="rectangle"><span class="iconfont icon-draw-square"></span></div>
                <div class="edit-btn" title="画多边形" data-operate="polygon"><span class="iconfont icon-draw-polygon1"></span></div>`;
                // <div class="edit-btn" title="撤销上一步操作" data-operate="undo"><span class="iconfont icon-undo"></span></div>
                // <div class="edit-btn" title="重复上一步操作" data-operate="redo"><span class="iconfont icon-redo"></span></div>
                // <div class="edit-btn" title="删除所选" data-operate="trash"><span class="iconfont icon-tool-trash"></span></div>`;
            mapEle.appendChild(container);
            let operateBtns = document.querySelectorAll("#edit-ctrl-group .edit-btn") as NodeListOf<HTMLElement>;
            for (let i = 0; i < operateBtns.length; i++) {
                operateBtns[i].onclick = function () {
                    me.active(this.dataset.operate);
                };
            }
        }

        public clear() {
            if (this.edit) {
                this.edit.onBtnCtrlActive("trash");
                this.mode = "trash";
            }
        }

        public active(mode: string) {
            if (this.edit && mode) {
                this.edit.onBtnCtrlActive(mode);
                this.mode = mode;
            }
        }
    }

}
