import { EgovaRouteLayer } from '../base/EgovaRouteLayer';
import { mapPoints, classStatistics } from 'apis';
import { MapUtils } from '../base/MapUtils'
import { MapSetting } from 'settings';
import { EgovaGroupLayer } from '../base/EgovaLayer';
/**
 * 车辆路由图层
 */
export class VehicleRouteLayer extends EgovaRouteLayer {

    constructor(egovaMap, layerName, options) {
        super(egovaMap, layerName, options);
        // 移动的小车车牌
    }

    onAddLayerAfter() {
        // 移动的小车车牌
        this.moveLabelLayer = new EgovaGroupLayer(this.layerName + "LabelLayer");
        this.egovaMap.innerMap.addLayer(this.moveLabelLayer.layer);
    }


    /**
     * 创建移动要素
     * @param {*} trackline 线路
     * @param {*} graphic 要素
     * @param {*} angle 偏转角
     */
    createMoveMark(trackline, graphic, angle) {
        var mg = this.getMarkerGraphic(trackline, graphic, angle);
        trackline._markerGraphic = mg;
        this.moveMarkLayer.add(mg);
        this.createVehiclePlateMarker(trackline, graphic, angle);
    }

    /**
     * 每次位置移动线路上的要素样式变换操作
     */
    changeMovingGraphicSymbol(trackline, point, angle) {
        if (trackline == undefined) return;
        const symbol = trackline._markerGraphic.symbol;
        symbol.setAngle(360 - angle);
        trackline._markerGraphic.setSymbol(symbol);
        trackline._markerGraphic.setGeometry(point);
        trackline._markerGraphic.draw();//重绘

        this.moveLabelLayer.setGeometry(trackline.name, point);
    }

    createVehiclePlateMarker(trackline, graphic, angle) {
        let text = this.getVehiclePlateGraphic(trackline, graphic, angle);
        let bg = this.getVehiclePlateBgGraphic(trackline, graphic, angle);
        this.moveLabelLayer.addGraphice(trackline.name, [text, bg]);
    }

    getSpatialReferenceFormNA() {
        if (MapSetting.wkid == 3857 && MapSetting.is25D && MapSetting.wkidFromApp == 4326) {
            return new esri.SpatialReference({ wkid: MapSetting.wkidFromApp });
        }
        return new esri.SpatialReference({ wkid: this.egovaMap.spatial.wkid });
    }

    toStopPoint(item) {
        let lnglat = { 'lat': item.latitude, 'lon': item.longitude };
        if (!MapUtils.validDevice(item)) {
            lnglat.lon = item.x;
            lnglat.lat = item.y;
        }

        if (MapSetting.wkid == 3857 && MapSetting.is25D && MapSetting.wkidFromApp == 4326) {
            return new esri.geometry.Point(lnglat.lon, lnglat.lat, this.getSpatialReferenceFormNA());
        }

        // 以x,y属性创建点
        return this.egovaMap.getPoint(item);
    }


    getStandardStops(name, stops, stopSymbol) {
        const stopGraphics = [];
        for (let i = 0; i < stops.length; i++) {
            if (stops[i] instanceof Array) {
                stopGraphics.push(new esri.Graphic(this.toStopPoint({
                    lon: stops[i][0],
                    lat: stops[i][1]
                }), stopSymbol, { type: "stop", line: name }));
            }
            else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                stopGraphics.push(new esri.Graphic(
                    stops[i],
                    stopSymbol, { type: "stop", line: name }
                ));
            } else {
                stopGraphics.push(new esri.Graphic(
                    this.toStopPoint(stops[i].attributes),
                    stopSymbol, { type: "stop", model: stops[i].attributes, line: name }
                ));
            }
        }
        return stopGraphics;
    }

    /**
     * 修改路段坐标系
     * @param {*} segment 路段
     * @param {*} egovaMap 地图修饰类
     */
    changeSegmentSpatial(segment, egovaMap) {

        const polyline = new esri.geometry.Polyline(egovaMap.spatial.wkid);
        for (let j = 0; j < segment.polyline.paths.length; j++) {
            let points = segment.polyline.paths[j].map(xy => {
                let pt = this.egovaMap.getPoint({
                    longitude: xy[0],
                    latitude: xy[1]
                });
                return [pt.x, pt.y];
            });
            polyline.addPath(points);
        };
        segment.polyline = polyline;

        if (segment.line) {
            let line = segment.line.map(xy => {
                let pt = egovaMap.getPoint({
                    longitude: xy[0],
                    latitude: xy[1]
                });
                return [pt.x, pt.y];
            });
            segment.line = line;
        }

        if (segment.startGraphic) {
            let startGeometry = segment.startGraphic.geometry;
            segment.startGraphic.setGeometry(egovaMap.getPoint({
                longitude: startGeometry.x,
                latitude: startGeometry.y
            }));
        }

        if (segment.endGraphic) {
            let endGeometry = segment.endGraphic.geometry;
            segment.endGraphic.setGeometry(egovaMap.getPoint({
                longitude: endGeometry.x,
                latitude: endGeometry.y
            }));
        }

        if (segment.waypoints) {
            segment.waypoints.forEach(g => {
                let geometry = g.geometry;
                g.setGeometry(egovaMap.getPoint({
                    longitude: geometry.x,
                    latitude: geometry.y
                }));
            });
        }
    }

    /**
     * 线段创建完成事件回调
     * @param {*} segment 
     */
    onCreateSegmentLineComplete(segment) {
        if (MapSetting.wkid == 3857 && MapSetting.is25D && MapSetting.wkidFromApp == 4326) {
            this.changeSegmentSpatial(segment, this.egovaMap);
        }
    }


    /**
     * 线路上移动要素的构建（子）
     */
    getMarkerGraphic(trackline, graphic, angle) {
        var markerUrl = require('assets/maps/car.png');// trackline.markerUrl || "static/resources/images/map/icon/" + moveIconName + "On.png";
        var markerHeight = trackline.options.markerHeight || 48;
        var markerWidth = trackline.options.markerWidth || 48;
        var symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerWidth, markerHeight);
        return new esri.Graphic(graphic.geometry, symbol, { type: "marker", line: trackline.name });
    }
    /**
     * 线路上移动要素的上方label构建
     */
    getVehiclePlateGraphic(trackline, graphic, angle) {
        if (!trackline.options.plateNo) return null;
        var text = new esri.symbol.TextSymbol(trackline.options.plateNo);
        var font = new esri.symbol.Font();
        font.setSize("10pt");
        font.setFamily("微软雅黑");
        text.setFont(font);
        text.setColor(new esri.Color([255, 255, 255, 100]));
        text.setOffset(0, 40);
        return new esri.Graphic(graphic.geometry, text, { type: "label", line: trackline.name });
    }
    getVehiclePlateBgGraphic(trackline, graphic, angle) {
        if (!trackline.plateNo) return null;
        var markerUrl = require('assets/maps/plate_blue.png');
        var pmsTextBg = new esri.symbol.PictureMarkerSymbol(markerUrl, 0, 100);
        var textLength = trackline.options.plateNo.length;
        pmsTextBg.setWidth(textLength * 13.5 + 5);
        var bgGraphic = new esri.Graphic(graphic.geometry, pmsTextBg, { type: "label", line: trackline.name });
        bgGraphic.symbol.setOffset(0, 40 + 5);
        return bgGraphic;
    }
}