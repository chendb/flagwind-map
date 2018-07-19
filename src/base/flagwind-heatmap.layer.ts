namespace flagwind {
    /**
     * 热力图
     */
    export interface IFlagwindHeatmapLayer extends IFlagwindSingleLayer{
        clear(): void;
        show(): void;
        hide(): void;
        resize(): void;
        showDataList(items: Array<any>, changeExtent: boolean): void;
    }
}
