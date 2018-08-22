namespace flagwind {
    // tslint:disable-next-line:interface-name
    export interface HeatmapPoint {
        longitude: number;
        latitude: number;
        count: number;
        members: Array<any>;
    }
    
    export const HEATMAP_LAYER_OPTIONS = {
        changeStandardModel: (data: any) => {
            return {
                longitude: data.longitude || data.x,
                latitude: data.latitude || data.y
            };
        }
    };
    
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
