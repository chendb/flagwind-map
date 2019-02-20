/// <reference path="../events/EventProvider.ts" />
namespace flagwind {

    export interface IMinemapGraphicsLayer {
        map: any;
        graphics: Array<IMinemapGraphic>;
        show(): void;
        hide(): void;
        add(graphic: any): void;
        remove(graphic: any): void;
        appendTo(map: any): void;
        removeLayer(map: any): void;
        on(eventName: string, callBack: Function): void;
        dispatchEvent(type: string, data?: any): void;
    }

    export class MinemapGraphicsLayer extends EventProvider implements IMinemapGraphicsLayer {

        private GRAPHICS_MAP: Map<string, IMinemapGraphic> = new Map<string, IMinemapGraphic>();

        /**
         * 是否在地图上
         */
        public _isInsided: boolean = false;
        public isShow: boolean = true;
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
            this.GRAPHICS_MAP.forEach(g => {
                if (!g.value.isShow) {
                    g.value.show();
                }
            });
            this.isShow = true;
        }

        public hide(): void {
            this.GRAPHICS_MAP.forEach(g => {
                if (g.value.isShow) {
                    g.value.hide();
                }
            });
            this.isShow = true;
        }

        public remove(graphic: IMinemapGraphic) {
            this.GRAPHICS_MAP.delete(graphic.attributes.id);
            if (graphic.isInsided) {
                graphic.delete();
            }
        }

        public clear(): void {
            this.GRAPHICS_MAP.forEach(g => g.value.remove());
            this.GRAPHICS_MAP.clear();
        }

        public add(graphic: IMinemapGraphic): void {
            this.GRAPHICS_MAP.set(graphic.attributes.id, graphic);
            graphic.layer = this;
            if (this.map) {
                graphic.addTo(this.map);
            }
        }

        public appendTo(map: any): void {
            return this.addToMap(map);
        }

        public removeLayer(map: any): void {
            return this.removeFromMap(map);
        }

        public addToMap(map: any): void {
            if (!this.map) {
                this.GRAPHICS_MAP.forEach(g => {
                    g.value.addTo(map);
                });
            }
            this.map = map;
            this.isShow = true;
            this._isInsided = true;
        }

        public removeFromMap(map: any) {
            this.GRAPHICS_MAP.forEach(g => {
                g.value.remove();
            });
            this._isInsided = false;
        }
    }

}
