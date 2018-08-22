var baseUrl = "http://27.17.34.22:8081/arcgis4js/library/3.21/";
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '../scripts/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim: {},
    paths: {
        esri: baseUrl + "esri",
        dojo: baseUrl + "dojo",
        dojox: baseUrl + "dojox",
        dijit: baseUrl + "dijit",
        flagwindMap: "flagwind-map/flagwind-map"
    },
    map: {}
});


// Start the main app logic.
requirejs(["dojo/parser",
        "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/dom", "dojo/on", "dojo/fx",
        "dojox/gfx/fx", "dojox/gesture/tap",
        'flagwindMap',
        "esri/renderers/ClassBreaksRenderer",
        "esri/map", "esri/toolbars/draw", "esri/toolbars/edit", "esri/SpatialReference", "esri/Color", "esri/units",
        "esri/layers/ArcGISImageServiceLayer", "esri/layers/GraphicsLayer", "esri/layers/DynamicMapServiceLayer", "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/WebTiledLayer",
        "esri/graphic", "esri/graphicsUtils",
        "esri/geometry/Point", "esri/geometry/Multipoint", "esri/geometry/geometryEngine", "esri/geometry/Polyline", "esri/geometry/Circle", "esri/geometry/geodesicUtils",
        "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/CartographicLineSymbol",
        "esri/tasks/RouteTask", "esri/tasks/RouteParameters", "esri/tasks/FeatureSet", "dojo/domReady!"


    ],
    function (
        parser,
        dojoBaseDeclare,
        dojoBaselang,
        dojoBaseArray,
        dojoDom,
        dojoOn,
        dojoFx,
        dojoxGfxFx,
        dojoxGestureTap,
        flagwindMap,
        esriRenderersClassBreaksRenderer) {

        dojo._base = {
            declare: dojoBaseDeclare,
            lang: dojoBaselang,
            array: dojoBaseArray
        };
        dojo.dom = dojoDom;
        dojo.on = dojoOn;
        dojo.fx = dojoFx;
        dojox.gfx.fx = dojoxGfxFx;
        dojox.gesture = {
            tap: dojoxGestureTap
        };
        esri.renderers = {
            ClassBreaksRenderer: esriRenderersClassBreaksRenderer
        };

        var flagwind = flagwindMap.default;
        var mapSetting = new flagwind.EsriSetting();
        mapSetting.center = [100.974, 22.767];
        mapSetting.minZoom = 0;
        mapSetting.maxZoom = 8;
        mapSetting.zoom = 5;
        // mapSetting.basemap="topo";
        mapSetting.baseUrl = "http://192.168.101.39:6080/arcgis/rest/services/smq_2018_05_03/MapServer";
        var myMap = new flagwind.EsriMap(mapSetting, 'map', {
            onMapLoad: function () {

            }
        });

 

        var businessService = {
            getDataList: function () {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        tollCode: "1",
                        tollName: "关山大道卡口",
                        lon: 100.972,
                        lat: 22.763
                    }, {
                        tollCode: "2",
                        tollName: "北京路卡口",
                        lon: 100.975,
                        lat: 22.765
                    }, {
                        tollCode: "3",
                        tollName: "天津路卡口",
                        lon: 100.978,
                        lat: 22.768
                    }]);
                });
            },
            getLastStatus: function () {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        tollCode: "1",
                        tollName: "关山大道卡口",
                        lon: 116.461,
                        lat: 39.929,
                        satus: Math.random()
                    }, {
                        tollCode: "2",
                        tollName: "北京路卡口",
                        lon: 116.465,
                        lat: 39.922,
                        satus: Math.random()
                    }]);
                });
            },
            changeStandardModel: function (item) {
                item.id = item.tollCode;
                item.name = item.tollName;
                item.longitude = item.lon;
                item.latitude = item.lat;
                return item;
            },
            getInfoWindowContext: function (item) {
                return {
                    title: item.name,
                    content: "这是一个测试" + item.name
                };
            }
        }



        var tollgateLayer = new flagwind.EsriPointLayer(myMap, "tollgateLayer", {
            kind: "point",
            dataType: "tollgate",
            symbol: {
                imageUrl: "http://113.106.54.47:1180/minemapapi/demo/images/police.png"
            },
            onLoad: function () {
                alert("测试");
            }
        },businessService);


        tollgateLayer.showDataList();

        var graphic = null;

        document.getElementById("btnShow").onclick = function () {
            tollgateLayer.show();
        }

        document.getElementById("btnHide").onclick = function () {
            tollgateLayer.hide();
        }

        document.getElementById("btnClear").onclick = function () {
            tollgateLayer.clear();
        }

        document.getElementById("btnGetGraphic").onclick = function () {
            graphic = tollgateLayer.getGraphicById("1");
            if (tollgateLayer.graphics.length == 0) {
                alert("图层无数据，请重新加载数据");
                return;
            }
            if (graphic == null) {
                alert("获取失败");
            } else {
                alert("获取到要素" + graphic.attributes.tollName);
            }
        }

        document.getElementById("btnShowGraphic").onclick = function () {
            if (graphic == null) {
                alert("请先获取要素数据");
                return;
            }
            graphic.show();
        }

        document.getElementById("btnHideGraphic").onclick = function () {
            if (graphic == null) {
                alert("请先获取要素数据");
                return;
            }
            graphic.hide();
        }

    }
);
