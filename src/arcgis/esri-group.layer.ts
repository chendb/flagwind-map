/// <reference path="../base/flagwind-group.layer.ts" />
namespace flagwind {
    export class EsriGroupLayer extends FlagwindGroupLayer {

        public onCreateGraphicsLayer(args: any) {
            let layer = new esri.layers.GraphicsLayer(args);
            layer.addToMap = function (map: any) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map: any) {
                map.removeLayer(this);
            };
            return layer;
        }

    }
}
