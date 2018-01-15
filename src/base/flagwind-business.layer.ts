namespace flagwind {

    export const BUSINESS_LAYER_OPTIONS: any = {
        onLayerClick: function (evt: any) {
            console.log("onLayerClick");
        },
        onMapLoad: function () {
            console.log("onMapLoad");
        },
        onEvent: function (eventName: string, evt: any) {
            console.log("onEvent");

        },
        onCheck: function (evt: any) {
            console.log("onCheck");
        },
        onEditInfo: function (evt: any, isSave: boolean) {
            console.log("onEditInfo");
        },
        enableEdit: true,      // 启用要素编辑功能
        enableSelectMode: false, // 是否启用选择模块
        selectMode: 1,           // 1为多选，2为单选
        showTooltipOnHover: true,
        showInfoWindow: true
    };

    /**
     * 业务图层
     */
    export abstract class FlagwindBusinessLayer extends FlagwindFeatureLayer {

        public constructor(
            public flagwindMap: FlagwindMap,
            public id: string, public options: any) {
            super(flagwindMap.mapService, id, options.title || "设备图层");
            options = { ...BUSINESS_LAYER_OPTIONS, ...options };

            this.flagwindMap = flagwindMap;
            this.options = options;

            this.onInit();
            this.onAddLayerBefor();
            this.flagwindMap.addFeatureLayer(this);
            this.onAddLayerAfter();

            if (this.flagwindMap.innerMap.loaded) {
                this.onLoad();
            } else {
                const me = this;
                this.flagwindMap.innerMap.on("load", function () {
                    me.onLoad();
                });
            }

        }

        public abstract showInfoWindow(evt: any): void;

        public abstract onCreatGraphicByModel(item: any): any;

        public abstract onUpdateGraphicByModel(item: any): void;

        public abstract addEventListener(target: any, eventName: string, callback: Function): void;

        // /**
        //  * 获取资源图标
        //  */
        // public abstract getIconUrl(info: any): void;

        // public abstract getGraphicWidth(level: number | null): number;

        // public abstract getGraphicHeight(level: number | null): number;

        public get map(): any {
            return this.flagwindMap.map;
        }

        public get spatial(): any {
            return this.flagwindMap.spatial;
        }

        public gotoCenterById(key: string): void {
            const graphic = this.getGraphicById(key);
            const pt = this.getPoint(graphic.attributes);
            this.map.centerAt(pt).then(() => {
                console.log(pt);
            });
        }

        public saveGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                this.saveGraphicByModel(dataList[i]);
            }
        }

        public updateGraphicList(dataList: Array<any>): void {

            for (let i = 0; i < dataList.length; i++) {
                this.updateGraphicByModel(dataList[i]);
            }
        }

        // 设置选择状态
        public setSelectStatusByModels(dataList: Array<any>): void {
            this.clearSelectStatus();
            for (let i = 0; i < dataList.length; i++) {
                let model = this.changeStandardModel(dataList[i]);
                let graphic = this.getGraphicById(model.id);
                if (graphic) {
                    this.setSelectStatus(graphic, true);
                }
            }
        }

        /**
         * 保存要素（如果存在，则修改，否则添加）
         */
        public saveGraphicByModel(item: any): void {
            const graphic = this.getGraphicById(item.id);
            if (graphic) {
                return this.updateGraphicByModel(item, graphic);
            } else {
                return this.addGraphicByModel(item);
            }
        }

        public addGraphicByModel(item: any): void {
            const graphic = this.creatGraphicByModel(item);
            this.layer.add(graphic);
        }

        public creatGraphicByModel(item: any): any {
            item = this.changeStandardModel(item);
            if (!this.validModel(item)) {
                return null;
            }
            item.select = false; // select属性为true表示当前选中，false表示未选中
            const graphic = this.onCreatGraphicByModel(item);
            // const pt = this.getPoint(item);
            // const iconUrl = this.getIconUrl(item);
            // const width = this.getGraphicWidth(null);
            // const height = this.getGraphicHeight(null);
            // const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            // const graphic = new esri.Graphic(pt, markerSymbol, item);
            return graphic;
        }

        /**
         * 修改要素
         */
        public updateGraphicByModel(item: any, graphic: any | null = null): void {
            item = this.changeStandardModel(item);
            if (!this.validModel(item)) {
                return;
            }
            if (!graphic) {
                graphic = this.getGraphicById(item.id);
            }
            if (graphic == null) {
                return;
            }

            const pt = this.getPoint(item);
            this.onUpdateGraphicByModel(item);

            // const iconUrl = this.getIconUrl(item);

            // graphic.setSymbol(new esri.symbol.PictureMarkerSymbol(
            //     iconUrl,
            //     this.getGraphicWidth(null),
            //     this.getGraphicHeight(null)));
            // graphic.setGeometry(pt);
            // graphic.attributes = item;

            // graphic.draw(); // 重绘

            return pt;
        }

        public clearSelectStatus(): void {
            let graphics = this.layer.graphics;
            for (let i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected) {
                    this.setSelectStatus(graphics[i], false);
                }
            }
        }
        public getSelectedGraphics(): Array<any> {
            return (<Array<any>>this.layer.graphics).filter(g => g.attributes && g.attributes.selected);
        }

        /**
         * 创建点要素（把业务数据的坐标转换成地图上的点）
         */
        public getPoint(item: any): any {
            return this.flagwindMap.getPoint(item);
        }

        /**
         * 把地图上的点转换成业务的坐标
         * @param {*} point 
         */
        public formPoint(point: any): any {
            return this.flagwindMap.formPoint(point);
        }

        protected onAddLayerBefor(): void {
            console.log("onAddLayerBefor");
        }

        protected onAddLayerAfter(): void {
            console.log("onAddLayerAfter");
        }

        protected onInit(): void {
            console.log("onInit");
        }

        protected onLoad() {
            if (!this.layer._map) {
                this.layer._map = this.flagwindMap.innerMap;
            }
            this.registerEvent();
            this.onMapLoad();
        }

        protected onMapLoad() {
            this.options.onMapLoad();
        }

        protected registerEvent(): void {
            let _deviceLayer = this;
            this.addEventListener(this.layer, "onClick", function (evt: any) {
                _deviceLayer.onLayerClick(_deviceLayer, evt);
            });

            if (this.options.showTooltipOnHover) { // 如果开启鼠标hover开关
                this.addEventListener(this.layer, "onMouseOver", function (evt: any) {
                    _deviceLayer.flagwindMap.showTitle(evt.graphic);
                });
                this.addEventListener(this.layer, "onMouseOut", function (evt: any) {
                    _deviceLayer.flagwindMap.hideTitle();
                });
            }
        }

        protected onLayerClick(deviceLayer: this, evt: any) {

            if (deviceLayer.options.onLayerClick) {
                deviceLayer.options.onLayerClick(evt);
            }
            if (deviceLayer.options.showInfoWindow) {
                evt.graphic.attributes.eventName = "";
                deviceLayer.showInfoWindow(evt);
            }

            if (deviceLayer.options.enableSelectMode) {
                if (deviceLayer.options.selectMode === 1) {
                    let item = evt.graphic.attributes;
                    if (evt.graphic.attributes.selected) {
                        deviceLayer.setSelectStatus(item, false);
                    } else {
                        deviceLayer.setSelectStatus(item, true);
                    }
                } else {
                    deviceLayer.clearSelectStatus();
                    let item = evt.graphic.attributes;
                    deviceLayer.setSelectStatus(item, true);
                }
                console.log("check-------" + evt.graphic.attributes);
                deviceLayer.options.onCheck({
                    target: [evt.graphic.attributes],
                    check: evt.graphic.attributes.selected,
                    selectGraphics: deviceLayer.getSelectedGraphics()
                });
            }

        }

        protected fireEvent(eventName: string, event: any) {
            this.options.onEvent(eventName, event);
        }

        protected validModel(item: any) {
            return item.longitude && item.latitude;
        }

        /**
         * 变换成标准实体（最好子类重写）
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        protected changeStandardModel(item: any) {
            if (item.tollLongitude && item.tollLatitude) {
                item.id = item.tollCode;
                item.name = item.tollName;
                item.longitude = item.tollLongitude;
                item.latitude = item.tollLatitude;
            }
            return item;
        }

        protected setSelectStatus(item: any, selected: boolean): void {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        }
    }

}
