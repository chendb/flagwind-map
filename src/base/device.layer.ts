import { FlagwindMap } from './flagwind.map';
import { FlagwindFeatureLayer } from './flagwind.layer';
import { MapUtils } from './map.utils';
declare var esri: any;
declare var dojo: any;
declare var dijit:any;

export const deviceLayerOptions = {
    onLayerClick: function (evt: any) { },
    onMapLoad: function () {

    },
    onEvent: function (eventName: string, evt: any) {

    },
    onCheck: function (evt: any) {

    },
    onEditInfo: function (evt: any, isSave: boolean) {

    },
    enableEdit: true,      // 启用要素编辑功能
    enableSelectMode: false, // 是否启用选择模块
    selectMode: 1,           // 1为多选，2为单选
    showTooltipOnHover: true,
    showInfoWindow: true
}

export class DeviceLayer extends FlagwindFeatureLayer {

    constructor(
        public flagwindMap: FlagwindMap,
        public id: string, public options: any) {
        super(id, options.title || "设备图层");
        options = Object.assign({}, deviceLayerOptions, options);

        this.flagwindMap = flagwindMap;
        this.options = options;

        this.onInit();
        this.onAddLayerBefor();
        this.flagwindMap.addDeviceLayer(this);
        this.onAddLayerAfter();

        if (this.flagwindMap.innerMap.loaded) {
            this.onLoad();
        } else {
            const _deviceLayer = this;
            this.flagwindMap.innerMap.on('load', function () {
                _deviceLayer.onLoad();
            });
        }

    }

    onAddLayerBefor() {
    }

    onAddLayerAfter() {

    }

    onInit() {

    }

    onLoad() {
        if (!this.layer._map) {
            this.layer._map = this.flagwindMap.innerMap;
        }
        this.registerEvent();
        this.onMapLoad();
    }

    onMapLoad() {
        this.options.onMapLoad();
    }

    get map() {
        return this.flagwindMap.map;
    }

    get spatial() {
        return this.flagwindMap.spatial;
    }

    registerEvent() {
        let _deviceLayer = this;
        dojo.connect(this.layer, 'onClick', function (evt: any) {
            _deviceLayer.onLayerClick(_deviceLayer, evt);
        });

        if (this.options.showTooltipOnHover) { // 如果开启鼠标hover开关
            dojo.connect(this.layer, "onMouseOver", function (evt: any) {
                _deviceLayer.flagwindMap.showTitle(evt.graphic);
            });
            dojo.connect(this.layer, "onMouseOut", function (evt: any) {
                _deviceLayer.flagwindMap.hideTitle();
            });
        }

    }
    setSelectStatus(gp: any, selected: boolean) {
        gp.attributes.selected = selected;
        let iconUrl = this.getIconUrl(gp.attributes);
        gp.symbol.setUrl(iconUrl);
        gp.draw();
    }
    clearSelectStatus() {
        let graphics = this.layer.graphics;
        for (let i = 0; i < graphics.length; i++) {
            if (graphics[i].attributes.selected) {
                this.setSelectStatus(graphics[i], false);
            }
        }
    }
    getSelectedGraphics() {
        return (<any[]>this.layer.graphics).filter(g => g.attributes && g.attributes.selected);
    }

    onLayerClick(deviceLayer: this, evt: any) {

        if (deviceLayer.options.onLayerClick) {
            deviceLayer.options.onLayerClick(evt);
        }
        if (deviceLayer.options.showInfoWindow) {
            evt.graphic.attributes.eventName = "";
            deviceLayer.showInfoWindow(evt);
        }

        if (deviceLayer.options.enableSelectMode) {
            if (deviceLayer.options.selectMode == 1) {
                if (evt.graphic.attributes.selected) {
                    deviceLayer.setSelectStatus(evt.graphic, false);
                } else {
                    deviceLayer.setSelectStatus(evt.graphic, true);
                }
            } else {
                deviceLayer.clearSelectStatus();
                deviceLayer.setSelectStatus(evt.graphic, true);
            }
            console.log("check-------" + evt.graphic.attributes);
            deviceLayer.options.onCheck({
                target: [evt.graphic.attributes],
                check: evt.graphic.attributes.selected,
                selectGraphics: deviceLayer.getSelectedGraphics()
            });
        }

    }


    fireEvent(eventName: string, event: any) {
        this.options.onEvent(eventName, event);
    }

