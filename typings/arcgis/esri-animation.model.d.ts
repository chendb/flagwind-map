declare namespace flagwind {
    /**
     * 动画对象
     */
    abstract class Animation {
        abstract updateGraphic(): void;
        readonly abstract id: string;
    }
    /**
     * 亮光动画对象
     */
    class LightingAnimation extends Animation {
        graphic: any;
        options: any;
        private _fadeIn;
        private _alpha;
        private _id;
        attributes: any;
        readonly id: string;
        constructor(item: any, graphic: any, options: any);
        updateGraphic(): void;
        getSymbol(): any;
        getColor(): any;
    }
    /**
     * 闪烁星星
     */
    class StarAnimation extends Animation {
        graphic: any;
        options: {
            height: number;
            width: number;
            images: Array<any>;
        };
        id: string;
        index: number;
        attributes: any;
        /**
         * 构造函数
         * @param {*} item 实体
         * @param {*} graphic 地图初始要素
         * @param {height:number,width:number,images:[]} options 动画属性
         */
        constructor(item: any, graphic: any, options: {
            height: number;
            width: number;
            images: Array<any>;
        });
        getRandomNum(min: number, max: number): number;
        updateGraphic(): void;
    }
    /**
     * 动画图层
     */
    class AnimationLayer {
        options: any;
        private _timer;
        animations: Array<Animation>;
        isRunning: boolean;
        constructor(options: any);
        getRandomNum(min: number, max: number): number;
        getAnimationId(id: string): Animation;
        start(): void;
        stop(): void;
        add(animation: Animation): void;
        removeAnimationById(id: string): void;
        clear(): void;
    }
}
