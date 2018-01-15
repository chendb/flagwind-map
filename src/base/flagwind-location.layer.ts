namespace flagwind {
    export const locationLayerOptions = {

        onMapClick: function (evt: any) {
            console.log("onMapClick");
        }
    };

    export interface IFlagwindLocationLayer {
        clear(): void;
    }
}
