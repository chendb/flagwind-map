namespace flagwind {
    /**
     * 坐标点
     */
    export class MinemapPoint {

        public constructor(
            public x: number,
            public y: number,
            public spatial: any
        ) { }

        public get geometry(): MinemapGeometry {
            return new MinemapGeometry(
                "Point", [this.x, this.y]
            );
        }

        public set geometry(value: MinemapGeometry) {
            this.x = value.coordinates[0];
            this.y = value.coordinates[1];
        }

    }

    /**
     * 几何对象
     */
    export class MinemapGeometry {

        public constructor(
            public type: string,
            public coordinates: Array<any>
        ) {

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

        attributers: any;

        isShow: boolean;

        isInsided: boolean;

        kind: string;

        show(): void;

        hide(): void;

        remove(): void;

        delete(): void;

        setSymbol(symbol: any): void;

        setGeometry(geometry: { type: string; coordinates: Array<any> }): void;

        addTo(map: any): void;
    }

    export class MinemapMarker implements IMinemapGraphic {

        private _kind: string = "marker";
        /**
         * 是否在地图上
         */
        private _isInsided: boolean = false;
        private _geometry: MinemapGeometry;

        public id: string;
        public isShow: boolean = true;
        public symbol: any;

        public marker: any;
        public element: any;
        public attributers: any;

        public layer: MinemapMarkerLayer;

        // public EVENT_MAP: Map<string, string> = new Map<string, string>();

        public constructor(options: any) {
            this.id = options.id;
            this.element = document.createElement("div");
            this.element.id = this.id;
            if (options.symbol && options.symbol.className) {
                this.element.classList = [options.symbol.className];
            }
            this.marker = new minemap.Marker(this.element, { offset: [-25, -25] });
            if (options.point) {
                this._geometry = new MinemapGeometry("Point", [options.point.x, options.point.y]);
                this.marker.setLngLat([options.point.x, options.point.y]);
            }
            // this.EVENT_MAP.set("onMouseOver", "onmouseover");
            // this.EVENT_MAP.set("onMouseOut", "onmouseout");
            // this.EVENT_MAP.set("onMouseDown", "onmousedown");
            // this.EVENT_MAP.set("onMouseUp", "onmouseup");
            // this.EVENT_MAP.set("onClick", "onclick");
            let me = this;
            this.element.onmouseover = function (args: any) {
                me.onCallback("onMouseOver", args);
            };
            this.element.onmouseout = function (args: any) {
                me.onCallback("onMouseOut", args);
            };
            this.element.onmousedown = function (args: any) {
                me.onCallback("onMouseDown", args);
            };
            this.element.onmouseup = function (args: any) {
                me.onCallback("onMouseUp", args);
            };
            this.element.onclick = function (args: any) {
                me.onCallback("onClick", args);
            };
        }

        public get kind() {
            return this._kind;
        }

        public get isInsided() {
            return this._isInsided;
        }

        // public on(eventName: string, callBack: Function) {
        //     eventName = this.EVENT_MAP.get(eventName) || eventName;
        //     this.element[eventName] = callBack;
        // }

        public onCallback(eventName: string, arg: any) {
            let callback = this.layer.getCallBack("onMouseOver");
            if (callback) {
                callback(arg);
            }
        }

        public show(): void {
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
            this.layer.remove(this);
        }

        public setSymbol(symbol: any): void {
            if (symbol.className) {
                this.element.classList.add(symbol.className);
            }
        }

        public get geometry(): MinemapGeometry {
            return this._geometry;
        }

        public set geometry(geometry: MinemapGeometry) {
            this._geometry = geometry;
            this.marker.setLngLat(geometry.coordinates);
        }

        public setGeometry(geometry: { type: string; coordinates: Array<any> }): void {
            this._geometry = geometry;
            this.marker.setLngLat(geometry.coordinates);
        }

        public addTo(map: any) {
            this._isInsided = true;
            this.marker.addTo(map);
        }
    }

    export class MinemapGeoJson implements IMinemapGraphic {

        private _kind: string = "geojson";

        /**
         * 是否在地图上
         */
        public _isInsided: boolean = false;

        public id: string;
        public isShow: boolean = true;
        public data: { type: string; geometry: { type: string; coordinates: Array<any> } };
        public type: string;
        public layout: any;
        public paint: any;
        public layer: MinemapMarkerLayer;
        public attributers: any;

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
            throw new Exception("尚未实现");
        }

        public setGeometry(geometry: { type: string; coordinates: Array<any> }): void {
            if (this.data && this.data.geometry) {
                this.data.geometry = geometry;
            }
        }

        public addTo(map: any) {
            if (!map) return;
            map.addSource(this.id + "_source", {
                type: this.kind,
                data: this.data
            });

        }

        public addLayer(map: any) {
            map.addLayer({
                id: this.id,
                source: this.id + "_source",
                type: this.type,
                paint: this.paint,
                layout: this.layout
            });
        }
    }

    export interface IMinemapGraphicsLayer {
        graphics: Array<any>;
        show(): void;
        hide(): void;
        add(graphic: any): void;
        remove(graphic: any): void;
        addToMap(map: any): void;
        removeFromMap(map: any): void;
        on(eventName: string, callBack: Function): void;

    }

    export class MinemapMarkerLayer implements IMinemapGraphicsLayer {

        private GRAPHICS_MAP: Map<string, MinemapMarker> = new Map<string, MinemapMarker>();

        private EVENTS_MAP: Map<string, Function> = new Map<string, Function>();

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
            this.id = options.id;
        }

        public get graphics() {
            return new Array(this.GRAPHICS_MAP.values);
        }

        public getCallBack(eventName: string): Function {
            return this.EVENTS_MAP.get(eventName);
        }

        public on(eventName: string, callBack: Function) {
            this.EVENTS_MAP.set(eventName, callBack);
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

    export class MinemapGeoJsonLayer implements IMinemapGraphicsLayer {


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

        public constructor(options: any) {
            this.id = options.id;

        }

        public get graphics() {
            return new Array(this.GRAPHICS_MAP.values);
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

        public on(eventName: string, callBack: Function): void {
            throw new Error("Method not implemented.");
        }
    }

}
