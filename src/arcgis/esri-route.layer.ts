/// <reference path="../base/flagwind-route.layer.ts" />
namespace flagwind {

    export class EsriRouteLayer extends FlagwindRouteLayer {

        public moveLineLayer: FlagwindGroupLayer;
        public moveMarkLayer: FlagwindGroupLayer;
        public trackLines: Array<TrackLine> = [];

        public onSetSegmentByLine(options: any, segment: TrackSegment) {
            segment.polyline = options.polyline;
            segment.length = options.length;
            if (segment.polyline.paths && segment.polyline.paths.length > 0) {
                // 每公里抽取的点数
                let numsOfKilometer = segment.options.numsOfKilometer ? segment.options.numsOfKilometer : 100;

                segment.line = MapUtils.vacuate(segment.polyline.paths, segment.length, numsOfKilometer);
            }
        }

        public onSetSegmentByPoint(options: any, segment: TrackSegment) {
            let points = options.points;
            let numsOfKilometer = segment.options.numsOfKilometer ? segment.options.numsOfKilometer : 100;
            const polyline = new esri.geometry.Polyline(this.flagwindMap.spatial);
            for (let i = 0; i < points.length - 1; i++) {
                const start = points[i], end = points[i + 1];
                const tmppolyline = (new esri.geometry.Polyline(this.flagwindMap.spatial)).addPath([start, end]);
                const length = esri.geometry.geodesicLengths([tmppolyline], esri.Units.KILOMETERS)[0];
                const tmppoints = MapUtils.extractPoints(start, end, length * numsOfKilometer);
                polyline.addPath(tmppoints);
            }
            segment.length = esri.geometry.geodesicLengths([polyline], esri.Units.KILOMETERS)[0];
            segment.polyline = polyline;
            segment.line = MapUtils.vacuate(segment.polyline.paths, segment.length, numsOfKilometer);
        }

        public onShowSegmentLine(segment: TrackSegment) {
            let playedLineSymbol = new esri.symbol.CartographicLineSymbol(
                esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);

            segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
                __type: "segment",
                __index: segment.index,
                __line: segment.name
            });
            this.moveLineLayer.addGraphic(segment.name, segment.lineGraphic);
        }

        public onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number) {
            let markerUrl = trackline.options.symbol.image || trackline.options.symbol.imageUrl
                || this.options.imageUrl || this.options.symbol.image || this.options.symbol.imageUrl;
            let markerHeight = trackline.options.symbol.height || this.options.symbol.height;
            let markerWidth = trackline.options.symbol.width || this.options.symbol.width;
            if (!markerUrl) {
                console.warn("轨迹移动要素图片未定义");
            }
            let symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
            let marker = new esri.Graphic(graphic.geometry, symbol, { __type: "marker", __line: trackline.name });
            trackline.markerGraphic = marker;
            this.moveMarkLayer.addGraphic(trackline.name, marker);
        }

        public onCreateLineLayer(id: string): FlagwindGroupLayer {
            return new EsriGroupLayer(id);
        }

        public onCreateMovingLayer(id: string): FlagwindGroupLayer {
            return new EsriGroupLayer(id);
        }

        public onEqualGraphic(originGraphic: any, targetGraphic: any): boolean {
            return MapUtils.isEqualPoint(originGraphic.geometry, targetGraphic.geometry);
        }

        public onGetStandardStops(name: String, stops: Array<any>): Array<any> {
            const stopGraphics = [];
            let stopSymbol = new esri.symbol.SimpleMarkerSymbol()
                .setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS)
                .setSize(15).outline.setWidth(3);
            for (let i = 0; i < stops.length; i++) {
                if (stops[i] instanceof Array) {
                    stopGraphics.push(new esri.Graphic(new esri.geometry.Point(stops[i][0], stops[i][1]), stopSymbol, { __type: "stop", __line: name }));
                }
                else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                    stopGraphics.push(new esri.Graphic(stops[i], stopSymbol, { __type: "stop", __line: name }));
                } else if ((stops[i].declaredClass || "").indexOf("Graphic") > 0) {
                    stopGraphics.push(new esri.Graphic(stops[i].geometry, stopSymbol, { __type: "stop", __model: stops[i].attributes, __line: name }));
                } else {
                    stopGraphics.push(new esri.Graphic(this.flagwindMap.getPoint(stops[i]), stopSymbol, { __type: "stop", __model: stops[i], __line: name }));
                }
            }
            return stopGraphics;
        }

        public onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void {
            if (!this.options.routeUrl) {
                console.error("routeUrl地址为空！");
                return;
            }
            const routeTask = new esri.tasks.RouteTask(this.options.routeUrl);
            const routeParams = new esri.tasks.RouteParameters();
            routeParams.stops = new esri.tasks.FeatureSet();
            routeParams.returnRoutes = true;
            routeParams.returnDirections = true;
            routeParams.directionsLengthUnits = esri.Units.MILES;
            routeParams.outSpatialReference = this.getSpatialReferenceFormNA();

            const flagwindRoute = this;
            routeTask.on("solve-complete", function (evt: any) {
                const routeResult = evt.result.routeResults[0];
                const polyline = routeResult.route.geometry;
                const length = routeResult.directions.totalLength;
                flagwindRoute.solveComplete({ polyline: polyline, length: length }, segment);
            });
            routeTask.on("error", function (err: any) {
                console.warn("轨迹路由服务请求异常：" + err);
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

        public onAddEventListener(groupLayer: FlagwindGroupLayer, eventName: string, callBack: Function): void {
            groupLayer.layer.on(eventName, callBack);
        }

        public getSpatialReferenceFormNA() {
            return new esri.SpatialReference({ wkid: this.flagwindMap.spatial.wkid });
        }

        protected cloneStopGraphic(graphic: any): any {
            return new esri.Graphic(
                graphic.geometry,
                graphic.symbol, {
                    __type: graphic.attributes.__type,
                    __model: graphic.attributes.__model,
                    __line: graphic.attributes.__line
                }
            );
        }

        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        protected onChangeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number) {
            if (trackline === undefined) return;
            let symbol = trackline.markerGraphic.symbol;
            symbol.setAngle(360 - angle);
            trackline.markerGraphic.setSymbol(symbol);
            trackline.markerGraphic.setGeometry(point);
            trackline.markerGraphic.draw();// 重绘
        }

    }
}
