declare var echarts: any;

namespace flagwind {

    export class EsriSetting implements IMapSetting {
        public baseUrl: string;
        public imageUrl: string;
        public zhujiImageUrl: string;
        // public mapDomain: string = "minedata.cn";
        // public mapVersion: string = "v1.3";
        // public accessToken: string = "25cc55a69ea7422182d00d6b7c0ffa93";
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
        // public sliderStyle: string = "small";
        public sliderPosition: string = "bottom-left";

    }
}
