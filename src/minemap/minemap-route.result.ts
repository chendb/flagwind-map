namespace flagwind {
    /**
     * 思维图新路由结果定义
     */
    export class RouteResult {
        public success: boolean;
        public message: string;
        public data: { error: string; rows: Array<RouteRow> };

        public constructor(result: any) {
            console.log(result);
            this.success = (result.errcode ? false : true);
            this.message = result.message;
            if (result.data) {
                this.data = { error: null, rows: null };
                if (result.data.error) {
                    this.data.error = result.data.error;
                }
                if (result.data.rows) {
                    this.data.rows = [];
                    (<Array<any>>result.data.rows).forEach(row => {
                        this.data.rows.push(new RouteRow(row));
                    });
                }
            }
        }

        public getLine(spatial: any) {
            let polyline = new MinemapPolyline(spatial);
            let line: Array<Array<number>> = [];
            if (this.data && this.data.rows) {
                this.data.rows.forEach(row => {
                    let points = row.getPoints(spatial);
                    line = line.concat(points.map(g => [g.x, g.y]));
                });
            }
            polyline.path = line;
            return polyline;
        }
    }
    export class RouteItem {
        public streetName: string;
        public distance: number;
        public duration: number;
        public guide: string;
        public constructor(item: any) {
            if (item.strguide) {
                this.guide = item.strguide;
            }
            this.streetName = item.streetName;
            if (item.distance) {
                this.distance = parseFloat(item.distance);
            }
            if (item.duration) {
                this.duration = parseFloat(item.duration);
            }
        }
    }
    export class RouteRow {

        public center: MinemapPoint;

        public scale: number;

        public distance: number;

        public duration: number;

        public points: Array<Array<any>>;

        public items: Array<RouteItem>;

        public constructor(result: any) {
            if (result.mapinfo) {
                if (result.mapinfo.center) {
                    let xy = result.mapinfo.center.split(",");
                    this.center = new MinemapPoint(parseFloat(xy[0]), parseFloat(xy[1]), null);
                }
                if (result.mapinfo.scale) {
                    this.scale = parseFloat(result.mapinfo.scale);
                }
            }

            if (result.distance) {
                this.distance = parseFloat(result.distance);
            }
            if (result.duration) {
                this.duration = parseFloat(result.duration);
            }
            if (result.routelatlon) {
                this.points = [];
                let xys = result.routelatlon.split(";");
                for (let i = 0; i < xys.length; i++) {
                    if (xys[i]) {
                        let xy = xys[i].split(",");
                        this.points.push([parseFloat(xy[0]), parseFloat(xy[1])]);
                    }
                }
            }
            if (result.routes) {
                this.items = [];
                (<Array<any>>result.routes.item).forEach(item => {
                    this.items.push(new RouteItem(item));
                });
            }
        }

        public getPoints(spatial: any): Array<MinemapPoint> {
            let mps: Array<MinemapPoint> = [];
            this.points.forEach(g => {
                mps.push(new MinemapPoint(g[0], g[1], spatial));
            });
            return mps;
        }

        public getLine(spatial: any) {
            let polyline = new MinemapPolyline(spatial);
            let line: Array<Array<number>> = [];
            this.points.forEach(g => {
                line.push([g[0], g[1]]);
            });
            polyline.path = line;
            return polyline;
        }

    }
}
