declare var minemap: any;

namespace flagwind {

    const EVENT_MAP: Map<string, string> = new Map<string, string>();
    EVENT_MAP.set("onLoad", "load");

    export class MinemapService implements IMapService {

        //#region 
        public createTiledLayer(options: { url: string; id: string; title: string }) {
            // 该方法可不用实现
            throw new Error("Method not implemented.");
        }
        public createBaseLayer(flagwindMap: FlagwindMap): Array<FlagwindTiledLayer> {
            return new Array<FlagwindTiledLayer>();
        }
        public createGraphicsLayer(options: any) {
            if (options.kind === "marker") {
                return new MinemapMarkerLayer(options);
            }
            if (options.kind === "geojson") {
                return new MinemapGeoJsonLayer(options);
            }
            throw new Error("不支持的图层类型");
        }
        public clearLayer(layer: any): void {
            if (layer.clear) {
                layer.clear();
            }
        }
        public removeLayer(layer: any, map: any): void {
            (<IMinemapGraphicsLayer>layer).removeFromMap(map);
            // throw new Error("Method not implemented.");
        }
        public addLayer(layer: any, map: any): void {
            (<IMinemapGraphicsLayer>layer).addToMap(map);
            // throw new Error("Method not implemented.");
        }
        public showLayer(layer: any): void {
            (<IMinemapGraphicsLayer>layer).show();
        }
        public hideLayer(layer: any): void {
            (<IMinemapGraphicsLayer>layer).hide();
        }

        //#endregion

        //#region 
        public getGraphicListByLayer(layer: any): Array<any> {
            let graphics = (<IMinemapGraphicsLayer>layer).graphics;
            let result = new Array<any>();
            result.push(graphics);
            return result;
        }
        public removeGraphic(graphic: any, layer: any): void {
            (<IMinemapGraphicsLayer>layer).remove(graphic);
        }
        public addGraphic(graphic: any, layer: any): void {
            (<IMinemapGraphicsLayer>layer).add(graphic);
        }
        public showGraphic(graphic: any): void {
            (<IMinemapGraphic>graphic).show();
        }
        public hideGraphic(graphic: any): void {
            (<IMinemapGraphic>graphic).hide();
        }
        public setGeometryByGraphic(graphic: any, geometry: any): void {
            (<IMinemapGraphic>graphic).setGeometry(geometry);
        }
        public setSymbolByGraphic(graphic: any, symbol: any): void {
            (<IMinemapGraphic>graphic).setSymbol(symbol);
        }
        public createMarkerSymbol(options: any) {
            throw new Error("Method not implemented.");
        }
        public getGraphicAttributes(graphic: any) {
            return (<IMinemapGraphic>graphic).attributers;
        }

        //#endregion

        //#region 地图
        public addEventListener(target: any, eventName: string, callback: Function): void {
            let en = EVENT_MAP.get(eventName) || eventName;
            target.on(en, callback);
        }
        public centerAt(point: any, map: any): void {
            map.flyTo({
                center: [
                    point.x,
                    point.y]
            });
        }
        public createPoint(options: any) {
            return new MinemapPoint(options.x, options.y, options.spatial);
        }
        public createSpatial(wkid: any) {
            return new MinemapSpatial(wkid);
        }
        public getInfoWindow(map: any) {
            throw new Error("Method not implemented.");
        }
        public showInfoWindow(evt: { graphic: any; mapPoint: any }): void {
            throw new Error("Method not implemented.");
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
            // console.log("-->坐标转换之后:" + lnglat.lon + "," + lnglat.lat);

            // 以x,y属性创建点
            return {
                longitude: parseFloat(lnglat.lon.toFixed(8)),
                latitude: parseFloat(lnglat.lat.toFixed(8))
            };
        }

