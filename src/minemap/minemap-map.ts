namespace flagwind {

    export class MinemapMap extends FlagwindMap {

        public constructor(
            public mapSetting: IMapSetting,
            public mapEl: any,
            options: any) {
            super(mapSetting, mapEl, options);
            this.onInit();
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
            minemap.solution = this.mapSetting.wkid || 2365;
            const map = new minemap.Map({
                container: this.mapEl,
                style: "http://" + this.mapSetting.mapDomain + "/service/solu/style/id/" + minemap.solution,
                center: this.mapSetting.center || [116.46, 39.92],
                zoom: this.mapSetting.zoom,
                pitch: 0,
                maxZoom: this.mapSetting.maxZoom || 17,    // 地图最大缩放级别限制
                minZoom: this.mapSetting.minZoom || 9      // 地图最小缩放级别限制
            });

            this.spatial = new MinemapSpatial(minemap.solution);

            let popup = new minemap.Popup({ closeOnClick: false, closeButton: true, offset: [0, -14] }); // 创建全局信息框
            map.infoWindow = popup;
            popup.addTo(map);

            let div = (<any>this).tooltipElement = document.createElement("div");
            div.id = "flagwind-map-tooltip";
            div.classList.add("flagwind-map-tooltip");
            map._container.appendChild(div);
            this.innerMap = map;
            const me = this;

            map.on("load", function (args: any) {
                me.dispatchEvent("onLoad", args);
            });

            // #region click event
            map.on("click", function (args: any) {
                me.dispatchEvent("onClick", args);
            });
            map.on("dbclick", function (args: any) {
                me.dispatchEvent("onDbClick", args);
            });
            // #endregion

            // #region mouse event
            map.on("mouseout", function (args: any) {
                me.dispatchEvent("onMouseOut", args);
            });
            map.on("mousedown", function (args: any) {
                me.dispatchEvent("onMouseDown", args);
            });
            map.on("mousemove", function (args: any) {
                me.dispatchEvent("onMouseMove", args);
            });
            map.on("mouseup", function (args: any) {
                me.dispatchEvent("onMouseUp", args);
            });
            // #endregion

            // #region move event
            map.on("movestart", function (args: any) {
                me.dispatchEvent("onMoveStart", args);
            });
            map.on("move", function (args: any) {
                me.dispatchEvent("onMove", args);
            });
            map.on("moveend", function (args: any) {
                me.dispatchEvent("onMoveEnd", args);
            });
            // #endregionn

            return map;
        }
        public onShowInfoWindow(evt: any): void {
            // if (!this.innerMap.infoWindow) {
            //     this.innerMap.infoWindow = new minemap.Popup({ closeOnClick: false, closeButton: true, offset: [0, -35] });
            // }
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.remove();
            }
            if (evt.options) {
                let options = evt.options;
                // 存在原始设置参数则创建新信息窗口
                let params = {};
                if (typeof options.closeButton === "boolean") {
                    params["closeButton"] = options.closeButton;
                }
                if (typeof options.closeOnClick === "boolean") {
                    params["closeOnClick"] = options.closeOnClick;
                }
                if (options.offset) {
                    params["offset"] = options.offset;
                }
                params = { closeOnClick: false, closeButton: true, offset: [0, -14], ...params };
                this.innerMap.infoWindow = new minemap.Popup(params);
            } else {
                this.innerMap.infoWindow = new minemap.Popup({ closeOnClick: false, closeButton: true, offset: [0, -14] });
            }
            this.innerMap.infoWindow.addTo(this.innerMap);

            if (evt.context) {
                switch (evt.context.type) {
                    case "dom":
                        this.innerMap.infoWindow.setDOMContent(document.getElementById(evt.context.content) || "");
                        break; // 不推荐使用该方法，每次调用会删掉以前dom节点
                    case "html":
                        this.innerMap.infoWindow.setHTML(
                            `<h4 class='info-window-title'>${evt.context.title}</h4><div class='info-window-content'>${evt.context.content}</div>`
                        );
                        break;
                    case "text":
                        this.innerMap.infoWindow.setText(evt.context.content || "");
                        break;
                    default:
                        this.innerMap.infoWindow.setHTML(
                            `<h4 class='info-window-title'>${evt.context.title}</h4><div class='info-window-content'>${evt.context.content}</div>`
                        );
                        break;
                }
            }

            // this.onCenterAt({x: evt.graphic.geometry.x, y: evt.graphic.geometry.y});
            this.innerMap.infoWindow.setLngLat([evt.graphic.geometry.x, evt.graphic.geometry.y]);
            let popup: any = document.querySelector(".minemap-map .minemap-popup");
            if (popup) {
                popup.style.height = popup.offsetHeight;
            }
        }

        public onCloseInfoWindow(): void {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.remove();
            }
        }

        /**
         * 创建底图
         */
        public onCreateBaseLayers() {
            let baseLayers = new Array<FlagwindTiledLayer>();
            this.baseLayers = baseLayers;
            return baseLayers;
        }
        public onShowTooltip(graphic: any): void {
            let info = graphic.attributes;
            let pt = graphic.geometry;
            let screenpt = this.innerMap.project([pt.x, pt.y]);
            let title = info.name;
            (<any>this).tooltipElement.innerHTML = "<div>" + title + "</div>";
            (<any>this).tooltipElement.style.left = (screenpt.x + 8) + "px";
            (<any>this).tooltipElement.style.top = (screenpt.y + 8) + "px";
            (<any>this).tooltipElement.style.display = "block";

        }
        public onHideTooltip(graphic: any): void {
            (<any>this).tooltipElement.style.display = "none";
        }
        public onCreateContextMenu(args: { contextMenu: Array<any>; contextMenuClickEvent: any }): void {
            if (this.options.onCreateContextMenu) {
                this.options.onCreateContextMenu(args);
            }
        }

    }

}
