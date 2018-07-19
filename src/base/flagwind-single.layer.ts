namespace flagwind {
    /**
     * 单类型图层
     *
     * @export
     * @class IFlagwindSingleLayer
     */
    export interface IFlagwindSingleLayer extends IFlagwindLayer{

        appendTo(map: any): void;

        removeLayer(map: any): void;

    }
}
