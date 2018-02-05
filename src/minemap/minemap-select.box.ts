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
                me.options.onCheckChanged({
                    layer: layer,
                    current: checkItems,
                    all: layer.getSelectedGraphics().map(g => g.attributes)
                });
            });

            me.clear();

        }

        public addLayer(layer: FlagwindBusinessLayer): void {
            layer.options.enableSelectMode = true;
            this.layers.push(layer);
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
