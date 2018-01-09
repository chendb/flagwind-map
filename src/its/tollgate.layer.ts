import { DeviceLayer } from '../base/device.layer';
import { EditLayer } from '../base/edit.layer';
// import { mapPoints, classStatistics, updatePoint, pointStatus } from 'apis';
import { MapUtils } from '../base/map.utils';
// import store from 'vuexs';
// import member from 'utils/member';
//import { getTimeStr } from 'utils/extends';
//import { carFlowSearchUrl } from '../map.setting';
// import app from 'src/main';
import { StarAnimation, AnimationLayer } from './animation.model';
import { FlagwindMap } from '../base/flagwind.map';

declare var esri: any;
declare var dojo: any;
declare var dijit: any;
/**
 * 卡口
 */
export class TollgateLayer extends DeviceLayer {
    animationLayer: AnimationLayer;

    isLoading = false; // 设备是否正在加载

    animations = []; // 动画实体

    zoom = -1;

    flashZoom = 12;


    constructor(flagwindMap: FlagwindMap, id:string, options:any) {
        super(flagwindMap, id, options);

        this.animationLayer = new AnimationLayer({
            height: 48,
            width: 48,
            images: [
                // require('assets/maps/red/0.png'),
                // require('assets/maps/red/1.png'),
                // require('assets/maps/red/2.png'),
                // require('assets/maps/red/3.png'),
                // require('assets/maps/red/4.png'),
                // require('assets/maps/red/5.png'),
                // require('assets/maps/red/6.png'),
                // require('assets/maps/red/7.png'),
                // require('assets/maps/red/8.png'),
                // require('assets/maps/red/9.png'),
                // require('assets/maps/red/10.png'),
                // require('assets/maps/red/11.png'),
                // require('assets/maps/red/12.png'),
                // require('assets/maps/red/13.png'),
                // require('assets/maps/red/14.png'),
                // require('assets/maps/red/15.png'),
                // require('assets/maps/red/16.png'),
                // require('assets/maps/red/17.png'),
                // require('assets/maps/red/18.png')
            ]
        });

        if (this.options.enableEdit) {
            (<any>this).editLayer = new EditLayer(flagwindMap, this, {
                onEditInfo: this.onEditInfo
            });
        }

        const me = this;
        this.flagwindMap.innerMap.on('zoom-end', function () {
            me.onMapZoomEnd();
        });


    }

    show() {
        this.isShow = true;
        this.layer.show();
        this.onMapZoomEnd();
    }

    hide() {
        this.isShow = false;
        this.layer.hide();
        this.animationLayer.stop();
    }

    onMapZoomEnd() {
        if (this.options.flashlight) {
            let z = this.flagwindMap.innerMap.getZoom();
            if (z < this.flashZoom) {
                if (!this.animationLayer.isRunning) {
                    this.animationLayer.start();
                }
            }
            if (z >= this.flashZoom) {
                if (this.animationLayer.isRunning) {
                    this.animationLayer.stop();
                }
                this.zoom = z;
                const graphics = <any[]>this.layer.graphics;
                const list = graphics.map(g => g.attributes);
                this.saveGraphicList(list);
            }
        }
    }

    onEditInfo(evt:any, isSave: boolean) {
        // console.log(evt);
        // return new Promise((reject, resolve) => {
        //     if (isSave) {
        //         updatePoint({
        //             PointNo: evt.id,
        //             Longitude: evt.longitude,
        //             Latitude: evt.latitude
        //         }).then(response => {
        //             reject("坐标更新成功");
        //         }).catch(error => {
        //             app.$Message.error("坐标更新失败");
        //             resolve("坐标更新失败");
        //         });
        //         // console.log("请执行坐标更新服务");
        //     } else {
        //         // resolve("用户取消了坐标更新操作");
        //         console.log("用户取消了坐标更新操作");
        //     }
        // });
    }

