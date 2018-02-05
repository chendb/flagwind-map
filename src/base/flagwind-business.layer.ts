/// <reference path="./flagwind-feature.layer.ts" />
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
            super(id, options.title || "设备图层");
            options = { ...BUSINESS_LAYER_OPTIONS, ...options };

            this.flagwindMap = flagwindMap;
            this.options = options;
        }

        public onInit(): void {
            this.onAddLayerBefor();
            this.flagwindMap.addFeatureLayer(this);
            this.onAddLayerAfter();

            if (this.flagwindMap.loaded) {
                this.onLoad();
            } else {
                const me = this;
                this.flagwindMap.on("onLoad", function () {
                    me.onLoad();
                });
            }
        }

        public abstract onShowInfoWindow(evt: any): void;

        public abstract onCreatGraphicByModel(item: any): any;

        public abstract onUpdateGraphicByModel(item: any): void;

        public onAddLayerBefor(): void {
            console.log("onAddLayerBefor");
        }

        public onAddLayerAfter(): void {
            console.log("onAddLayerAfter");
        }

        public get map(): any {
            return this.flagwindMap.map;
        }

        public get spatial(): any {
            return this.flagwindMap.spatial;
        }

        public closeInfoWindow(): void {
            this.flagwindMap.closeInfoWindow();
        }

        public gotoCenterById(key: string): void {
            const graphic = this.getGraphicById(key);
            const pt = this.getPoint(graphic.attributes);
            this.flagwindMap.centerAt(pt.x, pt.y);
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
        public setSelectStatusByModels(dataList: Array<any>, refresh: boolean): void {
            if (refresh) {
                this.clearSelectStatus();
            }
            for (let i = 0; i < dataList.length; i++) {
                let model = this.onChangeStandardModel(dataList[i]);
                let graphic = this.getGraphicById(model.id);
                if (graphic) {
                    this.setSelectStatus(graphic.attributes, true);
                }
            }
        }

        /**
         * 保存要素（如果存在，则修改，否则添加）
         */
        public saveGraphicByModel(item: any): void {
            item = this.onChangeStandardModel(item);
            if (!item || !item.id) return;
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
            item = this.onChangeStandardModel(item);
            if (!this.onValidModel(item)) {
                return null;
            }
            // select属性为true表示当前选中，false表示未选中
            if (item.selected === undefined) {
                item.selected = false;
            }
            const graphic = this.onCreatGraphicByModel(item);
            return graphic;
        }

        /**
         * 修改要素
         */
        public updateGraphicByModel(item: any, graphic: any | null = null): void {
            item = this.onChangeStandardModel(item);
            if (!this.onValidModel(item)) {
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
            return this.flagwindMap.onFormPoint(point);
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
            this.on("onClick", function (evt: EventArgs) {
                _deviceLayer.onLayerClick(_deviceLayer, evt.data);
            });

            if (this.options.showTooltipOnHover) { // 如果开启鼠标hover开关
                this.on("onMouseOver", function (evt: EventArgs) {
                    _deviceLayer.flagwindMap.onShowTooltip(evt.data.graphic);
                });
                this.on("onMouseOut", function (evt: EventArgs) {
                    _deviceLayer.flagwindMap.onHideTooltip(evt.data.graphic);
                });
            }
        }

        protected onLayerClick(deviceLayer: this, evt: any) {

            if (deviceLayer.options.onLayerClick) {
                deviceLayer.options.onLayerClick(evt);
            }
            if (deviceLayer.options.showInfoWindow) {
                evt.graphic.attributes.eventName = "";
                deviceLayer.onShowInfoWindow(evt);
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

        protected setSelectStatus(item: any, selected: boolean): void {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        }

        /**
         * 变换成标准实体（最好子类重写）
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        protected abstract onChangeStandardModel(item: any): any;

        protected onValidModel(item: any) {
            return item.longitude && item.latitude;
        }
    }

}
