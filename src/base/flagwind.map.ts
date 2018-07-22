/// <reference path="../events/EventProvider" />
namespace flagwind {

    export const MAP_OPTIONS = {
        // 地图加载完回调
        onMapLoad() {
            console.log("onMapLoad");
        },
        // zoom 结束回调
        onMapZoomEnd(level: number) {
            console.log("onMapZoomEnd");
        },
        // 地图单击回调
        onMapClick(evt: any) {
            console.log("onMapClick");
        }
    };

    export abstract class FlagwindMap extends EventProvider {
        private featureLayers: Array<FlagwindFeatureLayer> = [];
        protected baseLayers: Array<FlagwindTiledLayer> = [];
        public options: any;
        public spatial: any;
        public innerMap: any;
        public loaded: boolean = false;

        public constructor(public mapSetting: IMapSetting, public mapElement: any, options: any) {
            super();
            this.options = { ...MAP_OPTIONS, ...options };
        }

        // #region 坐标转换

        /**
         * 坐标点转换成对象
         * @param point 点
         */
        public onFormPoint(point: any): { latitude: number; longitude: number } {
            let lnglat = { lat: point.y, lon: point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (this.mapSetting.wkid === 3589) {
                console.log("GCJ-02坐标：" + lnglat.lon + "," + lnglat.lat);
                lnglat = MapUtils.gcj_decrypt_exact(lnglat.lat, lnglat.lon);
            }

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
            return { longitude: parseFloat(lnglat.lon.toFixed(8)), latitude: parseFloat(lnglat.lat.toFixed(8)) };
        }

        /**
         * 对象转换成点
         * @param item 要素原型
         */
        public onToPoint(item: any): FlagwindPoint {
            let lnglat = { lat: item.latitude || item.lat, lon: item.longitude || item.lon };
            if (!this.validGeometryModel(item)) {
                lnglat.lon = item.x || lnglat.lon;
                lnglat.lat = item.y || lnglat.lat;
            }

            if (this.mapSetting.wkid === 3589) {
                console.log("GCJ-02坐标：" + lnglat.lon + "," + lnglat.lat);
                lnglat = MapUtils.gcj_decrypt_exact(lnglat.lat, lnglat.lon);
            }

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
                } else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return this.onCreatePoint({
                x: lnglat.lon,
                y: lnglat.lat,
                spatial: this.spatial
            });
        }

        public validGeometryModel(item: any) {
            return MapUtils.validGeometryModel(item);
        }

        // #endregion

        // #region 事件监听与移除

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

        // #endregion

        // #region 地图常规操作

        public get map() {
            return this.innerMap;
        }

        /**
         * 关闭信息窗口
         */
        public closeInfoWindow(): void {
            this.onCloseInfoWindow();
        }

        /**
         * @即将废弃
         */
        public gotoCenter() {
            this.centerAtDefault();
        }

        /**
         * 定位到配置的地图中心点
         */
        public centerAtDefault() {
            if (this.mapSetting.center && this.mapSetting.center.length === 2) {
                let pt = this.getPoint({
                    x: this.mapSetting.center[0],
                    y: this.mapSetting.center[1]
                });
                this.onCenterAt(pt);
            }
        }

        /**
         * 中心定位
         */
        public centerAt(x: number, y: number): Promise<void> {
            let pt = this.onCreatePoint({
                x: x,
                y: y,
                spatial: this.spatial
            });
            return this.onCenterAt(pt);
        }

        /**
         * 放大或缩小到指挥zoom级别
         * @param zoom
         */
        public setZoom(zoom: number): Promise<void> {
            return this.onZoom(zoom);
        }

        /**
         * 创建几何点
         */
        public getPoint(item: any): FlagwindPoint {
            return this.onToPoint(item);
        }

        // #endregion

        // #region 底图

        /**
         * 根据id查找底图
         * @param id 底图id
         */
        public getBaseLayerById(id: string): FlagwindTiledLayer | null {
            let layers = this.baseLayers.filter(g => g.id === id);
            return layers && layers.length > 0 ? layers[0] : null;
        }

        /**
         * 显示所有底图
         */
        public showBaseLayers(): void {
            if (this.baseLayers) {
                this.baseLayers.forEach(g => g.show());
            }
        }

        /**
         * 隐藏所有底图
         */
        public hideBaseLayers(): void {
            if (this.baseLayers) {
                this.baseLayers.forEach(g => g.hide());
            }
        }

