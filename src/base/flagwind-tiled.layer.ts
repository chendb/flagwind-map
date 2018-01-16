namespace flagwind {
    /**
     * 底图包装类
     *
     * @export
     * @class FlagwindTiledLayer
     */
    export class FlagwindTiledLayer {

        public layer: any;
        public isShow: boolean = true;

        public constructor(public mapService: IMapService, public id: string, public url: string | null, public title: string | null) {

            if (url) {
                this.layer = mapService.createTiledLayer({
                    url: url,
                    id: id,
                    title: title
                });
            }
        }

        public appendTo(map: any) {
            if (this.layer) {
                this.mapService.addLayer(this.layer, map);
            }
        }

        public removeLayer(map: any) {
            this.mapService.removeLayer(this.layer, map);
        }

        public show() {
            this.isShow = true;
            this.mapService.showLayer(this.layer);
        }

        public hide() {
            this.isShow = false;
            this.mapService.hideLayer(this.layer);
        }
    }
}
