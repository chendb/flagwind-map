import { TrackLine, TrackSegment, TrackSegmentOptions } from './flagwind.model'
import { FlagwindFeatureLayer, FlagwindGroupLayer } from './flagwind.layer';
import { FlagwindMap } from './flagwind.map';
import { MapUtils } from './map.utils';
import { MapSetting } from '../map.setting';
declare var esri: any;
declare var dojo: any;

export const FlagwindRouteOptions = {

    routeType: "Line",
    routeUrl: MapSetting.routeUrl,

    onLineStartEvent(lineName: string, segmentIndex: number, trackLine: TrackLine) {

    },

    onLineEndEvent(lineName: string, segmentIndex: number, trackLine: TrackLine) {

    },

    onMoveEvent(lineName: string, segmentIndex: number, xy: any[], angle: number) {

    },

    onStationEvent(lineName: string, segmentIndex: number, graphic: any, enter: boolean, trackLine: TrackLine) {

    }

}

export const LineOptions = {
    markerUrl: null,
    markerLabel: null,
    markerHeight: 48,
    markerWidth: 48
}

export class FlagwindRouteLayer {

    moveLineLayer: FlagwindGroupLayer;
    moveMarkLayer: { graphics: any; remove: (arg0: any) => void; _map: null; clear: () => void; id: any; add: (arg0: any) => void; show: () => void; hide: () => void; };
    //moveLabelLayer;
    trackLines: TrackLine[] = [];

    constructor(public flagwindMap: FlagwindMap, public layerName: string, public options: any) {


        this.options = Object.assign({}, FlagwindRouteOptions, options);
        // 轨迹线路
        // this.moveLineLayer = new esri.layers.GraphicsLayer({
        //     id: layerName + "LineLayer"
        // });

        this.moveLineLayer = new FlagwindGroupLayer(layerName + "LineLayer");

        // 移动小车
        this.moveMarkLayer = new esri.layers.GraphicsLayer({
            id: layerName + "MarkerLayer"
        });

        // 移动的小车车牌
        //this.moveLabelLayer = new FlagwindGroupLayer(layerName + "LabelLayer");
        this.onAddLayerBefor();
        //this.moveLineLayer = this.flagwindMap.innerMap.addLayer(this.moveLineLayer);
        this.flagwindMap.innerMap.addLayer(this.moveLineLayer.layer);
        this.moveMarkLayer = this.flagwindMap.innerMap.addLayer(this.moveMarkLayer);
        this.onAddLayerAfter();
        // this.flagwindMap.innerMap.addLayer(this.moveLabelLayer.layer);

        const _this = this;
        // 当地图已经加载时直接执行_onLoad方法
        if (this.flagwindMap.innerMap.loaded) {
            _this.onLoad();
        } else {
            this.flagwindMap.innerMap.on("load", function () {
                _this.onLoad();
            });
        }
    }

    onAddLayerBefor() {

    }

    onAddLayerAfter() {

    }

    onLoad() {
        const me = this;
        dojo.connect(this.moveMarkLayer, 'onClick', function (evt: any) {
            if (me.options.onMovingClick) {
                me.options.onMovingClick(evt);
            }
        });
    }



    /*********************轨迹线路**************************/


    /**
    * 获取指定名称的线路
    */
    getTrackLine(name: string) {
        return this.trackLines.find(g => g.name == name);
    }

    /**
     * 向指定线路中增加路段
     */
    addTrackSegment(name: any, segment: TrackSegment, lineOptions: any) {
        var trackline = this.getTrackLine(name);
        if (!trackline) {
            trackline = new TrackLine(name, lineOptions);
            this.trackLines.push(trackline);
        }
        trackline.add(segment);
    }

