declare namespace flagwind {
    const flagwindMapOptions: {
        onMapLoad(): void;
        onMapZoomEnd(level: number): void;
        onMapClick(evt: any): void;
    };
    class FlagwindMap {
        mapService: IMapService;
        mapSetting: IMapSetting;
        private titleDiv;
        private options;
        private baseLayers;
        private featureLayers;
        mapEl: any;
        spatial: any;
        innerMap: any;
        constructor(mapService: IMapService, mapSetting: IMapSetting, mapEl: any, options: any);
        goToCenter(): void;
        getBaseLayerById(id: string): FlagwindTiledLayer | null;
        formPoint(point: any): {
            longitude: number;
            latitude: number;
        };
        /**
         * 中心定位
         */
        centerAt(x: number, y: number): void;
        /**
         *
         * 创建菜单
         *
         * @param {{ contextMenu: any[], contextMenuClickEvent: any }} options
         * @memberof FlagwindMap
         */
        createContextMenu(options: {
            contextMenu: Array<any>;
            contextMenuClickEvent: any;
        }): void;
        /**
         * 创建点要素
         */
        getPoint(item: any): any;
        createBaseLayer(): void;
        addDeviceLayer(deviceLayer: FlagwindFeatureLayer): void;
        /**
         * 鼠标移动到点要素时显示title
         */
        showTitle(graphic: any): void;
        hideTitle(): void;
        protected onMapLoad(): void;
        protected showBaseLayer(id: string): boolean;
        protected getFeatureLayerById(id: string): FlagwindFeatureLayer | null;
        protected addFeatureLayer(id: string, title: string): void;
        protected showFeatureLayer(id: string): boolean;
        protected removeFeatureLayer(id: string): boolean;
        readonly map: any;
        protected onMapZoomEnd(evt: any): void;
        protected createMap(): void;
    }
}
