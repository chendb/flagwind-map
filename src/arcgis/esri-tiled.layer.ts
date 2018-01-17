/// <reference path="../base/flagwind-tiled.layer.ts" />
namespace flagwind {
    export class EsriTiledLayer extends FlagwindTiledLayer {
        public onCreateTiledLayer(args: any) {
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
