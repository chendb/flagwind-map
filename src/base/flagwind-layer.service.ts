namespace flagwind {

    /**
     * 图层操作服务
     */
    export interface IFlaywindLayerService {

        // #region 图层

        createTiledLayer(options: { url: string | null; id: string; title: string | null }): any;

        createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer>;

        createGraphicsLayer(options: any): any;

        clearLayer(layer: any): void;

        removeLayer(layer: any, map: any): void;

        addLayer(layer: any, map: any): void;

        showLayer(layer: any): void;

        hideLayer(layer: any): void;
        
        getGraphicListByLayer(lay: any): Array<any>;
        
        //#endregion
    }
}
