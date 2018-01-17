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
            if (options.kind === "marker") {
                return new MinemapMarkerLayer(options);
            }
            if (options.kind === "geojson") {
                return new MinemapGeoJsonLayer(options);
            }
            console.warn("未指定图层类型");
            return new MinemapMarkerLayer(options);
        }

        public onShowInfoWindow(evt: any): void {
            let context = this.businessService.getInfoWindowContext(evt.graphic.attributes);
            let infoWindow = this.flagwindMap.innerMap.infoWindow;
            infoWindow.setText("<h4 class='info-window-title'>" + context.title + "</h4" + context.content);
            infoWindow.setLngLat([evt.graphic.geometry.x, evt.graphic.geometry.y]);
        }

        /**
         * 图层事件处理
         * @param eventName 事件名称
         * @param callback 回调
         */
        public onAddEventListener(eventName: string, callback: Function): void {
            this.layer.on(eventName, callback);
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
            return new MinemapMarker({
                id: item.id,
                symbol: {
                    className: this.options.dataType || "graphic-tollgate"
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
            this.removeGraphicById(item.id);
            // let minemapMarker = <MinemapMarker>this.onCreatGraphicByModel(item);
            this.addGraphicByModel(item);
            // (<MinemapMarkerLayer>this.layer).add(minemapMarker);
            // throw new Error("Method not implemented.");
        }

        public openInfoWindow(id: string, context: any) {
            let graphic = this.getGraphicById(id);
            let infoWindow = this.flagwindMap.innerMap.infoWindow;
            infoWindow.setText("<h4 class='info-window-title'>" + context.title + "</h4" + context.content);
            infoWindow.setLngLat([graphic.geometry.x, graphic.geometry.y]);
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
