namespace flagwind {
    export class MinemapTrackLayer extends FlagwindTrackLayer {

        public constructor(public businessLayer: MinemapPointLayer, options: any) {
            super(businessLayer, new MinemapRouteLayer(businessLayer.flagwindMap, businessLayer.id + "_track", options), options);
        }

    }
}
