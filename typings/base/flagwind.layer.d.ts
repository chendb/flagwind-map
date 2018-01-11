declare namespace flagwind {
    /**
     * 底图包装类
     *
     * @export
     * @class FlagwindTiledLayer
     */
    class FlagwindTiledLayer {
        mapService: IMapService;
        id: string;
        url: string | null;
        title: string | null;
        layer: any;
        isShow: boolean;
        constructor(mapService: IMapService, id: string, url: string | null, title: string | null);
        appendTo(map: any): void;
        removeLayer(map: any): void;
        show(): void;
        hide(): void;
    }
    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    class FlagwindFeatureLayer {
        mapService: IMapService;
        id: string;
        title: string | null;
        protected layer: any;
        isShow: boolean;
        constructor(mapService: IMapService, id: string, title: string | null);
        readonly graphics: Array<any>;
        readonly items: Array<any>;
        appendTo(map: any): void;
        removeLayer(map: any): void;
        readonly count: number;
        clear(): void;
        show(): void;
        hide(): void;
        /**
         * 获取资源要素点
         */
        getGraphicById(key: string): any;
        /**
         * 删除资源要素点
         */
        removeGraphicById(key: string): void;
    }
    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     *
     * @export
     * @class FlagwindGroupLayer
     */
    class FlagwindGroupLayer {
        mapService: IMapService;
        id: string;
        layer: any;
        isShow: boolean;
        constructor(mapService: IMapService, id: string);
        readonly graphics: any[];
        appendTo(map: any): void;
        removeLayer(map: any): void;
        clear(): void;
        show(): void;
        hide(): void;
        setGeometry(name: string, geometry: any): void;
        setSymbol(name: string, symbol: any): void;
        showGraphice(name: string): void;
        hideGraphice(name: string): void;
        addGraphice(name: string, graphics: Array<any>): void;
        getMasterGraphicByName(name: string): any;
        /**
         * 获取资源要素点
         */
        getGraphicByName(name: String): Array<any>;
        /**
         * 删除资源要素点
         */
        removeGraphicByName(name: string): void;
    }
}
