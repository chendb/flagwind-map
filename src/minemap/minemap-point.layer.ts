/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 点图层
     */
    export class MinemapPointLayer extends FlagwindBusinessLayer {

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(flagwindMap: FlagwindMap, id: string, options: any, public businessService: IFlagwindBusinessService) {
            super(flagwindMap, id, { ...{ autoInit: true }, ...options, ...{ layerType: "point" } });
            if (this.options.autoInit) {
                this.onInit();
            }
        }

        public onCreateGraphicsLayer(options: any) {
            return new MinemapGraphicsLayer(options);
        }

        public openInfoWindow(id: string, context: any, options: any) {
            let graphic = this.getGraphicById(id);
            if (context) {
                this.flagwindMap.onShowInfoWindow({
                    graphic: graphic,
                    context: context,
                    options: options
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
                }
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
            let imageUrl = this.options.imageUrl || this.options.symbol.imageUrl;
            if (typeof imageUrl === "string") {
                const key = "imageUrl" + (item.status || "") + (item.selected ? "checked" : "");
                let statusImageUrl = this.options[key] || this.options.symbol[key] || imageUrl;
                let imageParts = statusImageUrl.split(".");
                if (item.selected) {
                    return imageParts[0] + "_checked." + imageParts[1];
                } else {
                    return imageParts[0] + "_unchecked." + imageParts[1];
                }
            } else {
                const key = "image" + (item.status || "") + (item.selected ? "checked" : "");
                return this.options[key] || this.options.symbol[key] || this.options.image;
            }
        }

        public getClassName(item: any): string {
            if (item.selected == null) {
                return "";
            }

            if (item.selected) {
                return "checked";
            } else {
                return "unchecked";
            }

        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            let className = this.options.symbol.className || "graphic-tollgate";
            let imageUrl = this.options.symbol.imageUrl || this.options.imageUrl;
            let attr = { ...item, ...{ __type: "marker" } };
            return new MinemapMarkerGraphic({
                id: item.id,
                className: className,
                symbol: {
                    imageUrl: imageUrl,
                    imageSize: this.options.symbol.imageSize || [20, 28],
                    imgOffset: this.options.symbol.imgOffset || [-10, -14]
                },
                point: {
                    y: this.getPoint(item).y,
                    x: this.getPoint(item).x
                },
                attributes: attr
            });
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            let graphic: MinemapMarkerGraphic = this.getGraphicById(item.id);
            if (graphic) {
                graphic.geometry = new MinemapPoint(item.longitude, item.latitude);
                let attr = { ...graphic.attributes, ...item, ...{ __type: "marker" } };
                this.setGraphicStatus(attr);
            } else {
                console.warn("待修改的要素不存在");
            }
        }

        /**
         * 加载并显示设备点位
         * 
         * @memberof TollgateLayer
         */
        public showDataList() {
            let getDataList: Function = (this.businessService) ? this.businessService.getDataList : this.options.getDataList;
            if (!getDataList) {
                throw new Error("没有指定该图层的状态获取方法");
            }
            this.isLoading = true;
            this.fireEvent("showDataList", { action: "start" });
            return (<Promise<Array<any>>>getDataList()).then(dataList => {
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
            item.selected = selected;
            this.setGraphicStatus(item);
        }

        protected setGraphicStatus(item: any): void {
            let graphic: MinemapMarkerGraphic = this.getGraphicById(item.id);
            graphic.setSymbol({
                className: this.getClassName(item),
                imageUrl: this.getImageUrl(item)
            });
        }

        /**
         * 更新设备状态
         */
        private updateStatus(): void {
            let getLastStatus: Function = (this.businessService) ? this.businessService.getLastStatus : this.options.getLastStatus;
            if (!getLastStatus) {
                throw new Error("没有指定该图层的状态获取方法");
            }
            this.isLoading = true;
            this.fireEvent("updateStatus", { action: "start" });
            (<Promise<Array<any>>>getLastStatus()).then(dataList => {
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
