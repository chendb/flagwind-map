import { DeviceLayer } from '../base/DeviceLayer';
import { EditLayer } from '../base/EditLayer';
import { phoneList, classStatistics, updatePoint } from 'apis';
import { MapUtils } from '../base/MapUtils';
import store from 'vuexs';
import member from 'utils/member';
import { getTimeStr } from 'utils/extends';
import { carFlowSearchUrl } from 'settings';
import app from 'src/main';

/**
 * 手台
 */
export class PhoneLayer extends DeviceLayer {

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
                    reject("坐标更新成功");
                }).catch(error => {
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

    showInfoWindow(evt) {
        var _this = this;
        let PointCode = evt.graphic.attributes.PointNo;
        const pt = this.getPoint(evt.graphic.attributes);
        console.log(evt.graphic.attributes);
        // 清除之前的窗体内容
        _this.map.infoWindow.setTitle('');
        _this.map.infoWindow.setContent('');
        _this.map.centerAt(pt).then(function () {
            const title = _this.getInfoWindowTitle(evt.graphic.attributes);
            _this.setInfoWindow(pt, title, "<div>正在加载中</div>");
            let content = _this.getInfoWindowContent(evt.graphic.attributes);
            _this.map.infoWindow.setContent(content);
        });
    }


    /**
     * 加载并显示设备点位
     * 
     * @memberof PhoneLayer
     */
    showDevices() {
        const _this = this;
        _this.isLoading = true;
        _this.fireEvent("showDevices", { action: "start" });
        phoneList().then(response => {
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

    getUserToken() {
        return member.getUserToken();
    }

    getInfoWindowContent(response) {
        let tempStr = "";
        tempStr += `姓名: ${response.Name}<br>`;
        tempStr += `单位: ${response.DepartmentName}<br>`;
        tempStr += `方向: ${response.Direction}<br>`;
        tempStr += `速度: ${response.Speed} m/s<br>`;
        return tempStr;
    }

    getInfoWindowTitle(device) {
        return device.Name+"用户信息";
    }

    changeStandardModel(item) {
        item.id = item.Id || item.PointNo;
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
     * 获取资源图标
     */
    getIconUrl(info) {
        // 选中图标
        if (info.selected) {
            return require('assets/phone_mark_checked.png');
        }
        return require('assets/phone_mark.png');
    }
    getGraphicWidth(level) {
        return 32;
    }
    getGraphicHeight(level) {
        return 48;
    }

}