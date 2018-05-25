/// <reference path="../base/flagwind.map.ts" />
namespace flagwind {
    export class EsriMap extends FlagwindMap {

        public constructor(
            public mapSetting: EsriSetting,
            public mapEl: any,
            options: any) {
            super(mapSetting, mapEl, {
                ...{
                    onMapClick: function (evt: any) {
                        console.log("onMapClick:" + evt.data.mapPoint.x + "," + evt.data.mapPoint.y);
                    }
                },
                ...options
            });
            this.onInit();
        }

        public onAddEventListener(eventName: string, callBack: Function): void {
            dojo.on(this.map, eventName, callBack);
        }
        public onCenterAt(point: any): void {
            this.map.centerAt(point).then(function () {
                // console.log("centerAt:" + point.x + "," + point.y);
            });
        }
        public onCreatePoint(options: any) {
            return new esri.geometry.Point(options.x, options.y, options.spatial || this.spatial);
        }

        public onCreateMap() {
            this.spatial = new esri.SpatialReference({
                wkid: this.mapSetting.wkid || 4326
            });
            // let infoWindow = new esri.dijit.InfoWindow({}, document.getElementById("dispatchInfoWindow"));
            // infoWindow.startup();
            let setting = this.mapSetting;
            let mapArguments = <any>{
                wkid: setting.wkid,
                center: setting.center,
                logo: setting.logo,
                slider: setting.slider,
                sliderPosition: setting.sliderPosition,
                zoom: setting.zoom,
                minZoom: setting.minZoom,
                maxZoom: setting.maxZoom
                // infoWindow: infoWindow
            };
            if (setting.zoom) {
                mapArguments.zoom = setting.zoom;
            }
            if (setting.minZoom) {
                mapArguments.minZoom = setting.minZoom;
            }
            if (setting.maxZoom) {
                mapArguments.maxZoom = setting.maxZoom;
            }
            if (setting.basemap) {
                mapArguments.basemap = setting.basemap;
            }

            if (setting.extent && setting.extent.length === 4) {
                let minXY = this.getPoint({
                    x: setting.extent[0],
                    y: setting.extent[1]
                });
                let maxXY = this.getPoint({
                    x: setting.extent[2],
                    y: setting.extent[3]
                });
                // let tileExtent = new esri.geometry.Extent({xmin: setting.extent[0],ymin: setting.extent[1],xmax: setting.extent[2],ymax: setting.extent[3],spatialReference: {wkid: mapArguments.wkid}});
                let tileExtent = new esri.geometry.Extent(minXY.x, minXY.y, maxXY.x, maxXY.y, this.spatial);
                // mapArguments.extent = esri.geometry.geographicToWebMercator(tileExtent);
                mapArguments.extent = tileExtent;
            }

            if (setting.webTiledUrl) {
                mapArguments.lods = this.getTileInfo().lods;
            }
            // 地图对象
            const map = new esri.Map(this.mapEl, mapArguments);
            map.infoWindow.anchor = "top";
            this.innerMap = map;

            let div = (<any>this).tooltipElement = document.createElement("div");
            div.classList.add("flagwind-map-tooltip");
            (<any>this).innerMap.root.appendChild(div);
            const me = this;

            // #region click event

            map.on("load", function (args: any) {
                me.dispatchEvent("onLoad", args);
            });

            map.on("click", function (args: any) {
                me.dispatchEvent("onClick", args);
            });

            map.on("dbl-click", function (args: any) {
                me.dispatchEvent("onDbClick", args);
            });

            // #endregion

            // #region mouse event
            map.on("mouse-out", function (args: any) {
                me.dispatchEvent("onMouseOut", args);
            });
            map.on("mouse-over", function (args: any) {
                me.dispatchEvent("onMouseOver", args);
            });
            map.on("mouse-move", function (args: any) {
                me.dispatchEvent("onMouseMove", args);
            });
            map.on("mouse-wheel", function (args: any) {
                me.dispatchEvent("onMouseWheel", args);
            });
            // #endregion

            // #region zoom event
            map.on("zoom", function (args: any) {
                me.dispatchEvent("onZoom", args);
            });
            map.on("zoom-start", function (args: any) {
                me.dispatchEvent("onZoomStart", args);
            });
            map.on("zoom-end", function (args: any) {
                me.dispatchEvent("onZoomEnd", args);
            });

            // #endregion

            // #region pan event

            map.on("pan", function (args: any) {
                me.dispatchEvent("onPan", args);
            });
            map.on("pan-start", function (args: any) {
                me.dispatchEvent("onPanStart", args);
            });
            map.on("pan-end", function (args: any) {
                me.dispatchEvent("onPanEnd", args);
            });

            // #endregion

            // #region update event

            map.on("update-start", function (args: any) {
                me.dispatchEvent("onUpdateStart", args);
            });
            map.on("update-end", function (args: any) {
                me.dispatchEvent("onUpdateEnd", args);
            });

            // #endregion 

            map.on("extent-change", function (args: any) {
                // console.trace("------extentChange", args);
                me.dispatchEvent("onExtentChange", args);
            });
            map.on("resize", function (args: any) {
                me.dispatchEvent("onResize", args);
            });

        }

