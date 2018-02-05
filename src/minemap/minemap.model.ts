/// <reference path="../events/EventProvider" />
namespace flagwind {

    /**
     * 几何对象
     */
    export abstract class MinemapGeometry {

        public attributes: any;

        public constructor(
            public type: string,
            public spatial: MinemapSpatial
        ) {

        }

        public abstract toJson(): any;

    }
    /**
     * 线
     */
    export class MinemapPolyline extends MinemapGeometry {

        public path: Array<Array<number>> = [];
        public constructor(spatial: MinemapSpatial = null) {
            super("Polyline", spatial);
        }

        public getPoint(pointIndex: number) {

            return this.path[pointIndex];
        }

        public insertPoint(pointIndex: number, point: Array<number>) {
            this.path.splice(pointIndex, 0, point);
        }

        public removePoint(pointIndex: number) {
            this.path.splice(pointIndex, 1);
        }

        public toJson() {

            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": this.path
                    }
                }
            };
        }
    }
    /**
     * 面
     */
    export class MinemapPolygon extends MinemapGeometry {

        public rings: Array<Array<Array<number>>> = [];
        public constructor(spatial: MinemapSpatial = null) {
            super("Line", spatial);
        }

        public addRing(path: Array<Array<number>>) {
            this.rings.push(path);
        }

        public removeRing(ringIndex: number) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings = this.rings.splice(ringIndex, 1);
        }

        public getPoint(ringIndex: number, pointIndex: number) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            return this.rings[ringIndex][pointIndex];
        }

        public insertPoint(ringIndex: number, pointIndex: number, point: Array<number>) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings[ringIndex].splice(pointIndex, 0, point);
        }

        public removePoint(ringIndex: number, pointIndex: number) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings[ringIndex].splice(pointIndex, 1);
        }

        public toJson() {

            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": this.rings
                    }
                }
            };
        }
    }

    /**
     * 坐标点
     */
    export class MinemapPoint extends MinemapGeometry {

        public constructor(
            public x: number,
            public y: number,
            public spatial: MinemapSpatial = null
        ) {
            super("Point", spatial);
        }

        public toJson() {
            return {
                "type": "Feature",
                "properties": this.attributes || {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [this.x, this.y]
                }
            };
        }
    }

    /**
     * 空间投影
     */
    export class MinemapSpatial {
        public constructor(
            public wkid: number
        ) {

        }
    }

    export interface IMinemapGraphic {

        id: string;

        attributes: any;

        isShow: boolean;

        isInsided: boolean;

        kind: string;

        show(): void;

        hide(): void;

        remove(): void;

        delete(): void;

        setSymbol(symbol: any): void;

        setGeometry(geometry: MinemapGeometry): void;

        addTo(map: any): void;

    }

    export class MinemapMarker extends EventProvider implements IMinemapGraphic {

        private _kind: string = "marker";
        /**
         * 是否在地图上
         */
        private _isInsided: boolean = false;
        private _geometry: MinemapPoint;

        public id: string;
        public isShow: boolean = true;
        public symbol: any;

        public marker: any;
        public element: any;
        public attributes: any;

        public layer: MinemapMarkerLayer;

        public EVENTS_MAP: Map<string, Function> = new Map<string, Function>();

        public constructor(options: any) {
            super();
            this.id = options.id;
            this.element = document.createElement("div");
            this.element.id = this.id;
            this.symbol = options.symbol;
            this.attributes = options.attributes;
            if (options.symbol && options.symbol.className) {
                this.element.classList = [options.symbol.className];
            }
            this.marker = new minemap.Marker(this.element, { offset: [-10, -14] });
            if (this.element.parentNode && options.symbol.className.indexOf("checked") !== -1) {
                this.element.parentNode.classList.add("checked");
            }
            if (options.point) {
                this.geometry = new MinemapPoint(options.point.x, options.point.y);
            }
            if (options.geometry) {
                this.geometry = options.geometry;
            }
            let me = this;
            this.element.onmouseover = function (args: any) {
                console.log("fire marker onMouseOver");
                me.fireEvent("onMouseOver", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            this.element.onmouseout = function (args: any) {
                console.log("fire marker onMouseOut");
                me.fireEvent("onMouseOut", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            this.element.onmousedown = function (args: any) {
                console.log("fire marker onMouseDown");
                me.fireEvent("onMouseDown", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            this.element.onmouseup = function (args: any) {
                console.log("fire marker onMouseUp");
                me.fireEvent("onMouseUp", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            this.element.onclick = function (args: any) {
                console.log("fire marker onClick");
                me.fireEvent("onClick", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
        }

        /**
         * 复制节点
         * @param id 元素ID
         */
        public clone(id: string) {
            let m = new MinemapMarker({
                id: id,
                symbol: this.symbol,
                attributes: this.attributes,
                point: this.geometry
            });
            return m;
        }

        public get kind() {
            return this._kind;
        }

        public get isInsided() {
            return this._isInsided;
        }

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

        // public onCallBack(eventName: string, arg: any) {
        //     let call = this.EVENTS_MAP.get(eventName);
        //     if (call) {
        //         call(arg);
        //     }
        //     if (!this.layer) { return; }
        //     let callback = this.layer.getCallBack(eventName);
        //     if (callback) {
        //         callback(arg);
        //     }
        // }

        public show(): void {
            if (!this.layer) {
                throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.marker.addTo(this.layer.map);
            this.isShow = false;
        }

        public hide(): void {
            this.marker.remove();
            this.isShow = false;
        }

        public remove(): void {
            if (this._isInsided) {
                this.marker.remove();
                this._isInsided = false;
            }
        }

        public delete(): void {
            if (this._isInsided) {
                this.marker.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        }

        public setAngle(angle: number) {
            this.element.style.transform = "rotate(" + angle + "deg)";
            this.element.style["-ms-transform"] = "rotate(" + angle + "deg)";
            this.element.style["-moz-transform"] = "rotate(" + angle + "deg)";
            this.element.style["-webkit-transform"] = "rotate(" + angle + "deg)";
            this.element.style["-o-transform"] = "rotate(" + angle + "deg)";
        }

        public setSymbol(symbol: any): void {
            if (this.symbol && this.symbol.className) {
                this.element.classList.remove(this.symbol.className);
            }
            if (symbol.className) {
                this.element.classList.push(symbol.className);
            }
        }

        public draw(): void {
            console.log("draw");
        }

        public get geometry(): MinemapPoint {
            return this._geometry;
        }

        public set geometry(geometry: MinemapPoint) {
            this._geometry = geometry;
            this.marker.setLngLat([geometry.x, geometry.y]);
        }

        public setGeometry(value: MinemapGeometry): void {
            if (value instanceof MinemapPoint) {
                this.geometry = <MinemapPoint>value;
            } else {
                throw new Error("不匹配类型");
            }
        }

        public addTo(map: any) {
            this._isInsided = true;
            this.marker.addTo(map);
        }

        protected fireEvent(type: string, data?: any): void {
            this.dispatchEvent(type, data);
            if (this.layer) {
                this.layer.dispatchEvent(type, data);
            }
        }
    }

    export class MinemapGeoJson implements IMinemapGraphic {

        private _kind: string = "geojson";
        private _geometry: MinemapGeometry;
        /**
         * 是否在地图上
         */
        public _isInsided: boolean = false;

        public id: string;
        public isShow: boolean = true;
        public type: string;
        public layout: any;
        public paint: any;
        public attributes: any = {};

        public constructor(public layer: MinemapGeoJsonLayer, options: any) {
            if (options && options.id) {
                this.id = options.id;
            }
            if (options && options.type) {
                this.type = options.type;
            }
            if (options && options.paint) {
                this.paint = options.paint;
            }
            if (options && options.layout) {
                this.layout = options.layout;
            }
            if (options && options.attributes) {
                this.attributes = options.attributes;
            }
            if (options && options.geometry) {
                if (options.geometry instanceof MinemapGeometry) {
                    this.geometry = options.geometry;
                } else {
                    throw new Exception("geometry 类型不正确");
                }
            }
            if (options && options.symbol) {
                if (options.symbol.layout) {
                    this.layout = options.symbol.layout;
                }
                if (options.symbol.paint) {
                    this.layout = options.symbol.paint;
                }
            }
        }

        public get kind() {
            return this._kind;
        }

        public get isInsided() {
            return this._isInsided;
        }
        public show(): void {
            if (!this.isShow) {
                this.addLayer(this.layer.map);
                this.isShow = true;
            }
        }

        public hide(): void {
            this.layer.map.removeLayer(this.id);
            this.isShow = false;
        }

        public remove(): void {
            this.layer.map.removeLayer(this.id);
        }

        public delete(): void {
            if (this.isInsided) {
                this.layer.map.removeLayer(this.id);
                this._isInsided = false;
                this.layer.remove(this);
            }
        }

        public setSymbol(symbol: any): void {
            if (symbol && symbol.paint) {
                this.paint = symbol.paint;
            }
            if (symbol && symbol.layout) {
                this.layout = symbol.layout;
            }
        }

        public get geometry(): MinemapGeometry {
            return this._geometry;
        }

        public set geometry(value: MinemapGeometry) {
            this._geometry = value;
        }

        public setGeometry(value: MinemapGeometry): void {
            if (value instanceof MinemapGeoJson) {
                this.geometry = value;
            }
        }

        public addTo(map: any) {
            if (!map) return;
            if (!this.id) {
                throw new Exception("没有指定id，无法添加");
            }
            if (!this.geometry) {
                throw new Exception("没有指定geometry，无法添加");
            }
            let json = this.geometry.toJson();
            console.log(json);
            map.addSource(this.id + "_source", json);
        }

        public addLayer(map: any) {
            let layerJson = {
                id: this.id,
                source: this.id + "_source",
                type: this.type,
                paint: this.paint,
                layout: this.layout
            };
            map.addLayer(layerJson);
        }
    }

    export interface IMinemapGraphicsLayer {
        graphics: Array<IMinemapGraphic>;
        show(): void;
        hide(): void;
        add(graphic: any): void;
        remove(graphic: any): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
        on(eventName: string, callBack: Function): void;

    }

    export class MinemapMarkerLayer extends EventProvider implements IMinemapGraphicsLayer {

        private GRAPHICS_MAP: Map<string, MinemapMarker> = new Map<string, MinemapMarker>();

        // private EVENTS_MAP: Map<string, Function> = new Map<string, Function>();

        /**
         * 是否在地图上
         */
        public _isInsided: boolean = false;

        public id: string;
        public map: any;

        public get isInsided() {
            return this._isInsided;
        }

        public constructor(
            public options: any) {
            super();
            this.id = options.id;
        }

        public get graphics() {
            if (this.GRAPHICS_MAP.size === 0) {
                return new Array<IMinemapGraphic>();
            } else {
                return <any>this.GRAPHICS_MAP.values();
            }
        }

        // public getCallBack(eventName: string): Function {
        //     return this.EVENTS_MAP.get(eventName);
        // }

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

        // public on(eventName: string, callBack: Function) {
        //     this.EVENTS_MAP.set(eventName, callBack);
        // }

        public show(): void {
            this.GRAPHICS_MAP.forEach(g => {
                if (!g.value.isShow) {
                    g.value.show();
                }
            });
        }

        public hide(): void {
            this.GRAPHICS_MAP.forEach(g => {
                if (g.value.isShow) {
                    g.value.hide();
                }
            });
        }

        public remove(graphic: IMinemapGraphic) {
            this.GRAPHICS_MAP.delete(graphic.id);
            if (graphic.isInsided) {
                graphic.delete();
            }
        }

        public clear(): void {
            this.GRAPHICS_MAP.forEach(g => g.value.remove());
            this.GRAPHICS_MAP.clear();
        }

        public add(graphic: MinemapMarker): void {
            this.GRAPHICS_MAP.set(graphic.id, graphic);
            graphic.layer = this;
            if (this.map) {
                graphic.addTo(this.map);
            }
        }

        public addToMap(map: any): void {
            if (!this.map) {
                this.GRAPHICS_MAP.forEach(g => {
                    g.value.addTo(map);
                });
            }
            this.map = map;
            this._isInsided = true;
        }

        public removeFromMap(map: any) {
            this.GRAPHICS_MAP.forEach(g => {
                g.value.remove();
            });
            this._isInsided = false;
        }
    }

    export class MinemapGeoJsonLayer extends EventProvider implements IMinemapGraphicsLayer {

        private GRAPHICS_MAP: Map<string, MinemapGeoJson> = new Map<string, MinemapGeoJson>();
        /**
         * 是否在地图上
         */
        public _isInsided: boolean = false;

        public id: string;
        public map: any;

        public get isInsided() {
            return this._isInsided;
        }

        public constructor(public options: any) {
            super();
            this.id = options.id;

        }

        public get graphics() {
            return <any>this.GRAPHICS_MAP.values();
        }

        public show(): void {
            this.GRAPHICS_MAP.forEach(g => {
                if (!g.value.isShow) {
                    g.value.show();
                }
            });
        }

        public hide(): void {
            this.GRAPHICS_MAP.forEach(g => {
                if (g.value.isShow) {
                    g.value.hide();
                }
            });
        }

        public remove(graphic: IMinemapGraphic) {
            this.GRAPHICS_MAP.delete(graphic.id);
            if (graphic.isInsided) {
                graphic.delete();
            }
        }

        public clear(): void {
            this.GRAPHICS_MAP.forEach(g => g.value.remove());
            this.GRAPHICS_MAP.clear();
        }

        public add(graphic: MinemapGeoJson): void {
            this.GRAPHICS_MAP.set(graphic.id, graphic);
            if (this.map) {
                graphic.addTo(this.map);
                graphic.addLayer(this.map);
            }
        }

        public addToMap(map: any): void {
            if (!this.map) {
                this.GRAPHICS_MAP.forEach(g => g.value.addLayer(map));
            }
            this.map = map;
            this._isInsided = true;
        }

        public removeFromMap(map: any) {
            this.GRAPHICS_MAP.forEach(g => g.value.delete());
            this._isInsided = false;
        }

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
    }

}
