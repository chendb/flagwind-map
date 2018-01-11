namespace flagwind {

    /**
     * 动画对象
     */
    export abstract class Animation {
        public abstract updateGraphic(): void;
        public abstract get id(): string;
    }

    /**
     * 亮光动画对象
     */
    export class LightingAnimation extends Animation {
        private _fadeIn: boolean;
        private _alpha: number;
        private _id: string;
        public attributes: any;

        public get id(): string {
            return this._id;
        }

        public constructor(item: any, public graphic: any, public options: any) {
            super();
            this.attributes = item;
            this.graphic = graphic;
            this._id = item.id;
            this._alpha = 1;
            this._fadeIn = false;
            this.options = options;
        }

        public updateGraphic(): void {
            if (this._fadeIn) {
                this._alpha += .01;
                if (this._alpha >= 1) {
                    this._alpha = 1;
                    this._fadeIn = false;
                }
            } else {
                this._alpha -= .01;
                if (this._alpha <= 0) {
                    this._alpha = 0;
                    this._fadeIn = true;
                }
            }
            const symbol = this.getSymbol();
            const color = this.getColor();
            color.push(this._alpha);
            symbol.setColor(color);
            this.graphic.setSymbol(symbol);
            this.graphic.draw();
        }

        public getSymbol(): any {
            let markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            markerSymbol.setPath(this.options.path);
            markerSymbol.setSize(this.options.size);
            markerSymbol.setColor(new dojo.Color(this.getColor()));
            markerSymbol.setOutline(null);
            return markerSymbol;
        }

        public getColor(): any {
            let iconColor: any = this.options.color;
            if (!iconColor) {
                iconColor = this.options.getColor(this.attributes);
            }
            if (iconColor.length > 3) {
                iconColor.splice(3, 1);
            }
            return iconColor;
        }

    }

    /**
     * 闪烁星星
     */
    export class StarAnimation extends Animation {
        public id: string;
        public index: number = 0;
        public attributes: any;

        /**
         * 构造函数
         * @param {*} item 实体
         * @param {*} graphic 地图初始要素 
         * @param {height:number,width:number,images:[]} options 动画属性
         */
        public constructor(item: any, public graphic: any, public options: {
            height: number;
            width: number;
            images: Array<any>;
        }) {
            super();
            this.attributes = item;
            this.graphic = graphic;
            this.id = item.id;
            this.index = 0;
            this.options = options;
        }

        public getRandomNum(min: number, max: number) {
            let range = max - min;
            let rand = Math.random();
            return (min + Math.round(rand * range));
        }

        public updateGraphic(): void {
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
        private _timer: number;

        public animations: Array<Animation>;
        public isRunning: boolean;

        public constructor(public options: any) {
            this.isRunning = false;
            this.animations = [];
            this.options = options;
        }

        public getRandomNum(min: number, max: number) {
            let range = max - min;
            let rand = Math.random();
            return (min + Math.round(rand * range));
        }

        public getAnimationId(id: string) {
            const animations = this.animations.filter(g => g.id === id);
            return animations && animations.length > 0 ? animations[0] : null;
        }

        public start() {
            this.isRunning = true;
            let _this = this;
            this._timer = setInterval(() => {
                _this.animations.forEach(g => {
                    const n = _this.getRandomNum(0, 10);
                    if (n > 5) {
                        g.updateGraphic();
                    }
                });
            }, this.options.timeout || 20);

        }

        public stop() {
            this.isRunning = false;
            if (this._timer) {
                clearInterval(this._timer);
            }
        }

        public add(animation: Animation) {
            this.animations.push(animation);
        }

        public removeAnimationById(id: string): void {
            const animation = this.getAnimationId(id);
            if (animation) {
                const i = this.animations.indexOf(animation);
                if (i >= 0) {
                    this.animations.splice(i, 1);
                }
            }
        }

        public clear(): void {
            this.stop();
            this.animations = [];
        }
    }
}
