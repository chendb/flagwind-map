declare var echarts: any;

namespace flagwind {

    export class EsriSetting implements IMapSetting {
        public baseUrl: string;
        public imageUrl: string;
        public zhujiImageUrl: string;
        public tiledUrls: Array<{ id: string; url: string; title: string }>;
        public arcgisApi: string;
        public wkid: number;
        public routeUrl: string;
        public extent: Array<number>;
        public basemap: string;
        public webTiledUrl: string;
        public units: number = 0.03;
        public center: Array<number> = [116.46, 39.92];
        public wkidFromApp: number = 4326;
        public is25D: boolean = false;
        public minZoom: number;
        public maxZoom: number;
        public zoom: number;
        public logo: boolean = false;
        public slider: boolean = true;
        public sliderPosition: string = "bottom-left";

    }
}
