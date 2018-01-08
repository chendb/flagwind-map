import { FlagwindMap } from './flagwind.map';
import { FlagwindFeatureLayer } from './flagwind.layer';
import { MapUtils } from './map.utils';
import { DeviceLayer } from './device.layer';

declare var esri: any;
declare var dojo: any;
declare var dijit:any;

export const editLayerOptions = {

    onEditInfo: function (key: string, lon: number, lat: number, isSave: boolean) {

    }
}
export class EditLayer extends FlagwindFeatureLayer {
    editObj: any;
    options: any;
    deviceLayer: DeviceLayer;
    flagwindMap: FlagwindMap;

    constructor(
        flagwindMap: FlagwindMap,
        deviceLayer: DeviceLayer,
        options: any) {
        options = Object.assign({}, editLayerOptions, options);
        super("edit_" + deviceLayer.id, "编辑图层");
        this.flagwindMap = flagwindMap;
        this.deviceLayer = deviceLayer;
        this.options = options;


        this.editObj = new esri.toolbars.Edit(this.flagwindMap.innerMap); //编辑对象,在编辑图层进行操作
        this.flagwindMap.addDeviceLayer(this);
        if (this.flagwindMap.innerMap.loaded) {
            this.onLoad();
        } else {
            const _editLayer = this;
            this.flagwindMap.innerMap.on('load', function () {
                _editLayer.onLoad();
            });
        }
    }

    onLoad() {
        if (!this.layer._map) {
            this.layer._map = this.flagwindMap.innerMap;
        }
        try {
            this.registerEvent();
            this.onMapLoad();
        } catch (error) {
            console.error(error);
        }
    }

    onMapLoad() {

    }

    get map() {
        return this.flagwindMap.map;
    }

    get spatial() {
        return this.flagwindMap.spatial;
    }

    bindModifyEvent(modifySeletor:string) {
        const _editLayer = this;
        dojo.connect(dojo.byId(modifySeletor), 'onclick', function (evt:any) {
            const key = evt.target.attributes["key"].value;
            _editLayer.activateEdit(key);
        });
    }

    bindDeleteEvent(deleteSeletor:string) {
        const _editLayer = this;
        dojo.connect(dojo.byId(deleteSeletor), 'onclick', function (evt:any) {
            const key = evt.target.attributes["key"].value;
            _editLayer.cancelEdit(key);
        });
    }

    registerEvent() {
        let _editLayer = this;
        dojo.connect(this.layer, 'onClick', function (evt:any) {
            _editLayer.onLayerClick(_editLayer, evt);
        });


        var originInfo:any = {}; //存放资源的初始值		
        console.log("编辑对象：" + this.editObj);
        dojo.on(this.editObj, 'graphic-first-move', function (ev:any) {
            console.log("要素移动---------graphic-first-move");
            _editLayer.flagwindMap.innerMap.infoWindow.hide();
            originInfo = ev.graphic.attributes;
        });
        dojo.on(this.editObj, 'graphic-move-stop', function (ev:any) { // 这里要更新一下属性值	
            console.log("要素移动---------graphic-move-stop");
            _editLayer.editObj.deactivate();
            let key = ev.graphic.attributes.id;

            (<any>window).$Modal.confirm({
                title: '确定要进行更改吗？',
                content: '初始坐标值（经度）:' + originInfo.longitude +
                    ',（纬度）:' + originInfo.latitude +
                    '\r当前坐标值（经度）:' + ev.graphic.geometry.x.toFixed(8) +
                    ',（纬度）:' + ev.graphic.geometry.y.toFixed(8),
                onOk: () => {
                    let pt = ev.graphic.geometry;
                    let lonlat = _editLayer.deviceLayer.formPoint(pt);
                    let changeInfo = Object.assign({}, ev.graphic.attributes, lonlat);

                    // 异步更新，请求成功才更新位置，否则不处理，
                    _editLayer.options.onEditInfo({
                        id: key,
                        latitude: changeInfo.latitude,
                        longitude: changeInfo.longitude
                    }, true).then(() => {
                        _editLayer.deviceLayer.removeGraphicById(changeInfo.id);
                        _editLayer.deviceLayer.addGraphicByDevice(changeInfo);
                    });
                },
                onCancel: () => {
                    _editLayer.options.onEditInfo({
                        id: key,
                        latitude: originInfo.latitude,
                        longitude: originInfo.longitude
                    }, false);
                }
            });

            // if (confirm('确定要进行更改吗？\r初始坐标值（经度）:' + originInfo.longitude +
            //     ',（纬度）:' + originInfo.latitude +
            //     '\r当前坐标值（经度）:' + ev.graphic.geometry.x.toFixed(8) +
            //     ',（纬度）:' + ev.graphic.geometry.y.toFixed(8))) {
            //         let pt = ev.graphic.geometry;
            //         let lonlat = _editLayer.deviceLayer.formPoint(pt);
            //         let changeInfo = Object.assign({}, ev.graphic.attributes,lonlat);
            //         _editLayer.deviceLayer.removeGraphicById(changeInfo.id);
            //         _editLayer.deviceLayer.addGraphicByDevice(changeInfo);
            //         _editLayer.options.onEditInfo({
            //             id:key,
            //             latitude:changeInfo.latitude,
            //             longitude:changeInfo.longitude
            //         }, true);
            // } else {
            //     _editLayer.options.onEditInfo({
            //         id:key,
            //         latitude:originInfo.latitude,
            //         longitude:originInfo.longitude
            //     }, false);
            // }
            ev.graphic.attributes.eventName = "stop";
            _editLayer.clear();
            _editLayer.hide();
            _editLayer.flagwindMap.innerMap.infoWindow.hide();
            _editLayer.deviceLayer.show();
        });
    }

    onLayerClick(editLayer: this, evt: any) {

        if (editLayer.deviceLayer.options.onLayerClick) {
            editLayer.deviceLayer.options.onLayerClick(evt);
        }

        if (editLayer.deviceLayer.options.showInfoWindow) {
            editLayer.deviceLayer.showInfoWindow(evt);
        }
    }

    /**
      * 激活编辑事件
      */
    activateEdit(key: string) {

        var graphic = this.deviceLayer.getGraphicById(key);
        if (!graphic) {
            console.log("无效的代码：" + key);
            return;
        }
        this.deviceLayer.hide();
        this.show();
        let editGraphic = this.deviceLayer.creatGraphicByDevice(graphic.attributes);
        this.layer.add(editGraphic);
        editGraphic.attributes.eventName = "start";
        var tool = esri.toolbars.Edit.MOVE;
        // map.disableDoubleClickZoom();//禁掉鼠标双击事件
        this.editObj.activate(tool, editGraphic, null); //激活编辑工具
        this.deviceLayer.showInfoWindow({
            graphic: graphic
        });
    }

    /**
     * 取消编辑要素
     */
    cancelEdit(key: string) {
        this.editObj.deactivate();
        this.clear();
        this.hide();
        this.flagwindMap.innerMap.infoWindow.hide();
        this.deviceLayer.show();

        var graphic = this.deviceLayer.getGraphicById(key);
        graphic.attributes.eventName = "delete";
        this.deviceLayer.showInfoWindow({
            graphic: graphic
        });
    }

}