        public toPoint(item: any, flagwindMap: FlagwindMap) {
            let lnglat: any = { "latitude": item.latitude || item.lat, "longitude": item.longitude || item.lon };
            if (!MapUtils.validDevice(lnglat)) {
                lnglat.longitude = item.x;
                lnglat.latitude = item.y;
            }
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("原始坐标：" + lnglat.longitude + "," + lnglat.latitude);
                        lnglat = MapUtils.gcj_encrypt(lnglat.latitude, lnglat.longitude);
                        console.log("高德坐标：" + lnglat.longitude + "," + lnglat.latitude);
                        lnglat = MapUtils.point2To25(lnglat.longitude, lnglat.latitude);
                        console.log("2.5D坐标：" + lnglat.longitude + "," + lnglat.latitude);
                    } else {
                        lnglat = MapUtils.lonlat2mercator(lnglat.latitude, lnglat.longitude);
                    }
                } else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.latitude, lnglat.longitude);
                }
                else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = MapUtils.mercator_encrypt(lnglat.latitude, lnglat.longitude);
                }
            }
            // 以x,y属性创建点
            return new MinemapPoint(lnglat.longitude, lnglat.latitude, flagwindMap.spatial);

        }

        public createMap(setting: IMapSetting, flagwindMap: FlagwindMap) {
            minemap.domainUrl = "http://" + setting.mapDomain;
            minemap.spriteUrl = "http://" + setting.mapDomain + "/minemapapi/" + setting.mapVersion + "/sprite/sprite";
            minemap.serviceUrl = "http://" + setting.mapDomain + "/service";
            minemap.accessToken = setting.accessToken || "25cc55a69ea7422182d00d6b7c0ffa93";
            minemap.solution = 2365;
            const map = new minemap.Map({
                container: flagwindMap.mapEl,
                style: "http://" + setting.mapDomain + "/service/solu/style/id/2365",
                center: setting.center || [116.46, 39.92],
                zoom: setting.zoom,
                pitch: 60,
                maxZoom: setting.maxZoom || 17,    // 地图最大缩放级别限制
                minZoom: setting.minZoom || 9      // 地图最小缩放级别限制
            });

            let popup = new minemap.Popup({ closeOnClick: false })
                .addTo(map);
            map.infoWindow = popup;

            let el = document.createElement("div");
            el.id = "flagwind-map-title";

            let titleDiv = (<any>flagwindMap).titleDiv = document.createElement("div");
            titleDiv.id = "flagwind-map-title";
            titleDiv.classList.add("flagwind-map-title");
            
            (<any>flagwindMap).titleMarker = new minemap.Marker(titleDiv, {offset: [0, 0]})
            .addTo(map);

            // (<any>flagwindMap).innerMap._controlContainer.appendChild(div);
            
            return map;
        }

        public createContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }, flagwindMap: FlagwindMap): void {
            throw new Error("Method not implemented.");
        }
        public showTitle(graphic: any, flagwindMap: FlagwindMap): void {
            let info = graphic.attributes;
            let pt = new MinemapPoint(info.longitude, info.latitude, flagwindMap.spatial);
            (<any>flagwindMap).titleMarker.setLngLat([pt.x,pt.y]);
            (<any>flagwindMap).titleMarker.getElement().style.display = "block";
            // let screenpt = flagwindMap.innerMap.toScreen(pt);
            // let title = info.name;
            // (<any>flagwindMap).titleDiv.innerHTML = "<div>" + title + "</div>";
            // (<any>flagwindMap).titleDiv.style.left = (screenpt.x + 8) + "px";
            // (<any>flagwindMap).titleDiv.style.top = (screenpt.y + 8) + "px";
            // (<any>flagwindMap).titleDiv.style.display = "block";
        }
        public hideTitle(flagwindMap: FlagwindMap): void {
           // (<any>flagwindMap).titleDiv.style.display = "none";
           (<any>flagwindMap).titleMarker.getElement().style.display = "none";
        }

        //#endregion

        //#region 
        public setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: { points: Array<any>; spatial: any }, segment: TrackSegment): void {
            throw new Error("Method not implemented.");
        }
        public setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: { polyline: any; length: number }, segment: TrackSegment): void {
            throw new Error("Method not implemented.");
        }
        public solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void {
            throw new Error("Method not implemented.");
        }
        public solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void {
            throw new Error("Method not implemented.");
        }
        public getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number) {
            throw new Error("Method not implemented.");
        }
        public getStandardStops(name: string, stops: Array<any>): Array<any> {
            throw new Error("Method not implemented.");
        }
        public showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment) {
            throw new Error("Method not implemented.");
        }
        //#endregion

    }
}
