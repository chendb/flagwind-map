namespace flagwind {

    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    export class FlagwindFeatureLayer {

        protected layer: any;
        public isShow: boolean = true;

        public constructor(public mapService: IMapService, public id: string, public title: string | null) {
            this.id = id;
            this.layer = this.createGraphicsLayer({ id: id });
        }

        public createGraphicsLayer(args: any): any {
            return this.mapService.createGraphicsLayer(args);
        }

        public get graphics(): Array<any> {
            return this.mapService.getGraphicListByLayer(this.layer);
        }

        public get items(): Array<any> {
            return this.graphics.map(g => this.mapService.getGraphicAttributes(g));
        }

        public appendTo(map: any) {
            this.mapService.addLayer(this.layer, map);
        }

        public removeLayer(map: any) {
            this.mapService.removeLayer(this.layer, map);
        }

        public get count() {
            if (this.layer) {
                return this.graphics.length;
            }
            return 0;
        }

        public clear() {
            this.mapService.clearLayer(this.layer);
        }

        public show() {
            this.isShow = true;
            this.mapService.showLayer(this.layer);
        }

        public hide() {
            this.isShow = false;
            this.mapService.hideLayer(this.layer);
        }

        /**
         * 获取资源要素点
         */
        public getGraphicById(key: string): any {
            const graphics = this.graphics;
            for (let i = 0; i < graphics.length; i++) {
                const attrs = this.mapService.getGraphicAttributes(graphics[i]);
                if (attrs.id === key) {
                    return graphics[i];
                }
            }
            return null;
        }

        /**
         * 删除资源要素点
         */
        public removeGraphicById(key: string) {
            const graphic = this.getGraphicById(key);
            if (graphic != null) {
                this.mapService.removeGraphic(graphic, this.layer);
            }
        }
    }
}
