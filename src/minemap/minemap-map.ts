namespace flagwind {

    export class MinemapMap extends FlagwindMap {

        public MAP_EVENTS_MAP: Map<string, string> = new Map<string, string>().set("onLoad", "load");

        /**
         * 事件监听
         * @param eventName 事件名称
         * @param callBack 回调
         */
        public onAddEventListener(eventName: string, callBack: Function): void {
            let en = this.MAP_EVENTS_MAP.get(eventName) || eventName;
            this.innerMap.on(en, callBack);
        }
        /**
         * 中心定位
         * @param point 坐标点
         */
        public onCenterAt(point: any): void {
            this.innerMap.flyTo({
                center: [
                    point.x,
                    point.y]
            });
        }
        /**
         * 创建点
         * @param options 点属性
         */
        public onCreatePoint(options: any) {
            return new MinemapPoint(options.x, options.y, options.spatial || this.spatial);
        }

        /**
         * 创建地图对象
         */
        public onCreateMap() {
            minemap.domainUrl = "http://" + this.mapSetting.mapDomain;
            minemap.spriteUrl = "http://" + this.mapSetting.mapDomain + "/minemapapi/" + this.mapSetting.mapVersion + "/sprite/sprite";
            minemap.serviceUrl = "http://" + this.mapSetting.mapDomain + "/service";
            minemap.accessToken = this.mapSetting.accessToken || "25cc55a69ea7422182d00d6b7c0ffa93";
            minemap.solution = 2365;
            const map = new minemap.Map({
                container: this.mapEl,
                style: "http://" + this.mapSetting.mapDomain + "/service/solu/style/id/2365",
                center: this.mapSetting.center || [116.46, 39.92],
                zoom: this.mapSetting.zoom,
                pitch: 60,
                maxZoom: this.mapSetting.maxZoom || 17,    // 地图最大缩放级别限制
                minZoom: this.mapSetting.minZoom || 9      // 地图最小缩放级别限制
            });

            let popup = new minemap.Popup({ closeOnClick: true, closeButton: true, offset: [0, -35] }); // 创建全局信息框
            map.infoWindow = popup;

            let el = document.createElement("div");
            el.id = "flagwind-map-title";

            let titleDiv = (<any>this).titleDiv = document.createElement("div");
            titleDiv.id = "flagwind-map-title";
            titleDiv.classList.add("flagwind-map-title");

            (<any>this).titleMarker = new minemap.Marker(titleDiv, { offset: [-25, -25] })
                .setLngLat([116.46, 39.92])
                .addTo(map);

            // (<any>flagwindMap).innerMap._controlContainer.appendChild(div);

            return map;
        }
        public onShowInfoWindow(options: any): void {
            // 存在原始参数则创建新信息窗口
            if (typeof options.closeButton === "boolean" || typeof options.closeOnClick === "boolean" || options.offset) {
                let params = {};
                if (typeof options.closeButton === "boolean") params["closeButton"] = options.closeButton;
                if (typeof options.closeOnClick === "boolean") params["closeOnClick"] = options.closeOnClick;
                if (options.offset) params["offset"] = options.offset;
                this.innerMap.infoWindow.remove();
                this.innerMap.infoWindow = new minemap.Popup(params);
            }
            switch (options.type) {
                case "dom": this.innerMap.infoWindow.setDOMContent(options.content || "");break;
                case "html": this.innerMap.infoWindow.setHTML(options.content || "");break;
                case "text": this.innerMap.infoWindow.setText(options.content || "");break;
                default: this.innerMap.infoWindow.setHTML(options.content || "");break;
            }
            this.innerMap.infoWindow.setLngLat([options.point.x, options.point.y]).addTo(this.innerMap);
        }
        public onCreateBaseLayers() {
            return new Array<FlagwindTiledLayer>();
        }
        public onShowTitle(graphic: any): void {
            let info = graphic.attributes;
            let pt = new MinemapPoint(info.longitude, info.latitude, this.spatial);
            (<any>this).titleMarker.setLngLat([pt.x, pt.y]);
            (<any>this).titleMarker.getElement().style.display = "block";
        }
        public onHideTitle(graphic: any): void {
            (<any>this).titleMarker.getElement().style.display = "none";
        }
        public onCreateContextMenu(args: { contextMenu: Array<any>; contextMenuClickEvent: any }): void {
            if (this.options.onCreateContextMenu) {
                this.options.onCreateContextMenu(args);
            }
        }

    }

}