    showInfoWindow(evt: any) {
        if (evt.graphic) {
            const content = this.getInfoWindowContent(evt.graphic);
            const title = this.getInfoWindowTitle(evt.graphic);
            const pt = this.getPoint(evt.graphic.attributes);
            this.map.centerAt(pt).then(this.setInfoWindow(pt, title, content));
        }
    }

    setInfoWindow(pt: any, title: any, content: string | void) {
        if (content) {
            this.map.infoWindow.setContent(content);
        }
        if (title) {
            this.map.infoWindow.setTitle(title);
        }
        this.map.infoWindow.show(pt);
    }
    /**+++++++++++++++++++++++++++++++++++++++++ 待重写类 +++++++++++++++++++++++++++++++++++++++++**/
    /**
     * 获取资源图标
     */
    getIconUrl(info: any) {

    }
    getGraphicWidth(level: number | null = null) {
        return 32;
    }
    getGraphicHeight(level: number | null = null) {
        return 48;
    }
    getInfoWindowContent(graphic: any) {

    }

    getInfoWindowTitle(graphic: any) {

    }
    /**---------------------------------------- 待重写类 ----------------------------------------**/
    validDevice(item: any) {
        return item.longitude && item.latitude;
    }

    /**
     * 变换成标准实体（最好子类重写）
     *
     * @protected
     * @param {*} item
     * @returns {{ id: String, name: String, longitude: number, latitude: number }}
     * @memberof FlagwindDeviceLayer
     */
    changeStandardModel(item: any) {
        if (item.tollLongitude && item.tollLatitude) {
            item.id = item.tollCode;
            item.name = item.tollName;
            item.longitude = item.tollLongitude;
            item.latitude = item.tollLatitude;
        }
        return item;
    }

    gotoCenterById(key: string) {
        const graphic = this.getGraphicById(key);
        const pt = this.getPoint(graphic.attributes);
        this.map.centerAt(pt).then(() => {

        });
    }

    saveGraphicList(dataList: any[]) {
        for (let i = 0; i < dataList.length; i++) {
            this.saveGraphicByDevice(dataList[i]);
        }
    }

    updateGraphicList(dataList: any[]) {


        for (let i = 0; i < dataList.length; i++) {
            this.updateGraphicByDevice(dataList[i]);
        }
    }
    // 设置选择状态
    setSelectStatusByDevices(dataList: any[]) {
        this.clearSelectStatus();
        for (let i = 0; i < dataList.length; i++) {
            let model = this.changeStandardModel(dataList[i]);
            let graphic = this.getGraphicById(model.id);
            if (graphic)
                this.setSelectStatus(graphic, true);
        }
    }

    /**
     * 保存要素（如果存在，则修改，否则添加）
     */
    saveGraphicByDevice(item: any) {
        const graphic = this.getGraphicById(item.id);
        if (graphic) {
            return this.updateGraphicByDevice(item, graphic);
        } else {
            return this.addGraphicByDevice(item);
        }
    }

    addGraphicByDevice(item: any) {
        const graphic = this.creatGraphicByDevice(item);
        try {
            this.layer.add(graphic);
        } catch (ex) {

        }
    }

    /**
     * 修改要素
     */
    updateGraphicByDevice(item: any, graphic: any | null = null) {
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

        //const startGeometry = graphic.geometry;
        //const endGeometry = pt;

        graphic.setSymbol(new esri.symbol.PictureMarkerSymbol(
            iconUrl,
            this.getGraphicWidth(),
            this.getGraphicHeight()));
        graphic.setGeometry(pt);
        graphic.attributes = item;

        graphic.draw(); // 重绘

        return pt;
    }

    creatGraphicByDevice(item: any) {
        item = this.changeStandardModel(item);
        if (!this.validDevice(item)) {
            return null;
        }
        const pt = this.getPoint(item);
        item.select = false; // select属性为true表示当前选中，false表示未选中
        const iconUrl = this.getIconUrl(item);
        const width = this.getGraphicWidth();
        const height = this.getGraphicHeight();
        const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
        const graphic = new esri.Graphic(pt, markerSymbol, item);
        return graphic;
    }

    /**
     * 创建点要素（把业务数据的坐标转换成地图上的点）
     */
    getPoint(item: any) {
        return this.flagwindMap.getPoint(item);
    }

    /**
     * 把地图上的点转换成业务的坐标
     * @param {*} point 
     */
    formPoint(point: any) {
        return this.flagwindMap.formPoint(point);
    }

}