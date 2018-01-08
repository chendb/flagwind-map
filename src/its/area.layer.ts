import { DeviceLayer } from '../base/device.layer';
 
import { MapUtils } from '../base/map.utils'
declare var esri: any;
declare var dojo: any;
declare var dijit:any;

/**
 * 重点区域
 */
export class AreaLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载

    changeStandardModel(item:any) {
        item.id = item.AreaNo;
        item.name = item.Name;
        if (item.VertexesText) {
            item.polygon = item.VertexesText;
        }
        return item;
    }

    showInfoWindow(evt:any) {
        if (evt.graphic) {
            const content = this.getInfoWindowContent(evt.graphic);
            const title = this.getInfoWindowTitle(evt.graphic);
            const pt = evt.mapPoint;
            this.map.centerAt(pt).then(this.setInfoWindow(pt, title, content));
        }
    }

    getInfoWindowContent(graphic:any) {
        let attributes = graphic.attributes;
        console.log('attributes', attributes);
        let tempStr = "";
        tempStr += `防控圈: ${attributes["Name"]}<br>`;
        tempStr += `人控设备: 356<br>`;
        tempStr += `车控设备: 81<br>`;
        tempStr += `视频: 200<br>`;
        tempStr += `车流量: 3056<br>`;
        tempStr += `人流量: 680<br>`;
        return tempStr;
    }

    getInfoWindowTitle(graphic:any) {
        return graphic.attributes.name;
    }
    focueArea(args:any){
        return 
    }

    showDevices() {
        // const _this = this;
        // _this.isLoading = true;
        // _this.fireEvent("showDevices", { action: "start" });
        // focueArea({}).then(response => {
        //     _this.isLoading = false;
        //     _this.saveGraphicList(response);
        //     _this.fireEvent("showDevices", { action: "end", attributes: response });
        // }).catch(error => {
        //     _this.isLoading = false;
        //     console.log('点击点位发生了错误：', error);
        //     _this.fireEvent("showDevices", { action: "error", attributes: error });
        // });
    }

    getFillSymbol(item:any, width:number|null=null, color:number[]|null=null) {
        color = color || [38, 101, 196];

        width = width || 2;
        var polygonColor = [60, 137, 253, 0.6];
        var polygonSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(
                esri.symbol.SimpleLineSymbol.STYLE_DOT,
                new esri.Color([151, 249, 0, .80]),
                width
            ),
            new esri.Color(polygonColor)
        );

        return polygonSymbol;
    }
    /**
    * 把点集字符串转换成线要素
    */
    getPolygon(strLine: any) {
        if (!strLine) return null;
        let line = [];
        let xys = strLine.indexOf("|") >= 0 ? strLine.split("|") : strLine.split(";");
        for (var i = 0; i < xys.length; i++) {
            if ((!xys[i]) || xys[i].length <= 0) continue;
            let pointXy = xys[i].split(",");
            let point = this.getPoint({
                x: parseFloat(pointXy[0]),
                y: parseFloat(pointXy[1])
            });
            line.push([point.x, point.y]);
        }
        var json = {
            "spatialReference": { "wkid": this.flagwindMap.spatial.wkid },
            "rings": [line]
        };
        return esri.geometry.Polygon(json);
    }

    validDevice(item:any) {
        return (item.polygon && item.polygon.length > 0)
    }

    /**
     * 修改要素
     */
    updateGraphicByDevice(item:any, graphic:any) {
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

        let polygon = this.getPolygon(item.polygon);
        let fillSymbol = this.getFillSymbol(item);
        graphic.setSymbol(fillSymbol);
        graphic.setGeometry(polygon);
        graphic.attributes = item;
        graphic.draw(); //重绘
 
    }

    creatGraphicByDevice(item:any) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return null;
        }
        item.select = false; // select属性为true表示当前选中，false表示未选中
        let polygon = this.getPolygon(item.polygon);
        let fillSymbol = this.getFillSymbol(item);
        let graphic = new esri.Graphic(polygon, fillSymbol, item);
        return graphic;
    }

}