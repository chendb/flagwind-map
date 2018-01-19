/// <reference path="../base/flagwind.map.ts" />
namespace flagwind {
    export class EsriMap extends FlagwindMap {

        public constructor(
            public mapSetting: IMapSetting,
            public mapEl: any,
            options: any) {
            super(mapSetting, mapEl, options);
            this.onInit();
        }

        public onAddEventListener(eventName: string, callBack: Function): void {
            dojo.on(this.map, eventName, callBack);
        }
        public onCenterAt(point: any): void {
            this.map.centerAt(point).then(function () {
                console.log("centerAt:" + point.x + "," + point.y);
            });
        }
        public onCreatePoint(options: any) {
            return new esri.geometry.Point(options.x, options.y, options.spatial || this.spatial);
        }

        public onCreateMap() {
            this.spatial = new esri.SpatialReference({
                wkid: this.mapSetting.wkid || 4326
            });
            let setting = this.mapSetting;
            let mapArguments = <any>{
                logo: setting.logo,
                slider: setting.slider,
                zoom: setting.zoom,
                minZoom: setting.minZoom,
                maxZoom: setting.maxZoom
            };
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
                let tileExtent = new esri.geometry.Extent(minXY.x, minXY.y, maxXY.x, maxXY.y, this.spatial);
                mapArguments.extent = tileExtent;
            }

            if (setting.webTiledUrl) {
                mapArguments.lods = this.getTileInfo().lods;
            }
            // 地图对象
            const map = new esri.Map(this.mapEl, mapArguments);
            map.infoWindow.anchor = "top";

            let div = (<any>this).tooltipElement = document.createElement("div");
            div.classList.add("flagwind-map-tooltip");
            (<any>this).innerMap.root.parentElement.appendChild(div);
        }

        public onShowInfoWindow(options: any): void {
            throw new Error("Method not implemented.");
        }

        public onCreateBaseLayers() {
            let baseLayers = new Array<FlagwindTiledLayer>();
            if (this.mapSetting.baseUrl) {
                const layer = new EsriTiledLayer("base_arcgis_tiled", this.mapSetting.baseUrl, "瓦片图层");
                baseLayers.push(layer);
            }
            if (this.mapSetting.webTiledUrl) {
                const tileInfo1 = this.getTileInfo();

                const cycleLayer = new esri.layers.WebTiledLayer(this.mapSetting.webTiledUrl, {
                    tileInfo: tileInfo1
                });
                const layer = new EsriTiledLayer("base_arcgis_tiled", null, "瓦片图层");
                layer.layer = cycleLayer;
                baseLayers.push(layer);
            }
            this.baseLayers = baseLayers;
            this.baseLayers.forEach(g => g.appendTo(this.innerMap));
            return baseLayers;
        }
        public onShowTooltip(graphic: any): void {
            let info = graphic.attributes;
            let pt = new esri.geometry.Point(info.longitude, info.latitude, this.spatial);
            let screenpt = this.innerMap.toScreen(pt);
            let title = info.name;
            (<any>this).tooltipElement.innerHTML = "<div>" + title + "</div>";
            (<any>this).tooltipElement.style.left = (screenpt.x + 8) + "px";
            (<any>this).tooltipElement.style.top = (screenpt.y + 8) + "px";
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
