import { MapSetting } from '../map.setting';
import { MapUtils } from './map.utils';
import { FlagwindTiledLayer, FlagwindFeatureLayer } from './flagwind.layer';
import { DeviceLayer } from './device.layer';

declare var esri: any;
declare var dojo: any;
declare var dijit:any;

export const FlagwindMapOptions = {

    mapLoad: null,
    mapClick: null,

    onMapLoad() {
        if (this.mapLoad) {
            this.mapLoad();
        }
    },
    onMapZoomEnd(level) {

    },
    onMapClick(evt) {
        if (this.mapClick) {
            this.mapClick(evt);
        }
    }

}

export class FlagwindMap {

    private mapEl: any = null;
    private options: any = null;
    private baseLayers: FlagwindTiledLayer[] = [];
    private featureLayers: FlagwindFeatureLayer[] = [];
    public spatial: any;
    private ctxMenuForMap = null;
    private currentLocation = null;
    public innerMap: any;
    private titleDiv: any;
    private tileInfo: any;



    constructor(mapEl: any, options: any) {
        this.mapEl = mapEl;
        this.options = Object.assign({}, FlagwindMapOptions, options);
        this.createMap();
        this.createBaseLayer();
        const _this = this;
        dojo.connect(_this.innerMap, "onLoad", function () {
            try {
                _this.goToCenter();
                _this.onMapLoad();
            } catch (ex) {
                console.error(ex);
            }
        });

        _this.innerMap.on('zoom-end', function (evt: any) {
            _this.onMapZoomEnd(evt);
        });

    }

    onMapZoomEnd(evt: any) {
        this.options.onMapZoomEnd(evt.level);
    }


    createMap() {
        this.spatial = new esri.SpatialReference({
            wkid: MapSetting.wkid
        });

        let mapArguments = <any>{
            logo: MapSetting.logo,
            slider: MapSetting.slider,
            zoom: MapSetting.zoom,
            minZoom: MapSetting.minZoom,
            maxZoom: MapSetting.maxZoom
        };
        if (MapSetting.basemap) {
            mapArguments.basemap = MapSetting.basemap;
        }

        if (MapSetting.extent && MapSetting.extent.length == 4) {
            let minXY = this.getPoint({
                x: MapSetting.extent[0],
                y: MapSetting.extent[1]
            });
            let maxXY = this.getPoint({
                x: MapSetting.extent[2],
                y: MapSetting.extent[3]
            });
            let tileExtent = new esri.geometry.Extent(minXY.x, minXY.y, maxXY.x, maxXY.y, this.spatial);
            mapArguments.extent = tileExtent;
        }

        if (MapSetting.webTiledUrl) {
            mapArguments.lods = this.getTileInfo().lods;
        }
        // 地图对象
        const map = new esri.Map(this.mapEl, mapArguments);
        map.infoWindow.anchor = 'top';
        this.innerMap = map;

        var div = this.titleDiv = document.createElement('div');
        div.classList.add("eg-map-title");
        this.innerMap.root.parentElement.appendChild(div);



        // var cycleMap = new esri.layers.WebTiledLayer("http://10.52.88.149:6080/arcgis/rest/services/DY25D/MapServer/tile/${level}/${row}/${col}", {
        //     tileInfo: this.getTileInfo()
        // });
        //this.innerMap.addLayer(cycleMap);


    }

    computeDiff1() {
        let gds = [[118.680865, 37.447362]
            , [118.464684, 37.45599]
            , [118.552031, 37.471093]
            , [118.604196, 37.404561]
            , [118.575237, 37.444553]
            , [118.519394, 37.457989]
            , [118.644942, 37.441212]];


        for (let i = 0; i < gds.length; i++) {
            let origin = {
                x: gds[i][0],
                y: gds[i][1]
            };

            let ws25d = this.getPoint(origin);
            console.log("+++++++++++++++++++" + i + "+++++++++++++++++++++++");
            console.log("高德坐标:" + origin.x + "," + origin.y);
            console.log("2.5d坐标:" + ws25d.x + "," + ws25d.y);
            console.log("---------------------" + i + "---------------------");
        }

    }

