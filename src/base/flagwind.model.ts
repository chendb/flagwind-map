import { MapUtils } from "./map.utils";
import { MapSetting } from '../map.setting';
declare var esri: any;
declare var dojo: any;
declare var dijit: any;

export class TrackSegmentOptions {




    constructor(public numsOfKilometer: number, public speed: number = 100, public autoShowLine: boolean = false) {

    }


    onShowSegmentLineEvent(segment: TrackSegment) {

    }

    onMoveStartEvent(target: any, startGraphic: any, angle: number) {

    }
    onMoveEndEvent(target: any, endGraphic: any, angle: number) {

    }
    onMoveEvent(target: any, point: any, angle: number) {

    }

}



/**
 * 对轨迹播放中线路的路段的定义
 * 
 * @export
 * @class TrackSegment
 */
export class TrackSegment {
    position = -1;
    length: number | null;
    speed: number | null;
    isCompleted = false;
    isRunning = false;
    line: any | null;
    polyline: any | null;
    time = 200;
    _timer: any;

    /**
     * 由外部使用
     * 
     * @type {*}
     * @memberof TrackSegment
     */
    lineGraphic: any;

    /**
     * 
     * 途经的点
     * 
     * @type {any[]}
     * @memberof TrackSegment
     */
    waypoints:any[] = [];

    constructor(
        public index: number    // 线路对应路段索引
        , public name: string          // 线路名
        , public startGraphic: any     // 起点要素
        , public endGraphic: any       // 终点要素
        , public options: any) {
        this.index = index;
        this.name = name;
        this.startGraphic = startGraphic;
        this.endGraphic = endGraphic;
        this.options = Object.assign({}, options);

    }



    /**
     * 设置拆线
     */
    setPolyLine(polyline: any, length: number) {
        this.polyline = polyline;
        this.length = length; //egMapUtils.getPolylineDistance(graphic);
        if (this.polyline.paths.length > 0) {
            const paths = this.polyline.paths;
            // 每公里抽取的点数
            let numsOfKilometer = this.options.numsOfKilometer;
            if (numsOfKilometer == undefined) {
                numsOfKilometer = 100;
            }
            this.line = this.vacuate(paths, this.length, numsOfKilometer);
        }
        if (!this.speed) this.changeSpeed();
        this.options.onShowSegmentLineEvent(this);
    }

    /**
     * 把一个直线，切成多个点
     */
    _getPointsBetweenTwo(start: { x: number, y: number }, end: { x: number, y: number }, n: number) {

        const resList = [];
        if (n == 0) {
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
     * 设置直线
     */
    setLine(points: any[], spatial: any) {
        // 每公里抽取的点数
        let numsOfKilometer = this.options.numsOfKilometer;
        if (numsOfKilometer == undefined) {
            numsOfKilometer = 20;
        }
        const polyline = new esri.geometry.Polyline(spatial);
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i], end = points[i + 1];
            const tmppolyline = (new esri.geometry.Polyline(spatial)).addPath([start, end]);
            // 求两点之间距离
            const length = this.getLength(tmppolyline, esri.Units.KILOMETERS);
            const tmppoints = this._getPointsBetweenTwo(start, end, length * numsOfKilometer);
            polyline.addPath(tmppoints);
        }

        this.polyline = polyline;
        this.length = this.getLength(polyline, esri.Units.KILOMETERS);
        this.line = this.vacuate(polyline.paths, this.length, numsOfKilometer);

        if (!this.speed) this.changeSpeed();
        console.debug("路段" + this.index + "长度：" + this.length + "km");
        console.debug("路段" + this.index + "取点：" + this.line.length + "个");
        console.debug("路段" + this.index + "速度：" + this.speed + "km/h");
        console.debug("路段" + this.index + "定时：" + this.time + "ms");
        this.options.onShowSegmentLineEvent(this);
    }

    getLength(tmppolyline: any, units: number) {
        let length = esri.geometry.geodesicLengths([tmppolyline], units)[0];
        return MapSetting.units * length;
    }


    /**
     * 线段抽稀操作
     */
    vacuate(paths: any[], length: number, numsOfKilometer: number) {

        if (numsOfKilometer == 0) {
            var startPath = paths[0];
            var endPath = paths[paths.length - 1];
            return [startPath[0], endPath[endPath.length - 1]];
        }

        let points: any[] = [];

        for (let i = 0; i < paths.length; i++) {
            points = points.concat(paths[i]);
        }

        const total = length * (numsOfKilometer);

        if (points.length > total) {
            var s = 0;
            var interval = Math.max(Math.floor(points.length / total), 1);
            var sLine = [];
            while (s < total) {
                sLine.push(points[s]);
                s += interval;
            }

            if (s != points.length - 1) {
                sLine.push(points[points.length - 1])
            }
            return sLine;
        }

        return points;
    }

