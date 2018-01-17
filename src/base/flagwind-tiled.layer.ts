namespace flagwind {
    /**
     * 底图包装类
     *
     * @export
     * @class FlagwindTiledLayer
     */
    export abstract class FlagwindTiledLayer {

        public layer: any;
        public isShow: boolean = true;

        public constructor(public id: string, public url: string | null, public title: string | null) {

            if (url) {
                this.layer = this.onCreateTiledLayer({
                    url: url,
                    id: id,
                    title: title
                });
            }
        }

        public abstract onCreateTiledLayer(args: any): any;

        public appendTo(map: any) {
            if (this.layer) {
                this.layer.addToMap(map);
            }
        }

        public removeLayer(map: any) {
            this.layer.removeFormMap(map);
        }

        public show() {
            this.isShow = true;
            this.layer.show();
        }

        public hide() {
            this.isShow = false;
            this.layer.hide();
        }
    }
}
