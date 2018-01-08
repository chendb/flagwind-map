import { FlagwindMap } from './flagwind.map';
import { FlagwindFeatureLayer } from './flagwind.layer';
import { MapUtils } from './map.utils';
declare var esri: any;
declare var dojo: any;

export class EchartsLayer {
    _echartsContainer: HTMLDivElement;
    flagwindMap: FlagwindMap;

    name = "EchartsLayer";
    _map: any;
    _ec: any;
    _geoCoord = [];
    _option: any;
    _mapOffset = [0, 0];

    constructor(flagwindMap: FlagwindMap, ec: any) {
        this._map = flagwindMap.innerMap;
        this.flagwindMap = flagwindMap;
        (<any>window).ec = ec;
        var div = this._echartsContainer = document.createElement('div');
        div.style.position = 'absolute';
        div.style.height = flagwindMap.innerMap.height + 'px';
        div.style.width = flagwindMap.innerMap.width + 'px';
        div.style.top = '0';
        div.style.left = '0';
        this._map.__container.children[0].appendChild(div);

    }

    //初始化mapoverlay
    /**
     * 获取echarts容器
     *
     * @return {HTMLElement}
     * @public
     */
    getEchartsContainer() {
        return this._echartsContainer;
    }
    /**
     * 获取map实例
     *
     * @return {map.Map}
     * @public
     */
    getMap() {
        return this._map;
    }
    /**
     * 经纬度转换为屏幕像素
     *
     * @param {Array.<number>} geoCoord  经纬度
     * @return {Array.<number>}
     * @public
     */
    geoCoord2Pixel(geoCoord: any) {
        var point = new esri.geometry.Point(geoCoord[0], geoCoord[1]);
        var pos = this._map.toScreen(point);
        return [pos.x, pos.y];
    }

    /**
     * 屏幕像素转换为经纬度
     *
     * @param {Array.<number>} pixel  像素坐标
     * @return {Array.<number>}
     * @public
     */
    pixel2GeoCoord(pixel: any[]) {
        var point = this._map.toMap(new esri.geometry.ScreenPoint(pixel[0], pixel[1]));
        return [point.lng, point.lat];
    }

    /**
     * 初始化echarts实例
     *
     * @return {ECharts}
     * @public
     */
    initECharts() {
        const self = this;
        this._ec = (<any>window).ec.init.apply(self, arguments);
        if (this._ec.Geo) {
            this._ec.Geo.prototype.dataToPoint = function (e: any) {
                var t = new esri.geometry.Point(e[0], e[1]);
                var i = self._map.toScreen(t);
                return [i.x, i.y];
            };
        }
        this._bindEvent();
        return this._ec;
    }

    /**
     * 获取ECharts实例
     *
     * @return {ECharts}
     * @public
     */
    getECharts() {
        return this._ec;
    }


    setOption(e: any, t: any) {
        this._option = e;
        this._ec.setOption(e, t);
    }


    /**
     * 绑定地图事件的处理方法
     *
     * @private
     */
    _bindEvent() {
        const self = this;
        self._map.on('zoom-end', function (e: any) {
            self._ec.resize();
            self._echartsContainer.style.visibility = "visible";
        });
        self._map.on('zoom-start', function (e: any) {
            self._echartsContainer.style.visibility = "hidden";
        });
        self._map.on('pan', function (e: any) {
            self._echartsContainer.style.visibility = "hidden"
        });
        self._map.on('pan-end', function (e: any) {
            self._ec.resize(),
                self._echartsContainer.style.visibility = "visible"
        });

        self._map.on("resize", function () {
            if (self._echartsContainer.parentNode == null) return;
            if (self._echartsContainer.parentNode.parentNode == null) return;
            var e = <any>self._echartsContainer.parentNode.parentNode.parentNode;
            self._mapOffset = [-parseInt(e.style.left) || 0, -parseInt(e.style.top) || 0];
            self._echartsContainer.style.left = self._mapOffset[0] + "px";
            self._echartsContainer.style.top = self._mapOffset[1] + "px";
            setTimeout(function () {
                self._map.resize(); self._map.reposition(); self._ec.resize();
            }, 200);
            self._echartsContainer.style.visibility = "visible"
        });

        self._ec.getZr().on('dragstart', function (e: any) {

        });
        self._ec.getZr().on('dragend', function (e: any) {

        });
        self._ec.getZr().on('mousewheel', function (e: any) {
            (<any>self)._lastMousePos = self._map.toMap(new esri.geometry.ScreenPoint(e.event.x, e.event.y));
            var delta = e.wheelDelta, map = self._map, zoom = map.getZoom();
            delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
            delta = Math.max(Math.min(delta, 4), -4);
            delta = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoom + delta)) - zoom;
            (<any>self)._delta = 0;
            (<any>self)._startTime = null;
            delta && map.setZoom(zoom + delta);
        });
    }



}
