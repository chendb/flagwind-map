/// <reference path="../base/flagwind.draw.ts" />

namespace flagwind {
    /**
     * 绘制图层
     */
    export class MinemapDraw implements IFlagwindDraw {

        public flagwindMap: FlagwindMap;
        public draw: any;
        public mode: any;
        public options: any = {
            boxSelect: true,
            touchEnabled: true,
            displayControlsDefault: true,
            showButtons: false,
            onEvent: (eventName: string, evt: any) => {
                // console.log(eventName);
            }
        };

        public constructor(flagwindMap: FlagwindMap, options?: any) {
            this.flagwindMap = flagwindMap;
            this.options = {
                ...DRAW_LAYER_OPTIONS,
                ...this.options,
                ...options
            };

            this.draw = new minemap.edit.init(flagwindMap.map, this.options);
            this.flagwindMap.innerMap.on("edit.record.create", (evt: any) => this.onDrawComplete(evt.record.features[0]));
        }

        public activate(mode: string, options?: any) {
            if (this.draw && mode) {
                let tool = mode.replace(/ /g, "_");
                this.draw.onBtnCtrlActive(tool);
            }
        }

        public finish() {
            // if (this.draw) {
            //     this.draw.deactivate();
            // }
        }

        private onDrawComplete(evt: any) {
            this.finish();
            this.options.onEvent("draw-complete", evt.geometry);
            this.options.onDrawCompleteEvent(evt.geometry);
        }

    }
}
