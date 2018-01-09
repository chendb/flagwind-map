
import { CircleLayer } from './circle.layer';
import { TollgateLayer } from './tollgate.layer';
// import { areaPortStatistic, classStatistics } from 'apis';
import { MapUtils } from '../base/map.utils';

export const radarLayerOptions = {
    onEvent: function (eventName: any, evtn: any) {

    }
}

/**
 * 防控圈
 */
export class RadarLayer {

    circleLayer: any = null;
    tollgateLayer: any = null;
    isLoading = false;
    options: any = null;
    egovaMap: any = null;
    id: any = null;
    isShow = true;

    constructor(egovaMap: any, id: any, options: any) {
        this.egovaMap = egovaMap;
        this.id = id;
        this.options = Object.assign({}, radarLayerOptions, options);


        this.circleLayer = new CircleLayer(egovaMap, (id || "radar") + "_circle", {
            showInfoWindow: true,
            onEvent: function (eventName: any, evt: any) {
                options.onEvent(eventName, evt);
            }
        });

        this.tollgateLayer = new TollgateLayer(egovaMap, (id || "radar") + "_tollgate", {
            showInfoWindow: true,
            onEvent: function (eventName: any, evt: any) {
                options.onEvent(eventName, evt);
            }
        });


    }

    fireEvent(eventName: any, event: any) {
        this.options.onEvent(eventName, event);
    }

    showCircle(name: any, points: any) {
        points = points || [];
        let circle = {
            Name: name,
            Members: points.map((g: any) => {
                return {
                    Name: g.Name,
                    Point: g
                };
            })
        }
        this.circleLayer.clear();
        this.circleLayer.saveGraphicList([circle]);
    }

    saveGraphicList(list: Array<any>) {
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
        // const me = this;
        // me.isLoading = true;
        // me.fireEvent("showDevices", { action: "start" });
        // areaPortStatistic({}).then(response => {
        //     me.isLoading = false;
        //     me.saveGraphicList(response);
        //     me.fireEvent("showDevices", { action: "end", attributes: response });
        // }).catch(error => {
        //     me.isLoading = false;
        //     console.log('点击点位发生了错误：', error);
        //     me.fireEvent("showDevices", { action: "error", attributes: error });
        // });
    }



    /**
     * 获取资源要素点
     */
    getGraphicById(key: any) {
        return this.circleLayer.getGraphicById(key);
    }

    /**
     * 删除资源要素点
     */
    removeGraphicById(key: any) {
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

    appendTo(map: any) {
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