
// namespace flagwind {
//     export class EsriMarkerGraphic extends EventProvider implements IEsriGraphic {

//         private _kind: string = "marker";
//         /**
//          * 是否在地图上
//          */
//         private _isInsided: boolean = false;
//         private _geometry: EsriPoint;

//         public id: string;
//         public isShow: boolean = true;
//         public symbol: any;
//         // public pt: any;

//         public marker: any;
//         public element: any;
//         public markerSymbol: any;
//         // public infoTemplate: any;

//         public polyline: any;
//         public polylineSymbol: any;

//         public polygon: any;
//         public polygonSymbol: any;

//         public attributes: any;
//         public options: any;
//         public spatial: any;

//         public layer: IEsriGraphicsLayer;

//         public constructor(options: any) {
//             super();
//             this.options = options;
//             this.id = options.id;
//             this.spatial = options.spatial;

//             this.attributes = options.attributes ? options.attributes : {};

//             switch (this.options.dataType) {
//                 case "marker":
//                     this.marker = this.createMarker();
//                     if (this.options.point) this.geometry = new EsriPoint(this.options.point.x, this.options.point.y, this.spatial).point;
//                     break;

//                 case "polyline":
//                     this.marker = this.createPolylineMarker();
//                     break;

//                 case "polygon":
//                     this.marker = this.createPolygonMarker();
//                     break;
//             }

//             if (this.options.geometry) {
//                 this.geometry = this.options.geometry;
//             }

//             // this.element = this.marker.getNode();
//             // if (options && options.className) {
//             //     this.addClass(options.className);
//             //     this.symbol.className = "";
//             // }
//             // if (options.symbol && options.symbol.className) {
//             //     this.addClass(options.symbol.className);
//             //     this.symbol.className = "";
//             // }
//         }

//         public createMarker() {
//             this.markerSymbol = this.getMarkerSymbol();
//             // this.infoTemplate = new esri.InfoTemplate("", this.attributes.name);
//             // let pt = new esri.geometry.Point(options.point.x, options.point.y, this.spatial);
//             return new esri.Graphic(this.options.point, this.markerSymbol, this.options);
//         }

//         public createPolylineMarker() {
//             this.polyline = this.toPolyline(this.attributes.polyline, this.spatial);
//             this.polylineSymbol = this.getLineSymbol(this.options.symbol);
//             return new esri.Graphic(this.polyline, this.polylineSymbol, this.attributes);
//         }

//         public createPolygonMarker() {
//             this.polygon = this.toPolygon(this.attributes.polygon);
//             this.polygonSymbol = this.getPolygonSymbol(this.options.symbol);
//             return new esri.Graphic(this.polygon, this.polygonSymbol, this.attributes);
//         }

//         public getPointFromPloyline() {
//             let pt: any = {};
//             pt.x = (this.marker._extent.xmax + this.marker._extent.xmin) / 2;
//             pt.y = (this.marker._extent.ymax + this.marker._extent.ymin) / 2;
//             return pt;
//         }

//         public toPolyline(strLine: string, spatial: any) {
//             if (!strLine) return null;
//             if (typeof strLine === "string") strLine = JSON.parse(strLine);
//             let line = new esri.geometry.Polyline(spatial);
//             for (let i = 1; i < strLine.length; i++) {
//                 if(!strLine[i] || strLine[i].length < 2) continue;
//                 let start = [strLine[i - 1][0], strLine[i - 1][1]];
//                 let end = [strLine[i][0], strLine[i][1]];
//                 line.addPath([start, end]);
//             }
//             return line;
//             // if (!strLine) return null;
//             // let line = new esri.geometry.Polyline(spatial);
//             // let xys = strLine.split(";");
//             // for (let i = 1; i < xys.length; i++) {
//             //     if ((!xys[i]) || xys[i].length <= 0) continue;
//             //     let startXy = xys[i - 1].split(",");
//             //     let endXy = xys[i].split(",");
//             //     let start = [parseFloat(startXy[0]), parseFloat(startXy[1])];
//             //     let end = [parseFloat(endXy[0]), parseFloat(endXy[1])];
//             //     line.addPath([start, end]);
//             // }
//             // return line;
//         }

