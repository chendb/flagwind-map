namespace flagwind {

    export class MinemapGroupLayer extends FlagwindGroupLayer {
        public onCreateGraphicsLayer(options: any) {
            if (options.kind === "marker") {
                return new MinemapMarkerLayer(options);
            }
            if (options.kind === "geojson") {
                return new MinemapGeoJsonLayer(options);
            }
            console.log("未指定图层类型");
            return null;
        }

    }
}
