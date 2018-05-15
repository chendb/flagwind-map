/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 点图层
     */
    export class EsriPointLayer extends FlagwindBusinessLayer {

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(public businessService: IFlagwindBusinessService, flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, options);
            this.onInit();
        }

        public onCreateGraphicsLayer(options: any) {
            // return new esri.layers.GraphicsLayer(options);
            return new EsriGraphicsLayer(options);
        }
        
        public openInfoWindow(id: string, context: any, options: any) {
            let graphic = this.getGraphicById(id);
            if(!graphic) {
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

        public getImageUrl(item: any): string {
            switch (item.status) {
                case 0:
                    return item.selected ? this.options.symbol.imageUrl.checkedOff : this.options.symbol.imageUrl.offline;
                case 1:
                    return item.selected ? this.options.symbol.imageUrl.checkedOn : this.options.symbol.imageUrl.online;
                default:
                    return item.selected ? this.options.symbol.imageUrl.checkedOn : this.options.symbol.imageUrl.online;
            }
            // if (item.selected == null) {
            //     return this.options.imageUrl || this.options.symbol.imageUrl;
            // }

            // let imageUrl: String = this.options.imageUrl || this.options.symbol.imageUrl;
            // let imageParts = imageUrl.split(".");
            // if (item.selected) {
            //     return imageParts[0] + "_checked." + imageParts[1];
            // } else {
            //     return imageParts[0] + "_unchecked." + imageParts[1];
            // }
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
            // let imageUrl = this.options.imageUrl || this.options.symbol.imageUrl;
            let imageUrl = this.options.dataType === "marker" ? this.getImageUrl(item) : "";
            return new EsriMarkerGraphic({
                id: item.id,
                dataType: this.options.dataType,
                symbol: {
                    className: className,
                    imageUrl: imageUrl,
                    width: this.options.symbol.width || 20,
                    lineWidth: this.options.symbol.lineWidth,
                    height: this.options.symbol.height || 27,
                    color: this.options.symbol.color,
                    lineColor: this.options.symbol.lineColor,
                    fillColor: this.options.symbol.fillColor,
                    lineSymbol: this.options.symbol.lineSymbol,
                    fillSymbol: this.options.symbol.fillSymbol
                },
                point: this.getPoint(item),
                // point: {
                //     y: item.latitude,
                //     x: item.longitude
                // },
                spatial: this.flagwindMap.spatial,
                map: this.flagwindMap,
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
            let graphic: EsriMarkerGraphic = this.getGraphicById(item.id);
            if (graphic) {
                graphic.geometry = new EsriPoint(item.longitude, item.latitude, this.flagwindMap.spatial).point;
                graphic.attributes = item;
                this.setGraphicStatus(item);
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
            return this.businessService.getDataList().then(dataList => {
                me.isLoading = false;
                me.saveGraphicList(dataList);
                me.triggerEvent();
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
            graphics.forEach(g => {
                if (!g.attributes.selected) {
                    // g.selected = false;
                    this.setGraphicStatus(g.attributes);
                }
            });
            
            item.selected = selected;
            this.setGraphicStatus(item);
        }

        protected setGraphicStatus(item: any): void {
            let graphic: EsriMarkerGraphic = this.getGraphicById(item.id);
            // if(typeof graphic.attributes.selected === "boolean") {
            //     graphic["selected"] = graphic.attributes.selected;
            // }
            // graphic.attributes.selected = graphic["selected"];
            graphic.setSymbol({
                className: this.getClassName(item),
                imageUrl: this.getImageUrl(item)
            });
            graphic.draw();
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

        /**
         * 注册设备事件
         */
        private triggerEvent(): void {
            this.layer.layer.on("mouse-over", (evt: any) => this.layer.dispatchEvent("onMouseOver", { "graphic": this.getGraphicById(evt.graphic.attributes.id), "mapPoint": evt.graphic.geometry, "evt": evt }));
            this.layer.layer.on("mouse-out", (evt: any) => this.layer.dispatchEvent("onMouseOut", { "graphic": this.getGraphicById(evt.graphic.attributes.id), "mapPoint": evt.graphic.geometry, "evt": evt }));
            this.layer.layer.on("mouse-up", (evt: any) => this.layer.dispatchEvent("onMouseUp", { "graphic": this.getGraphicById(evt.graphic.attributes.id), "mapPoint": evt.graphic.geometry, "evt": evt }));
            this.layer.layer.on("mouse-down", (evt: any) => this.layer.dispatchEvent("onMouseDown", { "graphic": this.getGraphicById(evt.graphic.attributes.id), "mapPoint": evt.graphic.geometry, "evt": evt }));
            this.layer.layer.on("click", (evt: any) => this.layer.dispatchEvent("onClick", { "graphic": this.getGraphicById(evt.graphic.attributes.id), "mapPoint": evt.graphic.geometry, "evt": evt }));
            this.layer.layer.on("dbl-click", (evt: any) => this.layer.dispatchEvent("onDblClick", { "graphic": this.getGraphicById(evt.graphic.attributes.id), "mapPoint": evt.graphic.geometry, "evt": evt }));
        }

    }

}