    changeSpeed(speed: number | null = null) {
        if (this.options.numsOfKilometer == 0) {
            this.speed = 10000000;
            this.time = 1;
        } else {
            this.speed = (speed || this.options.speed);
            this.time = (this.length || 0) * 3600 / ((this.speed || 100) * 15 * this.line.length);
        }

        // 若正在跑，则暂停，改变速度后再执行
        if (this._timer) {
            this.pause();
            this.start();
        }
    }

    move(segment: TrackSegment) {
        segment.position = segment.position + 1;
        let angle = 0;
        if (segment.position == 0) {
            if (segment.line.length > 1) {
                angle = MapUtils.getAngle(segment.startGraphic.geometry, {
                    x: segment.line[0][0], y: segment.line[0][1]
                }) || 0;
            }
            segment.options.onMoveStartEvent(segment, segment.startGraphic, angle);
            segment.options.onMoveEvent(segment, [segment.startGraphic.geometry.x, segment.startGraphic.geometry.y], angle);
            return;
        }

        if (segment.position >= segment.line.length) {
            if (this.line.length > 1) {
                angle = MapUtils.getAngle({
                    x: this.line[segment.line.length - 1][0],
                    y: this.line[segment.line.length - 1][1]
                }, this.endGraphic.geometry) || 0;
            }
            segment.isCompleted = true;
            segment.stop();
            segment.options.onMoveEvent(segment, [segment.endGraphic.geometry.x, segment.endGraphic.geometry.y], angle);
            segment.options.onMoveEndEvent(segment, segment.endGraphic, angle);
            return;
        }

        angle = MapUtils.getAngle(
            {
                x: this.line[this.position - 1][0],
                y: this.line[this.position - 1][1]
            },
            {
                x: this.line[this.position][0],
                y: this.line[this.position][1]
            });
        const xx = parseFloat(segment.line[this.position - 1][0]).toFixed(5);
        const yy = parseFloat(segment.line[this.position - 1][1]).toFixed(5);
        segment.options.onMoveEvent(segment, [xx, yy], angle);

    }
    start() {
        //if (!this.line) return false;
        this.isRunning = true;
        const _segment = this;
        _segment._timer = window.setInterval(function () {
            if (!_segment.line) {
                console.log("线路" + _segment.name + "的第" + (_segment.index + 1) + "路段等待设置");
            } else {
                _segment.move(_segment);
            }
        }, _segment.time);
        return true;
    }
    /**
     * 当定时器为空，且运行状态为true时表示是暂停
     */
    get isPaused() {
        return (!this._timer) && this.isRunning;
    }

    pause() {
        window.clearInterval(this._timer);
        this._timer = null;
    }
    stop() {
        if (this._timer) {
            window.clearInterval(this._timer);
        }
        this._timer = null;
        this.isRunning = false;
        this.position = -1;
    }

    reset() {
        this._timer = null;
        this.isRunning = false;
        this.position = -1;
        this.isCompleted = false;
    }
}



/**
 * 对轨迹播放中线路的定义（它由多个路段组成）
 * 
 * @export
 * @class TrackLine
 */
export class TrackLine {
    segments: TrackSegment[] = [];
    isMovingGraphicHide = false;
    _markerGraphic: any;
    _markerSymbol: any;
    _markerLabelGraphic: any;
    _markerLabelSymbol: any;

    constructor(public name: string, public options: any) {

    }

    /**
     * 设置线路上移动要素(如：车辆图标)
     * 
     * @memberof TrackLine
     */
    set markerGraphic(graphic: any) {
        this._markerGraphic = graphic;
        this._markerSymbol = graphic.symbol;
    }

    /**
     * 设置线路上移动要素的描述伴随要素（如：车辆图标的车牌）
     * 
     * @memberof TrackLine
     */
    set markerLabelGraphic(graphic: any) {
        this._markerLabelGraphic = graphic;
        this._markerLabelSymbol = graphic.symbol;
    }

    /**
     * 隐藏移动要素
     * 
     * @memberof TrackLine
     */
    hideMovingGraphic() {
        this.isMovingGraphicHide = true;
        this._markerGraphic.setSymbol(null);
        if (this._markerLabelGraphic)
            this._markerLabelGraphic.setSymbol(null);
        this._markerGraphic.draw();
        if (this._markerLabelGraphic)
            this._markerLabelGraphic.draw();
    }

    /**
     * 显示移动要素
     * 
     * @memberof TrackLine
     */
    showMovingGraphic() {
        if (this.isMovingGraphicHide) {
            this.isMovingGraphicHide = false;
            this._markerGraphic.setSymbol(this._markerSymbol);
            this._markerGraphic.draw();
            if (this._markerLabelGraphic)
                this._markerLabelGraphic.setSymbol(this._markerLabelSymbol);
            if (this._markerLabelGraphic)
                this._markerLabelGraphic.draw();
        }
    }

