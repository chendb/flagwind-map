declare namespace flagwind {
    class EsriLocationLayer extends FlagwindFeatureLayer implements ILocationLayer {
        flagwindMap: FlagwindMap;
        options: any;
        private timer;
        graphic: any;
        mapService: IMapService;
        constructor(flagwindMap: FlagwindMap, options: any);
        readonly map: any;
        readonly spatial: any;
        protected onLoad(): void;
        protected createAnimation(): void;
        protected onMapClick(evt: any): void;
        protected createSymbol(color: any): any;
        protected creatGraphic(pt: any): any;
    }
}
