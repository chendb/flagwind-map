namespace flagwind {
    export const LOCATION_LAYER_OPTIONS = {

        onMapClick: function (evt: any) {
            console.log("onMapClick");
        }
    };

    export interface IFlagwindLocationLayer extends IFlagwindSingleLayer{
        point: any;
        clear(): void;
        locate(): void;
    }
}
