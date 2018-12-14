
namespace flagwind {

    /**
     * 线
     */
    export class MinemapPolylineGraphic extends EventProvider implements IMinemapGraphic {

        private _geometry: MinemapPolyline;
        private _isInsided: boolean;
        public id: string;
        public attributes: any = {};
        public isShow: boolean;

        public symbol: any;
        public kind: string = "polyline";
        public polyline: any;

        public layer: IMinemapGraphicsLayer;

        public get isInsided() {
            return this._isInsided;
        }

        public constructor(layer: IMinemapGraphicsLayer, options: any) {
            super(null);
            this.layer = layer;
            this.id = options.id;
            this.attributes = { ...this.attributes, ...options.attributes };
            this.symbol = options.symbol;
            if (options.geometry) {
                this._geometry = options.geometry;
            } else {
                this._geometry = new MinemapPolyline();
            }
            let path = this._geometry.path;
            if (options.path) {
                path = options.path;
            }

            this.polyline = new minemap.Polyline(path, this.symbol);
            this._geometry.path = path;
        }

        public show(): void {
            if (!this.layer) {
                throw new Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.polyline.addTo(this.layer.map);
            this.isShow = false;
        }
        public hide(): void {
            this.polyline.remove();
            this.isShow = false;
        }
        public remove(): void {
            if (this._isInsided) {
                this.polyline.remove();
                this._isInsided = false;
            }
        }
        public delete(): void {
            if (this._isInsided) {
                this.polyline.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        }
        public setSymbol(symbol: any): void {
            this.symbol = symbol;
            if (this.symbol && this.symbol.strokeColor) {
                this.polyline.setStrokeColor(this.symbol.strokeColor);
            }
            if (this.symbol && this.symbol.opacity) {
                this.polyline.setOpacity(this.symbol.opacity);
            }
            if (this.symbol && this.symbol.strokeDashArray) {
                this.polyline.setStrokeDashArray(this.symbol.strokeDashArray);
            }
        }
        public setGeometry(geometry: MinemapPolyline): void {
            this._geometry = geometry;
            this.polyline.setPath(geometry.path);
        }

        public get geometry() {
            return this._geometry;
        }

        public addTo(map: any): void {
            this._isInsided = true;
            this.polyline.addTo(map);
        }

        public setAngle(angle: number) {
            throw new Exception("未实现setAngle方法");
        }
    }

}