    computeDiff() {
        let ws84s = [[118.67521, 37.44667]
            , [118.45874, 37.45514]
            , [118.54638, 37.47041]
            , [118.59866, 37.40399]
            , [118.56962, 37.44396]
            , [118.51363, 37.45727]
            , [118.63932, 37.44058]];
        let mercators = [[174920.576, 15281.434]
            , [46165.734, 88186.591]
            , [114185.482, 65821.847]
            , [90303.878, 23772.063]
            , [106215.555, 48276.629]
            , [82433.435, 71324.53]
            , [147089.793, 24589.759]];

        let offsetX = 0, offsetY = 0, length = ws84s.length;
        for (let i = 0; i < length; i++) {
            let origin = {
                x: ws84s[i][0],
                y: ws84s[i][1]
            };
            let target = {
                x: mercators[i][0],
                y: mercators[i][1]
            }
            let ws3857 = this.getPoint(origin);

            let diffx = ws3857.x - target.x;
            let diffy = ws3857.y - target.y;

            offsetX += diffx, offsetY += diffy;
            console.log("+++++++++++++++++++" + i + "+++++++++++++++++++++++");
            console.log("4326原始坐标:" + origin.x + "," + origin.y);
            console.log("3857原始坐标:" + ws3857.x + "," + ws3857.y);
            console.log("3857比较坐标:" + target.x + "," + target.y);
            console.log("坐标比较差值:" + diffx + "," + diffy);
            console.log("---------------------" + i + "---------------------");
        }
        console.log("平均差值:" + offsetX / length + "," + offsetY / length);

    }

    goToCenter() {

        if (MapSetting.center && MapSetting.center.length == 2) {
            let pt = this.getPoint({
                x: MapSetting.center[0],
                y: MapSetting.center[1]
            });
            this.innerMap.centerAt(pt).then(function () {
                console.log("centerAt:" + pt.x + "," + pt.y);
            });
        }
    }

    formPoint(point: any) {
        let lnglat = { 'lat': point.y, 'lon': point.x };
        if (point.latitude && point.longitude) {
            lnglat.lon = point.longitude;
            lnglat.lat = point.latitude;
        }
        //console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
        if (this.spatial.wkid != MapSetting.wkidFromApp) {
            if (this.spatial.wkid == 3857 && MapSetting.wkidFromApp == 4326) {
                if (MapSetting.is25D) {
                    console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                    lnglat = MapUtils.point25To2(lnglat.lon, lnglat.lat);
                    console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                    lnglat = MapUtils.gcj_decrypt(lnglat.lat, lnglat.lon);
                    console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);

                } else {
                    lnglat = MapUtils.mercator2lonlat(lnglat.lat, lnglat.lon);
                }
            } else if (this.spatial.wkid == 102100 && MapSetting.wkidFromApp == 4326) {
                lnglat = MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
            } else if (this.spatial.wkid == 4326 && MapSetting.wkidFromApp == 3857) {
                lnglat = MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
            }
        }
        //console.log("-->坐标转换之后:" + lnglat.lon + "," + lnglat.lat);

