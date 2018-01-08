import { DeviceLayer } from '../base/DeviceLayer';
import { mapPoints, classStatistics, updatePoint, pointStatus } from 'apis';
import { MapUtils } from '../base/MapUtils'
import { EditLayer } from '../base/EditLayer';

/**
 * 视频图层
 */
export class VideoLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载

    constructor(egovaMap, id, options) {
        super(egovaMap, id, options);
        if (this.options.enableEdit) {
            this.editLayer = new EditLayer(egovaMap, this, {
                onEditInfo: this.onEditInfo
            });
        }
    }

    onEditInfo(evt, isSave) {
        console.log(evt);
        return new Promise((reject, resolve) => {
            if (isSave) {
                updatePoint({
                    PointNo: evt.id,
                    Longitude: evt.longitude,
                    Latitude: evt.latitude
                }).then(response => {
                    // console.log("坐标更新成功", response);
                    reject("坐标更新成功");
                }).catch(error => {
                    // cosnole.log("坐标更新失败:", error);
                    app.$Message.error("坐标更新失败");
                    resolve("坐标更新失败");
                });
                // console.log("请执行坐标更新服务");
            } else {
                // resolve("用户取消了坐标更新操作");
                console.log("用户取消了坐标更新操作");
            }
        });
    }

    changeStandardModel(item) {

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

    onMapLoad() {
        var _this = this;
    }

    showInfoWindow(evt) {
        if (evt.graphic) {
            let content = this.getInfoWindowContent(evt.graphic);

            // 增加坐标更新、还原按钮
            if (this.options.enableEdit) {
                if (evt.graphic.attributes.eventName == "start") {
                    content += "<a><span id='deleteOrdinate'  class='btn btn-primary btn-transparent outline mt5 deleteOrdinate' " + "key=" + evt.graphic.attributes.id + ">还原坐标</span></a>";
                } else {
                    content += "<a><span id='modifyOrdinate'  class='btn btn-primary btn-transparent outline mt5 modifyOrdinate' " + "key=" + evt.graphic.attributes.id + ">更改坐标</span></a>";
                }
            }

            const title = this.getInfoWindowTitle(evt.graphic);
            const pt = this.getPoint(evt.graphic.attributes);
            this.map.centerAt(pt).then(this.setInfoWindow(pt, title, content));
        }
    }

    setInfoWindow(pt, title, content) {
        if (content) {
            this.map.infoWindow.setContent(content);
        }
        if (title) {
            this.map.infoWindow.setTitle(title);
        }

        this.map.infoWindow.show(pt);

        // 为坐标更新、还原按钮绑定事件
        if (this.options.enableEdit) {
            if (evt.graphic.attributes.eventName == "start") {
                this.editLayer.bindDeleteEvent("deleteOrdinate");
            } else {
                this.editLayer.bindModifyEvent("modifyOrdinate");
            }
        }
    }


    getInfoWindowContent(graphic) {
        let attributes = graphic.attributes;
        let tempStr = "";
        // Object.keys(graphic.attributes).forEach(item => {
        //     tempStr += `${item}: ${attributes[item]}<br>`;
        // });
        tempStr += `视频点位名称: ${attributes["Name"]}<br>`;
        if (attributes.PointCode) {
            tempStr += "<button class='realtime-video' data='" + attributes.id + "'>实时视频</button>";
            tempStr += "<button class='history-video' data='" + attributes.id + "'>历史视频</button>";
        }


        return tempStr;

    }


    getInfoWindowTitle(graphic) {
        return "视频";
    }

    showDevices() {
        const _this = this;
        _this.isLoading = true;
        _this.fireEvent("showDevices", { action: "start" });
        mapPoints({ Kind: 2, PageSize: 0 }).then(response => {
            _this.isLoading = false;
            _this.saveGraphicList(response);
            _this.fireEvent("showDevices", { action: "end", attributes: response });
        }).catch(error => {
            _this.isLoading = false;
            console.log('点击点位发生了错误：', error);
            _this.fireEvent("showDevices", { action: "error", attributes: error });
        });
    }

    /**
     * 更新设备状态
     */
    updateStatus() {
        const _this = this;
        pointStatus({ Kind: 2, PageSize: 0 }).then(response => {
            _this.isLoading = false;
            _this.layer.graphics.forEach(g => {
                const attr = g.attributes;
                const ps = response.find(t => t.PointNo == g.PointNo);
                if (ps) {
                    attr.status = ps.Status;
                    this.saveGraphicByDevice(attr);
                }
            });
        }).catch(error => {
            _this.isLoading = false;
            console.log('点击点位发生了错误：', error);
            _this.fireEvent("showDevices", { action: "error", attributes: error });
        });
    }

    /**
     * 开启定时器
     */
    start() {
        let _this = this;
        this.timer = setInterval(() => {
            _this.updateStatus();
        }, this.options.timeout || 20000);
    }

    /**
     * 关闭定时器
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    /**
     * 获取资源图标
     */
    getIconUrl(info) {
        switch (info.status) {
            case 0:
                return info.selected ? require('assets/maps/video-mark-offline-check.png') : require('assets/maps/video-mark-offline.png');
            case 2:
                return info.selected ? require('assets/maps/video-mark-waste-check.png') : require('assets/maps/video-mark-waste.png');
            default:
                return info.selected ? require('assets/maps/video-mark-online-check.png') : require('assets/maps/video-mark-online.png');
        }
    }

    getGraphicWidth(level) {
        return 32;
    }
    getGraphicHeight(level) {
        return 48;
    }

}