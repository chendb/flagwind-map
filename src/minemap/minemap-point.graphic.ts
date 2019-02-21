
namespace flagwind {
    export class MinemapPointGraphic extends EventProvider implements IMinemapGraphic {

        private _kind: string = "point";
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
        public icon: any;

        public attributes: any;

        public layer: IMinemapGraphicsLayer;

        public constructor(options: any) {
            super();
            this.id = options.id;

            this.symbol = options.symbol ? options.symbol : {};
            this.attributes = options.attributes ? options.attributes : {};
            this.icon = options.icon;
            if ((!this.icon) && this.symbol.imageUrl) {
                this.icon = new minemap.Icon({ imageUrl: this.symbol.imageUrl, imageSize: this.symbol.imageSize, imgOffset: this.symbol.imageOffset });
            }
            this.marker = new minemap.Marker(this.icon, { /* offset: [-10, -14] */ });
            this.element = this.marker.getElement();
            if (options.point) {
                this.geometry = new MinemapPoint(options.point.x, options.point.y, options.point.spatial);
            }
            if (options.geometry) {
                this.geometry = options.geometry;
            }
            if (options && options.className) {
                this.addClass(options.className);
                this.symbol.className = "";
            }
            if (options.symbol && options.symbol.className) {
                this.addClass(options.symbol.className);
                this.symbol.className = "";
            }
        }

        public addClass(className: string) {
            this.symbol.className = className;
            if (className === " " || className === null || className === undefined) {
                return;
            }
            let classList = className.split(" ");
            for (let i = 0; i < classList.length; i++) {
                this.marker.getElement().classList.add(classList[i]);
            }
        }

        public removeClass(className: string) {
            if (className === " " || className === null || className === undefined) {
                return;
            }
            let classList = className.split(" ");
            for (let i = 0; i < classList.length; i++) {
                this.marker.getElement().classList.remove(classList[i]);
            }
        }

        /**
         * 复制节点
         * @param id 元素ID
         */
        public clone(id: string) {
            let m = new MinemapPointGraphic({
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

        public show(): void {
            if (!this.layer) {
                throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            // this.marker.addTo(this.layer.map);
            this.addTo(this.layer.map);
            this.isShow = true;
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
            this.marker.getElement().style.transform = `rotate(${angle}deg)`;
            this.marker.getElement().style["-ms-transform"] = `rotate(${angle}deg)`;
            this.marker.getElement().style["-moz-transform"] = `rotate(${angle}deg)`;
            this.marker.getElement().style["-webkit-transform"] = `rotate(${angle}deg)`;
            this.marker.getElement().style["-o-transform"] = `rotate(${angle}deg)`;

            let routeCar = this.marker.getElement().querySelector(".graphic-moving .minemap-icon");
            if(routeCar) {
                routeCar.style.transform = `rotate(${angle}deg)`;
            }
        }

        public setSymbol(symbol: any): void {

            if (symbol.className) {
                // 先删除之前的样式
                if (this.symbol && this.symbol.className) {
                    this.removeClass(this.symbol.className);
                }
                this.addClass(symbol.className);
            }
            if (symbol.icon) {
                this.marker.setIcon(symbol.icon);
            }
            if (symbol.imageUrl) {
                this.icon.setImageUrl(symbol.imageUrl);
            }
            if (symbol.title) {
                this.marker.setTitle(symbol.title);
            }
            if (symbol.titleFontSize) {
                this.marker.setTitleFontSize(symbol.titleFontSize);
            }
            if (symbol.titleColor) {
                this.marker.setTitleColor(symbol.titleColor);
            }
            if (symbol.titleColor) {
                this.marker.setTitleColor(symbol.titleColor);
            }
            if (symbol.titlePosition) {
                this.marker.setTitlePosition(symbol.titlePosition);
            }
            this.symbol = { ...this.symbol, ...symbol };
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

            this.marker.on("mouseover", (args: any) => {
                console.log("fire marker onMouseOver");
                this.fireEvent("onMouseOver", {
                    graphic: this,
                    mapPoint: this.geometry,
                    orgion: args
                });
            });

            this.marker.on("mouseout", (args: any) => {
                console.log("fire marker onMouseOut");
                this.fireEvent("onMouseOut", {
                    graphic: this,
                    mapPoint: this.geometry,
                    orgion: args
                });
            });

            this.marker.on("mouseup", (args: any) => {
                console.log("fire marker onMouseUp");
                this.fireEvent("onMouseUp", {
                    graphic: this,
                    mapPoint: this.geometry,
                    orgion: args
                });
            });

            this.marker.on("mousedown", (args: any) => {
                console.log("fire marker onMouseDown");
                this.fireEvent("onMouseDown", {
                    graphic: this,
                    mapPoint: this.geometry,
                    orgion: args
                });
            });

            this.marker.on("dblclick", (args: any) => {
                console.log("fire marker onClick");
                this.fireEvent("onDblClick", {
                    graphic: this,
                    mapPoint: this.geometry,
                    orgion: args
                });
            });
            this.marker.on("click", (args: any) => {
                console.log("fire marker onClick");
                this.fireEvent("onClick", {
                    graphic: this,
                    mapPoint: this.geometry,
                    orgion: args
                });
            });
        }

        protected fireEvent(type: string, data?: any): void {
            this.dispatchEvent(type, data);
            if (this.layer) {
                this.layer.dispatchEvent(type, data);
            }
        }

        public static getStandardSymbol(options: any): { imageUrl: string; imageSize: Array<number>; imageOffset: Array<number>; className: string } {
            let imageSize = [20, 28];
            let imageOffset = [-imageSize[0] / 2, -imageSize[1] / 2];
            let markerUrl = null;
            let markerClassName = null;
            if (options.symbol) {
                markerClassName = options.symbol.className || "graphic-point";
                markerUrl = options.symbol.imageUrl || options.symbol.image;
                if (options.symbol.size) {
                    if (options.symbol.size instanceof Array) {
                        imageSize = options.symbol.size;
                    } else {
                        imageSize[0] = options.symbol.size.width;
                        imageSize[1] = options.symbol.size.heigth;
                    }
                } else if (options.symbol.width !== undefined && options.symbol.heigth !== undefined) {
                    imageSize[0] = options.symbol.width;
                    imageSize[1] = options.symbol.heigth;
                }
                if (options.symbol.offset) {
                    if (
                        options.symbol.offset instanceof Array
                    ) {
                        imageOffset = options.symbol.offset;
                    } else if (options.offset.x !== undefined && options.offset.y !== undefined) {
                        imageOffset[0] = options.symbol.offset.x;
                        imageOffset[1] = options.symbol.offset.y;
                    }
                }
            }
            return {
                imageUrl: markerUrl,
                imageSize: imageSize,
                imageOffset: imageOffset,
                className: markerClassName
            };
        }
    }
}
