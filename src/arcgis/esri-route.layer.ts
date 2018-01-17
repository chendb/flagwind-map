/// <reference path="../base/flagwind-route.layer.ts" />
namespace flagwind {

    export class EsriRouteLayer extends FlagwindRouteLayer {

        public moveLineLayer: FlagwindGroupLayer;
        public moveMarkLayer: FlagwindGroupLayer;
        public trackLines: Array<TrackLine> = [];

        public constructor(public flagwindMap: FlagwindMap, public layerName: string, public options: any) {
            super(flagwindMap, layerName, options);
        }

        public onShowSegmentLine(segment: TrackSegment) {
            let playedLineSymbol = new esri.symbol.CartographicLineSymbol(
                esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);

            segment.lineGraphic = this.getStandardGraphic(new esri.Graphic(segment.polyline, playedLineSymbol, {
                type: "segment",
                index: segment.index,
                line: segment.name
            }));
            this.moveLineLayer.addGraphice(segment.name, [segment.lineGraphic]);
        }

        public onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number) {
            let markerUrl = trackline.options.markerUrl;
            let markerHeight = trackline.options.markerHeight || 48;
            let markerWidth = trackline.options.markerWidth || 48;
            let symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
            return this.getStandardGraphic(new esri.Graphic(graphic.geometry, symbol, { type: "marker", line: trackline.name }));
            // return this.mapService.getTrackLineMarkerGraphic(trackline, graphic, angle);
        }

        public onCreateGroupLayer(id: string): FlagwindGroupLayer {
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
                    stopGraphics.push(this.getStandardGraphic(new esri.Graphic(
                        new esri.geometry.Point(stops[i][0], stops[i][1]),
                        stopSymbol, { type: "stop", line: name }
                    )));
                }
                else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                    stopGraphics.push(this.getStandardGraphic(new esri.Graphic(
                        stops[i],
                        stopSymbol, { type: "stop", line: name }
                    )));
                } else {
                    stopGraphics.push(this.getStandardGraphic(new esri.Graphic(
                        stops[i].geometry,
                        stopSymbol, { type: "stop", model: stops[i].attributes, line: name }
                    )));
                }
            }
            return stopGraphics;
        }
        public onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void {
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
            segment.setLine(points);
        }
        public onAddEventListener(groupLayer: FlagwindGroupLayer, eventName: string, callBack: Function): void {
            groupLayer.layer.on(eventName, callBack);
        }

        public getSpatialReferenceFormNA() {
            return new esri.SpatialReference({ wkid: this.flagwindMap.spatial.wkid });
        }

        protected getStandardGraphic(graphic: any) {
            graphic.show = function () {
                console.log("graphic 的显示方法没有实现");
            };
            graphic.hide = function () {
                console.log("graphic 的隐藏方法没有实现");
            };
            return graphic;

        }

        protected cloneStopGraphic(graphic: any): any {
            return this.getStandardGraphic(new esri.Graphic(
                graphic.geometry,
                graphic.symbol, {
                    type: graphic.attributes.type,
                    line: graphic.attributes.line
                }
            ));
        }

    }
}
