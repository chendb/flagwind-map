import { DeviceLayer } from '../base/device.layer';
// import { areaPortStatistic, carFlowStatistic } from 'apis';
import { MapUtils } from '../base/map.utils';
declare var esri: any;

export class CircleLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载

    changeStandardModel(item: any) {
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

    showInfoWindow(evt: any) {
        if (evt.graphic) {

            const item = evt.graphic.attributes;

            // 取出PointNo
            let PointNos = item.Members.map((value: any) => {
                return value.PointNo;
            });
            // 根据pointNo请求查询车流量
            // this.getCarFlowStatistic(PointNos).then((response: any) => {
            //     item.carFlow = response;
            //     const content = this.getInfoWindowContent(evt.graphic);
            //     const title = this.getInfoWindowTitle(evt.graphic);
            //     const pt = evt.mapPoint;
            //     this.setInfoWindow(pt, title, content);
            //     //this.map.centerAt(pt).then();
            // }).catch((error: any) => {
            //     item.carFlow = "加载异常";
            //     const content = this.getInfoWindowContent(evt.graphic);
            //     const title = this.getInfoWindowTitle(evt.graphic);
            //     const pt = evt.mapPoint;
            //     this.setInfoWindow(pt, title, content)
            //     //this.map.centerAt(pt).then();
            //     console.log('点击点位发生了错误：', error);
            // });



        }
    }

    // 获取车流量数据
    getCarFlowStatistic(points: any) {
        // return carFlowStatistic({ Ids: points });
    }

    getInfoWindowContent(graphic: any) {
        let attributes = graphic.attributes;
        let tempStr = "";
        tempStr += `防控圈: ${attributes["Name"]}<br>`;
        tempStr += `设备数: ${attributes["count"]}<br>`;
        tempStr += `车流量: ${attributes["carFlow"]}<br>`;
        return tempStr;
    }


    getInfoWindowTitle(graphic: any) {
        return graphic.attributes.name;
    }

    showDevices() {
        this.isLoading = true;
        this.fireEvent("showDevices", { action: "start" });
        // areaPortStatistic({}).then((response: any) => {
        //     this.isLoading = false;
        //     this.saveGraphicList(response);
        //     this.fireEvent("showDevices", { action: "end", attributes: response });
        // }).catch((error: any) => {
        //     this.isLoading = false;
        //     console.log('点击点位发生了错误：', error);
        //     this.fireEvent("showDevices", { action: "error", attributes: error });
        // });
    }

    getLineSymbol(item: any, width: any = null, color: any = null) {
        if (item.PointGroupNo == "1" && color == null) {
            color = [138, 10, 96];
        }
        if (item.PointGroupNo == "2" && color == null) {
            color = [38, 10, 196];
        }
        color = color || [38, 101, 196];

        width = width || 8;
        var playedLineSymbol = new esri.symbol.CartographicLineSymbol(
            esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color(color), width,
            esri.symbol.CartographicLineSymbol.CAP_ROUND,
            esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
        return playedLineSymbol;
    }
    /**
    * 把点集字符串转换成线要素
    */
    getPolyline(strLine: any) {
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

    validDevice(item: any) {
        return (item.polyline && item.polyline.length > 0)
    }

    /**
     * 修改要素
     */
    updateGraphicByDevice(item: any, graphic: any) {
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

        let line = this.getPolyline(item.polyline);
        let lineSymbol = this.getLineSymbol(item);
        graphic.setSymbol(lineSymbol);
        graphic.setGeometry(line);
        graphic.attributes = item;
        graphic.draw(); //重绘

        return line;
    }

    creatGraphicByDevice(item: any) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return null;
        }
        item.select = false; // select属性为true表示当前选中，false表示未选中
        let line = this.getPolyline(item.polyline);
        let lineSymbol = this.getLineSymbol(item);
        let lineGraphic = new esri.Graphic(line, lineSymbol, item);
        return lineGraphic;
    }

}