namespace flagwind {
    /**
     * 卡口
     */
    export class MinemapTollgateLayer extends FlagwindBusinessLayer {

        public isLoading: boolean = false; // 设备是否正在加载

        public constructor(public businessService: IBusinessService, flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, options);

            // if (this.options.enableEdit) {
            //     (<any>this).editLayer = new EditLayer(flagwindMap, this, {
            //         onEditInfo: this.onEditInfo
            //     });
            // }

        }

        public onEditInfo(evt: any, isSave: boolean) {
            // console.log(evt);
            // return new Promise((reject, resolve) => {
            //     if (isSave) {
            //         updatePoint({
            //             PointNo: evt.id,
            //             Longitude: evt.longitude,
            //             Latitude: evt.latitude
            //         }).then(response => {
            //             reject("坐标更新成功");
            //         }).catch(error => {
            //             app.$Message.error("坐标更新失败");
            //             resolve("坐标更新失败");
            //         });
            //         // console.log("请执行坐标更新服务");
            //     } else {
            //         // resolve("用户取消了坐标更新操作");
            //         console.log("用户取消了坐标更新操作");
            //     }
            // });
        }

        public createGraphicsLayer(options: any) {
            options.kind = "marker";
            return this.mapService.createGraphicsLayer(options);
        }

        public showInfoWindow(evt: any) {
            let context = this.businessService.getInfoWindowContext(evt.graphic.attributes);
            let infoWindow = this.flagwindMap.innerMap.infoWindow;
            infoWindow.setText("<h4 class='info-window-title'>" + context.title + "</h4" + context.content);
            infoWindow.setLngLat([evt.graphic.geometry.x, evt.graphic.geometry.y]);
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
         * 把实体转换成标准的要素属性信息
         * @param item 实体信息
         */
        public changeStandardModel(item: any): any {
            return this.businessService.changeStandardModel(item);
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
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            return new MinemapMarker({
                id: item.id,
                symbol: {
                    className: "graphic-tollgate"
                },
                point: {
                    x: item.latitude,
                    y: item.longitude
                }
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

        /**
         * 图层事件处理
         * @param eventName 事件名称
         * @param callback 回调
         */
        public addEventListener(eventName: string, callback: Function): void {
            this.layer.on(eventName, callback);
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
