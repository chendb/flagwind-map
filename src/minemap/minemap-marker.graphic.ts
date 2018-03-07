
namespace flagwind {
    export class MinemapMarkerGraphic extends EventProvider implements IMinemapGraphic {

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
                this.icon = new minemap.Icon({ imageUrl: this.symbol.imageUrl });
            }
            this.marker = new minemap.Marker(this.icon, { offset: [-10, -14] });
            this.element = this.marker.getElement();
            if (options.point) {
                this.geometry = new MinemapPoint(options.point.x, options.point.y);
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
            let m = new MinemapMarkerGraphic({
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
            let me = this;
            this.marker.on("mouseover", function (args: any) {
                console.log("fire marker onMouseOver");
                me.fireEvent("onMouseOver", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            });

            this.marker.on("mouseout", function (args: any) {
                console.log("fire marker onMouseOut");
                me.fireEvent("onMouseOut", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            });

            this.marker.on("mouseup", function (args: any) {
                console.log("fire marker onMouseUp");
                me.fireEvent("onMouseUp", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            });

            this.marker.on("mousedown", function (args: any) {
                console.log("fire marker onMouseDown");
                me.fireEvent("onMouseDown", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            });

            this.marker.on("dblclick", function (args: any) {
                console.log("fire marker onClick");
                me.fireEvent("onDblClick", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            });
            this.marker.on("click", function (args: any) {
                console.log("fire marker onClick");
                me.fireEvent("onClick", {
                    graphic: me,
                    mapPoint: me.geometry,
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
    }
}
