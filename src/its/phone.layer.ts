import { DeviceLayer } from '../base/device.layer';
import { EditLayer } from '../base/edit.layer';
// import { phoneList, classStatistics, updatePoint } from 'apis';
import { MapUtils } from '../base/map.utils';
import { FlagwindMap } from '../base/flagwind.map';
// import store from 'vuexs';
// import member from 'utils/member';
// import { getTimeStr } from 'utils/extends';
// import { carFlowSearchUrl } from 'settings';
// import app from 'src/main';

/**
 * 手台
 */
export class PhoneLayer extends DeviceLayer {

    isLoading = false; // 设备是否正在加载
    editLayer: any;

    constructor(flagwindMap: FlagwindMap, id: any, options: any) {
        super(flagwindMap, id, options);
        if (this.options.enableEdit) {
            this.editLayer = new EditLayer(flagwindMap, this, {
                onEditInfo: this.onEditInfo
            });
        }
    }

    onEditInfo(evt: any, isSave: any) {
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

    showInfoWindow(evt: any) {
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
            let content = me.getInfoWindowContent(evt.graphic.attributes);
            me.map.infoWindow.setContent(content);
        });
    }


    /**
     * 加载并显示设备点位
     * 
     * @memberof PhoneLayer
     */
    showDevices() {
        // const me = this;
        // me.isLoading = true;
        // me.fireEvent("showDevices", { action: "start" });
        // phoneList().then(response => {
        //     me.isLoading = false;
        //     me.dataList = response;
        //     me.saveGraphicList(response);
        //     me.fireEvent("showDevices", { action: "end", attributes: response });
        // }).catch(error => {
        //     me.isLoading = false;
        //     console.log('点击点位发生了错误：', error);
        //     me.fireEvent("showDevices", { action: "error", attributes: error });
        // });
    }

    getUserToken() {
        // return member.getUserToken();
    }

    getInfoWindowContent(response: any) {
        let tempStr = "";
        tempStr += `姓名: ${response.Name}<br>`;
        tempStr += `单位: ${response.DepartmentName}<br>`;
        tempStr += `方向: ${response.Direction}<br>`;
        tempStr += `速度: ${response.Speed} m/s<br>`;
        return tempStr;
    }

    getInfoWindowTitle(device: any) {
        return device.Name + "用户信息";
    }

    changeStandardModel(item: any) {
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
    getIconUrl(info: any) {
        // // 选中图标
        // if (info.selected) {
        //     return require('assets/phone_mark_checked.png');
        // }
        // return require('assets/phone_mark.png');
    }
    getGraphicWidth(level: any) {
        return 32;
    }
    getGraphicHeight(level: any) {
        return 48;
    }

}