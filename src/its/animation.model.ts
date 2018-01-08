declare var esri: any;
declare var dojo: any;
declare var dijit: any;


export class Animation {
    updateGraphic(): void {
        throw new Error("Method not implemented.");
    }
    public id: string;
}


export class LightingAnimation extends Animation {
    fadeIn: boolean;
    alpha: number;
    id: string;
    attributes: any;

    constructor(item: any, public graphic: any, public options: any) {
        super();
        this.attributes = item;
        this.graphic = graphic;
        this.id = item.id;
        this.alpha = 1;
        this.fadeIn = false;
        this.options = options;
    }

    updateGraphic() {
        if (this.fadeIn) {
            this.alpha += .01;
            if (this.alpha >= 1) {
                this.alpha = 1;
                this.fadeIn = false;
            }
        } else {
            this.alpha -= .01;
            if (this.alpha <= 0) {
                this.alpha = 0;
                this.fadeIn = true;
            }
        }
        const symbol = this.getSymbol();
        const color = this.getColor();
        color.push(this.alpha);
        symbol.setColor(color);
        this.graphic.setSymbol(symbol);
        this.graphic.draw();
    }


    getSymbol() {
        //const iconPath = "M512 224c160 0 288 128 288 288s-128 288-288 288-288-128-288-288 128-288 288-288z"; //"M518.4 960c-249.6 0-448-198.4-448-448 0-249.6 198.4-448 448-448s448 198.4 448 448C966.4 761.6 768 960 518.4 960zM518.4 262.4C384 262.4 268.8 377.6 268.8 512s108.8 249.6 249.6 249.6c134.4 0 249.6-108.8 249.6-249.6S659.2 262.4 518.4 262.4z";
        var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
        markerSymbol.setPath(this.options.path);
        markerSymbol.setSize(this.options.size);
        markerSymbol.setColor(new dojo.Color(this.getColor()));
        markerSymbol.setOutline(null);
        return markerSymbol;
    }

    getColor() {
        let iconColor = this.options.color;
        if (!iconColor) {
            iconColor = this.options.getColor(this.attributes);
        } if (iconColor.length > 3) {
            iconColor.splice(3, 1);
        }
        return iconColor;
    }

}


/**
 * 闪烁星星
 */
export class StarAnimation extends Animation {
    index: number;
    id: string;
    attributes: any;

    /**
     * 构造函数
     * @param {*} item 实体
     * @param {*} graphic 地图初始要素 
     * @param {height:number,width:number,images:[]} options 动画属性
     */
    constructor(item: any, public graphic: any, public options: { height: number, width: number, images: any[] }) {
        super();
        this.attributes = item;
        this.graphic = graphic;
        this.id = item.id;
        this.index = 0;
        this.options = options;


    }

    getRandomNum(min: number, max: number) {
        let range = max - min;
        var rand = Math.random();
        return (min + Math.round(rand * range));
    }

    updateGraphic() {
        const iconUrl = this.options.images[this.index];
        const width = this.options.width || 48;
        const height = this.options.height || 48;
        const symbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
        this.graphic.setSymbol(symbol);
        this.index = ((this.index + 1) % this.options.images.length);
        this.graphic.draw();
    }


}


/**
 * 动画图层
 */
export class AnimationLayer {
    timer: number;

    animations: Animation[];
    isRunning: boolean;

    constructor(public options: any) {
        this.isRunning = false;
        this.animations = [];
        this.options = options;
    }

    getRandomNum(min: number, max: number) {
        let range = max - min;
        var rand = Math.random();
        return (min + Math.round(rand * range));
    }

    getAnimationId(id: string) {
        const animation = this.animations.find(g => g.id == id);
        return animation;
    }

    start() {
        this.isRunning = true;
        let _this = this;
        this.timer = setInterval(() => {
            _this.animations.forEach(g => {
                const n = _this.getRandomNum(0, 10);
                if (n > 5)
                    g.updateGraphic();
            });
        }, this.options.timeout || 20);

    }

    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    add(animation:Animation) {
        this.animations.push(animation);
    }


    removeAnimationById(id:string) {
        const animation = this.getAnimationId(id);
        if (animation) {
            const i = this.animations.indexOf(animation);
            if (i >= 0) {
                this.animations.splice(i, 1);
            }
        }
    }

    clear() {
        this.stop();
        this.animations = [];
    }

}