//         public toPolygon(strPolygon: string) {
//             if (!strPolygon) return null;
//             if (typeof strPolygon === "string") strPolygon = JSON.parse(strPolygon);
//             return new esri.geometry.Polygon(strPolygon);
//         }

//         public getMarkerSymbol() {
//             this.symbol = this.options.symbol ? this.options.symbol : {};
//             let markerSymbol = this.options.markerSymbol;
//             if ((!markerSymbol) && this.symbol.imageUrl) {
//                 markerSymbol = new esri.symbol.PictureMarkerSymbol(this.symbol.imageUrl, this.symbol.width, this.symbol.height);
//             }
//             return markerSymbol;
//         }

//         public getLineSymbol(symbol?: any) {
//             let lineColor = symbol.lineColor || [255, 0, 0];
//             let lineWidth = symbol.lineWidth || 4;
//             let lineSymbol = symbol.lineSymbol || "STYLE_DASH";
//             let playedLineSymbol = new esri.symbol.CartographicLineSymbol(
//                 esri.symbol.CartographicLineSymbol[lineSymbol], new esri.Color(lineColor), lineWidth,
//                 esri.symbol.CartographicLineSymbol.CAP_ROUND,
//                 esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
//             return playedLineSymbol;
//         }

//         public getPolygonSymbol(symbol?: any) {
//             let lineColor = symbol.lineColor || [151, 249, 0, .80];
//             let lineWidth = symbol.lineWidth || 3;
//             let lineSymbol = symbol.lineSymbol || "STYLE_DOT";
//             let fillSymbol = symbol.fillSymbol || "STYLE_SOLID";
//             let fillColor = symbol.fillColor || [255, 49, 0, 0.45];
//             let polygonSymbol = new esri.symbol.SimpleFillSymbol(
//                 esri.symbol.SimpleFillSymbol[fillSymbol],
//                 new esri.symbol.SimpleLineSymbol(
//                     esri.symbol.SimpleLineSymbol[lineSymbol],
//                     new esri.Color(lineColor),
//                     lineWidth
//                 ),
//                 new esri.Color(fillColor)
//             );
//             return polygonSymbol;
//         }

//         /**
//          * 获取中心点
//          */
//         public setCenterPoint(): void {
//             this.attributes.longitude = this.getPointFromPloyline().x;
//             this.attributes.latitude = this.getPointFromPloyline().y;
//         }

//         public addClass(className: string) {
//             this.symbol.className = className;
//             if (className === " " || className === null || className === undefined || !this.element) {
//                 return;
//             }
//             let classList = className.split(" ");
//             for (let i = 0; i < classList.length; i++) {
//                 this.element.classList.add(classList[i]);
//             }
//         }

//         public removeClass(className: string) {
//             if (className === " " || className === null || className === undefined || !this.element) {
//                 return;
//             }
//             let classList = className.split(" ");
//             for (let i = 0; i < classList.length; i++) {
//                 this.element.classList.remove(classList[i]);
//             }
//         }

//         /**
//          * 复制节点
//          * @param id 元素ID
//          */
//         public clone(id: string) {
//             let m = new EsriMarkerGraphic({
//                 id: id,
//                 symbol: this.symbol,
//                 attributes: this.attributes,
//                 point: this.geometry
//             });
//             return m;
//         }

//         public get kind() {
//             return this._kind;
//         }

//         public get isInsided() {
//             return this._isInsided;
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
//             if (!this.layer) {
//                 throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
//             }
//             // this.marker.addTo(this.layer.map);
//             // this.layer.layer.add(this.marker);
//             this.addTo(this.layer.layer);
//             this.isShow = true;
//         }

//         public hide(): void {
//             this.marker.hide();
//             this.isShow = false;
//         }

//         public remove(): void {
//             if (this._isInsided && this.layer) {
//                 this.layer.layer.remove(this.marker);
//                 // this.marker.remove();
//                 this._isInsided = false;
//             }
//         }