    /**
     * 计算线路的下一个路段索引
     */
    getNextSegmentIndex(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline) return trackline.nextSegmentIndex;
        return 0;
    }

    /**
     * 获取线路的下一路段
     */
    getNextSegment(name: string, index: number) {
        var trackline = this.getTrackLine(name);
        if (trackline) return trackline.getNextSegment(index);
        return undefined;
    }

    /**
     * 获取线路中的最后一路段
     */
    getLastSegment(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline) return trackline.lastSegment;
        return undefined;
    }

    /**
     * 获取监控最近播放完成的路段线路
     */
    getActiveCompletedSegment(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline) return trackline.activeCompletedSegment;
        return undefined;
    }

    /**
     * 判断线路是否在运行
     */
    getIsRunning(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline)
            return trackline.isRunning;
        else
            return false;
    }

    /*********************轨迹线路**************************/

    /*********************播放控制**************************/

    /**
      * 停止
      */
    stop(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline != null) {
            trackline.stop();
        }
    }
    /**
     * 启动线路播放（起点为上次播放的终点）
     */
    move(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline) trackline.move();
    }
    /**
     * 启动线路播放（起点为线路的始点）
     */
    start(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline) {
            trackline.stop();
            trackline.start();
        }
    }
    /**
     * 暂停
     */
    pause(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline)
            trackline.pause();
    }

    /**
     * 继续
     */
    continue(name: string) {
        var trackline = this.getTrackLine(name);
        if (trackline)
            trackline.continue();
    }
    /**
     * 调速
     */
    changeSpeed(name: string, speed: number) {
        var trackline = this.getTrackLine(name);
        if (trackline) {
            trackline.changeSpeed(speed);
        }
    }
    clear(name: string) {
        if (!name) {
            console.error("没有指定清除的线路名称");
            return;
        }
        var trackline = this.getTrackLine(name);
        if (trackline == null) return;
        trackline.stop();


        var markerGraphics = this.moveMarkLayer.graphics;
        for (var i = 0; i < markerGraphics.length; i++) {
            var g = markerGraphics[i];
            if (g.attributes.line == name) {
                this.moveMarkLayer.remove(g);
                i--;
            }
        }

        //this.moveLabelLayer.removeGraphicByName(name);

        this.moveLineLayer.removeGraphicByName(name);

        // var lineGraphics = this.moveLineLayer.graphics;
        // for (var i = 0; i < lineGraphics.length; i++) {
        //     var g = lineGraphics[i];
        //     if (g.attributes.line == name) {
        //         this.moveLineLayer.remove(g);
        //         i--;
        //     }
        // }
        trackline.markerLabelGraphic = null;
        trackline.markerGraphic = null;

    }

    clearLine(name: string) {
        if (!name) {
            console.error("没有指定清除的线路名称");
            return;
        }
        var trackline = this.getTrackLine(name);

        this.moveLineLayer.removeGraphicByName(name);

        // var lineGraphics = this.moveLineLayer.graphics;
        // for (var i = 0; i < lineGraphics.length; i++) {
        //     var g = lineGraphics[i];
        //     if (g.attributes.line == name) {
        //         this.moveLineLayer.remove(g);
        //         i--;
        //     }
        // }

    }
    /**
     * 清除所有
     */
    clearAll() {
        this.checkMapSetting();
        for (var i = 0; i < this.trackLines.length; i++) {
            var trackline = this.trackLines[i];
            trackline.stop();
            trackline.reset();
        }
        this.trackLines = [];

        if (this.moveMarkLayer && this.moveMarkLayer._map != null)
            this.moveMarkLayer.clear();

        // if (this.moveLabelLayer && this.moveLabelLayer._map != null)
        //     this.moveLabelLayer.clear();

        if (this.moveLineLayer && this.moveLineLayer._map != null)
            this.moveLineLayer.clear();
    }

    /*********************播放控制**************************/


    /**
     * 求解最短路径（与solve不同，它求解的是一个路段，该路段起点为stops[0],终点为stops[stops.length-1]
     *
     * @param {any} name  线路名称
     * @param {any} stops 经过的站点
     * @param {any} options 可选参数
     */
    solveSegment(name: string, stops: any[], options: any) {
        options = Object.assign({}, LineOptions, options);
        this.checkMapSetting();

        if (stops.length < 1) {
            throw Error("站点不能少于2");
        }

        const stopSymbol = new esri.symbol.SimpleMarkerSymbol()
            .setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS)
            .setSize(15).outline.setWidth(3);

        const stopGraphics = this.getStandardStops(name, stops, stopSymbol);

        const segment = this.getLastSegment(name);
        let startLineIndex = segment ? segment.index + 1 : 0;
        if (segment) {
            const isEqual = MapUtils.isEqualPoint(segment.endGraphic.geometry, stopGraphics[0].geometry);
            const isNA = this.options.routeType == "NA";
            // 若是网络分析服务且新增的路段与前一路段没有对接上，则增加一个路段用于连接他们
            if (isNA && !isEqual) {
                this.post(startLineIndex, name, segment.endGraphic, stopGraphics[0], options);
                startLineIndex += 1;
            }
        }
        const start = stopGraphics.splice(0, 1)[0];// 从数组中取出第一个
        const end = stopGraphics.splice(stopGraphics.length - 1, 1)[0];// 从数组中取出最后一个
        const waypoints = stopGraphics; //
        this.post(startLineIndex, name, start, end, options, waypoints);

    }


    /**
     * 发送路由请求
     * @ index:路段索引
     * @ name:线路名称
     * @ start:开始要素
     * @ end:终点要素
     * @ lineOptions:线路控制的参数
     * @ waypoints:经过的点
     */
    post(index: number, name: string, start: any, end: any, lineOptions: any, waypoints: any[] = []) {

        const flagwindRoute = this;

        const trackSegmentOptions = new TrackSegmentOptions(lineOptions.numsOfKilometer, lineOptions.speed, lineOptions.autoShowLine);

        trackSegmentOptions.onShowSegmentLineEvent = function (segment) {
            flagwindRoute.onShowSegmentLineEvent(flagwindRoute, segment, lineOptions);
        }
        trackSegmentOptions.onMoveStartEvent = function (segment, graphic, angle) {
            flagwindRoute.onMoveStartEvent(flagwindRoute, segment, graphic, angle);
        }
        trackSegmentOptions.onMoveEvent = function (segment, point, angle) {
            flagwindRoute.onMoveEvent(flagwindRoute, segment, point, angle);
        }
        trackSegmentOptions.onMoveEndEvent = function (segment, graphic, angle) {
            flagwindRoute.onMoveEndEvent(flagwindRoute, segment, graphic, angle);
        }

        const segment = new TrackSegment(index, name, start, end, trackSegmentOptions);

        if (waypoints) {
            segment.waypoints = waypoints;
        }

        this.addTrackSegment(name, segment, lineOptions);

        if (this.options.routeType == "NA") {
            this.solveByNA(segment, start, end, waypoints);
        } else {
            this.solveByJoinPoint(segment);
        }

    }

    getSpatialReferenceFormNA() {
        return new esri.SpatialReference({ wkid: this.flagwindMap.spatial.wkid });
    }


    /**
     * 由网络分析服务来求解轨迹并播放
     * 
     * @param {TrackSegment} segment 要播放的路段
     * @param {*} start 起点要素
     * @param {*} end 终点要素
     * @param {any[]} [waypoints] 途经要素点
     * @memberof flagwindRoute
     */
    solveByNA(segment: TrackSegment, start: any, end: any, waypoints: any[]) {
        const routeTask = new esri.tasks.RouteTask(this.options.routeUrl);
        const routeParams = new esri.tasks.RouteParameters();
        routeParams.stops = new esri.tasks.FeatureSet();
        routeParams.returnRoutes = true;
        routeParams.returnDirections = true;
        routeParams.directionsLengthUnits = esri.Units.MILES;
        routeParams.outSpatialReference = this.getSpatialReferenceFormNA();

        const flagwindRoute = this;
        routeTask.on("solve-complete", function (evt: any) {
            flagwindRoute.solveComplete(flagwindRoute, evt, segment);
        });
        routeTask.on("error", function (err: any) {
            flagwindRoute.errorHandler(flagwindRoute, err, segment);
        });

        // 起点
        routeParams.stops.features.push(this.cloneStopGraphic(start));

        // 途径点
        if (waypoints) {
            for (var i = 0; i < waypoints.length; i++) {
                routeParams.stops.features.push(this.cloneStopGraphic(waypoints[i]));
            }
        }
        // 终点
        routeParams.stops.features.push(this.cloneStopGraphic(end));
        routeTask.solve(routeParams);
    }

    /**
     * 由连线求解轨迹
     * @param segment
     */
    solveByJoinPoint(segment: TrackSegment) {
        const points = [];
        points.push(segment.startGraphic.geometry);

        if (segment.waypoints) {
            for (var i = 0; i < segment.waypoints.length; i++) {
                points.push(segment.waypoints[i].geometry);
            }
        }

        points.push(segment.endGraphic.geometry);
        //当路由分析出错时，两点之间的最短路径以直线代替
        segment.setLine(points, this.flagwindMap.spatial);
    }


    /**
     * 线段创建完成事件回调
     * @param {*} segment 
     */
    onCreateSegmentLineComplete(segment: TrackSegment) {

    }

    /**
     * 路由分析完成回调
     */
    solveComplete(mapRoute: this, evt: any, segment: TrackSegment) {
        const routeResult = evt.result.routeResults[0];
        const polyline = routeResult.route.geometry;
        const length = routeResult.directions.totalLength;
        // 设置路段播放线路信息
        segment.setPolyLine(polyline, length);
        this.onCreateSegmentLineComplete(segment);
    }

    /**
     * 路由分析失败回调
     */
    errorHandler(mapRoute: this, err: any, segment: TrackSegment) {
        console.log("路由分析异常" + err + "");
        const points = [];
        points.push(segment.startGraphic.geometry);
        if (segment.waypoints) {
            for (let i = 0; i < segment.waypoints.length; i++) {
                points.push(segment.waypoints[i].geometry);
            }
        }
        points.push(segment.endGraphic.geometry);
        //当路由分析出错时，两点之间的最短路径以直线代替
        segment.setLine(points, this.getSpatialReferenceFormNA());
        this.onCreateSegmentLineComplete(segment);
    }



    // 检测地图设置，防止图层未加载到地图上
    checkMapSetting() {
        if (this.moveMarkLayer._map == null) {
            this.moveMarkLayer = this.flagwindMap.innerMap.getLayer(this.moveMarkLayer.id);
        }
        // if (this.moveLabelLayer && this.moveLabelLayer._map == null) {
        //     this.moveLabelLayer = this.flagwindMap.innerMap.getLayer(this.moveLabelLayer.id);
        // }
        // if (this.moveLineLayer._map == null) {
        //     this.moveLineLayer = this.flagwindMap.innerMap.getLayer(this.moveLineLayer.id);
        // }
    }


    /**
     * 每次位置移动线路上的要素样式变换操作
     */
    changeMovingGraphicSymbol(trackline: TrackLine, point: any, angle: number) {
        if (trackline == undefined) return;
        var symbol = trackline._markerGraphic.symbol;
        symbol.setAngle(360 - angle);
        trackline._markerGraphic.setSymbol(symbol);
        trackline._markerGraphic.setGeometry(point);
        trackline._markerGraphic.draw();//重绘

        // if (trackline._markerLabelGraphic) {
        //     trackline._markerLabelGraphic.setGeometry(point);
        //     trackline._markerLabelGraphic.draw();
        // }
    }

    showSegmentLine(segment: TrackSegment) {
        var playedLineSymbol = new esri.symbol.CartographicLineSymbol(
            esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4,
            esri.symbol.CartographicLineSymbol.CAP_ROUND,
            esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);

        segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
            type: "segment",
            index: segment.index,
            line: segment.name
        });
        this.moveLineLayer.addGraphice(segment.name, [segment.lineGraphic]);
        //this.moveLineLayer.add(segment.lineGraphic);
    }

    /**
     * 
     * 显示路段事件
     * 
     * @protected
     * @memberof flagwindRoute
     */
    onShowSegmentLineEvent(flagwindRoute: this, segment: TrackSegment, lineOptions: any) {
        // 是否自动显示轨迹
        if (lineOptions.autoShowSegmentLine) {
            if (!segment.lineGraphic) {
                flagwindRoute.showSegmentLine(segment);
            }
        }
        if (lineOptions.onShowSegmentLineEvent) {
            lineOptions.onShowSegmentLineEvent(segment);
        }
    }

    /**
     * 创建移动要素
     * @param {*} trackline 线路
     * @param {*} graphic 要素
     * @param {*} angle 偏转角
     */
    createMoveMark(trackline: TrackLine, graphic: any, angle: number) {
        var mg = this.getMarkerGraphic(trackline, graphic, angle);
        trackline._markerGraphic = mg;
        this.moveMarkLayer.add(mg);
    }

    /**
     * 线段播放开始事故
     */
    onMoveStartEvent(flagwindRoute: this, segment: TrackSegment, graphic: any, angle: number) {
        var trackline = flagwindRoute.getTrackLine(segment.name);

        if (trackline == undefined) {
            return;
        }

        if (!trackline._markerGraphic) {
            flagwindRoute.createMoveMark(trackline, graphic, angle);
            // var mg = flagwindRoute.getMarkerGraphic(trackline, graphic, angle);
            // trackline._markerGraphic = mg;
            // flagwindRoute.moveMarkLayer.add(mg);

            // if (trackline._markerLabel) {
            //     var text = flagwindRoute.getMarkerLabelGraphic(trackline, graphic, angle);
            //     var bg = _flagwindRoute.getMarkerLabelBackGroundGraphic(trackline, graphic, angle);
            //     trackline._markerLabelGraphic = text;
            //     flagwindRoute.moveLabelLayer.addGraphice(trackline.name, [text, bg]);
            // }
        }
        flagwindRoute.flagwindMap.centerAt(graphic.geometry.x, graphic.geometry.y);

        if (!segment.lineGraphic) {
            flagwindRoute.showSegmentLine(segment);
        }


        flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, true, flagwindRoute.getTrackLine(segment.name));
        if (segment.index == 0) {
            // 线路播放开始事故回调
            this.options.onLineStartEvent(segment.name, segment.index, flagwindRoute.getTrackLine(segment.name));
        }
    }

    /**
     * 线段播放完成事件
     */
    onMoveEndEvent(flagwindRoute: this, segment: TrackSegment, graphic: any, angle: number) {
        const nextSegment = flagwindRoute.getNextSegment(segment.name, segment.index);
        const currentLine = flagwindRoute.getTrackLine(segment.name);
        if (nextSegment) {
            flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, false, currentLine);
            // 到达站点
            nextSegment.start();
        } else {
            flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, false, currentLine);
            segment.stop();
            // 如果没有下一条线路，说明线路播放结束，此时调用线路播放结束回调
            flagwindRoute.options.onLineEndEvent(segment.name, segment.index, currentLine);
        }
    }
    /**
     * 移动回调事件
     */
    onMoveEvent(flagwindRoute: this, segment: any, xy: any, angle: number) {
        var point = new esri.geometry.Point(parseFloat(xy[0]), parseFloat(xy[1]), flagwindRoute.flagwindMap.spatial)
        var trackline = flagwindRoute.getTrackLine(segment.name);

        if (trackline) {
            flagwindRoute.changeMovingGraphicSymbol(trackline, point, angle);
            flagwindRoute.options.onMoveEvent(segment.name, segment.index, xy, angle);
        }
    }

    cloneStopGraphic(graphic: any) {
        return new esri.Graphic(
            graphic.geometry,
            graphic.symbol, {
                type: graphic.attributes.type,
                line: graphic.attributes.line
            }
        );
    }

    /**
     * 标准化停靠点
     */
    getStandardStops(name: string, stops: any[], stopSymbol: any) {
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


    /**
     * 线路上移动要素的构建（子）
     */
    getMarkerGraphic(trackline: any, graphic: any, angle: number) {
        var markerUrl = trackline.markerUrl;
        var markerHeight = trackline.markerHeight || 48;
        var markerWidth = trackline.markerWidth || 48;
        var symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
        return new esri.Graphic(graphic.geometry, symbol, { type: "marker", line: trackline.name });
    }

    // /**
    //  * 线路上移动要素的上方label构建
    //  */
    // getMarkerLabelGraphic(trackline, graphic, angle) {
    //     var text = new esri.symbol.TextSymbol(trackline.markerLabel);
    //     var font = new esri.symbol.Font();
    //     font.setSize("10pt");
    //     font.setFamily("微软雅黑");
    //     text.setFont(font);
    //     text.setColor(new esri.Color([255, 255, 255, 100]));
    //     text.setOffset(0, 40);
    //     return new esri.Graphic(graphic.geometry, text);
    // }

    // getMarkerLabelBackGroundGraphic(trackline, graphic, angle) {

    //     return null;
    // }

    show() {
        if (this.moveMarkLayer)// 移动小车
            this.moveMarkLayer.show();

        // 移动的小车车牌
        // if (this.moveLabelLayer)
        //     this.moveLabelLayer.show();

        if (this.moveLineLayer)
            this.moveLineLayer.show();
    }

    hide() {
        if (this.moveMarkLayer)// 移动小车
            this.moveMarkLayer.hide();

        // 移动的小车车牌
        // if (this.moveLabelLayer)
        //     this.moveLabelLayer.hide();

        if (this.moveLineLayer)
            this.moveLineLayer.hide();

    }

}