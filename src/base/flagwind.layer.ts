declare var esri: any;
declare var dojo: any;

/**
 * 底图包装类
 *
 * @export
 * @class FlagwindTiledLayer
 */
export class FlagwindTiledLayer {


    layer: any;
    isShow: boolean = true;

    constructor(public id: string, public url: string|null, public title: string|null) {

        if (url) {
            this.layer = new esri.layers.ArcGISTiledMapServiceLayer(url, { id: id });
        }
    }

    appendTo(map: any) {
        if (this.layer)
            map.addLayer(this.layer);
    }

    show() {
        this.isShow = true;
        this.layer.show();
    }

    hide() {
        this.isShow = false;
        this.layer.hide();
    }
}


/**
 * 功能图层包装类
 *
 * @export
 * @class FlagwindFeatureLayer
 */
export class FlagwindFeatureLayer {


    layer: any;
    isShow: boolean = true;


    constructor(public id: string, public title: string|null) {
        this.id = id;
        this.layer = new esri.layers.GraphicsLayer({ id: id });
    }

    appendTo(map: any) {
        map.addLayer(this.layer);
    }

    get count() {
        if (this.layer)
            return this.layer.graphics.length;
        return 0;
    }

    clear() {
        this.layer.clear();
    }

    show() {
        this.isShow = true;
        this.layer.show();
    }

    hide() {
        this.isShow = false;
        this.layer.hide();
    }


    /**
     * 获取资源要素点
     */
    getGraphicById(key: string) {
        const graphics = this.layer.graphics;
        for (let i = 0; i < graphics.length; i++) {
            const attrs = graphics[i].attributes;
            if (attrs.id === key) {
                return graphics[i];
            }
        }
        return null;
    }

    /**
     * 删除资源要素点
     */
    removeGraphicById(key: string) {
        const graphic = this.getGraphicById(key);
        if (graphic != null) {
            this.layer.remove(graphic);
        }
    }
}

/**
 * 分组图层(用于需要多个要素叠加效果情况)
 * 
 * @export
 * @class FlagwindGroupLayer
 */
export class FlagwindGroupLayer {



    layer: any;
    isShow: boolean = true;



    constructor(public id: string) {
        this.layer = new esri.layers.GraphicsLayer({ id: id });
    }

    get _map() {
        return this.layer._map;
    }

    get graphics() {
        return this.layer.graphics;
    }

    appendTo(map: any) {
        map.addLayer(this.layer);
    }

    clear() {
        this.layer.clear();
    }

    show() {
        this.isShow = true;
        this.layer.show();
    }

    hide() {
        this.isShow = false;
        this.layer.hide();
    }

    setGeometry(name: string, geometry: any) {
        this.getGraphicByName(name).forEach(g => {
            g.setGeometry(geometry);
        });
    }

    setSymbol(name: string, symbol: any) {
        this.getGraphicByName(name).forEach(g => {
            g.setSymbol(symbol);
        });
    }

    showGraphice(name: string) {
        this.getGraphicByName(name).forEach(g => {
            if (g.__symbol) {
                g.setSymbol(g.__symbol);
            }
        });
    }

    hideGraphice(name: string) {
        this.getGraphicByName(name).forEach(g => {
            g.__symbol = g.getSymbol();
            g.setSymbol(null);
        });
    }


    addGraphice(name: string, graphics: any[]) {
        if (graphics == undefined) return;
        graphics.forEach((g, index) => {
            if (g) {
                g.attributes.__master = index == 0;
                g.attributes.__name = name;
                this.layer.add(g);
            }
        });
    }


    getMasterGraphicByName(name: string) {
        (<any[]>this.layer.graphics).forEach(element => {
            if (name == element.attributes.__name && element.__master) {
                return element;
            }
        });
        return null;
    }

    /**
     * 获取资源要素点
     */
    getGraphicByName(name: String) {
        const graphics = [];
        for (let i = 0; i < this.layer.graphics.length; i++) {
            const attrs = this.layer.graphics[i].attributes;
            if (attrs.__name === name) {
                graphics.push(this.layer.graphics[i]);
            }
        }
        return graphics;
    }

    /**
     * 删除资源要素点
     */
    removeGraphicByName(name: string) {
        const graphics = this.getGraphicByName(name);
        if (graphics != null) {
            const _layer = this.layer;
            graphics.forEach(g => {
                _layer.remove(g);
            });

        }
    }
}
