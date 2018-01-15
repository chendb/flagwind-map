namespace flagwind {
    // tslint:disable-next-line:variable-name
    export const MAP_OPTIONS = {

        onMapLoad() {
            console.log("onMapLoad");
        },
        onMapZoomEnd(level: number) {
            console.log("onMapZoomEnd");
        },
        onMapClick(evt: any) {
            console.log("onMapClick");
        }
    };

    export class FlagwindMap {

        private options: any;
        private baseLayers: Array<FlagwindTiledLayer> = [];
        private featureLayers: Array<FlagwindFeatureLayer> = [];

        public mapEl: any;
        public spatial: any;
        public innerMap: any;

        public constructor(
            public mapService: IMapService,
            public mapSetting: IMapSetting,
            mapEl: any,
            options: any) {
            this.mapEl = mapEl;
            this.options = { ...MAP_OPTIONS, ...options };
            this.createMap();
            this.createBaseLayer();
            const _this = this;
            mapService.addEventListener(_this.innerMap, "onLoad", function () {
                try {
                    _this.goToCenter();
                    _this.onMapLoad();
                } catch (ex) {
                    console.error(ex);
                }
            });

            mapService.addEventListener(_this.innerMap, "zoom-end", function (evt: any) {
                _this.onMapZoomEnd(evt);
            });

        }

        public goToCenter() {

            if (this.mapSetting.center && this.mapSetting.center.length === 2) {
                let pt = this.getPoint({
                    x: this.mapSetting.center[0],
                    y: this.mapSetting.center[1]
                });
                this.mapService.centerAt(pt, this.innerMap);
            }
        }

        public getBaseLayerById(id: string): FlagwindTiledLayer | null {
            const layers = this.baseLayers.filter(g => g.id === id);
            if (layers && layers.length > 0) {
                return layers[0];
            }
            return null;
        }

        public formPoint(point: any) {
            let lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            return this.mapService.formPoint(lnglat, this);

        }

        /**
         * 中心定位
         */
        public centerAt(x: number, y: number) {
            let pt = this.mapService.createPoint({
                x: x,
                y: y,
                spatial: this.spatial
            });
            this.mapService.centerAt(pt, this.innerMap);
        }

        /**
         *
         * 创建菜单
         *
         * @param {{ contextMenu: any[], contextMenuClickEvent: any }} options
         * @memberof FlagwindMap
         */
        public createContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }) {
            this.mapService.createContextMenu(options, this);
        }

        /**
         * 创建点要素
         */
        public getPoint(item: any) {
            let lnglat = { "lat": item.latitude || item.lat, "lon": item.longitude || item.lon };
            if (!MapUtils.validGeometryModel(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }
            return this.mapService.toPoint(lnglat, this);
        }

        public createBaseLayer() {
            let layers = this.mapService.createBaseLayer(this);
            layers.forEach(g => {
                g.appendTo(this.innerMap);
            });
        }

        public addFeatureLayer(deviceLayer: FlagwindFeatureLayer) {
            if (this.getFeatureLayerById(deviceLayer.id)) {
                throw Error("图层" + deviceLayer.id + "已存在");
            }
            this.featureLayers.push(deviceLayer);
            deviceLayer.appendTo(this.innerMap);
        }

        /**
         * 鼠标移动到点要素时显示title
         */
        public showTitle(graphic: any) {
            this.mapService.showTitle(graphic, this);
        }

        public hideTitle() {
            this.mapService.hideTitle(this);
        }

        protected onMapLoad() {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }

            const me: FlagwindMap = this;
            this.mapService.addEventListener(this.innerMap, "click", function (evt: any) {
                me.options.onMapClick(evt);
            });
        }

        protected showBaseLayer(id: string) {
            const layer = this.getBaseLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        }

        protected getFeatureLayerById(id: string): FlagwindFeatureLayer | null {
            const layers = this.featureLayers.filter(g => g.id === id);
            return layers != null && layers.length > 0 ? layers[0] : null;
        }

        // protected addFeatureLayer(id: string, title: string) {
        //     if (this.getFeatureLayerById(id)) {
        //         throw Error("图层" + id + "已存在");
        //     }
        //     const layer = new FlagwindFeatureLayer(this.mapService, id, title);
        //     this.featureLayers.push(layer);
        //     layer.appendTo(this.innerMap);
        // }

        protected showFeatureLayer(id: string) {
            const layer = this.getFeatureLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        }

        protected removeFeatureLayer(id: string) {
            const flayer = this.getFeatureLayerById(id);
            if (flayer) {
                flayer.removeLayer(this.innerMap);
                const i = this.featureLayers.indexOf(flayer);
                this.featureLayers.splice(i, 1);
                return true;
            }
            return false;
        }

        // public get infoWindow() {
        //     return this.mapService.getInfoWindow(this.innerMap);
        // }

        public get map() {
            return this.innerMap;
        }

        protected onMapZoomEnd(evt: any) {
            this.options.onMapZoomEnd(evt.level);
        }

        protected createMap() {
            this.spatial = this.mapService.createSpatial(this.mapSetting.wkid);
            const map = this.mapService.createMap(this.mapSetting, this);
            this.innerMap = map;
        }

    }
}
