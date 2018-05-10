namespace flagwind {
    export class MinemapRouteLayer extends FlagwindRouteLayer {

        public onSetSegmentByLine(options: any, segment: TrackSegment) {
            segment.polyline = options.polyline;
            segment.length = options.length;
            if (segment.polyline.path && segment.polyline.path.length > 0) {
                // 每公里抽取的点数
                let numsOfKilometer = segment.options.numsOfKilometer;

                segment.line = MapUtils.vacuate([segment.polyline.path], segment.length, numsOfKilometer);
            }
        }

        public onSetSegmentByPoint(options: any, segment: TrackSegment) {
            let points = options.points;
            let length = options.length || MinemapUtils.distance(points);
            let numsOfKilometer = segment.options.numsOfKilometer;
            const polyline = new MinemapPolyline();
            const line: Array<any> = [];
            for (let i = 0; i < points.length - 1; i++) {
                const start = points[i], end = points[i + 1];
                const tmppoints = MapUtils.density(start, end, length * numsOfKilometer);
                tmppoints.forEach(g => {
                    line.push([g.x, g.y]);
                });
            }
            polyline.path = line;
            segment.length = length;
            segment.polyline = polyline;
            segment.line = MapUtils.vacuate([segment.polyline.path], segment.length, numsOfKilometer);
        }

        public onCreateMovingLayer(id: string): FlagwindGroupLayer {
            return new MinemapGroupLayer({
                id: id,
                kind: "marker"
            });
        }

        public onCreateLineLayer(id: string): FlagwindGroupLayer {
            return new MinemapGroupLayer({
                id: id,
                kind: "geojson"
            });
        }

        public onEqualGraphic(originGraphic: any, targetGraphic: any): boolean {
            if (originGraphic == null || targetGraphic == null) return false;
            return originGraphic.geometry.x !== targetGraphic.geometry.x
                || originGraphic.geometry.y !== targetGraphic.geometry.y;
        }
        public onShowSegmentLine(segment: TrackSegment): void {
            let lineGraphic = new MinemapPolylineGraphic(this.moveLineLayer.layer, {
                id: segment.name + "_" + segment.index,
                geometry: segment.polyline,
                attributes: {
                    id: segment.name + "_" + segment.index
                },
                symbol: { strokeDashArray: [1, 1] }
            });
            segment.lineGraphic = lineGraphic;
            this.moveLineLayer.addGraphic(segment.name, lineGraphic);
        }

        public onGetStandardStops(name: String, stops: Array<any>): Array<any> {
            let list: Array<MinemapMarkerGraphic> = [];
            if (stops == null || stops.length === 0) return list;
            stops.forEach(g => {
                if (g instanceof MinemapMarkerGraphic) {
                    g.attributes.__type = "stop";
                    g.attributes.__line = name;
                    list.push(g);
                } else {
                    throw new Error("未知的停靠点定义.");
                }
            });
            return list;
        }

        /**
         * 由路由服务来路径规划
         * @param segment 路段
         * @param start 开始结点
         * @param end 结束结点
         * @param waypoints  经过点
         */
        public onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void {
            let startXY = segment.startGraphic.geometry.x + "," + segment.startGraphic.geometry.y;
            let endXY = segment.endGraphic.geometry.x + "," + segment.endGraphic.geometry.y;
            let wayXY: string = null;
            if (waypoints) {
                // wayXY = waypoints.map(g => `${ g.geometry.x },${ g.geometry.y }`).join(",");
                wayXY = waypoints.join(",");
            }

            const me = this;
            minemap.service.queryRouteDrivingResult3(startXY, endXY, wayXY, 2, "", function (error: any, results: any) {
                if (error) {
                    me.errorHandler(error, segment);
                } else {
                    if (results.errcode === 0 && results.data) {
                        let routeResult = new RouteResult(results);
                        me.solveComplete({
                            polyline: routeResult.getLine(me.spatial),
                            length: routeResult.data.rows[0].distance
                        }, segment);
                    } else {
                        me.errorHandler(results.errmsg, segment);
                    }
                }
            });

        }

        /**
         * 由点点连线进行路径规划
         * @param segment 路段
         */
        public onSolveByJoinPoint(segment: TrackSegment): void {
            const points = [];
            points.push(segment.startGraphic.geometry);

            if (segment.waypoints) {
                for (let i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }

            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setMultPoints(points);
        }

        public onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number) {
            let markerUrl = trackline.options.symbol.imageUrl || trackline.options.markerUrl || this.options.markerUrl || this.options.movingImageUrl;
            let marker = new MinemapMarkerGraphic({
                id: trackline.name,
                symbol: {
                    imageUrl: markerUrl,
                    className: "graphic-moving"
                },
                point: graphic.geometry,
                attributes: graphic.attributes
            });
            trackline.markerGraphic = marker;
            this.moveMarkLayer.addGraphic(trackline.name, marker);
            // document.querySelector(".minemap-icon").classList.add("route-car");
        }
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        protected onChangeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number) {
            if (trackline === undefined) return;
            trackline.markerGraphic.setAngle(360 - angle);
            trackline.markerGraphic.setGeometry(point);
        }
    }
}
