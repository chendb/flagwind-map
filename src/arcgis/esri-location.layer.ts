namespace flagwind {
    export class EsriLocationLayer extends FlagwindFeatureLayer implements IFlagwindLocationLayer {

        public point: any;

        public constructor(public flagwindMap: FlagwindMap, public options: any) {
            super(options.id, options.title);
            this.options = { ...LOCATION_LAYER_OPTIONS, ...this.options };
            this.layer = this.onCreateGraphicsLayer({ id: this.id });
            this.flagwindMap.addFeatureLayer(this);
            this.registerEvent();
        }

        public registerEvent(): void {
            this.flagwindMap.on("onClick", (args: EventArgs) => {
                this.point = args.data.mapPoint;
                this.locate();
            }, this);
        }

        public onCreateGraphicsLayer(options: any) {
            const layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", (evt: any) => this.dispatchEvent("onMouseOver", evt));
            layer.on("mouse-out", (evt: any) => this.dispatchEvent("onMouseOut", evt));
            layer.on("mouse-up", (evt: any) => this.dispatchEvent("onMouseUp", evt));
            layer.on("mouse-down", (evt: any) => this.dispatchEvent("onMouseDown", evt));
            layer.on("click", (evt: any) => this.dispatchEvent("onClick", evt));
            layer.on("dbl-click", (evt: any) => this.dispatchEvent("onDblClick", evt));
            layer.addToMap = function (map: any) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map: any) {
                map.removeLayer(this);
            };
            return layer;
        }

        public locate(): void {
            this.clear();
            const marker = this.createGraphic(this.point);
            this.layer.add(marker);
            this.options.onMapClick({ point: this.point });
        }

        protected getFillSymbol(width: number, color: any): any {
            color = color || [38, 101, 196];
            width = width || 2;
            let polygonColor = [60, 137, 253, 0.6];
            let polygonSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new esri.Color(polygonColor),
                    width
                ),
                new esri.Color(polygonColor)
            );
            return polygonSymbol;
        }

        protected createSymbol(path: any, color: any): any {
            let markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            markerSymbol.setPath(path);
            markerSymbol.setSize(40);
            markerSymbol.setColor(new dojo.Color(color));
            markerSymbol.setOutline(null);
            return markerSymbol;
        }

        protected createGraphic(pt: any): any {
            const iconPath = "M511.999488 299.209616m-112.814392 0a110.245 110.245 0 1 0 225.628784 0 110.245 110.245 0 1 0-225.628784 0ZM47.208697 523.662621A0 11.396 0 1 1 47.208697 524.685927ZM511.949346 7.981788c-173.610036 0-314.358641 140.748604-314.358641 314.358641s314.358641 523.932774 314.358641 523.932774 314.358641-350.322737 314.358641-523.932774S685.558359 7.981788 511.949346 7.981788L511.949346 7.981788zM511.949346 453.323623c-86.805018 0-157.177785-70.371744-157.177785-157.176762 0-86.830601 70.372767-157.182902 157.177785-157.182902 86.825484 0 157.201322 70.352301 157.201322 157.182902C669.150668 382.952902 598.774831 453.323623 511.949346 453.323623L511.949346 453.323623zM511.949346 453.323623M583.236949 788.686646l-19.674085 34.075073c201.221908 3.617387 357.506347 30.455639 357.506347 63.026452 0 35.039028-180.857091 63.442938-403.955238 63.442938-309.208341 0-403.962401-28.404933-403.962401-63.442938 0-32.067346 151.486156-58.57507 348.201423-62.841234l-19.780509-34.259268c-214.366276 7.369851-378.251833 47.647183-378.251833 96.232738 0 53.81465 105.338117 97.443309 449.084065 97.443309 248.02077 0 449.082018-43.62559 449.082018-97.443309C961.487759 836.332806 797.602202 796.055474 583.236949 788.686646z";
            const initColor = "#13227a";
            const graphic = new esri.Graphic(pt, this.createSymbol(iconPath, initColor));
            return graphic;
        }

    }
}
