namespace flagwind {
    export const locationLayerOptions = {

        onMapClick: function (evt: any) {
            console.log("onMapClick");
        }
    };

    export interface ILocationLayer {
        clear(): void;
    }
}
