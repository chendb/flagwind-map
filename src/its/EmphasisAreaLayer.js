import { DeviceLayer } from '../base/DeviceLayer';
import { EgovaGroupLayer } from '../base/EgovaLayer';
import { focueArea, classStatistics } from 'apis';
import { MapUtils } from '../base/MapUtils'

/**
 * 重点区域
 */
export class EmphasisAreaLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载

    constructor(egovaMap, id, options) {
        super(egovaMap, id, options);
    }

    onAddLayerBefor() {
        this.groupLayer = new EgovaGroupLayer(this.id + "_group");
        this.groupLayer.appendTo(this.egovaMap.innerMap);
    }

    changeStandardModel(item) {
        item.id = item.AreaNo;
        item.name = item.Name;
        item.longitude = item.Longitude;
        item.latitude = item.Latitude;
        //if ((!item.Center) && item.VertexesText) {
        //    item.Center = item.VertexesText.split('|')[0];
        //}
        //if (item.Center) {
        //    let strXY = item.Center.split('|')[0].split(",");
        //    item.longitude = parseFloat(strXY[0]);
        //    item.latitude = parseFloat(strXY[1]);
        //}
        item.radius = item.Radius;
        if (!item.radius) {
            item.radius = 200;
        }
        return item;
    }

    showInfoWindow(evt) {
        if (evt.graphic) {
            const content = this.getInfoWindowContent(evt.graphic);
            const title = this.getInfoWindowTitle(evt.graphic);
            const pt = evt.mapPoint;
            this.map.centerAt(pt).then(this.setInfoWindow(pt, title, content));
        }
    }

    getInfoWindowContent(graphic) {
        let attributes = graphic.attributes;
        console.log('attributes', attributes);
        let tempStr = "";
        //tempStr += `重点区域: ${attributes["Name"]}<br>`;
        tempStr += `人控设备: 356<br>`;
        tempStr += `车控设备: 81<br>`;
        tempStr += `视频: 200<br>`;
        tempStr += `车流量: 3056<br>`;
        tempStr += `人流量: 680<br>`;
        return tempStr;
    }

    getInfoWindowTitle(graphic) {
        return graphic.attributes.name;
    }

    showDevices() {
        const _this = this;
        _this.isLoading = true;
        _this.fireEvent("showDevices", { action: "start" });
        focueArea({}).then(response => {
            _this.isLoading = false;
            _this.saveGraphicList(response);
            _this.fireEvent("showDevices", { action: "end", attributes: response });
        }).catch(error => {
            _this.isLoading = false;
            console.log('点击点位发生了错误：', error);
            _this.fireEvent("showDevices", { action: "error", attributes: error });
        });
    }

    getFillSymbol(item, width, color) {
        color = color || [38, 101, 196];

        width = width || 2;
        var polygonColor = [0, 20, 28, 0.6];
        var polygonSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(
                esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new esri.Color(color),
                width
            ),
            new esri.Color(color)
        );

        return polygonSymbol;
    }
    /**
    * 把点集字符串转换成线要素
    */
    getCircle(item) {
        const pt = this.getPoint(item);
        return new esri.geometry.Circle({
            center: pt,
            geodesic: true,
            radiusUnit: esri.Units.MILES,
            radius: item.radius
        });
    }

    validDevice(item) {
        return item.longitude && item.latitude && item.radius;
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

        let circle = this.getCircle(item);
        let fillSymbol = this.getFillSymbol(item);
        graphic.setSymbol(fillSymbol);
        graphic.setGeometry(circle);
        graphic.attributes = item;
        graphic.draw(); //重绘

        const pt = this.getPoint(item);
        this.groupLayer.setGeometry(item.id, pt);


        return circle;
    }

    creatGraphicByDevice(item) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return null;
        }
        item.select = false; // select属性为true表示当前选中，false表示未选中
        let circle = this.getCircle(item);
        let fillSymbol = this.getFillSymbol(item);
        let graphic = new esri.Graphic(circle, fillSymbol, item);
        console.log(graphic);
        return graphic;
    }

    addGraphicByDevice(item) {
        const graphic = this.creatGraphicByDevice(item);
        try {
            if (graphic == null) return;
            this.layer.add(graphic);
            const pt = this.getPoint(item);
            console.log("group" + pt);
            let followGraphic = this.creatFollowGraphic(pt);
            if (followGraphic) {
                this.groupLayer.addGraphice(item.id, [followGraphic]);
            }
        } catch (ex) {
            console.log(ex);
        }
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

    getFillSymbol(width, color) {
        color = color || [38, 101, 196];
        width = width || 2;
        var polygonColor = [60, 137, 253, 0.6];
        var polygonSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(
                esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new esri.Color(polygonColor),
                width
            ),
            new esri.Color(polygonColor)
        );
        return polygonSymbol;
    }

    createFollowSymbol(path, color) {
        var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
        markerSymbol.setPath(path);
        markerSymbol.setSize(40);
        markerSymbol.setColor(new dojo.Color(color));
        markerSymbol.setOutline(null);
        return markerSymbol;
    }

    creatFollowGraphic(pt) {
        const iconPath = "M511.999488 299.209616m-112.814392 0a110.245 110.245 0 1 0 225.628784 0 110.245 110.245 0 1 0-225.628784 0ZM47.208697 523.662621A0 11.396 0 1 1 47.208697 524.685927ZM511.949346 7.981788c-173.610036 0-314.358641 140.748604-314.358641 314.358641s314.358641 523.932774 314.358641 523.932774 314.358641-350.322737 314.358641-523.932774S685.558359 7.981788 511.949346 7.981788L511.949346 7.981788zM511.949346 453.323623c-86.805018 0-157.177785-70.371744-157.177785-157.176762 0-86.830601 70.372767-157.182902 157.177785-157.182902 86.825484 0 157.201322 70.352301 157.201322 157.182902C669.150668 382.952902 598.774831 453.323623 511.949346 453.323623L511.949346 453.323623zM511.949346 453.323623M583.236949 788.686646l-19.674085 34.075073c201.221908 3.617387 357.506347 30.455639 357.506347 63.026452 0 35.039028-180.857091 63.442938-403.955238 63.442938-309.208341 0-403.962401-28.404933-403.962401-63.442938 0-32.067346 151.486156-58.57507 348.201423-62.841234l-19.780509-34.259268c-214.366276 7.369851-378.251833 47.647183-378.251833 96.232738 0 53.81465 105.338117 97.443309 449.084065 97.443309 248.02077 0 449.082018-43.62559 449.082018-97.443309C961.487759 836.332806 797.602202 796.055474 583.236949 788.686646z";
        const initColor = "#13227a";
        const graphic = new esri.Graphic(pt, this.createFollowSymbol(iconPath, initColor), {
            master: false,
            name: ""
        });
        return graphic;
    }

}