    showInfoWindow(evt:any) {
        var me = this;
        let PointCode = evt.graphic.attributes.PointNo;
        const pt = this.getPoint(evt.graphic.attributes);
        console.log(evt.graphic.attributes);
        // 清除之前的窗体内容
        me.map.infoWindow.setTitle('');
        me.map.infoWindow.setContent('');
        me.map.centerAt(pt).then(function () {
            const title = me.getInfoWindowTitle(evt.graphic.attributes);
            me.setInfoWindow(pt, title, "<div>正在加载中</div>");
            // me.getCarPointInfo(PointCode).then(response => {
            //     let content = me.getInfoWindowContent(response, PointCode);
            //     if (me.options.enableEdit) {
            //         if (evt.graphic.attributes.eventName == "start") {
            //             content += "<a><span id='deleteOrdinate'  class='btn btn-primary btn-transparent outline mt5 deleteOrdinate' " + "key=" + evt.graphic.attributes.id + ">还原坐标</span></a>";
            //         } else {
            //             content += "<a><span id='modifyOrdinate'  class='btn btn-primary btn-transparent outline mt5 modifyOrdinate' " + "key=" + evt.graphic.attributes.id + ">更改坐标</span></a>";
            //         }
            //     }
            //     me.map.infoWindow.setContent(content);

            //     if (me.options.enableEdit) {
            //         if (evt.graphic.attributes.eventName == "start") {
            //             me.editLayer.bindDeleteEvent("deleteOrdinate");
            //         } else {
            //             me.editLayer.bindModifyEvent("modifyOrdinate");
            //         }
            //     }

            // }).catch(error => {
            //     me.map.infoWindow.setContent("<div>加载失败</div>");
            //     console.log('点击点位发生了错误：', error);
            // });
        });
    }

    showAlarmWindow(item:any) {
        const me = this;
        const graphic = this.getGraphicById(item.tollCode);
        let pt = graphic ? graphic.geometry : null;
        if (pt == null && item.latitude && item.longitude) {
            pt = this.getPoint({
                x: item.latitude * 1,
                y: item.longitude * 1
            });
        }
        if (pt == null) {
            console.error("无效的坐标信息");
            return;
        }
        // 清除之前的窗体内容
        me.map.infoWindow.setTitle('');
        me.map.infoWindow.setContent('');
        me.map.centerAt(pt).then(function () {
            const title = `时间：${item.alarmDate}<br>卡口：${item.tollName}`;
            const content = `<div class="car-alarm-box">
                <img class="car-alarm-img" 
                    src=${item.bigPictureUrl} 
                    onclick="lookpic.show(event.target, {images: ['${item.bigPictureUrl}']});">
                <div class="car-alarm-info">
                    <p class="car-alarm-plate">
                        车牌号：
                        <span class="components-car-plate ${item.vehicleTypeName === '小型汽车' ? 'blue' : 'yellow'}">${item.vehiclePlate}</span>
                    </p>
                    <p>类型：${item.caseDesc}</p>
                    <p>布控原因：</p>
                    <p>布控人：</p>
                </div>
            </div>`;
            me.setInfoWindow(pt, title, content);
        });
        me.map.infoWindow.show();
    }

    /**
     * 加载并显示设备点位
     * 
     * @memberof TollgateLayer
     */
    showDevices() {
        const me = this;
        me.isLoading = true;
        me.fireEvent("showDevices", { action: "start" });
        // mapPoints({
        //     Kind: 1,
        //     PageSize: 0
        // }).then(response => {
        //     me.isLoading = false;
        //     me.dataList = response;
        //     me.saveGraphicList(response);
        //     me.onMapZoomEnd();
        //     me.fireEvent("showDevices", { action: "end", attributes: response });
        // }).catch(error => {
        //     me.isLoading = false;
        //     console.log('点击点位发生了错误：', error);
        //     me.fireEvent("showDevices", { action: "error", attributes: error });
        // });
    }


    // 车控点位点击获取数据
    // getCarPointInfo(PointCode) {
    //     return classStatistics({ PointCode: PointCode });
    // }

    // getUserToken() {
    //     return member.getUserToken();
    // }

    // getInfoWindowContent(response:any, PointCode:string) {
    //     let tempStr = "";
    //     // let token = this.getUserToken();
    //     // let timeStr = getTimeStr();
    //     // let options = {
    //     //     startTime: timeStr.startTime,
    //     //     endTime: timeStr.endTime,
    //     //     checkedTollCodes: PointCode,
    //     //     selectedIndex: 1,
    //     //     flag: 1
    //     // };

