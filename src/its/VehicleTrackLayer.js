import { EgovaRouteOptions } from '../base/EgovaRouteLayer';
import { mapPoints, classStatistics } from 'apis';
import { MapUtils } from '../base/MapUtils'

import { TollgateLayer } from './TollgateLayer'
import { VehicleRouteLayer } from './VehicleRouteLayer'




export const vehicleTrackLayerOption = {
    onTollgateChanged: function (index, graphic) {

    },
    onMessageEvent(name, message) {

    }
}

/**
 * 
 * 车辆轨迹图层
 * 
 * @export
 * @class VehicleTrackLayer
 */
export class VehicleTrackLayer {

    tollgateLayer = null;
    speed = 200;
    times = 1;
    isShow = true;

    constructor(egovaMap, id, options) {
        this.options = options = Object.assign({}, vehicleTrackLayerOption, options);
        this.egovaMap = egovaMap;
        this.trackingLineName = id + "_tracking";
        let _this = this;

        /**
         * 卡口图层
         */
        this.tollgateLayer = new TollgateLayer(egovaMap, id + "_toll", {
            /**
             * 车辆经过卡口位置变化事件回调
             */
            onPositionChanged: function (start_end, graphic) {
                _this.onPositionChanged(start_end, graphic, _this);
            }
        });



        /**
         * 轨迹图层
         */
        this.vehicleRouteLayer = new VehicleRouteLayer(egovaMap, id + "_route", {
            routeType: "NA",
            /**
             * 当轨迹上的移动物体进出卡口点事件回调
             */
            onStationEvent: function (name, index, graphic, isStartPoint, trackline) {
                if (index == 0) {
                    _this.egovaMap.centerAt(graphic.geometry.x, graphic.geometry.y);
                }
                if (isStartPoint) { // 进站 
                    //trackline.showMovingGraphic();
                }
                else { // 出站
                    //  trackline.hideMovingGraphic();
                    _this.tollgateLayer.saveGraphicByDevice(graphic.attributes.model);
                    _this.options.onTollgateChanged(index + 1, graphic);
                }
            },
            onMoveEvent: function (lineName, segmentIndex, xy, angle) {
                _this.options.onMessageEvent("info", "正在播放");
            },
            onLineEndEvent(lineName, segmentIndex, trackLine) {
                _this.options.onMessageEvent("success", "播放结束");
            },
            onMovingClick: function (evt) {
                if (_this.trackLine.isRunning) {
                    _this.stop();
                } else {
                    _this.continue();
                }
            }
        });

        // 当地图已经加载时直接执行_onLoad方法
        if (this.egovaMap.innerMap.loaded) {
            _this.onMapLoad();
        } else {
            this.egovaMap.innerMap.on("load", function () {
                _this.onMapLoad();
            });
        }
    }

    onMapLoad() {
        if (this.options.onMapLoad) {
            this.options.onMapLoad();
        }
    }

    /**
     * 显示过车记录并显示卡口点位
     * @param data 过车记录
     * @param content 弹窗信息
     */
    showPassVehicle(data, content) {
        var xy = [data.longitude, data.latitude];
        this.showInfoAndCenter(xy, "过车信息", content);
        if (this.passTollGraphice) {
            this.egovaMap.innerMap.graphics.remove(this.passTollGraphice);
            this.passTollGraphice = null;
        }
        var tollInfo = {
            tollName: data.tollName,
            tollCode: data.tollCode,
            tollLongitude: data.tollLongitude,
            tollLatitude: data.tollLatitude
        }
        // 由卡口图层创建要素
        this.passTollGraphice = this.tollgateLayer.creatGraphicByDevice(tollInfo);
        this.egovaMap.innerMap.graphics.add(this.passTollGraphice);
    }
    /**
     * 显示信息窗
     * @param xy 坐标数据
     * @param title 标题
     * @param content 内容
     */
    showInfoAndCenter(xy, title, content) {
        var _this = this;
        var pt = this.egovaMap.getPoint({ x: xy[0], y: xy[1] });
        this.egovaMap.innerMap.centerAt(pt).then(function () {
            _this.egovaMap.getInfoWindow().setContent(content);
            _this.egovaMap.getInfoWindow().setTitle(title);
            _this.egovaMap.getInfoWindow().show(pt);
        });
    }

