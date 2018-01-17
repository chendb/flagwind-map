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
        },
        onCreateContextMenu(args: { contextMenu: Array<any>; contextMenuClickEvent: any }): void {
            console.log("onCreateContextMenu");
        }
    };

    export abstract class FlagwindMap {

        private featureLayers: Array<FlagwindFeatureLayer> = [];
        protected baseLayers: Array<FlagwindTiledLayer> = [];
        public options: any;
        public spatial: any;
        public innerMap: any;
        public loaded: boolean = false;

        public constructor(
            public mapSetting: IMapSetting,
            public mapEl: any,
            options: any) {
            this.options = { ...MAP_OPTIONS, ...options };
        }

        public onInit(): void {
            this.onCreateMap();
            this.onCreateBaseLayers();
            const _this = this;
            _this.onAddEventListener("onLoad", function () {
                try {
                    _this.loaded = true;
                    _this.goToCenter();
                    _this.onMapLoad();
                } catch (ex) {
                    console.error(ex);
                }
            });

            _this.onAddEventListener("zoom-end", function (evt: any) {
                _this.onMapZoomEnd(evt);
            });
        }

        public abstract onAddEventListener(eventName: string, callBack: Function): void;

        public abstract onCenterAt(point: any): void;

        public abstract onCreatePoint(point: any): any;

        public onFormPoint(point: any) {
            let lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (this.spatial.wkid !== this.mapSetting.wkidFromApp) {
                if (this.spatial.wkid === 3857 && this.mapSetting.wkidFromApp === 4326) {
                    if (this.mapSetting.is25D) {
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.point25To2(lnglat.lon, lnglat.lat);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.gcj_decrypt(lnglat.lat, lnglat.lon);
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);

                    } else {
                        lnglat = MapUtils.mercator2lonlat(lnglat.lat, lnglat.lon);
                    }
                } else if (this.spatial.wkid === 102100 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                } else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
            }

            // 以x,y属性创建点
            return {
                longitude: parseFloat(lnglat.lon.toFixed(8)),
                latitude: parseFloat(lnglat.lat.toFixed(8))
            };
        }
        public onToPoint(item: any) {
            let lnglat = { "lat": item.latitude || item.lat, "lon": item.longitude || item.lon };
            if (!MapUtils.validGeometryModel(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (this.spatial.wkid !== this.mapSetting.wkidFromApp) {
                if (this.spatial.wkid === 3857 && this.mapSetting.wkidFromApp === 4326) {
                    if (this.mapSetting.is25D) {
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.point2To25(lnglat.lon, lnglat.lat);
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                    } else {
                        lnglat = MapUtils.lonlat2mercator(lnglat.lat, lnglat.lon);
                    }
                } else if (this.spatial.wkid === 102100 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return this.onCreatePoint({
                x: lnglat.lon, y: lnglat.lat, spatial: this.spatial
            });
        }

        public abstract onCreateMap(): any;

        public abstract onShowInfoWindow(options: any): void;

        public abstract onCreateBaseLayers(): any;

        public abstract onShowTitle(graphic: any): void;

        public abstract onHideTitle(graphic: any): void;

        public abstract onCreateContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }): void;

        public goToCenter() {

            if (this.mapSetting.center && this.mapSetting.center.length === 2) {
                let pt = this.getPoint({
                    x: this.mapSetting.center[0],
                    y: this.mapSetting.center[1]
                });
                this.onCenterAt(pt);
            }
        }

        public getBaseLayerById(id: string): FlagwindTiledLayer | null {
            const layers = this.baseLayers.filter(g => g.id === id);
            if (layers && layers.length > 0) {
                return layers[0];
            }
            return null;
        }

        /**
         * 中心定位
         */
        public centerAt(x: number, y: number) {
            let pt = this.onCreatePoint({
                x: x,
                y: y,
                spatial: this.spatial
            });
            this.onCenterAt(pt);
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
            return this.onToPoint(lnglat);
        }

        public addFeatureLayer(deviceLayer: FlagwindFeatureLayer) {
            if (this.getFeatureLayerById(deviceLayer.id)) {
                throw Error("图层" + deviceLayer.id + "已存在");
            }
            this.featureLayers.push(deviceLayer);
            deviceLayer.appendTo(this.innerMap);
        }

        public openInfoWindow(option: any) {
            this.onShowInfoWindow(option);
        }

        protected onMapLoad() {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }

            const me: FlagwindMap = this;
            this.onAddEventListener("click", function (evt: any) {
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

        public get map() {
            return this.innerMap;
        }

        protected onMapZoomEnd(evt: any) {
            this.options.onMapZoomEnd(evt.level);
        }

    }
}
