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

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(flagwindMap: FlagwindMap, id: string, options: any, public businessService?: IFlagwindBusinessService) {
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
            // return new EsriGraphicsLayer(options);
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
            this.isLoading = true;
            this.fireEvent("showDataList", { action: "start" });
            return this.businessService.getDataList().then(dataList => {
                this.isLoading = false;
                this.saveGraphicList(dataList);
                this.fireEvent("showDataList", { action: "end", attributes: dataList });
            }).catch(error => {
                this.isLoading = false;
                console.log("加载卡口数据时发生了错误：", error);
                this.fireEvent("showDataList", { action: "error", attributes: error });
            });
        }

        /**
         * 开启定时器
         */
        public start() {
            (<any>this).timer = setInterval(() => {
                this.updateStatus();
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

        public setSelectStatus(item: any, selected: boolean): void {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        }

        protected onCreateLineGraphic(item: any): any {
            let polyline = this.getPolyline(item.polyline);
            let lineSymbol = this.getLineSymbol(this.options.symbol);
            let attr = { ...item, ...{ __type: "polyline" } };
            const graphic = new esri.Graphic(polyline, lineSymbol, attr);
            return graphic;
        }

        protected onUpdateLineGraphic(item: any) {
            let polyline = this.getPolyline(item.polyline);
            let lineSymbol = this.getLineSymbol(this.options.symbol);
            const graphic = this.getGraphicById(item.id);
            graphic.setGeometry(polyline);
            graphic.setSymbol(lineSymbol);
            graphic.attributes = { ...graphic.attributes, ...item, ...{ __type: "polyline" } };
            graphic.draw(); // 重绘
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

        /**
         * 更新设备状态
         */
        private updateStatus(): void {
            this.isLoading = true;
            this.fireEvent("updateStatus", { action: "start" });
            this.businessService.getLastStatus().then(dataList => {
                this.isLoading = false;
                this.saveGraphicList(dataList);
                this.fireEvent("updateStatus", { action: "end", attributes: dataList });
            }).catch(error => {
                this.isLoading = false;
                console.log("加载卡口状态时发生了错误：", error);
                this.fireEvent("updateStatus", { action: "error", attributes: error });
            });
        }

    }

}
