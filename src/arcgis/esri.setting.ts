namespace flagwind {

    export class EsriSetting implements IMapSetting {
        public arcgisApi: string;
        public baseUrl: string;
        public tiledUrls: Array<{ id: string; url: string; title: string }>;
        public wkid: number;
        public routeUrl: string;
        public extent: Array<number>;
        public basemap: string;

        public units: number = 0.03;
        public center: Array<number> = [116.46, 39.92];
        public wkidFromApp: number = 4326;
        public minZoom: number;
        public maxZoom: number;
        public zoom: number;
        public logo: boolean = false;
        public slider: boolean = true;
        public sliderPosition: string = "bottom-left";

    }
}
