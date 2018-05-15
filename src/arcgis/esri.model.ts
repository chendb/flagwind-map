// /// <reference path="../events/EventProvider" />
// namespace flagwind {

//     /**
//      * 几何对象
//      */
//     export abstract class EsriGeometry {

//         public attributes: any;

//         public constructor(public type: string, public spatial: EsriSpatial) {
//         }

//         public abstract toJson(): any;

//     }
//     /**
//      * 线
//      */
//     export class EsriPolyline extends EsriGeometry {

//         public path: Array<Array<number>> = [];
//         public constructor(spatial: EsriSpatial = null) {
//             super("Polyline", spatial);
//         }

//         public getPoint(pointIndex: number) {

//             return this.path[pointIndex];
//         }

//         public insertPoint(pointIndex: number, point: Array<number>) {
//             this.path.splice(pointIndex, 0, point);
//         }

//         public removePoint(pointIndex: number) {
//             this.path.splice(pointIndex, 1);
//         }

//         public toJson() {

//             return {
//                 "type": "geojson",
//                 "data": {
//                     "type": "Feature",
//                     "properties": this.attributes || {},
//                     "geometry": {
//                         "type": "LineString",
//                         "coordinates": this.path
//                     }
//                 }
//             };
//         }
//     }
//     /**
//      * 面
//      */
//     // export class MinemapPolygon extends EsriGeometry {

//     //     public rings: Array<Array<Array<number>>> = [];
//     //     public constructor(spatial: EsriSpatial = null) {
//     //         super("Line", spatial);
//     //     }

//     //     public addRing(path: Array<Array<number>>) {
//     //         this.rings.push(path);
//     //     }

//     //     public removeRing(ringIndex: number) {
//     //         if (ringIndex > this.rings.length) {
//     //             throw new Error("数组越界");
//     //         }
//     //         this.rings = this.rings.splice(ringIndex, 1);
//     //     }

//     //     public getPoint(ringIndex: number, pointIndex: number) {
//     //         if (ringIndex > this.rings.length) {
//     //             throw new Error("数组越界");
//     //         }
//     //         return this.rings[ringIndex][pointIndex];
//     //     }

//     //     public insertPoint(ringIndex: number, pointIndex: number, point: Array<number>) {
//     //         if (ringIndex > this.rings.length) {
//     //             throw new Error("数组越界");
//     //         }
//     //         this.rings[ringIndex].splice(pointIndex, 0, point);
//     //     }

//     //     public removePoint(ringIndex: number, pointIndex: number) {
//     //         if (ringIndex > this.rings.length) {
//     //             throw new Error("数组越界");
//     //         }
//     //         this.rings[ringIndex].splice(pointIndex, 1);
//     //     }

//     //     /**
//     //      * 判断点是否在圆里面
//     //      * @param point 点 
//     //      */
//     //     public inside(point: Array<any>) {

//     //         let x = point[0], y = point[1];
//     //         let vs = this.rings[0];

//     //         let inside = false;
//     //         for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
//     //             let xi = vs[i][0], yi = vs[i][1];
//     //             let xj = vs[j][0], yj = vs[j][1];

//     //             let intersect = ((yi > y) !== (yj > y))
//     //                 && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
//     //             if (intersect) inside = !inside;
//     //         }

//     //         return inside;
//     //     }

//     //     public toJson() {

//     //         return {
//     //             "type": "geojson",
//     //             "data": {
//     //                 "type": "Feature",
//     //                 "properties": this.attributes || {},
//     //                 "geometry": {
//     //                     "type": "Polygon",
//     //                     "coordinates": this.rings
//     //                 }
//     //             }
//     //         };
//     //     }
//     // }

//     /**
//      * 圆
//      */
//     // export class MinemapCircle extends EsriGeometry {

//     //     public center: Array<number> = [];
//     //     public radius: number;

//     //     public constructor(spatial: EsriSpatial = null) {
//     //         super("Circle", spatial);
//     //     }

//     //     public toJson() {

//     //         return {
//     //             "type": "geojson",
//     //             "data": {
//     //                 "type": "Feature",
//     //                 "properties": this.attributes || {
//     //                     radius: this.radius
//     //                 },
//     //                 "geometry": {
//     //                     "type": "Point",
//     //                     "coordinates": this.center
//     //                 }
//     //             }
//     //         };
//     //     }

//     //     /**
//     //      * 判断点是否在圆里面
//     //      * @param point 点 
//     //      */
//     //     public inside(point: Array<any>) {
//     //         let from = new MinemapPoint(this.center[0], this.center[1]);
//     //         let to = new MinemapPoint(point[0], point[1]);
//     //         const units = "meters";
//     //         let distance = turf.distance(from.toJson(), to.toJson(), units);
//     //         return distance <= this.radius;

//     //         // let offsetX = point[0] - this.center[0];
//     //         // let offsetY = point[1] - this.center[1];
//     //         // let offsetR = (1 / 2) * Math.sqrt(offsetX * offsetX + offsetY * offsetY);
//     //         // let x = Math.sin(offsetX / offsetR) * this.radius;
//     //         // let y = Math.sin(offsetY / offsetR) * this.radius;

