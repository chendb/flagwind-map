import { DeviceLayer } from '../base/DeviceLayer';
import { areaPortStatistic, carFlowStatistic } from 'apis';
import { MapUtils } from '../base/MapUtils'
import { EgovaGroupLayer } from '../base/EgovaLayer';

import app from 'src/main';

import cityData from 'assets/370500.json'

export class CityLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载

    constructor(egovaMap, id, options) {
        super(egovaMap, id, options);
    }


    onAddLayerBefor() {
        this.groupLayer = new EgovaGroupLayer(this.id + "_group");
        this.groupLayer.appendTo(this.egovaMap.innerMap);
    }

    changeStandardModel(item) {
        const _this = this;
        item.id = item.properties.name;
        item.name = item.properties.name;
        item.polyline = item.geometry.coordinates.map(g => {
            return g.map(c => {
                return c.map(gg => {
                    return gg[0] + "," + gg[1];
                }).join(";");
            }).join(";");
        }).join(";");

        return item;
    }

    showInfoWindow(evt) {

    }

    showDevices() {
        console.log(cityData);
        this.saveGraphicList(cityData.features);
    }

    validDevice(item) {
        return (item.polyline && item.polyline.length > 0)
    }
    /**
     * 修改要素
     */
    updateGraphicByDevice(item, graphic) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return;
        }
        if (!graphic) {
            graphic = this.getGraphicById(item.id);
        }
        if (graphic == null) {
            return;
        }
        this.updatePolygonGraphic(item);


        return graphic.geometry;
    }

    creatGraphicByDevice(item) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return null;
        }
        item.selected = false; // select属性为true表示当前选中，false表示未选中
        return this.creatPolygonGraphic(item);
    }

    getFillSymbol(item, width, color) {
        color = color || [38, 101, 196];

        width = width || 2;

        var polygonColor = [0, 20, 28, 0.6];
        if (item.__hover) {
            polygonColor = [100, 20, 28, 0.6];

            switch (item.PointGroupNo) {
                case "1":
                    polygonColor = [212, 35, 122];
                    break;
                case "2":
                    polygonColor = [18, 150, 219];
                    break;
                case "3":
                    polygonColor = [60, 118, 61];
                    break;
                case "4":
                    polygonColor = [234, 152, 108];
                    break;
            }
        }

        var polygonSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(
                esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new esri.Color(color),
                width
            ),
            new esri.Color(polygonColor)
        );

        return polygonSymbol;
    }

    getPolygon(strLine) {
        if (!strLine) return null;
        var polygon = new esri.geometry.Polygon(this.spatial);
        var xys = strLine.split(";");
        let points = [];
        for (var i = 0; i < xys.length; i++) {
            if ((!xys[i]) || xys[i].length <= 0) continue;
            var xy = xys[i].split(",");
            var p = this.getPoint({
                x: parseFloat(xy[0]),
                y: parseFloat(xy[1])
            });
            points.push([p.x, p.y]);
        }
        polygon.addRing(points);
        return polygon;
    }


    updatePolygonGraphic(item) {
        let polygon = this.getPolygon(item.polyline);
        delete item.polygon;
        let fillSymbol = this.getFillSymbol(item);
        const g = this.getGraphicById(item.id);
        g.setGeometry(polygon);
        g.setSymbol(fillSymbol);
        g.attributes = Object.assign({}, g.attributes, item);
        g.draw(); //重绘
    }

    creatPolygonGraphic(item) {
        let polygon = this.getPolygon(item.polyline);
        delete item.polygon;
        let fillSymbol = this.getFillSymbol(item);
        let attr = Object.assign({}, item, { __type: "Polygon" });
        let graphic = new esri.Graphic(polygon, fillSymbol, attr);
        return graphic;
    }



}