/// <reference path="../events/EventProvider" />
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

    export abstract class FlagwindMap extends EventProvider {

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
                
            super();
            this.options = { ...MAP_OPTIONS, ...options };
        }

        public onInit(): void {
            this.onCreateMap();
            this.onCreateBaseLayers();
            const me = this;
            me.on("onLoad", function () {
                try {
                    me.loaded = true;
                    me.goToCenter();
                    me.onMapLoad();
                } catch (ex) {
                    console.error(ex);
                }
            });

            me.on("onZoomEnd", function (evt: EventArgs) {
                me.onMapZoomEnd(evt.data);
            });
        }

        // public abstract onAddEventListener(eventName: string, callBack: Function): void;

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
                lnglat.lon = item.x || lnglat.lon;
                lnglat.lat = item.y || lnglat.lat;
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

        public abstract onShowInfoWindow(evt: any): void;

        public abstract onCloseInfoWindow(): void;

        public abstract onCreateBaseLayers(): any;

        public abstract onShowTooltip(graphic: any): void;

        public abstract onHideTooltip(graphic: any): void;

        public abstract onCreateContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }): void;

        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        public on(type: string, listener: Function, scope: any = this, once: boolean = false): void {
            this.addListener(type, listener, scope, once);
        }

        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        public off(type: string, listener: Function, scope: any = this): void {
            this.removeListener(type, listener, scope);
        }

        public closeInfoWindow(): void {
            this.onCloseInfoWindow();
        }

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
            return this.onToPoint(item);
        }

        public addFeatureLayer(deviceLayer: FlagwindFeatureLayer) {
            if (this.getFeatureLayerById(deviceLayer.id)) {
                throw Error("图层" + deviceLayer.id + "已存在");
            }
            this.featureLayers.push(deviceLayer);
            deviceLayer.appendTo(this.innerMap);
        }

        protected onMapLoad() {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }

            const me: FlagwindMap = this;
            this.on("click", function (evt: EventArgs) {
                me.options.onMapClick(evt);// evt.data
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
