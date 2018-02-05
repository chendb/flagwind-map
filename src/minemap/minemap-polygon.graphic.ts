/// <reference path="../events/EventProvider" />
namespace flagwind {

    /**
     * 面
     */
    export class MinemapPolygonGraphic extends EventProvider implements IMinemapGraphic {

        private _geometry: MinemapPolygon;
        private _isInsided: boolean;
        public id: string;
        public attributes: any = {};
        public isShow: boolean;

        public symbol: any;
        public kind: string = "polygon";
        public polygon: any;

        public layer: IMinemapGraphicsLayer;

        public get isInsided() {
            return this._isInsided;
        }

        public constructor(options: any) {
            super(null);
            this.id = options.id;
            this.attributes = { ...this.attributes, ...options.attributes };
            this.symbol = options.symbol;
            this.polygon = new minemap.Polygon(options.path, this.symbol);
            this._geometry = new MinemapPolygon();
            this._geometry.addRing(options.path);
        }

        public show(): void {
            if (!this.layer) {
                throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.polygon.addTo(this.layer.map);
            this.isShow = false;
        }
        public hide(): void {
            this.polygon.remove();
            this.isShow = false;
        }
        public remove(): void {
            if (this._isInsided) {
                this.polygon.remove();
                this._isInsided = false;
            }
        }
        public delete(): void {
            if (this._isInsided) {
                this.polygon.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        }
        public setSymbol(symbol: any): void {
            this.symbol = symbol;
            if (this.symbol && this.symbol.strokeColor) {
                this.polygon.setStrokeColor(this.symbol.strokeColor);
            }
            if (this.symbol && this.symbol.fillOpacity) {
                this.polygon.setFillOpacity(this.symbol.fillOpacity);
            }
            if (this.symbol && this.symbol.strokeOpacity) {
                this.polygon.setStrokeOpacity(this.symbol.strokeOpacity);
            }
            if (this.symbol && this.symbol.strokeDashArray) {
                this.polygon.setStrokeDashArray(this.symbol.strokeDashArray);
            }
            if (this.symbol && this.symbol.ay) {
                this.polygon.ay(this.symbol.ay);
            }

        }
        public setGeometry(geometry: MinemapPolygon): void {
            this._geometry = geometry;
            if (geometry.rings.length > 0) {
                this.polygon.setPath(geometry.rings[0]);
            } else {
                this.polygon.setPath([]);
            }
        }
        public addTo(map: any): void {
            this._isInsided = true;
            this.polygon.addTo(map);
        }
    }

}
