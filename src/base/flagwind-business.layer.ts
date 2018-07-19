/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";

namespace flagwind {

    export const BUSINESS_LAYER_OPTIONS: any = {
        onLayerClick: (evt: any) => {
            console.log("onLayerClick");
        },
        onMapLoad: () => {
            // console.log("onMapLoad");
        },
        onEvent: (eventName: string, evt: any) => {
            console.log("onEvent");
        },
        // 该方法可能去掉
        onCheck: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) => {
            console.log("onCheck");
        },
        onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) => {
            console.log("onCheckChanged");
        },
        // onEditInfo: (evt: any, isSave: boolean) => {
        //     console.log("onEditInfo");
        // },
        onPositionChanged: (currentPoint: any, originPoint: any, item: any) => {
            console.log("onPositionChanged");
        },
        onVisibleChanged: (isShow: boolean) => {
            console.log("onVisibleChanged");
        },
        changeStandardModel: (model: any) => {
            return model;
        },
        getInfoWindowContext: (mode: any) => {
            return {
                title: "详细信息",
                content: "没有定制详细信息"
            };
        },
        enableEdit: true,           // 启用要素编辑功能
        enableSelectMode: false,    // 是否启用选择模块
        selectMode: 1,              // 1为多选，2为单选
        showTooltipOnHover: false,
        showInfoWindow: false,
        dataType: "point"
    };

    /**
     * 业务图层
     */
    export abstract class FlagwindBusinessLayer extends FlagwindFeatureLayer {
        public layerType: string = LayerType.point; // point polyline polygon

        public constructor(public flagwindMap: FlagwindMap, public id: string, public options: any) {
            super(id, options.title || "设备图层");
            options = { ...BUSINESS_LAYER_OPTIONS, ...options };
            this.layerType = options.layerType;
            this.flagwindMap = flagwindMap;
            this.options = options;
        }

        // #region 属性

        /**
         * 地图原生对象
         */
        public get map(): any {
            return this.flagwindMap.map;
        }

        /**
         * 空间坐标系
         */
        public get spatial(): any {
            return this.flagwindMap.spatial;
        }

        // #endregion

        // #region graphic操作

        /**
         * 根据对象集合构造要素集合（无则新增，有则修改）
         * @param dataList 对象集合
         */
        public saveGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                this.saveGraphicByModel(dataList[i]);
            }
        }

        /**
         * 根据对象集合修改要素集合（无则忽略）
         * @param dataList 对象集合
         */
        public updateGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                this.updateGraphicByModel(dataList[i]);
            }
        }

        /**
         * 保存要素（有则修改，无则增加）
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

        /**
         * 创建并增加要素
         */
        public addGraphicByModel(item: any): void {
            const graphic = this.creatGraphicByModel(item);
            if (graphic) {
                this.layer.add(graphic);
            }
        }

        /**
         * 创建要素（未添加至图层中）
         */
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

        // #endregion

        // #region 状态管理

        public clearSelectStatus(): void {
            let graphics: Array<any> = this.layer.graphics;
            for (let i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected || typeof graphics[i].attributes.selected !== "boolean") {
                    this.setSelectStatus(graphics[i].attributes, false);
                }
            }
            // 该方法可能去掉
            this.options.onCheck({
                target: graphics ? graphics.map(v => v.attributes) : [],
                check: false,
                selectedItems: this.getSelectedGraphics().map(
                    g => g.attributes
                )
            });
            this.options.onCheckChanged({
                target: graphics ? graphics.map(v => v.attributes) : [],
                check: false,
                selectedItems: this.getSelectedGraphics().map(
                    g => g.attributes
                )
            });
        }

        public setSelectStatus(item: any, selected: boolean): void {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
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
            // 该方法可能去掉
            this.options.onCheck({
                target: dataList,
                check: true,
                selectedItems: this.getSelectedGraphics().map(
                    g => g.attributes
                )
            });

            this.options.onCheckChanged({
                target: dataList,
                check: true,
                selectedItems: this.getSelectedGraphics().map(
                    g => g.attributes
                )
            });
        }

        public getSelectedGraphics(): Array<any> {
            return (<Array<any>>(
                this.layer.graphics
            )).filter(g => g.attributes && g.attributes.selected);
        }

        // #endregion

        // #region 坐标转换

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

        // #endregion

        // #region 常规操作
        /**
         * 在指定id的graphic上打开InfoWindow
         * @param id  grahpic的唯一标识
         * @param context 内容
         * @param options 参数
         */
        public openInfoWindow(id: string, context: any, options: any): void {
            let graphic = this.getGraphicById(id);
            if (!graphic) {
                console.warn("该条数据不在图层内！id:", id);
                return;
            }
            if (context) {
                this.flagwindMap.onShowInfoWindow({
                    graphic: graphic,
                    context: context,
                    options: options || {}
                });
            } else {
                this.onShowInfoWindow({ graphic: graphic });
            }
        }

        /**
         * 关闭信息窗口
         */
        public closeInfoWindow(): void {
            this.flagwindMap.closeInfoWindow();
        }

        /**
         * 定位至指定id的点
         * @param id
         */
        public gotoCenterById(id: string): void {
            const graphic = this.getGraphicById(id);
            if (!graphic) {
                console.trace("-----该条数据不在图层内！id:", id);
                return;
            }
            const pt = this.getPoint(graphic.attributes);
            this.flagwindMap.centerAt(pt.x, pt.y);
        }

        /**
         * 增加到地图上
         */
        public addToMap(): void {
            this.onAddLayerBefor();
            this.flagwindMap.addFeatureLayer(this);
            this.onAddLayerAfter();
        }

        /**
         * 从地图移除
         */
        public removeFormMap(): void {
            this.flagwindMap.removeFeatureLayer(this.id);
        }

        /**
         * 显示InfoWindow（在flagwind包下可用，对外不要调用此方法）
         * @param args
         */
        public abstract onShowInfoWindow(args: { graphic: FlagwindGraphic }): void;

        // #endregion

        // #region 内部方法

        protected onInit(): void {
            this.addToMap();

            if (this.flagwindMap.loaded) {
                this.onLoad();
            } else {
                this.flagwindMap.on("onLoad", () => this.onLoad());
            }
        }

        protected onAddLayerBefor(): void {
            // console.log("onAddLayerBefor");
        }

        protected onAddLayerAfter(): void {
            // console.log("onAddLayerAfter");
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
            this.on("onClick", (evt: EventArgs) => {
                this.onLayerClick(this, evt.data);
            });

            if (this.options.showTooltipOnHover) {
                // 如果开启鼠标hover开关
                this.on("onMouseOver", (evt: EventArgs) => {
                    this.flagwindMap.onShowTooltip(evt.data.graphic);
                    this.fireEvent("onMouseOver", evt.data);
                });
                this.on("onMouseOut", (evt: EventArgs) => {
                    this.flagwindMap.onHideTooltip();
                    this.fireEvent("onMouseOut", evt.data);
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
                if (deviceLayer.options.selectMode === SelectMode.single) {
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

                // 该方法可能去掉
                deviceLayer.options.onCheck({
                    target: [evt.graphic.attributes],
                    check: evt.graphic.attributes.selected,
                    selectedItems: deviceLayer.getSelectedGraphics()
                });

                deviceLayer.options.onCheckChanged({
                    target: [evt.graphic.attributes],
                    check: evt.graphic.attributes.selected,
                    selectedItems: deviceLayer.getSelectedGraphics()
                });
            }
        }

        protected fireEvent(eventName: string, event: any) {
            this.options.onEvent(eventName, event);
        }

        protected onValidModel(item: any) {
            switch (this.layerType) {
                case LayerType.point:
                    return item.id && item.longitude && item.latitude;
                case LayerType.polyline:
                    return item.id && item.polyline;
                case LayerType.polygon:
                    return item.id && item.polygon;
                default:
                    return item.id && item.longitude && item.latitude;
            }
        }
        // #endregion

        // #region 抽象方法

        /**
         * 变换成标准实体
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        protected abstract onChangeStandardModel(item: any): any;

        /**
         * 创建要素
         * @param item
         */
        protected abstract onCreatGraphicByModel(item: any): any;

        /**
         * 修改要素
         * @param item
         */
        protected abstract onUpdateGraphicByModel(item: any): void;

        // #endregion
    }

}