    /**
     * 根据list构建graphic点，会忽略远点的卡口点位
     */
    getGraphicList(list) {
        var graphics = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            // 由egMapToll创建的Graphic对象
            var graphic = this.tollgateLayer.creatGraphicByDevice(item);
            if (graphic) {
                graphics.push(graphic);
            } else {
                console.debug("构建停靠点失败:" + item);
            }
        }
        return graphics;
    }

    /**
     * 直接显示串联list中所有点位的轨迹，无播放动画
     */
    showTrack(list) {
        var _this = this;
        this.clear();
        if (list == null || list.length == 0) {
            this.options.onMessageEvent("warning", "没有轨迹数据");
            console.warn("没有轨迹数据！");
            return;
        }
        var stops = this.getGraphicList(list);
        if (stops == null && stops.length == 0) {
            this.options.onMessageEvent("warning", "无有效坐标");
            console.warn("没有有效的坐标点信息！");
            return;
        }
        if (stops.length < 2) {
            this.options.onMessageEvent("warning", "有效点少于2");
            console.warn("经过有效点位数不得少于2！");
            return;
        }
        this.vehicleRouteLayer.solveSegment(this.trackingLineName, stops, {
            numsOfKilometer: 0
        });
        //启动线路播放（起点为线路的始点）
        this.vehicleRouteLayer.start(this.trackingLineName);
    }

    /**
    * 当警车位置改变时播放轨迹
    */
    onPositionChanged(start_end, graphic, _this) {
        var id = graphic.attributes.id;
        _this.vehicleRouteLayer.solve(id, start_end, {
            numsOfKilometer: 50, attributes: { label: graphic.attributes.name }
        });
        _this.options.onPositionChanged(start_end, graphic);
        if (!_this.vehicleRouteLayer.getIsRunning(id)) {
            _this.vehicleRouteLayer.move(id);
        }
    }

    /**
    * 清除要素
    */
    clear() {
        this.vehicleRouteLayer.clearAll();
        this.tollgateLayer.clear();
    }
    /**
     * 显示图层
     */
    show() {
        this.isShow = true;
        this.vehicleRouteLayer.show();
        this.tollgateLayer.show();
    }
    /**
     * 隐藏图层
     */
    hide() {
        this.isShow = false;
        this.vehicleRouteLayer.hide();
        this.tollgateLayer.hide();
    }



    /**
     * 启动线路播放（起点为线路的始点）
     */
    start(list) {
        this.stop(this.trackingLineName);
        this.clear();
        if (list == null || list.length == 0) {
            this.options.onMessageEvent("warning", "没有轨迹数据");
            console.warn("没有轨迹数据！");
            return;
        }
        var stops = this.getGraphicList(list);
        if (stops == null && stops.length == 0) {
            this.options.onMessageEvent("warning", "无有效的坐标");
            console.warn("没有有效的坐标点信息！");
            return;
        }
        if (stops.length < 2) {
            this.options.onMessageEvent("warning", "有效点少于2");
            console.warn("经过有效点位数不得少于2！");
            return;
        }
        this.vehicleRouteLayer.solveSegment(this.trackingLineName, stops, {
            numsOfKilometer: 50,
            //plateNo:"鄂AC4661",
            speed: this.speed,
            autoShowLine: true
        });
        //启动线路播放（起点为线路的始点）
        this.vehicleRouteLayer.start(this.trackingLineName);
    }

    get trackLine() {
        return this.vehicleRouteLayer.getTrackLine(this.trackingLineName);
    }

    /**
     * 停止
     */
    stop() {
        this.options.onMessageEvent("info", "已停止");
        this.vehicleRouteLayer.stop(this.trackingLineName);
    }
    /**
     * 启动线路播放（起点为上次播放的终点）
     */
    move() {
        this.vehicleRouteLayer.move(this.trackingLineName);
    }
    /**
     * 暂停
     */
    pause() {
        this.options.onMessageEvent("info", "已暂停");
        this.vehicleRouteLayer.start(this.trackingLineName);
    }
    /**
     * 继续
     */
    continue() {
        this.vehicleRouteLayer.continue(this.trackingLineName);
    }

    speedUp() {
        let speed = this.speed * 1.5;
        this.changeSpeed(speed);
    }

    speedDown() {
        let speed = this.speed / 2;
        this.changeSpeed(speed);
    }

    /**
     * 调速
     */
    changeSpeed(speed) {
        this.speed = speed;
        this.vehicleRouteLayer.changeSpeed(this.trackingLineName, speed);
    }
    /**
     * 清除所有
     */
    clear() {
        this.tollgateLayer.clear();
        this.vehicleRouteLayer.clearAll();
    }

}