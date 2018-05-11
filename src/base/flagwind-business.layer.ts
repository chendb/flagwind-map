/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";

namespace flagwind {

    export const BUSINESS_LAYER_OPTIONS: any = {
        onLayerClick: function (evt: any) {
            console.log("onLayerClick");
        },
        onMapLoad: function () {
            // console.log("onMapLoad");
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
        onVisibleChanged: function (isShow: boolean) {
            console.log("onVisibleChanged");
        },
        changeStandardModel: function (model: any) {
            return model;
        },
        getInfoWindowContext: function (mode: any) {
            return {
                title: "详细信息",
                content: "没有定制详细信息"
            };
        },
        enableEdit: true,      // 启用要素编辑功能
        enableSelectMode: false, // 是否启用选择模块
        selectMode: 1,           // 1为多选，2为单选
        showTooltipOnHover: false,
        showInfoWindow: false,
        dataType: "marker"
    };

    /**
     * 业务图层
     */
    export abstract class FlagwindBusinessLayer extends FlagwindFeatureLayer {

        public layerType: string = "point";// point polyline polygon

        public constructor(
            public flagwindMap: FlagwindMap,
            public id: string,
            public options: any) {

            super(id, options.title || "设备图层");
            options = { ...BUSINESS_LAYER_OPTIONS, ...options };
            this.layerType = options.layerType;
            this.flagwindMap = flagwindMap;
            this.options = options;
        }

        public onInit(): void {
            this.addToMap();

            if (this.flagwindMap.loaded) {
                this.onLoad();
            } else {
                this.flagwindMap.on("onLoad", () => this.onLoad());
            }
        }

        public abstract openInfoWindow(id: string, context: any, options: any): void;

        public abstract onShowInfoWindow(evt: any): void;

        public abstract onCreatGraphicByModel(item: any): any;

        public abstract onUpdateGraphicByModel(item: any): void;

        public onAddLayerBefor(): void {
            // console.log("onAddLayerBefor");
        }

        public onAddLayerAfter(): void {
            // console.log("onAddLayerAfter");
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
            if (!graphic) {
                console.trace("-----该条数据不在图层内！id:", key);
                return;
            }
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

            this.options.onCheck({
                target: dataList,
                check: true,
                selectedItems: this.getSelectedGraphics().map(g => g.attributes)
            });
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
            if (graphic) {
                this.layer.add(graphic);
            }
        }

        public creatGraphicByModel(item: any): any {
            item = this.onChangeStandardModel(item);
            if (!this.onValidModel(item)) {
                console.warn("无效的要素：" + item);
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
            item = { ...graphic.attributes, ...item };
            const pt = this.getPoint(graphic.attributes);
            this.onUpdateGraphicByModel(item);
            return pt;
        }

        public clearSelectStatus(): void {
            let graphics: Array<any> = this.layer.graphics;
            for (let i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected || typeof graphics[i].attributes.selected !== "boolean") {
                    this.setSelectStatus(graphics[i].attributes, false);
                }
            }
            this.options.onCheck({
                target: graphics ? graphics.map(v => v.attributes) : [],
                check: false,
                selectedItems: this.getSelectedGraphics().map(g => g.attributes)
            });
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

        public addToMap(): void {
            this.onAddLayerBefor();
            this.flagwindMap.addFeatureLayer(this);
            this.onAddLayerAfter();
        }

        public removeFormMap(): void {
            this.flagwindMap.removeFeatureLayer(this.id);
        }

        protected onLoad() {
            try {
                if (!this.layer._map) {
                    this.layer._map = this.flagwindMap.innerMap;
                }
                this.registerEvent();
                this.onMapLoad();
            } catch (error) {
                console.error(error);
            }
        }

        protected onMapLoad() {
            this.options.onMapLoad();
        }

        protected registerEvent(): void {
            let _deviceLayer = this;
            this.on("onClick", (evt: EventArgs) => {
                _deviceLayer.onLayerClick(_deviceLayer, evt.data);
            });

            if (this.options.showTooltipOnHover) { // 如果开启鼠标hover开关
                this.on("onMouseOver", (evt: EventArgs) => {
                    // 增加Tooltip点位避免页面出现闪烁
                    if (_deviceLayer.layerType === "polyline" || _deviceLayer.layerType === "polygon") {
                        // TODO:不清楚此处作用
                        evt.data.graphic.attributes.tooltipX = evt.data.args.layerX;
                        evt.data.graphic.attributes.tooltipY = evt.data.args.layerY;
                    }
                    _deviceLayer.flagwindMap.onShowTooltip(evt.data.graphic);
                    _deviceLayer.fireEvent("onMouseOver", evt.data);
                });
                this.on("onMouseOut", (evt: EventArgs) => {
                    _deviceLayer.flagwindMap.onHideTooltip(evt.data.graphic);
                    _deviceLayer.fireEvent("onMouseOut", evt.data);
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
                    selectedItems: deviceLayer.getSelectedGraphics()
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
            switch (this.layerType) {
                case "marker": return item.id && item.longitude && item.latitude;
                case "polyline": return item.id && item.polyline;
                case "polygon": return item.id && item.polygon;
                default:
                    return item.id && item.longitude && item.latitude;
            }
        }
    }

}
