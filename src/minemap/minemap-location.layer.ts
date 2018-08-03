/// <reference path="./minemap.model.ts" />
/// <reference path="./minemap-graphics.layer.ts" />
namespace flagwind {
    export class MinemapLocationLayer extends MinemapGraphicsLayer implements IFlagwindLocationLayer {

        public point: MinemapPoint;

        public constructor(public flagwindMap: FlagwindMap, options: any) {
            super(options);
            this.options = { ...LOCATION_LAYER_OPTIONS, ...this.options };
            this.appendTo(flagwindMap.map);
            this.registerEvent();
        }
        
        public registerEvent() {
            this.flagwindMap.on("onClick",  (args: EventArgs) => {
                this.point = new MinemapPoint(args.data.lngLat.lng, args.data.lngLat.lat);
                this.locate();
            }, this);
        }

        public locate() {
            this.clear();
            const marker = new MinemapPointGraphic({
                id: "flagwind_map_location",
                type: "Point",
                geometry: this.point,
                symbol: {
                    className: "flagwind-map-location"
                }
            });
            marker.element.innerHTML = "<div class='breathing'><div class='pulse'></div></div>";
            this.add(marker);
            this.options.onMapClick({ point: this.point });
        }

    }

}
