namespace flagwind {

    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     * 
     * @export
     * @class FlagwindGroupLayer
     */
    export abstract class FlagwindGroupLayer extends EventProvider implements IFlagwindSingleLayer {

        public layer: any;
        public isShow: boolean = true;

        public constructor(public options: any) {
            super();
            this.layer = this.onCreateGraphicsLayer(options);
        }

        public get graphics(): Array<any> {
            return this.layer.graphics;
        }

        public appendTo(map: any) {
            this.layer.addToMap(map);
        }

        public removeLayer(map: any) {
            this.layer.removeFormMap(map);
        }

        public clear() {
            this.layer.clear();
        }

        public show() {
            this.isShow = true;
            this.layer.show();
        }

        public hide() {
            this.isShow = false;
            this.layer.hide();
        }

        public setGeometry(name: string, geometry: any) {
            this.getGraphicByName(name).forEach(g => {
                g.setGeometry(geometry);
            });
        }

        public setSymbol(name: string, symbol: any) {
            this.getGraphicByName(name).forEach(g => {
                g.setSymbol(symbol);
            });
        }

        public showGraphic(name: string) {
            this.getGraphicByName(name).forEach(g => {
                g.show();
            });
        }

        public hideGraphic(name: string) {
            this.getGraphicByName(name).forEach(g => {
                g.hide();
            });
        }

        public addGraphic(name: string, ...graphics: Array<any>) {
            if (graphics === undefined) return;
            graphics.forEach((g, index) => {
                if (g) {
                    let item = g.attributes;
                    item.__master = index === 0;
                    item.__name = name;
                    this.layer.add(g);
                }
            });
        }

        public getMasterGraphicByName(name: string): any {
            this.graphics.forEach(element => {
                let item = element.attributes;
                if (name === item.__name && item.__master) {
                    return element;
                }
            });
            return null;
        }

        /**
         * 获取资源要素点
         */
        public getGraphicByName(name: String): Array<any> {
            const list = [];
            for (let i = 0; i < this.graphics.length; i++) {
                let attrs = this.graphics[i].attributes;
                if (attrs.__name === name) {
                    list.push(this.graphics[i]);
                }
            }
            return list;
        }

        /**
         * 删除资源要素点
         */
        public removeGraphicByName(name: string) {
            const graphics = this.getGraphicByName(name);
            if (graphics != null) {
                graphics.forEach(g => {
                    this.layer.remove(g);
                });
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

        public abstract onCreateGraphicsLayer(options: any): any;

    }
}
