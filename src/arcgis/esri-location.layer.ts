/// <reference path="../base/flagwind.layer.ts" />
namespace flagwind {

    export class EsriLocationLayer extends FlagwindFeatureLayer implements ILocationLayer {

        private timer: any;
        public graphic: any;
        public mapService: IMapService;

        public constructor(public flagwindMap: FlagwindMap, public options: any) {

            super(flagwindMap.mapService, "commonLocationLayer", "定位图层");
            this.mapService = flagwindMap.mapService;
            options = { ...locationLayerOptions, ...options };
            this.flagwindMap = flagwindMap;
            this.options = options;
            const me = this;

            if (this.flagwindMap.innerMap.loaded) {
                this.onLoad();
            } else {
                this.flagwindMap.innerMap.on("load", function () {
                    me.onLoad();
                });
            }
            this.flagwindMap.addDeviceLayer(this);
        }

        public get map() {
            return this.flagwindMap.map;
        }

        public get spatial() {
            return this.flagwindMap.spatial;
        }

        protected onLoad() {
            const me = this;
            // if (!this.layer._map) {
            //     this.layer._map = this.flagwindMap.innerMap;
            // }
            try {
                this.mapService.addEventListener(this.map, "click", function (evt: any) {
                    me.onMapClick(evt);
                });
            } catch (error) {
                console.error(error);
            }
        }

        protected createAnimation() {
            if (this.timer) {
                clearInterval(this.timer);
            }

            const me = this;
            const oneSymbol = this.createSymbol("#de3700");
            const twoSymbol = this.createSymbol("#13227a");
            me.timer = setInterval(() => {
                if (me.graphic.__symbol) {
                    me.graphic.__symbol = false;
                    me.mapService.setSymbolByGraphic(me.graphic, oneSymbol);
                } else {
                    me.graphic.__symbol = true;
                    me.mapService.setSymbolByGraphic(me.graphic, twoSymbol);
                }
            }, 300);

        }

        protected onMapClick(evt: any) {
            console.log("地图加载：" + evt);
            let graphic = (this.graphic = this.creatGraphic(evt.mapPoint));
            this.createAnimation();
            this.clear();
            this.layer.add(graphic);
            let item = this.flagwindMap.formPoint(evt.mapPoint);
            this.options.onMapClick(item);
        }

        protected createSymbol(color: any) {
            const iconPath = "M511.999488 299.209616m-112.814392 0a110.245 110.245 0 1 0 225.628784 0 110.245 110.245 0 1 0-225.628784 0ZM47.208697 523.662621A0 11.396 0 1 1 47.208697 524.685927ZM511.949346 7.981788c-173.610036 0-314.358641 140.748604-314.358641 314.358641s314.358641 523.932774 314.358641 523.932774 314.358641-350.322737 314.358641-523.932774S685.558359 7.981788 511.949346 7.981788L511.949346 7.981788zM511.949346 453.323623c-86.805018 0-157.177785-70.371744-157.177785-157.176762 0-86.830601 70.372767-157.182902 157.177785-157.182902 86.825484 0 157.201322 70.352301 157.201322 157.182902C669.150668 382.952902 598.774831 453.323623 511.949346 453.323623L511.949346 453.323623zM511.949346 453.323623M583.236949 788.686646l-19.674085 34.075073c201.221908 3.617387 357.506347 30.455639 357.506347 63.026452 0 35.039028-180.857091 63.442938-403.955238 63.442938-309.208341 0-403.962401-28.404933-403.962401-63.442938 0-32.067346 151.486156-58.57507 348.201423-62.841234l-19.780509-34.259268c-214.366276 7.369851-378.251833 47.647183-378.251833 96.232738 0 53.81465 105.338117 97.443309 449.084065 97.443309 248.02077 0 449.082018-43.62559 449.082018-97.443309C961.487759 836.332806 797.602202 796.055474 583.236949 788.686646z";
            return this.mapService.createMarkerSymbol({
                path: iconPath,
                size: 40,
                color: color,
                outline: null
            });
        }

        protected creatGraphic(pt: any) {
            const initColor = "#13227a";
            const graphic = new esri.Graphic(pt, this.createSymbol(initColor));
            return graphic;
        }

    }
}