//     //         // if (offsetX * (x - point[0]) < 0) return false;
//     //         // if (offsetY * (y - point[1]) < 0) return false;
//     //         // return true;
//     //     }
//     // }

//     /**
//      * 坐标点
//      */
//     export class EsriPoint extends EsriGeometry {
//         public point: any;

//         public constructor(public x: number, public y: number, public spatial: EsriSpatial = null) {
//             super("Point", spatial);
            
//             this.point = new esri.geometry.Point(x, y, this.spatial);
//         }

//         public toJson() {
//             return {
//                 "type": "Feature",
//                 "properties": this.attributes || {},
//                 "geometry": {
//                     "type": "Point",
//                     "coordinates": [this.x, this.y]
//                 }
//             };
//         }
//     }

//     /**
//      * 空间投影
//      */
//     export class EsriSpatial {
//         public spatial: any;
//         public constructor(public wkid: number) {
//             this.spatial = wkid || 4326;
//         }
//     }

//     export interface IEsriGraphic {

//         id: string;

//         attributes: any;

//         isShow: boolean;

//         isInsided: boolean;

//         kind: string;

//         layer: IEsriGraphicsLayer;

//         show(): void;

//         hide(): void;

//         remove(): void;

//         delete(): void;

//         setSymbol(symbol: any): void;

//         setGeometry(geometry: EsriGeometry): void;

//         addTo(layer: any): void;

//     }

//     export interface IEsriGraphicsLayer {
//         map: any;
//         layer: any;
//         graphics: Array<IEsriGraphic>;
//         show(): void;
//         hide(): void;
//         add(graphic: any): void;
//         remove(graphic: any): void;
//         addToMap(map: any): void;
//         removeFromMap(layer: any): void;
//         on(eventName: string, callBack: Function): void;
//         dispatchEvent(type: string, data?: any): void;
//     }

//     export class EsriGraphicsLayer extends EventProvider implements IEsriGraphicsLayer {

//         private GRAPHICS_MAP: Map<string, IEsriGraphic> = new Map<string, IEsriGraphic>();

//         /**
//          * 是否在地图上
//          */
//         public _isInsided: boolean = false;

//         public id: string;
//         public map: any;

//         public layer: any;

//         public get isInsided() {
//             return this._isInsided;
//         }

//         public constructor(
//             public options: any) {
//             super();
//             this.id = options.id;
//             this.layer = new esri.layers.GraphicsLayer({ id: this.id  || "deviceLayer"});
//         }

//         public get graphics() {
//             if (this.GRAPHICS_MAP.size === 0) {
//                 return new Array<IEsriGraphic>();
//             } else {
//                 return <any>this.GRAPHICS_MAP.values();
//             }
//         }

//         /**
//          * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
//          * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
//          * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
//          * @param  {string} type 事件类型。
//          * @param  {Function} 处理事件的侦听器函数。
//          * @param  {any} scope? 侦听函数绑定的 this 对象。
//          * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
//          * @returns void
//          */
//         public on(type: string, listener: Function, scope: any = this, once: boolean = false): void {
//             this.addListener(type, listener, scope, once);
//         }

//         /**
//          * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
//          * @param  {string} type 事件类型。
//          * @param  {Function} listener 处理事件的侦听器函数。
//          * @param  {any} scope? 侦听函数绑定的 this 对象。
//          * @returns void
//          */
//         public off(type: string, listener: Function, scope: any = this): void {
//             this.removeListener(type, listener, scope);
//         }

//         public show(): void {
//             this.GRAPHICS_MAP.forEach(g => {
//                 if (!g.value.isShow) {
//                     g.value.show();
//                 }
//             });
//         }

//         public hide(): void {
//             this.GRAPHICS_MAP.forEach(g => {
//                 if (g.value.isShow) {
//                     g.value.hide();
//                 }
//             });
//         }

//         public remove(graphic: IEsriGraphic) {
//             this.GRAPHICS_MAP.delete(graphic.attributes.id);
//             if (graphic.isInsided) {
//                 graphic.delete();
//             }
//         }

//         public clear(): void {
//             this.GRAPHICS_MAP.forEach(g => g.value.remove());
//             this.GRAPHICS_MAP.clear();
//         }

//         public add(graphic: IEsriGraphic): void {
//             this.GRAPHICS_MAP.set(graphic.attributes.id, graphic);
//             graphic.layer = this;
//             if (this.layer) {
//                 graphic.addTo(this.layer);
//             }
//         }

//         public addToMap(map: any): void {
//             // if (!this.map) {
//             //     this.GRAPHICS_MAP.forEach(g => {
//             //         g.value.addTo(map);
//             //     });
//             // }
//             if (!this.layer) {
//                 this.layer = new esri.layers.GraphicsLayer({ id: this.options.id || "deviceLayer" });
//             }
//             this.GRAPHICS_MAP.forEach(g => {
//                 g.value.addTo(this.layer);
//             });
//             map.addLayer(this.layer);
//             this.map = map;
//             this._isInsided = true;
//         }

//         public removeFromMap(map: any) {
//             this.GRAPHICS_MAP.forEach(g => {
//                 g.value.remove();
//             });
//             this._isInsided = false;
//         }
//     }

// }
