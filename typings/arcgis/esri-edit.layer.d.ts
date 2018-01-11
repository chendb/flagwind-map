declare namespace flagwind {
    class EsriEditLayer extends FlagwindFeatureLayer implements IEditLayer {
        editObj: any;
        options: any;
        deviceLayer: DeviceLayer;
        flagwindMap: FlagwindMap;
        mapService: IMapService;
        constructor(flagwindMap: FlagwindMap, deviceLayer: DeviceLayer, options: any);
        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        activateEdit(key: string): void;
        /**
         * 取消编辑要素
         */
        cancelEdit(key: string): void;
        bindModifyEvent(modifySeletor: string): void;
        bindDeleteEvent(deleteSeletor: string): void;
        onLoad(): void;
        readonly map: any;
        readonly spatial: any;
        onChanged(options: any, isSave: boolean): Promise<boolean>;
        protected registerEvent(): void;
        protected onLayerClick(editLayer: this, evt: any): void;
    }
}
