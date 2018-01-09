import { DeviceLayer } from '../base/device.layer';
import { FlagwindGroupLayer } from '../base/flagwind.layer';
// import { focueArea, classStatistics } from 'apis';
import { MapUtils } from '../base/map.utils';
import { FlagwindMap } from '../base/flagwind.map';
declare var dojo: any;
declare var esri: any;

/**
 * 重点区域
 */
export class EmphasisLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载
    groupLayer: any;

    constructor(flagwindMap: FlagwindMap, id: any, options: any) {
        super(flagwindMap, id, options);

    }

    onAddLayerAfter() {
        this.groupLayer = new FlagwindGroupLayer(this.id + "_group");
        this.groupLayer.appendTo(this.flagwindMap.innerMap);
    }


    registerEvent() {
        let _deviceLayer = this;
        dojo.connect(this.layer, 'onClick', function (evt: any) {
            _deviceLayer.onLayerClick(_deviceLayer, evt);
        });
        dojo.connect(this.groupLayer.layer, 'onClick', function (evt: any) {
            _deviceLayer.onLayerClick(_deviceLayer, evt);
        });

        if (this.options.showTooltipOnHover) { // 如果开启鼠标hover开关
            dojo.connect(this.layer, "onMouseOver", function (evt: any) {
                _deviceLayer.flagwindMap.showTitle(evt.graphic);
            });
            dojo.connect(this.layer, "onMouseOut", function (evt: any) {
                _deviceLayer.flagwindMap.hideTitle();
            });

            dojo.connect(this.groupLayer.layer, "onMouseOver", function (evt: any) {
                _deviceLayer.flagwindMap.showTitle(evt.graphic);
            });
            dojo.connect(this.groupLayer.layer, "onMouseOut", function (evt: any) {
                _deviceLayer.flagwindMap.hideTitle();
            });
        }

    }

    changeStandardModel(item: any) {
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

    showInfoWindow(evt: any) {
        if (evt.graphic) {
            const content = this.getInfoWindowContent(evt.graphic);
            const title = this.getInfoWindowTitle(evt.graphic);
            const pt = this.getPoint(evt.graphic.attributes);
            this.setInfoWindow(pt, title, content);
            //this.map.centerAt(pt).then(this.setInfoWindow(pt, title, content));
        }
    }

    getInfoWindowContent(graphic: any) {
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

    getInfoWindowTitle(graphic: any) {
        return graphic.attributes.name;
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


    validDevice(item: any) {
        return item.longitude && item.latitude && item.radius;
    }

    getIconUrl(info: any) {
        // // 选中图标
        // if (info.selected) {
        //     return require('assets/area-mark.png');
        // }
        // return require('assets/area-mark.png');
    }
    getGraphicWidth(level: any = null) {
        return 106;
    }
    getGraphicHeight(level: any = null) {
        return 102;
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

        const pt = this.getPoint(item);
        const iconUrl = this.getIconUrl(item);

        graphic.setSymbol(new esri.symbol.PictureMarkerSymbol(
            iconUrl,
            this.getGraphicWidth(),
            this.getGraphicHeight()));

        graphic.attributes = item;
        graphic.draw(); //重绘

        this.groupLayer.setGeometry(item.id, pt);
        this.groupLayer.setSymbol(item.id, this.getFollowSymbol(item));

        return pt;
    }


    addGraphicByDevice(item: any) {
        const graphic = this.creatGraphicByDevice(item);
        try {
            if (graphic == null) return;
            this.layer.add(graphic);
            const pt = this.getPoint(item);
            this.groupLayer.addGraphice(item.id, [this.creatFollowGraphic(item)]);
        } catch (ex) {
            console.log(ex);
        }
    }

    removeGraphicById(key: any) {
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


    getFollowSymbol(info: any) {
        // let url = null;
        // // 选中图标
        // if (info.selected) {
        //     url = require('assets/area-centre-mark-checked.png');
        // }
        // url = require('assets/area-centre-mark.png');
        // let symbol = new esri.symbol.PictureMarkerSymbol(url, 32, 48);
        // symbol.setOffset(0, 15);
        // return symbol;
    }

    creatFollowGraphic(item: any) {
        const pt = this.getPoint(item);
        const graphic = new esri.Graphic(pt, this.getFollowSymbol(item), item);
        return graphic;
    }

}