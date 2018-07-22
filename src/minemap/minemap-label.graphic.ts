/// <reference path="../events/EventProvider" />
namespace flagwind {

    /**
     * 文本
     */
    export class MinemapLabelGraphic extends EventProvider implements IMinemapGraphic {

        private _geometry: MinemapPoint;
        private _isInsided: boolean;
        public id: string;
        public attributes: any;
        public isShow: boolean;

        public symbol: any;
        public kind: string = "label";
        public label: any;

        public layer: IMinemapGraphicsLayer;

        public get isInsided() {
            return this._isInsided;
        }

        public constructor(options: any) {
            super(null);
            this.id = options.id;
            this.attributes = options.attributes;
            this.symbol = options.symbol;
            if (options.point) {
                this._geometry = new MinemapPoint(options.point.x, options.point.y);
            }
            if (options.geometry) {
                this._geometry = options.geometry;
            }
            this.label = new minemap.Symbol([this._geometry.x, this._geometry.y], options.symbol);
        }

        public get geometry(): MinemapPoint {
            return this._geometry;
        }

        public set geometry(geometry: MinemapPoint) {
            this._geometry = geometry;
            this.label.setPoint([geometry.x, geometry.y]);
        }

        public show(): void {
            if (!this.layer) {
                throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.label.addTo(this.layer.map);
            this.isShow = false;
        }
        public hide(): void {
            this.label.remove();
            this.isShow = false;
        }
        public remove(): void {
            if (this._isInsided) {
                this.label.remove();
                this._isInsided = false;
            }
        }
        public delete(): void {
            if (this._isInsided) {
                this.label.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        }
        public setSymbol(symbol: any): void {
            this.symbol = symbol;
            if (this.symbol && this.symbol.textColor) {
                this.label.setTextColor(this.symbol.textColor);
            }
            if (this.symbol && this.symbol.textOffset) {
                this.label.setTextOffset(this.symbol.textOffset);
            }
            if (this.symbol && this.symbol.text) {
                this.label.setText(this.symbol.text);
            }
            if (this.symbol && this.symbol.icon) {
                this.label.setIcon(this.symbol.icon);
            }
            if (this.symbol && this.symbol.symbolSize) {
                this.label.setSymbolSize(this.symbol.symbolSize);
            }
            if (this.symbol && this.symbol.opacity) {
                this.label.setOpacity(this.symbol.opacity);
            }
        }
        public setGeometry(geometry: MinemapPoint): void {
            this._geometry = geometry;
            this.label.setPoint([geometry.x, geometry.y]);
        }
        public addTo(map: any): void {
            this._isInsided = true;
            this.label.addTo(map);
        }

        public setAngle(angle: number) {
            throw new Exception("未实现setAngle方法");
        }
    }

}
