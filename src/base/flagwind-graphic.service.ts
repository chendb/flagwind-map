namespace flagwind {

    /**
     * 地图要素服务
     */
    export interface IFlagwindGraphicService {

        //#region 要素

        removeGraphic(graphic: any, layer: any): void;

        addGraphic(graphic: any, layer: any): void;

        showGraphic(graphic: any): void;

        hideGraphic(graphic: any): void;

        setGeometryByGraphic(graphic: any, geometry: any): void;

        setSymbolByGraphic(graphic: any, symbol: any): void;

        createMarkerSymbol(options: any): any;

        getGraphicAttributes(graphic: any): any;

        //#endregion
    }
}
