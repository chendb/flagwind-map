/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";

/* tslint:disable:member-ordering */
namespace flagwind {

    export const BUSINESS_LAYER_OPTIONS: BusinessLayerOptions = {
        onLayerClick: (evt: any): void => {
            console.log("onLayerClick");
        },
        onMapLoad: (): void => {
            console.log("onMapLoad");
        },
        onEvent: (eventName: string, evt: any) => {
            console.log("onEvent");
        },
        onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) => {
            console.log("onCheckChanged");
        },
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
        /**
         * 获取图层
         */
        getDataList: (): Promise<Array<any>> => {
            return new Promise<Array<any>>((resolve,reject) => {
                resolve([]);
            });
        },
        /**
         * 获取最新图层数据状态
         */
        getLastStatus: (): Promise<Array<any>> => {
            return new Promise<Array<any>>((resolve,reject) => {
                resolve([]);
            });
        },
        showInfoWindowCompleted: null,
        timeout: 3000,
        autoInit: true,
        enableEdit: true,           // 启用要素编辑功能
        selectMode: 0,              // 0不启用选择 1为多选，2为单选
        showTooltip: false,
        showInfoWindow: false,
        symbol: null,
        dataType: "point"
    };

    /**
     * 业务图层
     */
    export abstract class FlagwindBusinessLayer extends FlagwindFeatureLayer {
        public layerType: string = LayerType.point; // point polyline polygon
        public isLoading: boolean = false;
        public options: BusinessLayerOptions;

        public constructor(public flagwindMap: FlagwindMap, public id: string,  options: any) {
            super(id, options.title || "设备图层");
            this.options = { ...BUSINESS_LAYER_OPTIONS, ...options };
            this.layer = this.onCreateGraphicsLayer({ id: this.id });
            this.layerType = options.layerType;
            this.flagwindMap = flagwindMap;
            if (this.options.autoInit) {
                this.onInit();
            }
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
         * 根据对象集合新增要素集合
         * @param dataList 对象集合
         */
        public addGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                const graphic = this.getGraphicById(dataList[i].id);
                if (graphic) {
                    console.warn("已存在id：" + dataList[i].id + "要素点");
                    continue;
                }
                this.addGraphicByModel(dataList[i]);
            }
        }

        /**
         * 保存要素（有则修改，无则增加）
         * @param item 原始要素模型
         */
        protected saveGraphicByModel(item: any): void {
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
        protected addGraphicByModel(item: any): void {
            const graphic = this.creatGraphicByModel(item);
            if (graphic) {
                this.add(graphic);
            }
        }

        /**
         * 创建要素（未添加至图层中）,请方法在flagwind包下可见
         */
        public creatGraphicByModel(item: any): FlagwindGraphic {
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
        protected updateGraphicByModel(item: any, graphic: any | null = null): void {
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
            this.onUpdateGraphicByModel(item);
        }

        // #endregion

        // #region 状态管理

        /**
         * 清除选择状态
         */
        public clearSelectStatus(): void {
            let graphics: Array<any> = this.graphics;
            for (let i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected || typeof graphics[i].attributes.selected !== "boolean") {
                    this.setSelectStatus(graphics[i].attributes, false);
                }
            }

            this.options.onCheckChanged({
                target: graphics ? graphics.map(v => v.attributes) : [],
                check: false,
                selectedItems: this.getSelectedGraphics().map(
                    g => g.attributes
                )
            });
        }

        /**
         * 设置选择状态
         * @param dataList 要素模型集合
         * @param refresh 是否刷新（为true是时，把所有的要素还原再设置;否则，之前的状态保留，然后再追加）
         */
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

            this.options.onCheckChanged({
                target: dataList,
                check: true,
                selectedItems: this.getSelectedGraphics().map(
                    g => g.attributes
                )
            });
        }

        /**
         * 获取所有选中的要素
         */
        public getSelectedGraphics(): Array<FlagwindGraphic> {
            return this.graphics.filter(g => g.attributes && g.attributes.selected);
        }

        /**
         * 设置选中状态
         * @param item 要素原型
         * @param selected 是否选中
         */
        protected setSelectStatus(item: any, selected: boolean): void {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        }

        // #endregion

        // #region 坐标转换

        /**
         * 创建点要素（把业务数据的坐标转换成地图上的点）
         */
        public getPoint(item: any): FlagwindPoint {
            return this.flagwindMap.getPoint(item);
        }

        /**
         * 把地图上的点转换成业务的坐标
         * @param {*} point
         */
        public formPoint(point: any): { latitude: number; longitude: number } {
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
                this.showInfoWindow({ graphic: graphic });
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
        public showInfoWindow(evt: { graphic: FlagwindGraphic }): void {
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
            if (this.options.showInfoWindowCompleted) {
                this.options.showInfoWindowCompleted(evt.graphic.attributes);
            }
        }

        // #endregion

        // #region 数据加载
        
        /**
         * 加载并显示设备点位
         *
         */
        public showDataList() {

            this.isLoading = true;
            this.fireEvent("showDataList", { action: "start" });
            return this.options.getDataList()
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
            (<any>this).timer = setInterval(() => {
                this.updateStatus();
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
        public updateStatus(): void {
            this.isLoading = true;
            this.fireEvent("updateStatus", { action: "start" });
            this.options.getLastStatus().then(dataList => {
                this.isLoading = false;
                this.saveGraphicList(dataList);
                this.fireEvent("updateStatus", { action: "end", attributes: dataList });
            }).catch(error => {
                this.isLoading = false;
                console.log("加载卡口状态时发生了错误：", error);
                this.fireEvent("updateStatus", { action: "error", attributes: error });
            });
        }

        // #endregion

        // #region 内部方法

        protected onGetInfoWindowContext(item: any): any {
            return this.options.getInfoWindowContext(item);
        }

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
            // 如果开启鼠标hover开关
            this.on("onMouseOver", (evt: EventArgs) => {
                if (this.options.showTooltip) {
                    this.flagwindMap.onShowTooltip(evt.data.graphic);
                }
                this.fireEvent("onMouseOver", evt.data);
            });
            this.on("onMouseOut", (evt: EventArgs) => {
                if (this.options.showTooltip) {
                    this.flagwindMap.onHideTooltip();
                }
                this.fireEvent("onMouseOut", evt.data);
            });

        }

        protected onLayerClick(deviceLayer: this, evt: any) {
            if (deviceLayer.options.onLayerClick) {
                deviceLayer.options.onLayerClick(evt);
            }
            if (deviceLayer.options.showInfoWindow) {
                evt.graphic.attributes.eventName = "";
                deviceLayer.showInfoWindow(evt);
            }

            if (deviceLayer.options.selectMode) {
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

        /**
         * 变换成标准实体
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        protected onChangeStandardModel(item: any): any {
            return this.options.changeStandardModel(item);
        }
        // #endregion

        // #region 抽象方法

        /**
         * 创建要素
         * @param item
         */
        protected abstract onCreatGraphicByModel(item: any): FlagwindGraphic;

        /**
         * 修改要素
         * @param item
         */
        protected abstract onUpdateGraphicByModel(item: any): void;

        // #endregion
    }

}