//         public delete(): void {
//             if (this._isInsided && this.layer) {
//                 this.layer.layer.remove(this.marker);
//                 this._isInsided = false;
//             }
//             // if (this._isInsided) {
//             //     this.marker.remove();
//             //     this._isInsided = false;
//             // }
//             // if (this.layer) {
//             //     this.layer.remove(this);
//             // }
//         }

//         public setAngle(angle: number) {
//             this.markerSymbol.setAngle(angle);
//             // this.marker.getNode().style.transform = `rotate(${angle}deg)`;
//             // this.marker.getNode().style["-ms-transform"] = `rotate(${angle}deg)`;
//             // this.marker.getNode().style["-moz-transform"] = `rotate(${angle}deg)`;
//             // this.marker.getNode().style["-webkit-transform"] = `rotate(${angle}deg)`;
//             // this.marker.getNode().style["-o-transform"] = `rotate(${angle}deg)`;

//             // let routeCar = this.marker.getNode().querySelector(".graphic-moving .minemap-icon");
//             // if(routeCar) {
//             //     routeCar.style.transform = `rotate(${angle}deg)`;
//             // }
//         }

//         public setSymbol(symbol: any): void {
//             if(this.options.dataType === "marker" && this.symbol) {
//                 if (symbol.className) {
//                     // 先删除之前的样式
//                     if (this.symbol.className) this.removeClass(this.symbol.className);
//                     this.addClass(symbol.className);
//                 }
//                 if (symbol.icon) {
//                     this.marker.setSymbol(symbol.icon);
//                 }
//                 if (symbol.imageUrl) {
//                     this.markerSymbol.setUrl(symbol.imageUrl);
//                 }
//             } else if(this.options.dataType === "polyline" && this.polylineSymbol) {
//                 if(symbol.width) {
//                     this.polylineSymbol.setWidth(symbol.width);
//                 }
//                 if(symbol.color) {
//                     this.polylineSymbol.setColor(symbol.color);
//                 }
//                 if(symbol.miterLimit) {
//                     this.polylineSymbol.setMiterLimit(symbol.miterLimit);
//                 }
//             } else if(this.options.dataType === "polygon" && this.polygonSymbol) {
//                 if(symbol.style) {
//                     this.polygonSymbol.setStyle(symbol.style);
//                 }
//                 if(symbol.color) {
//                     this.polygonSymbol.setColor(symbol.color);
//                 }
//                 if(symbol.outline) {
//                     this.polygonSymbol.setOutline(symbol.outline);
//                 }
//             }

//             this.symbol = { ...this.symbol, ...symbol };
//             // if (symbol.title) {
//             //     this.marker.setTitle(symbol.title);
//             // }
//             // if (symbol.titleFontSize) {
//             //     this.marker.setTitleFontSize(symbol.titleFontSize);
//             // }
//             // if (symbol.titleColor) {
//             //     this.marker.setTitleColor(symbol.titleColor);
//             // }
//             // if (symbol.titleColor) {
//             //     this.marker.setTitleColor(symbol.titleColor);
//             // }
//             // if (symbol.titlePosition) {
//             //     this.marker.setTitlePosition(symbol.titlePosition);
//             // }
//         }

//         public draw(): void {
//             this.marker.draw();
//             // console.log("draw-marker");
//         }

//         public get geometry(): EsriPoint {
//             return this._geometry;
//         }

//         public set geometry(geometry: EsriPoint) {
//             this._geometry = geometry;
//             this.marker.setGeometry(geometry);
//             // this.marker.setGeometry(new esri.geometry.Point(geometry.x, geometry.y, this.spatial));
//         }

//         public setGeometry(value: EsriGeometry): void {
//             if (value instanceof EsriPoint) {
//                 this.geometry = new EsriPoint(value.x, value.y, this.spatial).point;
//                 // this.geometry = <EsriPoint>value;
//             } else {
//                 throw new Error("不匹配类型");
//             }
//         }

