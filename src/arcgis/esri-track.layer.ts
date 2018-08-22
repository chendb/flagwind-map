/// <reference path="../base/flagwind-track.layer.ts" />
namespace flagwind {

    /**
     * 车辆路由服务
     */
    export class EsriTrackLayer extends FlagwindTrackLayer {

        public constructor(public businessLayer: FlagwindBusinessLayer, options: any) {
            super(businessLayer, new EsriRouteLayer(businessLayer.flagwindMap, businessLayer.id + "_track", options.route || options), options);
        }

    }
}
