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
                id: id
            });
        }

        public onCreateLineLayer(id: string): FlagwindGroupLayer {
            return new MinemapGroupLayer({
                id: id
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
            let list: Array<MinemapPointGraphic> = [];
            if (stops == null || stops.length === 0) return list;
            stops.forEach(g => {
                if (g instanceof MinemapPointGraphic) {
                    g.attributes.__type = "stop";
                    g.attributes.__line = name;
                    list.push(g);
                } else {
                    let mg = new MinemapPointGraphic({
                        id: g.id,
                        point: this.flagwindMap.getPoint(g),
                        className: "graphic-stop",
                        attributes: { __type: "stop", __line: name,__model: g }
                    });
                    list.push(mg);
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
                wayXY = waypoints.map(g => `${ g.geometry.x },${ g.geometry.y }`).join(",");
                // wayXY = waypoints.join(",");
            }

            minemap.service.queryRouteDrivingResult3(startXY, endXY, wayXY, 2, "", (error: any, results: any) => {
                if (error) {
                    this.errorHandler(error, segment);
                } else {
                    if (results.errcode === 0 && results.data) {
                        let routeResult = new RouteResult(results);
                        this.solveComplete({
                            polyline: routeResult.getLine(this.spatial),
                            length: routeResult.data.rows[0].distance
                        }, segment);
                    } else {
                        this.errorHandler(results.errmsg, segment);
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
            let markerUrl = this.getImageUrl(trackline,angle);
            let marker = new MinemapPointGraphic({
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
        public onUpdateMoveGraphic(trackline: TrackLine, point: any, angle: number) {
            if (trackline === undefined) return;
            let imageUrl = this.getImageUrl(trackline,angle);
            let imageAngle = this.getImageAngle(trackline,angle);
            trackline.markerGraphic.setSymbol({
                imageUrl: imageUrl,
                className: "graphic-moving"
            });
            if (imageAngle !== null) {
                trackline.markerGraphic.setAngle(imageAngle);
            }
            trackline.markerGraphic.setGeometry(point);
        }

        public getImageUrl(trackline: TrackLine, angle: number) {
            if (this.options.getImageUrl) {
                return this.options.getImageUrl(trackline, angle);
            }
            if (trackline.options.getImageUrl) {
                 return trackline.options.getImageUrl(trackline, angle);
            }
            let sx = 1;
            if (angle < 45 || angle >= 315) sx = 3; // 向东走
            if (angle >= 45 && angle < 135) sx = 4; // 向北走
            if (angle >= 135 && angle < 225) sx = 2; // 向西走
            if (angle >= 225 && angle < 315) sx = 1; // 向南走

            if (trackline.step === null) {
                trackline.step = -1;
            }
            if (trackline.direction !== sx) {
                trackline.step = 0;
            } else {
                trackline.step = (trackline.step + 1) % 4;
            }
            trackline.direction = sx;
            let name = `${trackline.direction}${trackline.step + 1}`;

            return trackline.options.symbol[`imageUrl${name}`];
        }

        public getImageAngle(trackline: TrackLine, angle: number) {
             if (this.options.getImageAngle) {
                 return this.options.getImageAngle(trackline, angle);
             }
             if (trackline.options.getImageAngle) {
                 return trackline.options.getImageAngle(trackline, angle);
             }
             return 360 - angle;
        }
    }
}
