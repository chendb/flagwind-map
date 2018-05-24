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

        public constructor(
            public id: string,
            public url: string | null,
            public spatial: any,
            public title: string | null
        ) {
            if (url) {
                this.layer = this.onCreateTiledLayer({
                    url: url,
                    id: id,
                    title: title,
                    spatial: spatial
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
            if (this.layer) {
                this.layer.removeFromMap(map);
            }
        }

        public show() {
            this.isShow = true;
            if (this.layer) {
                this.layer.show();
            }
        }

        public hide() {
            this.isShow = false;
            if (this.layer) {
                this.layer.hide();
            }
        }
    }
}
