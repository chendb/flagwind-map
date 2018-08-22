/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {

    export const ESRI_POLYLINE_LAYER_OPTIONS: any = {
        symbol: {
            lineWidth: 4,
            lineColor: [255, 0, 0],
            lineType: "STYLE_DASH",
            lineMiterLimit: 2
        },
        layerType: "polyline"
    };

    /**
     * 线图层
     */
    export class EsriPolylineLayer extends FlagwindBusinessLayer {

        public constructor(flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, { ...ESRI_POLYLINE_LAYER_OPTIONS, ...options });
            this.onInit();
        }

        public onCreateGraphicsLayer(options: any) {
            const layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", (evt: any) => this.dispatchEvent("onMouseOver", evt));
            layer.on("mouse-out", (evt: any) => this.dispatchEvent("onMouseOut", evt));
            layer.on("mouse-up", (evt: any) => this.dispatchEvent("onMouseUp", evt));
            layer.on("mouse-down", (evt: any) => this.dispatchEvent("onMouseDown", evt));
            layer.on("click", (evt: any) => this.dispatchEvent("onClick", evt));
            layer.on("dbl-click", (evt: any) => this.dispatchEvent("onDblClick", evt));
            layer.addToMap = function (map: any) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map: any) {
                map.removeLayer(this);
            };
            return layer;
        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            let polyline = this.getPolyline(item.polyline);
            let lineSymbol = this.getLineSymbol(this.options.symbol);
            let attr = { ...item, ...{ __type: "polyline" } };
            const graphic = new esri.Graphic(polyline, lineSymbol, attr);
            return graphic;
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            let polyline = this.getPolyline(item.polyline);
            let lineSymbol = this.getLineSymbol(this.options.symbol);
            const graphic = this.getGraphicById(item.id);
            graphic.setGeometry(polyline);
            graphic.setSymbol(lineSymbol);
            graphic.attributes = { ...graphic.attributes, ...item, ...{ __type: "polyline" } };
            graphic.draw(); // 重绘
        }

        public setSelectStatus(item: any, selected: boolean): void {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        }

        protected getLineSymbol(symbol: any): any {
            return new esri.symbol.CartographicLineSymbol(
                esri.symbol.CartographicLineSymbol[symbol.lineType], new esri.Color(symbol.lineColor), symbol.lineWidth,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, symbol.lineMiterLimit);
        }

        /**
         * 把点集字符串转换成线要素
         * @param strLine 坐标点字符串"x1,y1;x2,y2;x3,y3"
         */
        protected getPolyline(strLine: string): any {
            if (!strLine) return null;
            let line = new esri.geometry.Polyline(this.spatial);
            let xys = strLine.split(";");
            for (let i = 1; i < xys.length; i++) {
                if ((!xys[i]) || xys[i].length <= 0) continue;
                let startXy = xys[i - 1].split(",");
                let endXy = xys[i].split(",");
                let start = this.getPoint({
                    x: parseFloat(startXy[0]),
                    y: parseFloat(startXy[1])
                });
                let end = this.getPoint({
                    x: parseFloat(endXy[0]),
                    y: parseFloat(endXy[1])
                });
                line.addPath([[start.x, start.y], [end.x, end.y]]);
            }
            return line;
        }

    }

}