        /**
         * 显示指定id的底图
         * @param id
         */
        public showBaseLayer(id: string): boolean {
            const layer = this.getBaseLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        }

        /**
         * 隐藏指定id的底图
         * @param id
         */
        public hideBaseLayer(id: string): boolean {
            const layer = this.getBaseLayerById(id);
            if (layer) {
                layer.hide();
                return true;
            }
            return false;
        }

        // #endregion

        // #region 功能图层

        /**
         * 获取指定id的功能图层
         * @param id
         */
        public getFeatureLayerById(id: string): FlagwindFeatureLayer | null {
            const layers = this.featureLayers.filter(g => g.id === id);
            return layers != null && layers.length > 0 ? layers[0] : null;
        }

        /**
         * 增加功能图层
         * @param featureLayer
         */
        public addFeatureLayer(featureLayer: FlagwindFeatureLayer): void {
            if (this.getFeatureLayerById(featureLayer.id)) {
                throw Error("图层" + featureLayer.id + "已存在");
            }
            this.featureLayers.push(featureLayer);
            featureLayer.appendTo(this.innerMap);
        }

        /**
         * 移除指定id的功能图层
         * @param id 图层id
         */
        public removeFeatureLayer(id: string): boolean {
            const flayer = this.getFeatureLayerById(id);
            if (flayer) {
                flayer.removeLayer(this.innerMap);
                const i = this.featureLayers.indexOf(flayer);
                this.featureLayers.splice(i, 1);
                return true;
            }
            return false;
        }

        /**
         * 显示指定id的功能图层
         * @param id
         */
        public showFeatureLayer(id: string): boolean {
            const layer = this.getFeatureLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        }

        /**
         * 隐藏指定id的功能图层
         * @param id 
         */
        public hideFeatureLayer(id: string): boolean {
            const layer = this.getFeatureLayerById(id);
            if (layer) {
                layer.hide();
                return true;
            }
            return false;
        }

        // #endregion

        // #region 虚拟方法
        /**
         * 中心定位
         * @param point 点
         */
        public abstract onCenterAt(point: FlagwindPoint): Promise<void>;

        /**
         * 放大或缩小至指定的级别
         * @param zoom 级别
         */
        public abstract onZoom(zoom: number): Promise<void>;

        /**
         * 创建要素点
         * @param point 点
         */
        public abstract onCreatePoint(item: any): FlagwindPoint;

        /**
         * 创建地图对象
         */
        public abstract onCreateMap(): any;

        /**
         * 显示信息窗口
         * @param event 信息窗口构建参数
         */
        public abstract onShowInfoWindow(event: InfoWindowShowEventArgs): void;

        /**
         * 关闭信息窗口
         */
        public abstract onCloseInfoWindow(): void;

        /**
         * 创建底图
         */
        public abstract onCreateBaseLayers(): Array<FlagwindTiledLayer>;

        /**
         * 显示要素tooltip信息
         * @param graphic 要显示tootip信息的要素
         */
        public abstract onShowTooltip(graphic: FlagwindGraphic): void;

        /**
         * 隐藏要素tooltip信息
         */
        public abstract onHideTooltip(): void;

        /**
         * 创建地图右键快捷菜单
         * @param eventArgs 创建菜单的参数
         */
        public abstract onCreateContextMenu(eventArgs: ContextMenuCreateEventArgs): void;

        // #endregion

        // #region 初始化动作
        
        protected onInit(): void {
            this.onCreateMap();
            this.onCreateBaseLayers();
            this.on("onLoad", () => {
                try {
                    this.loaded = true;
                    this.centerAtDefault();
                    this.onMapLoad();
                } catch (ex) {
                    console.error(ex);
                }
            });
            this.on("onZoomStart", (evt: EventArgs) => {
                if (this.options.onZoomStart) {
                    this.options.onZoomStart(evt.data);
                }
            });
            this.on("onZoom", (evt: EventArgs) => {
                if (this.options.onZoom) {
                    this.options.onZoom(evt);
                }
            });
            this.on("onZoomEnd", (evt: EventArgs) => {
                if (this.options.onZoomEnd) {
                    this.options.onZoomEnd(evt.data);
                }
            });
        }

        /**
         * 地图加载回调
         */
        protected onMapLoad(): void {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }

            this.on("onClick", (evt: EventArgs) => {
                this.options.onMapClick(evt); // evt.data
            });
        }

        // #endregion 
    }
}
