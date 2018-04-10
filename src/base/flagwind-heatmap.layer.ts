namespace flagwind {
    /**
     * 热力图
     */
    export interface IFlagwindHeatmapLayer {
        clear(): void;
        show(): void;
        hide(): void;
        resize(): void;
        showDataList(datas: Array<any>, etent: any): void;
    }
}
