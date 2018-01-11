namespace flagwind {

    export class EsriRouteService {

        public constructor(
            public flagwindRouteLayer: FlagwindRouteLayer
        ) {

        }

        public showSegmentLine(segment: TrackSegment) {
            let playedLineSymbol = new esri.symbol.CartographicLineSymbol(
                esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);

            segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
                type: "segment",
                index: segment.index,
                line: segment.name
            });
            this.flagwindRouteLayer.moveLineLayer.addGraphice(segment.name, [segment.lineGraphic]);
            // this.moveLineLayer.add(segment.lineGraphic);
        }

        /**
         * 由连线求解轨迹
         * @param segment
         */
        public solveByJoinPoint(segment: TrackSegment) {
            const points = [];
            points.push(segment.startGraphic.geometry);

            if (segment.waypoints) {
                for (let i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }

            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setLine(points);
        }

        public solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>) {
            const routeTask = new esri.tasks.RouteTask(this.flagwindRouteLayer.options.routeUrl);
            const routeParams = new esri.tasks.RouteParameters();
            routeParams.stops = new esri.tasks.FeatureSet();
            routeParams.returnRoutes = true;
            routeParams.returnDirections = true;
            routeParams.directionsLengthUnits = esri.Units.MILES;
            routeParams.outSpatialReference = this.getSpatialReferenceFormNA();

            const flagwindRoute = this.flagwindRouteLayer;
            routeTask.on("solve-complete", function (evt: any) {
                const routeResult = evt.result.routeResults[0];
                const polyline = routeResult.route.geometry;
                const length = routeResult.directions.totalLength;
                flagwindRoute.solveComplete({ polyline: polyline, length: length }, segment);
            });
            routeTask.on("error", function (err: any) {
                flagwindRoute.errorHandler(err, segment);
            });

            // 起点
            routeParams.stops.features.push(this.cloneStopGraphic(start));

            // 途径点
            if (waypoints) {
                for (let i = 0; i < waypoints.length; i++) {
                    routeParams.stops.features.push(this.cloneStopGraphic(waypoints[i]));
                }
            }
            // 终点
            routeParams.stops.features.push(this.cloneStopGraphic(end));
            routeTask.solve(routeParams);
        }

        public setSegmentByLine(options: { points: Array<any>; spatial: any }, segment: TrackSegment): void {
            let points = options.points;
            let spatial = options.spatial || segment.flagwindRouteLayer.spatial;
            // 每公里抽取的点数
            let numsOfKilometer = segment.options.numsOfKilometer;
            if (numsOfKilometer === undefined) {
                numsOfKilometer = 20;
            }
            const polyline = new esri.geometry.Polyline(spatial);
            for (let i = 0; i < points.length - 1; i++) {
                const start = points[i], end = points[i + 1];
                const tmppolyline = (new esri.geometry.Polyline(spatial)).addPath([start, end]);
                // 求两点之间距离
                const length = this.getLength(tmppolyline, esri.Units.KILOMETERS);
                const tmppoints = EsriRouteService.extractPoints(start, end, length * numsOfKilometer);
                polyline.addPath(tmppoints);
            }

            segment.polyline = polyline;
            segment.length = this.getLength(polyline, esri.Units.KILOMETERS);
            segment.line = EsriRouteService.vacuate(polyline.paths, segment.length, numsOfKilometer);
        }
        public setSegmentByPolyLine(options: { polyline: any; length: number }, segment: TrackSegment): void {
            segment.polyline = options.polyline;
            segment.length = length; // egMapUtils.getPolylineDistance(graphic);
            if (segment.polyline.paths.length > 0) {
                const paths = segment.polyline.paths;
                // 每公里抽取的点数
                let numsOfKilometer = segment.options.numsOfKilometer;
                if (numsOfKilometer === undefined) {
                    numsOfKilometer = 100;
                }
                segment.line = EsriRouteService.vacuate(paths, segment.length, numsOfKilometer);
            }
        }

        public getSpatialReferenceFormNA() {
            return new esri.SpatialReference({ wkid: this.flagwindRouteLayer.flagwindMap.spatial.wkid });
        }

        protected cloneStopGraphic(graphic: any): any {
            return new esri.Graphic(
                graphic.geometry,
                graphic.symbol, {
                    type: graphic.attributes.type,
                    line: graphic.attributes.line
                }
            );
        }

        protected getLength(tmppolyline: any, units: number) {
            let length = esri.geometry.geodesicLengths([tmppolyline], units)[0];
            return this.flagwindRouteLayer.flagwindMap.mapSetting.units * length;
        }

        /**
         * 把一个直线，切成多个点
         * @param start 始点
         * @param end 终点
         * @param n 点数
         */
        public static extractPoints(start: { x: number; y: number }, end: { x: number; y: number }, n: number) {

            const resList = [];
            if (n === 0) {
                resList.push({ x: start.x, y: start.y });
                resList.push({ x: end.x, y: end.y });
                return resList;
            }
            const xDiff = (end.x - start.x) / n;
            const yDiff = (end.y - start.y) / n;
            for (let j = 0; j < n; j++) {
                resList.push({ x: start.x + j * xDiff, y: start.y + j * yDiff });
            }
            resList.push({ x: end.x, y: end.y });
            return resList;
        }

        /**
         * 线段抽稀操作
         * @param paths  线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        public static vacuate(paths: Array<any>, length: number, numsOfKilometer: number) {

            if (numsOfKilometer === 0) {
                let startPath = paths[0];
                let endPath = paths[paths.length - 1];
                return [startPath[0], endPath[endPath.length - 1]];
            }

            let points: Array<any> = [];

            for (let i = 0; i < paths.length; i++) {
                points = points.concat(paths[i]);
            }

            const total = length * (numsOfKilometer);

            if (points.length > total) {
                let s = 0;
                let interval = Math.max(Math.floor(points.length / total), 1);
                let sLine = [];
                while (s < total) {
                    sLine.push(points[s]);
                    s += interval;
                }

                if (s !== points.length - 1) {
                    sLine.push(points[points.length - 1]);
                }
                return sLine;
            }

            return points;
        }

        /**
         * 线路上移动要素的构建（子）
         */
        public static getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number) {
            let markerUrl = trackline.options.markerUrl;
            let markerHeight = trackline.options.markerHeight || 48;
            let markerWidth = trackline.options.markerWidth || 48;
            let symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
            return new esri.Graphic(graphic.geometry, symbol, { type: "marker", line: trackline.name });
        }

        /**
         * 标准化停靠点
         */
        public static getStandardStops(name: string, stops: Array<any>, stopSymbol: any) {
            if (stopSymbol == null) {
                stopSymbol = new esri.symbol.SimpleMarkerSymbol()
                    .setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS)
                    .setSize(15).outline.setWidth(3);
            }
            const stopGraphics = [];
            for (let i = 0; i < stops.length; i++) {
                if (stops[i] instanceof Array) {
                    stopGraphics.push(new esri.Graphic(
                        new esri.geometry.Point(stops[i][0], stops[i][1]),
                        stopSymbol, { type: "stop", line: name }
                    ));
                }
                else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                    stopGraphics.push(new esri.Graphic(
                        stops[i],
                        stopSymbol, { type: "stop", line: name }
                    ));
                } else {
                    stopGraphics.push(new esri.Graphic(
                        stops[i].geometry,
                        stopSymbol, { type: "stop", model: stops[i].attributes, line: name }
                    ));
                }
            }
            return stopGraphics;
        }

    }
}