    /**
     * 若有一个路段正在跑，代表该线路是正在运行
     */
    get isRunning() {
        if (this.segments.length == 0) return false;
        for (var i = 0; i < this.segments.length; i++) {
            var segemtn = this.segments[i];
            if (segemtn.isRunning == true) {
                return true;
            }
        }
        return false;
    }
    /**
     * 当所有的路段完成时，说明线路是跑完状态
     */
    get isCompleted() {
        if (this.segments.length == 0) return false;
        for (var i = 0; i < this.segments.length; i++) {
            var segemtn = this.segments[i];
            if (segemtn.isCompleted == false) {
                return false;
            }
        }
        return true;
    }

    /**
     * 调速
     */
    changeSpeed(speed: number) {
        if (this.segments.length == 0) return false;
        for (var i = 0; i < this.segments.length; i++) {
            var segemtn = this.segments[i];
            segemtn.changeSpeed(speed);
        }
    }
    /**
     * 启动线路播放（从第一个路段的起点开始）
     */
    start() {
        if (this.isRunning) return;

        let playSegment = this.segments[0];
        for (let i = 0; i < this.segments.length; i++) {
            const segemtn = this.segments[i];
            if (playSegment.index > segemtn.index) {
                playSegment = segemtn;
            }
        }
        playSegment.start();
    }
    /**
     * 停止线路
     */
    stop() {

        for (var i = 0; i < this.segments.length; i++) {
            var segemtn = this.segments[i];
            segemtn.stop();
        }

    }
    reset() {

        for (var i = 0; i < this.segments.length; i++) {
            var segemtn = this.segments[i];
            segemtn.reset();
        }
    }

    /**
     * 暂停
     */
    pause() {
        for (var i = 0; i < this.segments.length; i++) {
            var segemtn = this.segments[i];
            if (segemtn.isRunning) {
                segemtn.pause();
                return;
            }
        }
    }
    /**
     * 继续（与 暂停 是操作对，只能是在调用了暂停 才可以启用它）
     */
    continue() {

        // 若没有路段进行运行，则启动线路
        if (!this.isRunning) {
            this.start();
        }

        // 找到暂停路段，并启动路段
        for (let i = 0; i < this.segments.length; i++) {
            let segemtn = this.segments[i];
            if (segemtn.isRunning && (!segemtn._timer)) {
                segemtn.start();
                return;
            }
        }
    }
    /**
     * 移动(起点为上一次的终点，如果之前没有播放过，则从线路的起点开始)
     */
    move() {
        // 若没有路段进行运行，则启动线路
        if (this.isRunning) {
            return;
        }

        let segment = this.activeCompletedSegment;
        let playSegment = null;
        if (!segment) {
            playSegment = this.getSegment(0);
        } else {
            playSegment = this.getSegment(segment.index + 1);
        }
        if (playSegment) {
            playSegment.start();
        }
    }
    /**
     * 增加路段
     */
    add(segment: TrackSegment) {
        this.segments.push(segment);
    }
    /**
     * 计算线路的下一个路段索引
     */
    get nextSegmentIndex() {
        if (this.segments.length == 0) return 0;

        var startLineIndex = 0;
        for (var i = 0; i < this.segments.length; i++) {
            var rl = this.segments[i];
            if (rl.index > startLineIndex) {
                startLineIndex = rl.index;
            }
        }
        if (startLineIndex > 0) {
            startLineIndex += 1;
        }
        return startLineIndex;
    }
    /**
     * 获取最后的一个路段
     */
    get lastSegment() {
        if (this.segments.length == 0) return undefined;
        let segment = null;
        for (var i = 0; i < this.segments.length; i++) {
            var rl = this.segments[i];
            if ((!segment) || rl.index > segment.index) {
                segment = rl;
            }
        }
        return segment;
    }
    /**
     * 获取线路的下一路段
     */
    getNextSegment(index: number) {
        let line = null;
        if (this.segments.length == 0) return undefined;
        return this.getSegment(index + 1);
    }
    /**
     * 获取线路的路段
     */
    getSegment(index: number) {

        let line = null;
        if (this.segments.length == 0) return undefined;

        for (let i = 0; i < this.segments.length; i++) {
            const rl = this.segments[i];
            if (rl.name == name && rl.index == index) {
                line = rl;
            }
        }
        return line;
    }
    /**
     * 获取监控最近播放完成的路段线路
     */
    get activeCompletedSegment() {
        let line = null;
        if (this.segments.length == 0) return undefined;

        for (var i = 0; i < this.segments.length; i++) {
            var rl = this.segments[i];
            if (rl.isCompleted && (line == null || rl.index > line.index)) {
                line = rl;
            }
        }
        return line;
    }

}