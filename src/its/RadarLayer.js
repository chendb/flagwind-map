
import { CircleLayer } from './CircleLayer';
import { TollgateLayer } from './TollgateLayer';
import { areaPortStatistic, classStatistics } from 'apis';
import { MapUtils } from '../base/MapUtils'

export const radarLayerOptions = {
    onEvent: function (eventName, evtn) {

    }
}

/**
 * 防控圈
 */
export class RadarLayer {

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


        this.circleLayer = new CircleLayer(egovaMap, (id || "radar") + "_circle", {
            showInfoWindow: true,
            onEvent: function (eventName, evt) {
                options.onEvent(eventName, evt);
            }
        });

        this.tollgateLayer = new TollgateLayer(egovaMap, (id || "radar") + "_tollgate", {
            showInfoWindow: true,
            onEvent: function (eventName, evt) {
                options.onEvent(eventName, evt);
            }
        });


    }

    fireEvent(eventName, event) {
        this.options.onEvent(eventName, event);
    }

    showCircle(name,points){
        points=points||[];
        let circle={
            Name:name,
            Members:points.map(g=>{
                return {
                    Name:g.Name,
                    Point:g
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