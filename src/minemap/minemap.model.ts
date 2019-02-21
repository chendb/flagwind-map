
namespace flagwind {

    /**
     * 几何对象
     */
    export abstract class MinemapGeometry {

        public attributes: any;

        public constructor(
            public type: string,
            public spatial: MinemapSpatial
        ) {

        }

        public abstract toJson(): any;

    }
    /**
     * 线
     */
    export class MinemapPolyline extends MinemapGeometry {

        public path: Array<Array<number>> = [];
        public constructor(spatial: MinemapSpatial = null) {
            super("Polyline", spatial);
        }

        public getPoint(pointIndex: number) {

            return this.path[pointIndex];
        }

        public insertPoint(pointIndex: number, point: Array<number>) {
            this.path.splice(pointIndex, 0, point);
        }

        public removePoint(pointIndex: number) {
            this.path.splice(pointIndex, 1);
        }

        public toJson() {

            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": this.path
                    }
                }
            };
        }
    }
    /**
     * 面
     */
    export class MinemapPolygon extends MinemapGeometry {

        public rings: Array<Array<Array<number>>> = [];
        public constructor(spatial: MinemapSpatial = null) {
            super("Line", spatial);
        }

        public addRing(path: Array<Array<number>>) {
            this.rings.push(path);
        }

        public removeRing(ringIndex: number) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings = this.rings.splice(ringIndex, 1);
        }

        public getPoint(ringIndex: number, pointIndex: number) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            return this.rings[ringIndex][pointIndex];
        }

        public insertPoint(ringIndex: number, pointIndex: number, point: Array<number>) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings[ringIndex].splice(pointIndex, 0, point);
        }

        public removePoint(ringIndex: number, pointIndex: number) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings[ringIndex].splice(pointIndex, 1);
        }

        /**
         * 判断点是否在圆里面
         * @param point 点 
         */
        public inside(point: Array<any>) {

            let x = point[0], y = point[1];
            let vs = this.rings[0];

            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                let xi = vs[i][0], yi = vs[i][1];
                let xj = vs[j][0], yj = vs[j][1];

                let intersect = ((yi > y) !== (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }

            return inside;
        }

        public toJson() {

            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": this.rings
                    }
                }
            };
        }
    }

    /**
     * 圆
     */
    export class MinemapCircle extends MinemapGeometry {

        public center: Array<number> = [];
        public radius: number;

        public constructor(spatial: MinemapSpatial = null) {
            super("Circle", spatial);
        }

        public toJson() {

            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {
                        radius: this.radius
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": this.center
                    }
                }
            };
        }

        /**
         * 判断点是否在圆里面
         * @param point 点 
         */
        public inside(point: Array<any>) {
            let from = new MinemapPoint(this.center[0], this.center[1]);
            let to = new MinemapPoint(point[0], point[1]);
            const units = "meters";
            let distance = MinemapUtils.getLength(from, to, units);
            return distance <= this.radius;

            // let offsetX = point[0] - this.center[0];
            // let offsetY = point[1] - this.center[1];
            // let offsetR = (1 / 2) * Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            // let x = Math.sin(offsetX / offsetR) * this.radius;
            // let y = Math.sin(offsetY / offsetR) * this.radius;

            // if (offsetX * (x - point[0]) < 0) return false;
            // if (offsetY * (y - point[1]) < 0) return false;
            // return true;
        }
    }

    /**
     * 坐标点
     */
    export class MinemapPoint extends MinemapGeometry {

        public constructor(
            public x: number,
            public y: number,
            public spatial: MinemapSpatial = null
        ) {
            super("Point", spatial);
        }

        public toJson() {
            return {
                "type": "Feature",
                "properties": this.attributes || {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [this.x, this.y]
                }
            };
        }
    }

    /**
     * 空间投影
     */
    export class MinemapSpatial {
        public constructor(
            public wkid: number
        ) {

        }
    }

    export interface IMinemapGraphic extends FlagwindGraphic{

        id: string;

        attributes: any;

        isShow: boolean;

        isInsided: boolean;

        kind: string;

        layer: IMinemapGraphicsLayer;

        show(): void;

        hide(): void;

        remove(): void;

        delete(): void;

        setSymbol(symbol: any): void;

        setGeometry(geometry: MinemapGeometry): void;

        addTo(map: any): void;

    }
}
