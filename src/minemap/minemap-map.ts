namespace flagwind {

    export class MinemapMap extends FlagwindMap {

        protected tooltipElement: HTMLDivElement;

        public constructor(
            public mapSetting: MinemapSetting,
            mapElement: any,
            options: any) {
            super(mapSetting, mapElement, options);
            this.onInit();
        }

        public onZoom(zoom: number): Promise<void> {
            throw new Error("Method not implemented.");
        }

        /**
         * 中心定位
         * @param point 坐标点
         */
        public onCenterAt(point: any): Promise<void> {
            return new Promise<void>(resolve => {
                this.innerMap.flyTo({center: [point.x, point.y]});
                resolve();
            });
        }

        /**
         * 创建点
         * @param options 点属性
         */
        public onCreatePoint(options: any): MinemapPoint {
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
                container: this.mapElement,
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

            this.tooltipElement = document.createElement("div");
            this.tooltipElement.id = "flagwind-map-tooltip";
            this.tooltipElement.classList.add("flagwind-map-tooltip");
            map._container.appendChild(this.tooltipElement);
            this.innerMap = map;

            map.on("load", (args: any) => {
                this.dispatchEvent("onLoad", args);
            });

            // #region click event
            map.on("click", (args: any) => {
                this.dispatchEvent("onClick", args);
            });
            map.on("dbclick", (args: any) => {
                this.dispatchEvent("onDbClick", args);
            });
            // #endregion

            // #region mouse event
            map.on("mouseout", (args: any) => {
                this.dispatchEvent("onMouseOut", args);
            });
            map.on("mousedown", (args: any) => {
                this.dispatchEvent("onMouseDown", args);
            });
            map.on("mousemove", (args: any) => {
                this.dispatchEvent("onMouseMove", args);
            });
            map.on("mouseup", (args: any) => {
                this.dispatchEvent("onMouseUp", args);
            });
            // #endregion

            // #region move event
            map.on("movestart", (args: any) => {
                this.dispatchEvent("onMoveStart", args);
            });
            map.on("move", (args: any) => {
                this.dispatchEvent("onMove", args);
            });
            map.on("moveend", (args: any) => {
                this.dispatchEvent("onMoveEnd", args);
            });
            // #endregionn

            return map;
        }
        
        public onShowInfoWindow(evt: InfoWindowShowEventArgs): void {
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
            this.tooltipElement.innerHTML = "<div>" + title + "</div>";
            this.tooltipElement.style.left = (screenpt.x + 8) + "px";
            this.tooltipElement.style.top = (screenpt.y + 8) + "px";
            this.tooltipElement.style.display = "block";

        }

        public onHideTooltip(): void {
            this.tooltipElement.style.display = "none";
        }

        public onCreateContextMenu(): FlagwindContextMenu {
            return new MinemapContextMenu(this.innerMap);
        }

        public onDestroy(): void {
            try {
                if (this.tooltipElement) {
                    this.tooltipElement.remove();
                    this.tooltipElement = null;
                }
                if (this.featureLayers) {
                    this.featureLayers.forEach(l => {
                        l.clear();
                    });
                    this.featureLayers = [];
                }
                if (this.baseLayers) {
                    this.baseLayers = [];
                }
                if (this.innerMap && this.innerMap.destroy) {
                    this.innerMap.destroy();
                    this.innerMap = null;
                }
            } catch (error) {
                console.error(error);
            }
        }

    }

}