        // 以x,y属性创建点
        return {
            longitude: parseFloat(lnglat.lon.toFixed(8)),
            latitude: parseFloat(lnglat.lat.toFixed(8))
        };
    }


    /**
     * 创建点要素
     */
    getPoint(item: any) {
        let lnglat = { 'lat': item.latitude, 'lon': item.longitude };
        if (!MapUtils.validDevice(item)) {
            lnglat.lon = item.x;
            lnglat.lat = item.y;
        }
        //console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
        if (this.spatial.wkid != MapSetting.wkidFromApp) {
            if (this.spatial.wkid == 3857 && MapSetting.wkidFromApp == 4326) {
                if (MapSetting.is25D) {
                    console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                    lnglat = MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                    console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                    lnglat = MapUtils.point2To25(lnglat.lon, lnglat.lat);
                    console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                } else {
                    lnglat = MapUtils.lonlat2mercator(lnglat.lat, lnglat.lon);
                }
                //lnglat.lon = lnglat.lon - (MapSetting.offsetX || 0);
                // lnglat.lat = lnglat.lat - (MapSetting.offsetY || 0);
            } else if (this.spatial.wkid == 102100 && MapSetting.wkidFromApp == 4326) {
                // console.log("--原始坐标：" + lnglat.lon + "," + lnglat.lat);
                // let _lnglat = MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                // console.log("--高德坐标：" + _lnglat.lon + "," + _lnglat.lat);
                // _lnglat = MapUtils.gcj_decrypt(_lnglat.lat, _lnglat.lon);
                // console.log("--原始坐标：" + _lnglat.lon + "," + _lnglat.lat);


                lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
            }
            else if (this.spatial.wkid == 4326 && MapSetting.wkidFromApp == 3857) {
                lnglat = MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
            }
        }
        //console.log("-->坐标转换之后:" + lnglat.lon + "," + lnglat.lat);

        // 以x,y属性创建点
        return new esri.geometry.Point(lnglat.lon, lnglat.lat, this.spatial);
    }


    createBaseLayer() {
        if (MapSetting.baseUrl) {
            this.addBaseLayer('base_arcgis_tiled', MapSetting.baseUrl, '瓦片图层');
        }
        if (MapSetting.webTiledUrl) {
            const tileInfo1 = this.getTileInfo();

            const cycleLayer = new esri.layers.WebTiledLayer(MapSetting.webTiledUrl, {
                tileInfo: tileInfo1
            });

            this.addBaseLayer("base_web_titled", null, "瓦片图层");

            const base_web_titled = this.getBaseLayerById("base_web_titled");
            if (base_web_titled) {
                base_web_titled.layer = cycleLayer;
                base_web_titled.appendTo(this.innerMap);
            }
        }
    }

    onMapLoad() {
        if (this.options.onMapLoad) {
            this.options.onMapLoad();
        }

        /**
         * 检测图层的_map对象是否为null,如果为null则把当前地图对象赋值给它（解决图层添加后没关联地图情况）
         */
        this.featureLayers.forEach(fLayer => {
            if (fLayer.layer._map == undefined) {
                fLayer.layer._map == this.innerMap;
            }
        });
        const me: FlagwindMap = this;

        this.innerMap.on("click", function (evt: any) {

            me.options.onMapClick(evt);
        });
    }

    showCoordinates(evt: any) {
        console.log("---------------->当前坐标：" + evt.mapPoint.x.toFixed(5) + "," + evt.mapPoint.y.toFixed(5));
    }


    /**
     * tileInfo必须是单例模式，否则地图无法正常显示
     * 
     * @returns 
     * @memberof FlagwindMap
     */
    getTileInfo() {
        if (this.tileInfo) return this.tileInfo;
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
            "lods": [{
                "level": "0",
                "scale": 5.91657527591555E8,
                "resolution": 156543.03392800014
            }, {
                "level": "1",
                "scale": 2.95828763795777E8,
                "resolution": 78271.51696399994
            }, {
                "level": "2",
                "scale": 1.47914381897889E8,
                "resolution": 39135.75848200009
            }, {
                "level": "3",
                "scale": 7.3957190948944E7,
                "resolution": 19567.87924099992
            }, {
                "level": "4",
                "scale": 3.6978595474472E7,
                "resolution": 9783.93962049996
            }, {
                "level": "5",
                "scale": 1.8489297737236E7,
                "resolution": 4891.96981024998
            }, {
                "level": "6",
                "scale": 9244648.868618,
                "resolution": 2445.98490512499
            }, {
                "level": "7",
                "scale": 4622324.434309,
                "resolution": 1222.992452562495
            }, {
                "level": "8",
                "scale": 2311162.217155,
                "resolution": 611.4962262813797
            }, {
                "level": "9",
                "scale": 305.74811314055756,
                "resolution": 1155581.108577
            }, {
                "level": "10",
                "scale": 577790.554289,
                "resolution": 152.87405657041106
            }, {
                "level": "11",
                "scale": 288895.277144,
                "resolution": 76.43702828507324
            }, {
                "level": "12",
                "scale": 144447.638572,
                "resolution": 38.21851414253662
            }, {
                "level": "13",
                "scale": 72223.819286,
                "resolution": 19.10925707126831
            }, {
                "level": "14",
                "scale": 36111.909643,
                "resolution": 9.554628535634155
            }, {
                "level": "15",
                "scale": 18055.954822,
                "resolution": 4.77731426794937
            }, {
                "level": "16",
                "scale": 9027.977411,
                "resolution": 2.388657133974685
            }, {
                "level": "17",
                "scale": 4513.988705,
                "resolution": 1.1943285668550503
            }, {
                "level": "18",
                "scale": 2256.994353,
                "resolution": 0.5971642835598172
            }, {
                "level": "19",
                "scale": 1128.497176,
                "resolution": 0.29858214164761665
            }]
        });
        this.tileInfo = tileInfo;
        console.log(tileInfo);
        return tileInfo;


    }


    addBaseLayer(id: string, url: string|null, title: string|null) {
        if (this.getBaseLayerById(id)) {
            throw Error('图层' + id + '已存在');
        }
        const layer = new FlagwindTiledLayer(id, url, title);
        this.baseLayers.push(layer);
        layer.appendTo(this.innerMap);
    }

    getBaseLayerById(id: string): FlagwindTiledLayer | undefined {
        const layers = this.baseLayers.filter(g => g.id === id);
        if (layers && layers.length > 0) {
            return layers[0];
        }
        return undefined;
    }

    /**
     * 鼠标移动到点要素时显示title
     */
    showTitle(graphic: any) {
        var info = graphic.attributes;
        var pt = new esri.geometry.Point(info.longitude, info.latitude, this.spatial);
        var screenpt = this.innerMap.toScreen(pt);
        var title = info.name;
        this.titleDiv.innerHTML = "<div>" + title + "</div>";
        this.titleDiv.style.left = (screenpt.x + 8) + 'px';
        this.titleDiv.style.top = (screenpt.y + 8) + 'px';
        this.titleDiv.style.display = "block";
    }

    hideTitle() {
        this.titleDiv.style.display = "none";
    }

    showBaseLayer(id: string) {
        const layer = this.getBaseLayerById(id);
        if (layer) {
            layer.show();
            return true;
        }
        return false;
    }

    getFeatureLayerById(id: string): FlagwindFeatureLayer | undefined {
        const layer = this.featureLayers.find(g => g.id === id);
        return layer;
    }

    addDeviceLayer(deviceLayer: FlagwindFeatureLayer) {
        if (this.getFeatureLayerById(deviceLayer.id)) {
            throw Error('图层' + deviceLayer.id + '已存在');
        }
        this.featureLayers.push(deviceLayer);
        deviceLayer.appendTo(this.innerMap);
    }

    addFeatureLayer(id: string, title: string) {
        if (this.getFeatureLayerById(id)) {
            throw Error('图层' + id + '已存在');
        }
        const layer = new FlagwindFeatureLayer(id, title);
        this.featureLayers.push(layer);
        layer.appendTo(this.innerMap);
    }

    showFeatureLayer(id: string) {
        const layer = this.getFeatureLayerById(id);
        if (layer) {
            layer.show();
            return true;
        }
        return false;
    }

    removeFeatureLayer(id: string) {
        const flayer = this.getFeatureLayerById(id);
        if (flayer) {
            this.innerMap.removeLayer(flayer.layer);
            const i = this.featureLayers.indexOf(flayer);
            this.featureLayers.splice(i, 1);
            return true;
        }
        return false;
    }


    /**
     * 中心定位
     */
    centerAt(x: number, y: number) {
        this.innerMap.centerAt(new esri.geometry.Point(x, y, this.spatial)).then(function () {
            console.log("centerAt:" + x + "," + y);
        });
    }


    get infoWindow() {
        return this.innerMap.infoWindow;
    }

    get map() {
        return this.innerMap;
    }

    /**
     *
     * 创建菜单
     *
     * @param {{ contextMenu: any[], contextMenuClickEvent: any }} options
     * @memberof FlagwindMap
     */
    createContextMenu(options: { contextMenu: any[], contextMenuClickEvent: any }) {
        const menus = options.contextMenu;
        const _this = <any>this;
        _this.ctxMenuForMap = new dijit.Menu({
            onOpen: function (box: any) {
                _this.currentLocation = _this.getMapPointFromMenuPosition(box);
            }
        });
        for (let i = 0; i < menus.length; i++) {
            _this.ctxMenuForMap.addChild(new dijit.MenuItem({
                label: menus[i],
                onClick: function (evt: any) {
                    options.contextMenuClickEvent(this.label);
                }
            }));
        }
        _this.ctxMenuForMap.startup();
        _this.ctxMenuForMap.bindDomNode(_this.innerMap.container);
    }


    /**
     * 获取菜单单击的坐标信息
     *
     * @param {any} box
     * @returns {*}
     * @memberof FlagwindMap
     */
    getMapPointFromMenuPosition(box: any) {
        const _this = this;
        let x = box.x,
            y = box.y;
        switch (box.corner) {
            case 'TR':
                x += box.w;
                break;
            case 'BL':
                y += box.h;
                break;
            case 'BR':
                x += box.w;
                y += box.h;
                break;
        }

        const screenPoint = new esri.geometry.Point(x - _this.innerMap.position.x, y - _this.innerMap.position.y);
        return _this.innerMap.toMap(screenPoint);
    }
}