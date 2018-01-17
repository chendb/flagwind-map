namespace flagwind {

    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    export abstract class FlagwindFeatureLayer {

        protected layer: any;
        public isShow: boolean = true;

        public constructor(public id: string, public title: string | null) {
            this.id = id;
            this.layer = this.onCreateGraphicsLayer({ id: id });
        }

        public get graphics(): Array<any> {
            return this.layer.graphics;
        }

        public get items(): Array<any> {
            return this.graphics.map(g => g.attributes);
        }

        public appendTo(map: any) {
            this.layer.addToMap(map);
        }

        public removeLayer(map: any) {
            this.layer.removeFormMap(map);
        }

        public get count() {
            if (this.layer) {
                return this.graphics.length;
            }
            return 0;
        }

        public clear() {
            this.layer.clear();
        }

        public show() {
            this.isShow = true;
            this.layer.show();
        }

        public hide() {
            this.isShow = false;
            this.layer.hide();
        }

        /**
         * 获取资源要素点
         */
        public getGraphicById(key: string): any {
            const graphics = this.graphics;
            for (let i = 0; i < graphics.length; i++) {
                const attrs = graphics[i].attributes;
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
                this.layer.remove(graphic);
            }
        }

        public abstract onCreateGraphicsLayer(args: any): any;

    }
}