//         public addTo(layer: any) {
//             this._isInsided = true;
//             // this.marker.addTo(map);
//             // layer.on("graphic-node-add", () => {
//             //     if(!this.marker.getNode()) { console.log("无法获取标注元素"); return; }
                
//             //     if(this.options.dataType === "polyline" || this.options.dataType === "polygon") {
//             //         this.attributes.longitude = this.getPointFromPloyline().x;
//             //         this.attributes.latitude = this.getPointFromPloyline().y;
//             //     }

//             //     this.element = this.marker.getNode();
//             //     if (this.symbol && this.options.symbol && this.options.symbol.className) {
//             //         this.addClass(this.options.symbol.className);
//             //         this.symbol.className = "";
//             //     }

//             //     let events = ["onmouseover", "onmouseout", "onmouseup", "onmousedown", "ondblclick", "onclick"];
//             //     events.forEach(g => { this.registerEvent(this.element, g); });
//             // });

//             layer.add(this.marker);

//             if (this.symbol && this.options.symbol && this.options.symbol.className) {
//                 this.addClass(this.options.symbol.className);
//                 this.symbol.className = "";
//             }

//             if (this.options.dataType === "polyline" || this.options.dataType === "polygon")  this.setCenterPoint();

//             // let me = this;
//             // this.marker.getNode().on("mouseover", function (args: any) {
//             //     console.log("fire marker onMouseOver");
//             //     me.fireEvent("onMouseOver", {
//             //         graphic: me,
//             //         mapPoint: me.geometry,
//             //         orgion: args
//             //     });
//             // });

//             // this.marker.getNode().on("mouseout", function (args: any) {
//             //     console.log("fire marker onMouseOut");
//             //     me.fireEvent("onMouseOut", {
//             //         graphic: me,
//             //         mapPoint: me.geometry,
//             //         orgion: args
//             //     });
//             // });

//             // this.marker.getNode().on("mouseup", function (args: any) {
//             //     console.log("fire marker onMouseUp");
//             //     me.fireEvent("onMouseUp", {
//             //         graphic: me,
//             //         mapPoint: me.geometry,
//             //         orgion: args
//             //     });
//             // });

//             // this.marker.getNode().on("mousedown", function (args: any) {
//             //     console.log("fire marker onMouseDown");
//             //     me.fireEvent("onMouseDown", {
//             //         graphic: me,
//             //         mapPoint: me.geometry,
//             //         orgion: args
//             //     });
//             // });

//             // this.marker.getNode().on("dblclick", function (args: any) {
//             //     console.log("fire marker onClick");
//             //     me.fireEvent("onDblClick", {
//             //         graphic: me,
//             //         mapPoint: me.geometry,
//             //         orgion: args
//             //     });
//             // });
//             // this.marker.getNode().on("click", function (args: any) {
//             //     console.log("fire marker onClick");
//             //     me.fireEvent("onClick", {
//             //         graphic: me,
//             //         mapPoint: me.geometry,
//             //         orgion: args
//             //     });
//             // });
//         }

//         protected registerEvent(ele: any, eventName: string): void {
//             let me = this;
//             ele[eventName] = function(evt: any) {
//                 switch (eventName) {
//                     case "onmouseover": eventName = "onMouseOver"; break;
//                     case "onmouseout": eventName = "onMouseOut"; break;
//                     case "onmouseup": eventName = "onMouseUp"; break;
//                     case "onmousedown": eventName = "onMouseDown"; break;
//                     case "ondblclick": eventName = "onDblClick"; break;
//                     case "onclick": eventName = "onClick"; break;
//                 }
//                 // console.log(`fire marker ${eventName}`);
//                 me.fireEvent(eventName, {
//                     graphic: me,
//                     mapPoint: me.geometry,
//                     evt: evt
//                 });
//             };
//         }

//         protected fireEvent(type: string, data?: any): void {
//             this.dispatchEvent(type, data);
//             if (this.layer) {
//                 this.layer.dispatchEvent(type, data);
//             }
//         }
//     }
// }