    //     // let optionsStr = JSON.stringify(options).replace(/"/g, '%22');
    //     // // let optionsStr = encodeURIComponent(JSON.stringify(options));
    //     // // console.log('optionsStr', optionsStr);
    //     // // console.log('JSON', JSON.stringify(options));
    //     // Object.keys(response).forEach(item => {
    //     //     if (item != "PointNo") {
    //     //         tempStr += `${item}: ${response[item]}<br>`;
    //     //     }
    //     // });

    //     // let url = `${carFlowSearchUrl}?param=${optionsStr}&token=${token}`;
    //     // tempStr += `<a class="btn btn-primary btn-transparent outline mt5 mr10" target="_blank" href="${url}">查询过车</a>`;
    //     return tempStr;
    // }

    getInfoWindowTitle(device:any) {
        return device.Name;
    }

    changeStandardModel(item:any) {
        item.id = item.PointNo;
        item.name = item.Name;
        if (item.longitude & item.latitude) {
            item.Longitude = item.longitude;
            item.Latitude = item.latitude;
        } else {
            item.longitude = item.Longitude;
            item.latitude = item.Latitude;
        }

        return item;
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
        const pt = this.getPoint(item);
        graphic.setGeometry(pt);
        graphic.attributes = item;
        if (this.options.flashlight) {
            this.updateAnimation(item, graphic);
        } else {
            const iconUrl = this.getIconUrl(item);
            graphic.setSymbol(new esri.symbol.PictureMarkerSymbol(
                iconUrl,
                this.getGraphicWidth(),
                this.getGraphicHeight()));
        }
        graphic.draw();
        return pt;
    }

    addGraphicByDevice(item:any) {
        const graphic = this.creatGraphicByDevice(item);
        try {
            this.layer.add(graphic);
            this.createAnimation(item, graphic);
        } catch (ex) {
            console.error(ex);
        }
    }


    updateAnimation(item: any, graphic: any) {
        const animation = this.animationLayer.getAnimationId(item.id);
        if (animation) {
            (<any>animation).attributes = item;
            (<any>animation).graphic = graphic;
            animation.updateGraphic();
        }
    }


    createAnimation(item: any, graphic: any) {
        const animation = new StarAnimation(item, graphic, this.animationLayer.options);
        this.animationLayer.add(animation);
    }

    /**
     * 更新设备状态
     */
    updateStatus() {
        const me = this;
        // pointStatus({ Kind: 1, PageSize: 0 }).then(response => {
        //     me.isLoading = false;
        //     me.layer.graphics.forEach(g => {
        //         const attr = g.attributes;
        //         const ps = response.find(t => t.PointNo == g.PointNo);
        //         if (ps) {
        //             attr.status = ps.Status;
        //             this.saveGraphicByDevice(attr);
        //         }
        //     });
        // }).catch(error => {
        //     me.isLoading = false;
        //     console.log('点击点位发生了错误：', error);
        //     me.fireEvent("showDevices", { action: "error", attributes: error });
        // });
    }

    /**
     * 开启定时器
     */
    start() {
        let me = this;
        (<any>this).timer = setInterval(() => {
            me.updateStatus();
        }, this.options.timeout || 20000);
    }

    /**
     * 关闭定时器
     */
    stop() {
        if ((<any>this).timer) {
            clearInterval((<any>this).timer);
        }
    }

    /**
     * 获取资源图标
     */
    getIconUrl(info:any) {
        // switch (info.status) {
        //     case 0:
        //         return info.selected ? require('assets/maps/tollgate-mark-offline-check.png') : require('assets/maps/tollgate-mark-offline.png');
        //     case 1:
        //         return info.selected ? require('assets/maps/tollgate-mark-waste-check.png') : require('assets/maps/tollgate-mark-waste.png');
        //     default:
        //         return info.selected ? require('assets/maps/tollgate-mark-online-check.png') : require('assets/maps/tollgate-mark-online.png');
        // }
    }




    getGraphicWidth(level:number|null=null) {
        return 32;
    }
    getGraphicHeight(level: number | null = null) {
        return 48;
    }

}