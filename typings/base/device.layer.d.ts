declare namespace flagwind {
    const deviceLayerOptions: any;
    abstract class DeviceLayer extends FlagwindFeatureLayer {
        flagwindMap: FlagwindMap;
        id: string;
        options: any;
        constructor(flagwindMap: FlagwindMap, id: string, options: any);
        abstract showInfoWindow(evt: any): void;
        abstract onCreatGraphicByDevice(item: any): any;
        abstract onUpdateGraphicByDevice(item: any): void;
        abstract addEventListener(target: any, eventName: string, callback: Function): void;
        readonly map: any;
        readonly spatial: any;
        gotoCenterById(key: string): void;
        saveGraphicList(dataList: Array<any>): void;
        updateGraphicList(dataList: Array<any>): void;
        setSelectStatusByDevices(dataList: Array<any>): void;
        /**
         * 保存要素（如果存在，则修改，否则添加）
         */
        saveGraphicByDevice(item: any): void;
        addGraphicByDevice(item: any): void;
        creatGraphicByDevice(item: any): any;
        /**
         * 修改要素
         */
        updateGraphicByDevice(item: any, graphic?: any | null): void;
        clearSelectStatus(): void;
        getSelectedGraphics(): Array<any>;
        /**
         * 创建点要素（把业务数据的坐标转换成地图上的点）
         */
        getPoint(item: any): any;
        /**
         * 把地图上的点转换成业务的坐标
         * @param {*} point
         */
        formPoint(point: any): any;
        protected onAddLayerBefor(): void;
        protected onAddLayerAfter(): void;
        protected onInit(): void;
        protected onLoad(): void;
        protected onMapLoad(): void;
        protected registerEvent(): void;
        protected onLayerClick(deviceLayer: this, evt: any): void;
        protected fireEvent(eventName: string, event: any): void;
        protected validDevice(item: any): any;
        /**
         * 变换成标准实体（最好子类重写）
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindDeviceLayer
         */
        protected changeStandardModel(item: any): any;
        protected setSelectStatus(item: any, selected: boolean): void;
    }
}
