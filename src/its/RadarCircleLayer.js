
import { ControlCircleLayer } from './ControlCircleLayer';
import { TollgateLayer } from './TollgateLayer';
import { areaPortStatistic, classStatistics } from 'apis';
import { MapUtils } from '../base/MapUtils'
import { EgovaGroupLayer } from '../base/EgovaLayer';
import { LightingAnimation, AnimationLayer } from './AnimationModel';
export const radarLayerOptions = {
    onEvent: function (eventName, evtn) {

    }
}

export class RadarTollgateLayer extends TollgateLayer {
    constructor(egovaMap, id, options) {
        super(egovaMap, id, options);
        this.animationLayer = new AnimationLayer({
            size: 10,
            path: "M512 224c160 0 288 128 288 288s-128 288-288 288-288-128-288-288 128-288 288-288z",
            getColor: function getColor(item) {
                let initColor = [212, 35, 122];

                switch (item.PointGroupNo) {
                    case "1":
                        initColor = [212, 35, 122];
                        break;
                    case "2":
                        initColor = [18, 150, 219];
                        break;
                    case "3":
                        initColor = [60, 118, 61];
                        break;
                    case "4":
                        initColor = [234, 152, 108];
                        break;
                }
                return initColor;
            }
        });
        this.flashZoom = 99;
    }

    updateAnimation(item, graphic) {
        const animation = this.animationLayer.getAnimationId(item.id);
        if (animation) {
            animation.attributes = item;
            animation.graphic = graphic;
            animation.updateGraphic();
        }
    }


    createAnimation(item, graphic) {
        const animation = new LightingAnimation(item, graphic, this.animationLayer.options);
        this.animationLayer.add(animation);
    }




}



/**
 * 防控圈
 */
export class RadarCircleLayer {

    circleLayer = null;
    tollgateLayer = null;
    isLoading = false;
    options = null;
    egovaMap = null;
    id = null;
    isShow = true;

    constructor(egovaMap, id, options) {
        this.egovaMap = egovaMap;
        this.id = id;
        this.options = Object.assign({}, radarLayerOptions, options);
        const _this = this;
        this.circleLayer = new ControlCircleLayer(egovaMap, (id || "radar") + "_circle", {
            showInfoWindow: true,
            onMouseOut: function (item) {
                _this.onMouseOut(_this, item);
            },
            onMouseOver: function (item) {
                _this.onMouseOver(_this, item);
            },
            onEvent: function (eventName, evt) {
                options.onEvent(eventName, evt);
            }
        });

        this.tollgateLayer = new RadarTollgateLayer(egovaMap, (id || "radar") + "_tollgate", {
            flashlight: this.options.flashlight,
            showInfoWindow: true,
            onEvent: function (eventName, evt) {
                options.onEvent(eventName, evt);
            }
        });
    }

    onMouseOver(_this, item) {
        _this.tollgateLayer.hide();
    }

    onMouseOut(_this, item) {
        _this.tollgateLayer.show();
    }

    fireEvent(eventName, event) {
        this.options.onEvent(eventName, event);
    }

    showCircle(name, points) {
        points = points || [];
        let circle = {
            Name: name,
            Members: points.map(g => {
                return {
                    Name: g.Name,
                    Point: g
                };
            })
        }
        this.circleLayer.clear();
        this.circleLayer.saveGraphicList([circle]);
    }

    saveGraphicList(list) {
        this.circleLayer.saveGraphicList(list);
        for (let circle of list) {
            for (let mem of circle.Members) {
                if (mem.Point) {
                    mem.Point.PointGroupNo = circle.PointGroupNo;
                    this.tollgateLayer.saveGraphicByDevice(mem.Point);
                }
            }
        }
    }


    showDevices() {
        const _this = this;
        _this.isLoading = true;
        _this.fireEvent("showDevices", { action: "start" });
        areaPortStatistic({}).then(response => {
            _this.isLoading = false;
            _this.saveGraphicList(response);
            _this.fireEvent("showDevices", { action: "end", attributes: response });
        }).catch(error => {
            _this.isLoading = false;
            console.log('点击点位发生了错误：', error);
            _this.fireEvent("showDevices", { action: "error", attributes: error });
        });
    }



    /**
     * 获取资源要素点
     */
    getGraphicById(key) {
        return this.circleLayer.getGraphicById(key);
    }

    /**
     * 删除资源要素点
     */
    removeGraphicById(key) {
        this.circleLayer.removeGraphicById(key);
    }

    get count() {
        if (this.circleLayer)
            return this.circleLayer.count;
        return 0;
    }

    get _map() {
        return this.egovaMap._map;
    }

    get graphics() {
        return this.circleLayer.graphics;
    }

    appendTo(map) {
        map.addLayer(this.tollgateLayer);
        map.addLayer(this.circleLayer);
    }

    clear() {
        this.tollgateLayer.clear();
        this.circleLayer.clear();
    }

    show() {
        this.isShow = true;
        this.tollgateLayer.show();
        this.circleLayer.show();
    }

    hide() {
        this.isShow = false;
        this.tollgateLayer.hide();
        this.circleLayer.hide();
    }

}