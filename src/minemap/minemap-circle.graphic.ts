/// <reference path="../events/EventProvider" />
namespace flagwind {

    /**
     * 线
     */
    export class MinemapCircleGraphic extends EventProvider implements IMinemapGraphic {

        private _geometry: MinemapCircle;
        private _isInsided: boolean;
        public id: string;
        public attributes: any;
        public isShow: boolean;

        public symbol: any;
        public kind: string = "circle";
        public circle: any;

        public layer: IMinemapGraphicsLayer;

        public get isInsided() {
            return this._isInsided;
        }

        public constructor(options: any) {
            super(null);
            this.id = options.id;
            this.attributes = options.attributes;
            this.symbol = options.symbol;
            this.circle = new minemap.Polyline(options.path, this.symbol);
            this._geometry = new MinemapCircle();
            this._geometry.center = options.center;
            this._geometry.radius = options.radius;
        }

        public show(): void {
            if (!this.layer) {
                throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.circle.addTo(this.layer.map);
            this.isShow = false;
        }
        public hide(): void {
            this.circle.remove();
            this.isShow = false;
        }
        public remove(): void {
            if (this._isInsided) {
                this.circle.remove();
                this._isInsided = false;
            }
        }
        public delete(): void {
            if (this._isInsided) {
                this.circle.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        }
        public setSymbol(symbol: any): void {
            this.symbol = symbol;
            if (this.symbol && this.symbol.strokeColor) {
                this.circle.setStrokeColor(this.symbol.strokeColor);
            }
            if (this.symbol && this.symbol.fillOpacity) {
                this.circle.setFillOpacity(this.symbol.fillOpacity);
            }
            if (this.symbol && this.symbol.strokeOpacity) {
                this.circle.setStrokeOpacity(this.symbol.strokeOpacity);
            }
            if (this.symbol && this.symbol.strokeDashArray) {
                this.circle.setStrokeDashArray(this.symbol.strokeDashArray);
            }
            if (this.symbol && this.symbol.ay) {
                this.circle.ay(this.symbol.ay);
            }
        }
        
        public setGeometry(geometry: MinemapCircle): void {
            this._geometry = geometry;
            this.circle.setCenter(geometry.center);
            this.circle.setRadius(geometry.radius);
        }

        public get geometry() {
            return this._geometry;
        }

        public addTo(map: any): void {
            this._isInsided = true;
            this.circle.addTo(map);
        }
    }

}
