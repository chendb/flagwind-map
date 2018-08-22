declare var minemap: any;
declare var turf: any;

namespace flagwind {

    export class MinemapSetting implements IMapSetting {
        public mapDomain: string = "minedata.cn";
        public mapVersion: string = "v1.3";
        public accessToken: string = "25cc55a69ea7422182d00d6b7c0ffa93";
        public wkid: number;
        public extent: Array<number>;
        public units: number = 0.03;
        public center: Array<number> = [116.46, 39.92];
        public wkidFromApp: number = 4326;
        public minZoom: number = 9;
        public maxZoom: number = 17;
        public zoom: number = 16;
        public logo: boolean = false;
        public slider: boolean = true;
        public sliderPosition: string = "bottom-left";

    }
}
