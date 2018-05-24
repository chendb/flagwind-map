/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 点图层
     */
    export class EsriPointLayer extends FlagwindBusinessLayer {
        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(
            flagwindMap: FlagwindMap,
            id: string,
            options: any,
            public businessService?: IFlagwindBusinessService
        ) {
            super(flagwindMap, id, {
                ...{ autoInit: true },
                ...options,
                ...{ layerType: "point" }
            });
            if (this.options.autoInit) {
                this.onInit();
            }
        }

        public onCreateGraphicsLayer(options: any) {
            const layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", (evt: any) =>
                this.dispatchEvent("onMouseOver", evt)
            );
            layer.on("mouse-out", (evt: any) =>
                this.dispatchEvent("onMouseOut", evt)
            );
            layer.on("mouse-up", (evt: any) =>
                this.dispatchEvent("onMouseUp", evt)
            );
            layer.on("mouse-down", (evt: any) =>
                this.dispatchEvent("onMouseDown", evt)
            );
            layer.on("click", (evt: any) => this.dispatchEvent("onClick", evt));
            layer.on("dbl-click", (evt: any) =>
                this.dispatchEvent("onDblClick", evt)
            );
            layer.addToMap = function(map: any) {
                map.addLayer(this);
            };
            layer.removeFormMap = function(map: any) {
                try {
                    if (!this._map) {
                        this._map = map;
                    }
                    map.removeLayer(this);
                } catch (error) {
                    console.warn(error);
                }
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

        public getImageUrl(item: any): string {
            let imageUrl = this.options.imageUrl;
            if (typeof imageUrl === "string") {
                const key =
                    "imageUrl" +
                    (item.status || "") +
                    (item.selected ? "checked" : "");
                let statusImageUrl: string =
                    this.options[key] || this.options.symbol[key] || imageUrl;
                let suffixIndex = statusImageUrl.lastIndexOf(".");
                const path = statusImageUrl.substring(0, suffixIndex);
                const suffix = statusImageUrl.substring(suffixIndex + 1);
                if (item.selected) {
                    return path + "_checked." + suffix;
                } else {
                    return path + "." + suffix;
                }
            } else {
                const key =
                    "image" +
                    (item.status || "") +
                    (item.selected ? "checked" : "");
                return (
                    this.options[key] ||
                    this.options.symbol[key] ||
                    this.options.image
                );
            }
        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            return this.onCreateMarkerGraphic(item);
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            return this.onUpdateMarkerGraphic(item);
        }

        /**
         * 加载并显示设备点位
         *
         * @memberof TollgateLayer
         */
        public showDataList() {
            if (!this.businessService) {
                throw new Error("没有指定该图层数据获取服务");
            }

            this.isLoading = true;
            this.fireEvent("showDataList", { action: "start" });
            return this.businessService
                .getDataList()
                .then(dataList => {
                    this.isLoading = false;
                    this.saveGraphicList(dataList);
                    this.fireEvent("showDataList", {
                        action: "end",
                        attributes: dataList
                    });
                })
                .catch(error => {
                    this.isLoading = false;
                    console.log("加载图层数据时发生了错误：", error);
                    this.fireEvent("showDataList", {
                        action: "error",
                        attributes: error
                    });
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

        protected onCreateMarkerGraphic(item: any): any {
            const iconUrl = this.getImageUrl(item);
            const pt = this.getPoint(item);
            const width = this.options.symbol.width || 20;
            const height = this.options.symbol.height || 27;
            const markerSymbol = new esri.symbol.PictureMarkerSymbol(
                iconUrl,
                width,
                height
            );
            let attr = { ...item, ...{ __type: "marker" } };
            const graphic = new esri.Graphic(pt, markerSymbol, attr);
            return graphic;
        }

        protected onUpdateMarkerGraphic(item: any): any {
            const iconUrl = this.getImageUrl(item);
            const pt = this.getPoint(item);
            const width = this.options.symbol.width || 20;
            const height = this.options.symbol.height || 27;
            const markerSymbol = new esri.symbol.PictureMarkerSymbol(
                iconUrl,
                width,
                height
            );
            const graphic = this.getGraphicById(item.id);
            const originPoint = graphic.geometry;

            graphic.setGeometry(pt);
            graphic.setSymbol(markerSymbol);
            graphic.attributes = {
                ...graphic.attributes,
                ...item,
                ...{ __type: "marker" }
            };
            graphic.draw(); // 重绘
            if (!MapUtils.isEqualPoint(pt, originPoint)) {
                this.options.onPositionChanged(pt, originPoint, graphic.attributes);
            }
        }

        /**
         * 更新设备状态
         */
        private updateStatus(): void {
            if (!this.businessService) {
                throw new Error("没有指定该图层数据获取服务");
            }

            this.isLoading = true;
            this.fireEvent("updateStatus", { action: "start" });
            this.businessService
                .getLastStatus()
                .then(dataList => {
                    this.isLoading = false;
                    this.saveGraphicList(dataList);
                    this.fireEvent("updateStatus", {
                        action: "end",
                        attributes: dataList
                    });
                })
                .catch(error => {
                    this.isLoading = false;
                    console.log("加载状态时发生了错误：", error);
                    this.fireEvent("updateStatus", {
                        action: "error",
                        attributes: error
                    });
                });
        }
    }
}
