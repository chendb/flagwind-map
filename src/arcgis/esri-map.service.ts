declare let esri: any;
declare let dojo: any;
declare let dijit: any;

namespace flagwind {

    export class EsriMapService implements IMapService {

        public ROUTE_MAP: Map<FlagwindRouteLayer, EsriRouteService> = new Map<FlagwindRouteLayer, EsriRouteService>();

        public GRAPHIC_SYMBOL_MAP: Map<any, any> = new Map<any, any>();

        public showInfoWindow(evt: { graphic: any; mapPoint: any }): void {
            throw new Error("Method not implemented.");
        }

        //#region 轨迹
        public getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number) {
            return EsriRouteService.getTrackLineMarkerGraphic(trackline, graphic, angle);
        }

        public getStandardStops(name: string, stops: Array<any>): Array<any> {
            return EsriRouteService.getStandardStops(name, stops, null);
        }

        public showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment) {
            let service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null) service = new EsriRouteService(flagwindRouteLayer);
            service.showSegmentLine(segment);
        }

        public solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void {
            let service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null) service = new EsriRouteService(flagwindRouteLayer);
            service.solveByService(segment, start, end, waypoints);
        }

        public solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void {
            let service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null) service = new EsriRouteService(flagwindRouteLayer);
            service.solveByJoinPoint(segment);
        }

        public setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: { points: Array<any>; spatial: any }, segment: TrackSegment): void {
            let service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null) service = new EsriRouteService(flagwindRouteLayer);
            service.setSegmentByLine(options, segment);
        }
        public setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: { polyline: any; length: number }, segment: TrackSegment): void {
            let service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null) service = new EsriRouteService(flagwindRouteLayer);
            service.setSegmentByPolyLine(options, segment);
        }

        //#endregion

        public createMarkerSymbol(options: any) {
            let markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            if (options.path) markerSymbol.setPath(options.path);
            if (options.size) markerSymbol.setSize(options.size);
            if (options.color) markerSymbol.setColor(new dojo.Color(options.color));
            if (options.outline) markerSymbol.setOutline(options.outline);
            return markerSymbol;
        }

        public showTitle(graphic: any, flagwindMap: FlagwindMap): void {
            let info = graphic.attributes;
            let pt = new esri.geometry.Point(info.longitude, info.latitude, flagwindMap.spatial);
            let screenpt = flagwindMap.innerMap.toScreen(pt);
            let title = info.name;
            (<any>flagwindMap).titleDiv.innerHTML = "<div>" + title + "</div>";
            (<any>flagwindMap).titleDiv.style.left = (screenpt.x + 8) + "px";
            (<any>flagwindMap).titleDiv.style.top = (screenpt.y + 8) + "px";
            (<any>flagwindMap).titleDiv.style.display = "block";
        }

        public hideTitle(flagwindMap: FlagwindMap): void {
            (<any>flagwindMap).titleDiv.style.display = "none";
        }

        public createTiledLayer(options: { url: string; id: string; title: string }): any {
            return new esri.layers.ArcGISTiledMapServiceLayer(options.url, { id: options.id, title: options.title });
        }

        public clearLayer(layer: any): void {
            if (layer && layer._map != null) {
                layer.clear();
            }
        }
        public removeLayer(layer: any, map: any): void {
            map.removeLayer(layer);
        }
        public addLayer(layer: any, map: any): void {
            map.addLayer(layer);
        }
        public showLayer(layer: any): void {
            layer.show();
        }
        public hideLayer(layer: any): void {
            layer.hide();
        }
        public getGraphicListByLayer(lay: any): Array<any> {
            return lay.graphics;
        }
        public createGraphicsLayer(options: any) {
            return new esri.layers.GraphicsLayer(options);
        }
        public removeGraphic(graphic: any, layer: any): void {
            layer.remove(graphic);
        }
        public addGraphic(graphic: any, layer: any): void {
            layer.add(graphic);
        }
        public showGraphic(graphic: any): void {
            let symbol = this.GRAPHIC_SYMBOL_MAP.get(graphic);
            graphic.setSymbol(symbol);
        }
        public hideGraphic(graphic: any): void {
            let symbol = graphic.symbol;
            this.GRAPHIC_SYMBOL_MAP.set(graphic, symbol);
            graphic.setSymbol(null);
        }
        public setGeometryByGraphic(graphic: any, geometry: any): void {
            graphic.setGeometry(geometry);
        }
        public setSymbolByGraphic(graphic: any, symbol: any): void {
            graphic.setSymbol(symbol);
        }
        public getGraphicAttributes(graphic: any): any {
            return graphic.attributes;
        }
        public addEventListener(target: any, eventName: string, callback: Function): void {
            dojo.on(target, eventName, callback);
        }
        public centerAt(map: any, point: any): void {
            map.centerAt(point).then(function () {
                console.log("centerAt:" + point.x + "," + point.y);
            });
        }
        public createPoint(options: any): any {
            return new esri.geometry.Point(options.x, options.y, options.spatial);
        }
        public createSpatial(wkid: any): any {
            let spatial = new esri.SpatialReference({
                wkid: wkid
            });
            return spatial;
        }
        public getInfoWindow(map: any): any {
            return map.infoWindow;
        }

        public hideInfoWindow(map: any): void {
            map.infoWindow.hide();
        }
        public formPoint(point: any, flagwindMap: FlagwindMap): { longitude: number; latitude: number } {
            let lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.point25To2(lnglat.lon, lnglat.lat);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.gcj_decrypt(lnglat.lat, lnglat.lon);
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);

                    } else {
                        lnglat = MapUtils.mercator2lonlat(lnglat.lat, lnglat.lon);
                    }
                } else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    lnglat = MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                } else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
            }

            // 以x,y属性创建点
            return {
                longitude: parseFloat(lnglat.lon.toFixed(8)),
                latitude: parseFloat(lnglat.lat.toFixed(8))
            };
        }
        public toPoint(item: any, flagwindMap: FlagwindMap): any {
            let lnglat = { "lat": item.latitude || item.lat, "lon": item.longitude || item.lon };
            if (!MapUtils.validDevice(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = MapUtils.point2To25(lnglat.lon, lnglat.lat);
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                    } else {
                        lnglat = MapUtils.lonlat2mercator(lnglat.lat, lnglat.lon);
                    }
                } else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
                else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return new esri.geometry.Point(lnglat.lon, lnglat.lat, flagwindMap.spatial);
        }

        public createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer> {
            let baseLayers = new Array<FlagwindTiledLayer>();
            if (flagwindMap.mapSetting.baseUrl) {
                const layer = new FlagwindTiledLayer(flagwindMap.mapService, "base_arcgis_tiled", flagwindMap.mapSetting.baseUrl, "瓦片图层");
                baseLayers.push(layer);
            }
            if (flagwindMap.mapSetting.webTiledUrl) {
                const tileInfo1 = this.getTileInfo(flagwindMap);

                const cycleLayer = new esri.layers.WebTiledLayer(flagwindMap.mapSetting.webTiledUrl, {
                    tileInfo: tileInfo1
                });
                const layer = new FlagwindTiledLayer(flagwindMap.mapService, "base_arcgis_tiled", null, "瓦片图层");
                layer.layer = cycleLayer;
                baseLayers.push(layer);
            }
            return baseLayers;
        }

        public createMap(setting: IMapSetting, flagwindMap: FlagwindMap): any {
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
                let minXY = flagwindMap.getPoint({
                    x: setting.extent[0],
                    y: setting.extent[1]
                });
                let maxXY = flagwindMap.getPoint({
                    x: setting.extent[2],
                    y: setting.extent[3]
                });
                let tileExtent = new esri.geometry.Extent(minXY.x, minXY.y, maxXY.x, maxXY.y, flagwindMap.spatial);
                mapArguments.extent = tileExtent;
            }

            if (setting.webTiledUrl) {
                mapArguments.lods = this.getTileInfo(flagwindMap).lods;
            }
            // 地图对象
            const map = new esri.Map(flagwindMap.mapEl, mapArguments);
            map.infoWindow.anchor = "top";

            let div = (<any>flagwindMap).titleDiv = document.createElement("div");
            div.classList.add("eg-map-title");
            (<any>flagwindMap).innerMap.root.parentElement.appendChild(div);
        }

        public createContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }, flagwindMap: FlagwindMap): void {
            const menus = options.contextMenu;
            let ctxMenu = (<any>flagwindMap).ctxMenuForMap = new dijit.Menu({
                onOpen: function (box: any) {
                    (<any>flagwindMap).currentLocation = this.getMapPointFromMenuPosition(box, flagwindMap.innerMap);
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
            ctxMenu.bindDomNode(flagwindMap.innerMap.container);
        }

        /**
         * 获取菜单单击的坐标信息
         *
         * @param {any} box
         * @returns {*}
         * @memberof FlagwindMap
         */
        protected getMapPointFromMenuPosition(box: any, map: any) {
            let x = box.x,
                y = box.y;
            switch (box.corner) {
                case "TR":
                    x += box.w;
                    break;
                case "BL":
                    y += box.h;
                    break;
                case "BR":
                    x += box.w;
                    y += box.h;
                    break;
            }

            const screenPoint = new esri.geometry.Point(x - map.position.x, y - map.position.y);
            return map.toMap(screenPoint);
        }

        /**
         * tileInfo必须是单例模式，否则地图无法正常显示
         * 
         * @returns 
         * @memberof FlagwindMap
         */
        protected getTileInfo(flagwindMap: FlagwindMap) {
            if ((<any>flagwindMap).tileInfo) return (<any>flagwindMap).tileInfo;
            // tslint:disable-next-line:align
            let tileInfo = new esri.layers.TileInfo({
                "dpi": 96,
                "spatialReference": flagwindMap.spatial,
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -2.0037508342787E7,
                    "y": 2.0037508342787E7,
                    "spatialReference": flagwindMap.spatial
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
            (<any>flagwindMap).tileInfo = tileInfo;
            console.log(tileInfo);
            return tileInfo;
        }
    }
}