        public onShowInfoWindow(evt: any): void {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.hide();
            }

            if (evt.context) {
                const pt = this.getPoint(evt.graphic.attributes);
                this.innerMap.infoWindow.setTitle(evt.context.title);
                this.innerMap.infoWindow.setContent(evt.context.content);
                if (evt.options.width && evt.options.height) {
                    this.innerMap.infoWindow.resize(evt.options.width, evt.options.height);
                }
                if (evt.options.offset) {
                    let location = this.innerMap.toScreen(pt);
                    location.x += evt.options.offset.x;
                    location.y += evt.options.offset.y;
                    this.innerMap.infoWindow.show(location);
                } else {
                    this.innerMap.infoWindow.show(pt);
                }
            }
        }

        public onCloseInfoWindow(): void {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.hide();
            }
        }

        public onCreateBaseLayers() {
            let baseLayers = new Array<FlagwindTiledLayer>();
            if (this.mapSetting.baseUrl) {
                const layer = new EsriTiledLayer("base_arcgis_tiled", this.mapSetting.baseUrl, this.spatial, "瓦片图层");
                baseLayers.push(layer);
            }

            if (this.mapSetting.zhujiImageUrl) {
                const layer = new EsriTiledLayer("base_arcgis_zhuji", this.mapSetting.zhujiImageUrl, this.spatial, "瓦片图层");
                baseLayers.push(layer);
            }

            if (this.mapSetting.imageUrl) {
                const layer = new EsriTiledLayer("base_arcgis_image", this.mapSetting.imageUrl, this.spatial, "影像图层");
                baseLayers.push(layer);
            }

            if (this.mapSetting.tiledUrls) {
                this.mapSetting.tiledUrls.forEach(l => {
                    if (!l.url) return;
                    const layer = new EsriTiledLayer(l.id, l.url, this.spatial, l.title);
                    baseLayers.push(layer);
                });
            }
            if (this.mapSetting.webTiledUrl) {
                const tileInfo1 = this.getTileInfo();

                const cycleLayer = new esri.layers.WebTiledLayer(this.mapSetting.webTiledUrl, {
                    tileInfo: tileInfo1
                });
                const layer = new EsriTiledLayer("base_arcgis_tiled", null, this.spatial, "瓦片图层");
                layer.layer = cycleLayer;
                baseLayers.push(layer);
            }
            this.baseLayers = baseLayers;
            this.baseLayers.forEach(g => {
                g.appendTo(this.innerMap);
                // g.show(); // 默认全部打开
            });

            return baseLayers;
        }

        public onShowTooltip(graphic: any): void {
            let info = graphic.attributes;
            let pt = new esri.geometry.Point(info.longitude, info.latitude, this.spatial);
            let screenpt = this.innerMap.toScreen(pt);
            let title = info.name;
            // if (graphic.attributes.__type === "polyline" || graphic.attributes.__type === "polygon") {
            //     screenpt = { x: info.tooltipX, y: info.tooltipY };
            // }
            (<any>this).tooltipElement.innerHTML = "<div>" + title + "</div>";
            (<any>this).tooltipElement.style.left = (screenpt.x + 15) + "px";
            (<any>this).tooltipElement.style.top = (screenpt.y + 15) + "px";
            (<any>this).tooltipElement.style.display = "block";
        }

        public onHideTooltip(graphic: any): void {
            (<any>this).tooltipElement.style.display = "none";
        }

        public onCreateContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }): void {
            const menus = options.contextMenu;
            let ctxMenu = (<any>this).ctxMenuForMap = new dijit.Menu({
                onOpen: function (box: any) {
                    (<any>this).currentLocation = this.getMapPointFromMenuPosition(box, this.innerMap);
                }
            });
            for (let i = 0; i < menus.length; i++) {
                ctxMenu.addChild(new dijit.MenuItem({
                    label: menus[i],
                    onClick: function (evt: any) {
                        options.contextMenuClickEvent(this.label);
                    }
                }));
            }
            ctxMenu.startup();
            ctxMenu.bindDomNode(this.innerMap.container);
        }

        /**
         * tileInfo必须是单例模式，否则地图无法正常显示
         * 
         * @returns 
         * @memberof FlagwindMap
         */
        protected getTileInfo() {
            if ((<any>this).tileInfo) return (<any>this).tileInfo;
            // tslint:disable-next-line:align
            let tileInfo = new esri.layers.TileInfo({
                "dpi": 96,
                "spatialReference": this.spatial,
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -2.0037508342787E7,
                    "y": 2.0037508342787E7,
                    "spatialReference": this.spatial
                },
                "lods": [
                    {
                        "level": "0",
                        "scale": 5.91657527591555E8,
                        "resolution": 156543.03392800014
                    },
                    {
                        "level": "1",
                        "scale": 2.95828763795777E8,
                        "resolution": 78271.51696399994
                    },
                    {
                        "level": "2",
                        "scale": 1.47914381897889E8,
                        "resolution": 39135.75848200009
                    },
                    {
                        "level": "3",
                        "scale": 7.3957190948944E7,
                        "resolution": 19567.87924099992
                    },
                    {
                        "level": "4",
                        "scale": 3.6978595474472E7,
                        "resolution": 9783.93962049996
                    },
                    {
                        "level": "5",
                        "scale": 1.8489297737236E7,
                        "resolution": 4891.96981024998
                    },
                    {
                        "level": "6",
                        "scale": 9244648.868618,
                        "resolution": 2445.98490512499
                    },
                    {
                        "level": "7",
                        "scale": 4622324.434309,
                        "resolution": 1222.992452562495
                    },
                    {
                        "level": "8",
                        "scale": 2311162.217155,
                        "resolution": 611.4962262813797
                    },
                    {
                        "level": "9",
                        "scale": 305.74811314055756,
                        "resolution": 1155581.108577
                    },
                    {
                        "level": "10",
                        "scale": 577790.554289,
                        "resolution": 152.87405657041106
                    },
                    {
                        "level": "11",
                        "scale": 288895.277144,
                        "resolution": 76.43702828507324
                    },
                    {
                        "level": "12",
                        "scale": 144447.638572,
                        "resolution": 38.21851414253662
                    },
                    {
                        "level": "13",
                        "scale": 72223.819286,
                        "resolution": 19.10925707126831
                    },
                    {
                        "level": "14",
                        "scale": 36111.909643,
                        "resolution": 9.554628535634155
                    },
                    {
                        "level": "15",
                        "scale": 18055.954822,
                        "resolution": 4.77731426794937
                    },
                    {
                        "level": "16",
                        "scale": 9027.977411,
                        "resolution": 2.388657133974685
                    },
                    {
                        "level": "17",
                        "scale": 4513.988705,
                        "resolution": 1.1943285668550503
                    },
                    {
                        "level": "18",
                        "scale": 2256.994353,
                        "resolution": 0.5971642835598172
                    },
                    {
                        "level": "19",
                        "scale": 1128.497176,
                        "resolution": 0.29858214164761665
                    }]
            });
            (<any>this).tileInfo = tileInfo;
            return tileInfo;
        }

    }
}
