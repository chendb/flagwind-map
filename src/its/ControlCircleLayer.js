import { DeviceLayer } from '../base/DeviceLayer';
import { areaPortStatistic, carFlowStatistic } from 'apis';
import { MapUtils } from '../base/MapUtils'
import { EgovaGroupLayer } from '../base/EgovaLayer';

export class ControlCircleLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载

    constructor(egovaMap, id, options) {
        super(egovaMap, id, options);

    }

    registerEvent() {
        let _deviceLayer = this;
        dojo.connect(this.layer, 'onClick', function (evt) {
            _deviceLayer.onLayerClick(_deviceLayer, evt);
        });

        if (this.options.showTooltipOnHover) { // 如果开启鼠标hover开关
            dojo.connect(this.layer, "onMouseOver", function (evt) {
                let attr = evt.graphic.attributes;
                attr.__hover = true;
                _deviceLayer.showFollowGraphic(attr);
                // _deviceLayer.updatePolygonGraphic(attr);
                _deviceLayer.egovaMap.showTitle(evt.graphic);
                if (_deviceLayer.options.onMouseOver) {
                    _deviceLayer.options.onMouseOver(attr);
                }
            });
            dojo.connect(this.layer, "onMouseOut", function (evt) {
                let attr = evt.graphic.attributes;
                attr.__hover = false;
                _deviceLayer.showFollowGraphic(null);
                // _deviceLayer.updatePolygonGraphic(attr);
                _deviceLayer.egovaMap.hideTitle();
                if (_deviceLayer.options.onMouseOut) {
                    _deviceLayer.options.onMouseOut(attr);
                }
            });
        }

    }

    onAddLayerBefor() {
        this.groupLayer = new EgovaGroupLayer(this.id + "_group");
        this.groupLayer.appendTo(this.egovaMap.innerMap);
    }

    changeStandardModel(item) {
        item.id = item.PointGroupNo;
        item.name = item.Name;
        item.polyline = "";
        item.count = 0;
        if (item.Members && item.Members.length > 0) {
            item.count = item.Members.length;
            let first = null;
            for (let member of item.Members) {
                if (member.Point) {
                    member.Point.id = member.Point.PointNo;
                    member.Point.name = member.Point.Name;
                    member.Point.latitude = member.Point.Latitude;
                    member.Point.longitude = member.Point.Longitude;
                    if (MapUtils.validDevice(member.Point)) {
                        //item.polyline.push([member.longitude, member.latitude]);
                        if (!first) {
                            first = (";" + member.Point.longitude + "," + member.Point.latitude);
                        }
                        item.polyline += (";" + member.Point.longitude + "," + member.Point.latitude);
                    }
                }
            }
            if (item.polyline && item.polyline.length > 0) {
                item.polyline = item.polyline.substring(1) + first;
            }
        }
        return item;
    }

    showInfoWindow(evt) {
        if (evt.graphic) {

            const item = evt.graphic.attributes;

            // 取出PointNo
            let PointNos = item.Members.map(value => {
                return value.PointNo;
            });
            // 根据pointNo请求查询车流量
            this.getCarFlowStatistic(PointNos).then(response => {
                item.carFlow = response;
                const content = this.getInfoWindowContent(evt.graphic);
                const title = this.getInfoWindowTitle(evt.graphic);
                const pt = evt.mapPoint;
                this.setInfoWindow(pt, title, content);
                //this.map.centerAt(pt).then(this.setInfoWindow(pt, title, content));
            }).catch(error => {
                item.carFlow = "加载异常";
                const content = this.getInfoWindowContent(evt.graphic);
                const title = this.getInfoWindowTitle(evt.graphic);
                const pt = evt.mapPoint;
                this.setInfoWindow(pt, title, content);
                //this.map.centerAt(pt).then();
                console.log('点击点位发生了错误：', error);
            });
        }
    }

    // 获取车流量数据
    getCarFlowStatistic(points) {
        return carFlowStatistic({ Ids: points });
    }

    getInfoWindowContent(graphic) {
        let attributes = graphic.attributes;
        let tempStr = "";
        tempStr += `防控圈: ${attributes["Name"]}<br>`;
        tempStr += `设备数: ${attributes["count"]}<br>`;
        tempStr += `车流量: ${attributes["carFlow"]}<br>`;
        return tempStr;
    }


    getInfoWindowTitle(graphic) {
        return graphic.attributes.name;
    }

    showDevices() {
        const _this = this;
        _this.isLoading = true;
        _this.fireEvent("showDevices", { action: "start" });
        areaPortStatistic({}).then(response => {
            _this.isLoading = false;
            _this.dataList = response;
            _this.saveGraphicList(response);
            _this.fireEvent("showDevices", { action: "end", attributes: response });
        }).catch(error => {
            _this.isLoading = false;
            console.log('点击点位发生了错误：', error);
            _this.fireEvent("showDevices", { action: "error", attributes: error });
        });
    }

    validDevice(item) {
        return (item.polyline && item.polyline.length > 0)
    }

    removeGraphicById(key) {
        const graphic = this.getGraphicById(key);
        if (graphic != null) {
            this.layer.remove(graphic);
        }
        this.groupLayer.removeGraphicByName(key);
    }

    clear() {
        this.layer.clear();
        this.groupLayer.clear();
    }

    show() {
        this.isShow = true;
        this.layer.show();
        this.groupLayer.show();
    }

    hide() {
        this.isShow = false;
        this.layer.hide();
        this.groupLayer.hide();
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

        this.updateCentreGraphic(item);
        this.updateLineGraphic(item);
        this.updatePolygonGraphic(item);


        return this.getCentrePoint(item);
    }

    addGraphicByDevice(item) {
        const graphic = this.creatGraphicByDevice(item);
        try {
            if (graphic == null) return;
            this.layer.add(graphic);
            this.groupLayer.addGraphice(item.id, [this.creatPolygonGraphic(item), this.creatLineGraphic(item)]);
        } catch (ex) {
            console.log(ex);
        }
    }

    creatGraphicByDevice(item) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return null;
        }
        item.selected = false; // select属性为true表示当前选中，false表示未选中
        return this.creatCentreGraphic(item);
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


    getLineSymbol(item, width, color) {
        if (item.PointGroupNo == "1" && color == null) {
            //color = [138, 10, 96];
            color = [0, 125, 182];
        }
        if (item.PointGroupNo == "2" && color == null) {
            //color = [38, 10, 196];
            color = [103, 193, 234];
        }
        color = color || [38, 101, 196];

        switch (item.PointGroupNo) {
            case "1":
                color = [212, 35, 122];
                break;
            case "2":
                color = [18, 150, 219];
                break;
            case "3":
                color = [60, 118, 61];
                break;
            case "4":
                color = [234, 152, 108];
                break;
        }

        width = width || 1;
        var playedLineSymbol = new esri.symbol.CartographicLineSymbol(
            esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color(color), width,
            esri.symbol.CartographicLineSymbol.CAP_ROUND,
            esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
        return playedLineSymbol;
    }
    /**
    * 把点集字符串转换成线要素
    */
    getPolyline(strLine) {
        if (!strLine) return null;
        var line = new esri.geometry.Polyline(this.spatial);
        var xys = strLine.split(";");
        for (var i = 1; i < xys.length; i++) {
            if ((!xys[i]) || xys[i].length <= 0) continue;
            var startXy = xys[i - 1].split(",");
            var endXy = xys[i].split(",");
            var start = this.getPoint({
                x: parseFloat(startXy[0]),
                y: parseFloat(startXy[1])
            });
            var end = this.getPoint({
                x: parseFloat(endXy[0]),
                y: parseFloat(endXy[1])
            });
            line.addPath([[start.x, start.y], [end.x, end.y]]);
        }
        return line;
    }


    showFollowGraphic(item) {
        const _this = this;
        (this.groupLayer.layer.graphics).forEach(g => {
            if ((!item) || item.id == g.attributes.__name) {
                if (g.attributes.__type == "Polygon") {
                    g.setSymbol(_this.getFillSymbol(g.attributes));
                    g.draw(); //重绘
                }
                if (g.attributes.__type == "Polyline") {
                    g.setSymbol(_this.getLineSymbol(g.attributes));
                    g.draw(); //重绘
                }

            } else {
                if (g.attributes.__type == "Polygon") {
                    g.setSymbol(null);
                    g.draw(); //重绘
                }
                if (g.attributes.__type == "Polyline") {
                    g.setSymbol(null);
                    g.draw(); //重绘
                }
            }

        });

        this.layer.graphics.forEach(g => {
            if ((!item) || item.id == g.attributes.id) {
                g.setSymbol(_this.getCentreSymbol(g.attributes));
                g.draw();
            } else {
                g.setSymbol(null);
                g.draw();
            }
        });
    }

    updatePolygonGraphic(item) {
        let polygon = this.getPolygon(item.polyline);
        let fillSymbol = this.getFillSymbol(item);
        this.groupLayer.getGraphicByName(item.id).forEach(g => {
            if (g.attributes.__type == "Polygon") {
                g.setGeometry(polygon);
                g.setSymbol(fillSymbol);
                g.attributes = Object.assign({}, g.attributes, item, { __type: "Polygon" });
                g.draw(); //重绘
            }
        });
    }
    creatPolygonGraphic(item) {
        let polygon = this.getPolygon(item.polyline);
        let fillSymbol = this.getFillSymbol(item);
        let attr = Object.assign({}, item, { __type: "Polygon" });
        let graphic = new esri.Graphic(polygon, fillSymbol, attr);
        return graphic;
    }

    updateLineGraphic(item) {
        let polyline = this.getPolyline(item.polyline);
        let lineSymbol = this.getLineSymbol(item);
        this.groupLayer.getGraphicByName(item.id).forEach(g => {
            if (g.attributes.__type == "Polyline") {
                g.setGeometry(polyline);
                g.setSymbol(lineSymbol);
                g.attributes = Object.assign({}, g.attributes, item, { __type: "Polyline" });
                g.draw(); //重绘
            }
        });
    }

    creatLineGraphic(item) {
        let polyline = this.getPolyline(item.polyline);
        let lineSymbol = this.getLineSymbol(item);
        let attr = Object.assign({}, item, { __type: "Polyline" });
        const graphic = new esri.Graphic(polyline, lineSymbol, attr);
        return graphic;
    }

    updateCentreGraphic(item) {
        let graphic = this.getGraphicById(item.id);
        if (graphic == null) return;
        let pt = this.getCentrePoint(item.polyline);
        let symbol = this.getCentreSymbol(item);
        let attr = Object.assign({}, graphic.attributes, item, { __type: "Centre" });
        graphic.setSymbol(symbol);
        graphic.setGeometry(pt);
        graphic.attributes = attr;
        graphic.draw(); //重绘
    }

    getCentreSymbol(info) {
        let url = null;
        // 选中图标
        if (info.selected) {
            url = require('assets/area-centre-mark-checked.png');
        }
        url = require('assets/area-centre-mark.png');
        let symbol = new esri.symbol.PictureMarkerSymbol(url, 32, 48);
        symbol.setOffset(0, 15);
        return symbol;
    }

    // getCentrePoint(strLine) {
    //     if (!strLine) return null;
    //     var xys = strLine.split(";");
    //     let points = [];
    //     let xmax = 0, ymax = 0, xmin = 0, ymin = 0;
    //     for (var i = 0; i < xys.length; i++) {
    //         if ((!xys[i]) || xys[i].length <= 0) continue;
    //         var xy = xys[i].split(",");
    //         let x = parseFloat(xy[0]);
    //         let y = parseFloat(xy[1]);
    //         if (xmax == xmin && xmin == 0) {
    //             xmax = xmin = x;
    //         }
    //         if (ymax == ymin && ymin == 0) {
    //             ymax = ymin = y;
    //         }
    //         if (y > ymax) {
    //             ymax = y;
    //         }
    //         if (y < ymin) {
    //             ymin = y;
    //         }
    //         if (x > xmax) {
    //             xmax = x;
    //         }
    //         if (x < xmin) {
    //             xmin = x;
    //         }
    //     }
    //     if (xmax == xmin && ymax == ymin && ymin == 0) {
    //         return null;
    //     }

    //     var p = this.getPoint({
    //         x: (xmax + xmin) * 1.0 / 2,
    //         y: (ymax + ymin) * 1.0 / 2
    //     });
    //     return p;
    // }

    getCentrePoint(strLine) {
        if (!strLine) return null;
        let geo = this.getPolygon(strLine);
        let pt = geo.getCentroid();
        return pt;
    }

    creatCentreGraphic(item) {
        let geo = this.getPolygon(item.polyline);
        let pt = geo.getCentroid();
        //let pt = this.getCentrePoint(item.polyline);
        const graphic = new esri.Graphic(pt, this.getCentreSymbol(item), item);
        return graphic;
    }

}