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

        public createGraphicsLayer(options: any) {
            return this.mapService.createGraphicsLayer(options);
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

    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     * 
     * @export
     * @class FlagwindGroupLayer
     */
    export class FlagwindGroupLayer {

        public layer: any;
        public isShow: boolean = true;

        public constructor(public mapService: IMapService, public id: string) {
            this.layer = this.mapService.createGraphicsLayer({ id: id });
        }

        public get graphics() {
            return this.mapService.getGraphicListByLayer(this.layer);
        }

        public appendTo(map: any) {
            this.mapService.addLayer(this.layer, map);
        }

        public removeLayer(map: any) {
            this.mapService.removeLayer(this.layer, map);
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

        public setGeometry(name: string, geometry: any) {
            this.getGraphicByName(name).forEach(g => {
                this.mapService.setGeometryByGraphic(g, geometry);
            });
        }

        public setSymbol(name: string, symbol: any) {
            this.getGraphicByName(name).forEach(g => {
                this.mapService.setSymbolByGraphic(g, symbol);
            });
        }

        public showGraphice(name: string) {
            this.getGraphicByName(name).forEach(g => {
                this.mapService.showGraphic(g);
            });
        }

        public hideGraphice(name: string) {
            this.getGraphicByName(name).forEach(g => {
                this.mapService.hideGraphic(g);
            });
        }

        public addGraphice(name: string, graphics: Array<any>) {
            if (graphics === undefined) return;
            graphics.forEach((g, index) => {
                if (g) {
                    let item = this.mapService.getGraphicAttributes(g);
                    item.__master = index === 0;
                    item.__name = name;
                    this.mapService.addGraphic(g, this.layer);
                }
            });
        }

        public getMasterGraphicByName(name: string): any {
            this.graphics.forEach(element => {
                let item = this.mapService.getGraphicAttributes(element);
                if (name === item.__name && item.__master) {
                    return element;
                }
            });
            return null;
        }

        /**
         * 获取资源要素点
         */
        public getGraphicByName(name: String): Array<any> {
            const list = [];
            for (let i = 0; i < this.graphics.length; i++) {
                let attrs = this.mapService.getGraphicAttributes(this.graphics[i]);
                if (attrs.__name === name) {
                    list.push(this.graphics[i]);
                }
            }
            return list;
        }

        /**
         * 删除资源要素点
         */
        public removeGraphicByName(name: string) {
            const graphics = this.getGraphicByName(name);
            if (graphics != null) {
                const _layer = this.layer;
                graphics.forEach(g => {
                    this.mapService.removeGraphic(g, _layer);
                });
            }
        }
    }
}
