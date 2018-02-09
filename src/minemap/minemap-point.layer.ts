/// <reference path="../base/flagwind-business.layer.ts" />
namespace flagwind {
    /**
     * 点图层
     */
    export class MinemapPointLayer extends FlagwindBusinessLayer {

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(public businessService: IFlagwindBusinessService, flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, options);
            this.onInit();
        }

        public onCreateGraphicsLayer(options: any) {
            return new MinemapGraphicsLayer(options);
        }

        public onShowInfoWindow(evt: any): void {
            let context = this.businessService.getInfoWindowContext(evt.graphic.attributes);
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
            return this.businessService.changeStandardModel(item);
        }

        public getImageUrl(item: any): string {
            if (item.selected == null) {
                return this.options.imageUrl || this.options.symbol.imageUrl;
            }

            let imageUrl: String = this.options.imageUrl || this.options.symbol.imageUrl;
            let imageParts = imageUrl.split(".");
            if (item.selected) {
                return imageParts[0] + "_checked." + imageParts[1];
            } else {
                return imageParts[0] + "_unchecked." + imageParts[1];
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
            let className = this.options.dataType || "graphic-tollgate";
            let imageUrl = this.options.imageUrl || this.options.symbol.imageUrl;
            return new MinemapMarkerGraphic({
                id: item.id,
                className: className,
                symbol: {
                    imageUrl: imageUrl
                },
                point: {
                    y: item.latitude,
                    x: item.longitude
                },
                attributes: item
            });
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            // this.removeGraphicById(item.id);
            // let minemapMarker = <MinemapMarker>this.onCreatGraphicByModel(item);
            // this.addGraphicByModel(item);
            // (<MinemapMarkerLayer>this.layer).add(minemapMarker);
            // throw new Error("Method not implemented.");
            let graphic: MinemapMarkerGraphic = this.getGraphicById(item.id);
            if (graphic) {
                graphic.geometry = new MinemapPoint(item.longitude, item.latitude);
                this.setGraphicStatus(item);
            }
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

        /**
         * 加载并显示设备点位
         * 
         * @memberof TollgateLayer
         */
        public showDataList() {
            const me = this;
            me.isLoading = true;
            me.fireEvent("showDataList", { action: "start" });
            this.businessService.getDataList().then(dataList => {
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
            let graphics: Array<any> = this.layer.graphics;
            graphics.forEach(item => {
                if (!item.attributes.selected) {
                    item.selected = false;
                    this.setGraphicStatus(item);
                }
            });
            
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
