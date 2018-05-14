/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 线图层
     */
    export class EsriPolylineLayer extends FlagwindBusinessLayer {

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(flagwindMap: FlagwindMap, id: string, options: any, public businessService?: IFlagwindBusinessService) {
            super(flagwindMap, id, { ...options, ...{ layerType: "polyline" } });
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
            let context = this.onGetInfoWindowContext(evt.graphic.attributes);
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
            return this.options.changeStandardModel(item);
        }

        public onGetInfoWindowContext(item: any): any {
            return this.options.getInfoWindowContext(item);
        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            return this.onCreateLineGraphic(item);
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            return this.onUpdateLineGraphic(item);
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

        protected onCreateLineGraphic(item: any): any {
            let polyline = this.getPolyline(item.polyline);
            let lineSymbol = this.getLineSymbol(item, null);
            let attr = { ...item, ...{ __type: "polyline" } };
            const graphic = new esri.Graphic(polyline, lineSymbol, attr);
            return graphic;
        }

        protected onUpdateLineGraphic(item: any) {
            let polyline = this.getPolyline(item.polyline);
            let lineSymbol = this.getLineSymbol(item, null);
            const graphic = this.getGraphicById(item.id);
            graphic.setGeometry(polyline);
            graphic.setSymbol(lineSymbol);
            graphic.attributes = { ...graphic.attributes, ...item, ...{ __type: "polyline" } };
            graphic.draw(); // 重绘
        }

        protected getLineSymbol(item: any, symbol: any): any {
            let playedLineSymbol = new esri.symbol.CartographicLineSymbol(symbol);
            return playedLineSymbol;
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
