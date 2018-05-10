/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 面图层
     */
    export class EsriPolygonLayer extends FlagwindBusinessLayer {

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(public businessService: IFlagwindBusinessService, flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, { ...options, ...{ layerType: "polygon" } });
            this.onInit();
        }

        public onCreateGraphicsLayer(options: any) {
            const layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", (evt: any) => layer.dispatchEvent("onMouseOver", evt));
            layer.on("mouse-out", (evt: any) => layer.dispatchEvent("onMouseOut", evt));
            layer.on("mouse-up", (evt: any) => layer.dispatchEvent("onMouseUp", evt));
            layer.on("mouse-down", (evt: any) => layer.dispatchEvent("onMouseDown", evt));
            layer.on("click", (evt: any) => layer.dispatchEvent("onClick", evt));
            layer.on("dbl-click", (evt: any) => layer.dispatchEvent("onDblClick", evt));
            layer.addToMap = function (map: any) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map: any) {
                map.removeLayer(this);
            };
            return layer;
            // return new EsriGraphicsLayer(options);
        }

        public openInfoWindow(id: string, context: any, options: any) {
            let graphic = this.getGraphicById(id);
            if (!graphic) {
                console.trace("-----该条数据不在图层内！id:", id);
                return;
            }
            if (context) {
                this.flagwindMap.onShowInfoWindow({
                    graphic: graphic,
                    context: context,
                    options: options || {}
                });
            } else {
                this.onShowInfoWindow({
                    graphic: graphic
                });
            }
        }

        public onShowInfoWindow(evt: any): void {
            let context = this.businessService.getInfoWindowContext(evt.graphic.attributes);
            this.flagwindMap.onShowInfoWindow({
                graphic: evt.graphic,
                context: {
                    type: "html",
                    title: context.title,
                    content: context.content
                },
                options: {}
            });
        }

        /**
         * 把实体转换成标准的要素属性信息
         * @param item 实体信息
         */
        public onChangeStandardModel(item: any): any {
            return this.businessService.changeStandardModel(item);
        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            return this.onCreatePolygonGraphic(item);
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            return this.onUpdatePolygonGraphic(item);
        }

        /**
         * 加载并显示设备点位
         * 
         * @memberof TollgateLayer
         */
        public showDataList() {
            const me = this;
            me.isLoading = true;
            me.fireEvent("showDataList", { action: "start" });
            return this.businessService.getDataList().then(dataList => {
                me.isLoading = false;
                me.saveGraphicList(dataList);
                me.fireEvent("showDataList", { action: "end", attributes: dataList });
            }).catch(error => {
                me.isLoading = false;
                console.log("加载卡口数据时发生了错误：", error);
                me.fireEvent("showDataList", { action: "error", attributes: error });
            });
        }

        /**
         * 开启定时器
         */
        public start() {
            let me = this;
            (<any>this).timer = setInterval(() => {
                me.updateStatus();
            }, this.options.timeout || 20000);
        }

        /**
         * 关闭定时器
         */
        public stop() {
            if ((<any>this).timer) {
                clearInterval((<any>this).timer);
            }
        }

        protected setSelectStatus(item: any, selected: boolean): void {
            item.selected = true;
            this.onUpdateGraphicByModel(item);
        }

        protected onCreatePolygonGraphic(item: any): any {
            let polygon = this.getPolygon(item.polyline);
            let fillSymbol = this.getFillSymbol(item, null);
            let attr = { ...item, ...{ __type: "polygon" } };
            const graphic = new esri.Graphic(polygon, fillSymbol, attr);
            return graphic;
        }

        protected onUpdatePolygonGraphic(item: any) {
            let polygon = this.getPolygon(item.polyline);
            let fillSymbol = this.getFillSymbol(item, null);
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

        protected getFillSymbol(item: any, symbol: any): any {

            let polygonSymbol = new esri.symbol.SimpleFillSymbol(symbol);

            return polygonSymbol;
        }

        protected getLineSymbol(item: any, symbol: any): any {
            let playedLineSymbol = new esri.symbol.CartographicLineSymbol(symbol);
            return playedLineSymbol;
        }

        /**
         * 更新设备状态
         */
        private updateStatus(): void {
            const me = this;
            me.isLoading = true;
            me.fireEvent("updateStatus", { action: "start" });
            this.businessService.getLastStatus().then(dataList => {
                me.isLoading = false;
                me.saveGraphicList(dataList);
                me.fireEvent("updateStatus", { action: "end", attributes: dataList });
            }).catch(error => {
                me.isLoading = false;
                console.log("加载卡口状态时发生了错误：", error);
                me.fireEvent("updateStatus", { action: "error", attributes: error });
            });
        }

    }

}
