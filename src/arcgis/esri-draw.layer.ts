/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 绘制图层
     */
    export class EsriDrawLayer implements IFlagwindDrawLayer {
        private symbolSetting: any;
        public flagwindMap: FlagwindMap;
        public draw: any;
        public mode: any;

        public options: any = {
            drawTime: 75,
            showTooltips: true,
            tolerance: 8,
            tooltipOffset: 15,
            onEvent: function (eventName: string, evt: any) {
                // console.log(eventName);
            }
        };

        public constructor(flagwindMap: FlagwindMap, options?: any) {
            this.flagwindMap = flagwindMap;
            this.options = { ...DRAW_LAYER_OPTIONS, ...this.options, ...options };

            this.draw = new esri.toolbars.Draw(flagwindMap.map, this.options);
            this.draw.on("draw-complete", (evt: any) => this.onDrawComplete(evt));
        }

        public activate(mode: string, options?: any) {
            if (this.draw && options) {
                this.setSymbol(mode, options);
            }
            if (this.draw && mode) {
                let tool = mode.toUpperCase().replace(/ /g, "_");
                this.flagwindMap.map.disableMapNavigation();
                this.draw.activate(esri.toolbars.Draw[tool]);
            }
        }

        public clear(): void {
            if (this.draw) {
                this.draw.deactivate();
                this.flagwindMap.map.enableMapNavigation();
            }
        }

        public finish() {
            this.draw.finishDrawing();
        }

        private setSymbol(mode: string, options: any) {
            this.symbolSetting = options;
            switch (mode) {
                case "POLYLINE": this.draw.setLineSymbol(this.lineSymbol); break;
                case "POLYGON": this.draw.setFillSymbol(this.fillSymbol); break;
                case "FREEHAND_POLYGON": this.draw.setFillSymbol(this.fillSymbol); break;
            }
        }

        private onDrawComplete(evt: any) {
            this.clear();
            this.options.onEvent("draw-complete", evt.geometry);
            this.options.onDrawCompleteEvent(evt.geometry);
        }

        private get lineSymbol() {
            let color = this.symbolSetting.color || [255, 0, 0];
            let width = this.symbolSetting.width || 4;
            let lineSymbol = new esri.symbol.CartographicLineSymbol(
                this.symbolSetting.style === "dash" ? esri.symbol.CartographicLineSymbol.STYLE_DASH : esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                new esri.Color(color), width,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
            return lineSymbol;
        }

        private get fillSymbol() {
            let color = this.symbolSetting.color || [255, 49, 0, 0.45];
            let width = this.symbolSetting.width || 3;
            let polygonSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    this.symbolSetting.outlineStyle === "dash" ? esri.symbol.SimpleLineSymbol.STYLE_DASH : esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new esri.Color(this.symbolSetting.outlineColor || [255, 0, 0]),
                    width
                ),
                new esri.Color(color)
            );
            return polygonSymbol;
        }

    }
}
