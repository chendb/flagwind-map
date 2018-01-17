namespace flagwind {

    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     * 
     * @export
     * @class FlagwindGroupLayer
     */
    export abstract class FlagwindGroupLayer {
        public layer: any;
        public isShow: boolean = true;

        public constructor(public id: string) {
            this.layer = this.onCreateGraphicsLayer({ id: id });
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

        public addGraphice(name: string, graphics: Array<any>) {
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

        public abstract onCreateGraphicsLayer(args: any): any;

    }
}
