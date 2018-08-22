/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {

    export const ESRI_POLYGON_LAYER_OPTIONS: any = {
        onEvent: (eventName: string, evt: any) => {
            if (eventName === "onMouseOver") {
                evt.graphic.symbol.setColor([247, 247, 247, 0.05]);
                evt.graphic.draw();
            } else if (eventName === "onMouseOut") {
                evt.graphic.symbol.setColor([0, 49, 0, 0.45]);
                evt.graphic.draw();
            }
        },
        symbol: {
            lineWidth: 3,
            lineColor: [255, 255, 255, 0.6],
            fillColor: [0, 49, 0, 0.45],
            lineType: "STYLE_DASH",
            fillType: "STYLE_SOLID"
        },
        layerType: "polygon"
    };

    /**
     * 面图层
     */
    export class EsriPolygonLayer extends FlagwindBusinessLayer {

        public constructor(flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, { ...ESRI_POLYGON_LAYER_OPTIONS, ...options });
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
            let polygon = this.getPolygon(item.polygon);
            let fillSymbol = this.getFillSymbol(this.options.symbol);
            let attr = { ...item, ...{ __type: "polygon" } };
            const graphic = new esri.Graphic(polygon, fillSymbol, attr);
            return graphic;
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            let polygon = this.getPolygon(item.polygon);
            let fillSymbol = this.getFillSymbol(this.options.symbol);
            const graphic = this.getGraphicById(item.id);
            graphic.setGeometry(polygon);
            graphic.setSymbol(fillSymbol);
            graphic.attributes = { ...graphic.attributes, ...item, ...{ __type: "polygon" } };
            graphic.draw(); // 重绘
        }

        protected getPolygon(strLine: string): any {
            if (!strLine) return null;
            let polygon = new esri.geometry.Polygon(this.spatial);
            let xys = strLine.split(";");
            let points = [];
            for (let i = 0; i < xys.length; i++) {
                if ((!xys[i]) || xys[i].length <= 0) continue;
                let xy = xys[i].split(",");
                let p = this.getPoint({
                    x: parseFloat(xy[0]),
                    y: parseFloat(xy[1])
                });
                points.push([p.x, p.y]);
            }
            polygon.addRing(points);
            return polygon;
        }

        protected getFillSymbol(symbol: any): any {
            return new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol[symbol.fillType],
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol[symbol.lineType],
                    new esri.Color(symbol.lineColor),
                    symbol.lineWidth
                ),
                new esri.Color(symbol.fillColor)
            );
        }
    }

}
