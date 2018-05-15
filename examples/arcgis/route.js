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
        mapSetting.center = [117.520, 37.250];
        // mapSetting.minZoom = 0;
        // mapSetting.maxZoom = 9;
        // mapSetting.zoom = 5;
        mapSetting.wkid = 4326;
        // mapSetting.basemap="topo";
        mapSetting.baseUrl = "http://192.168.101.39:6080/arcgis/rest/services/DY/MapServer";
        var myMap = new flagwind.EsriMap(mapSetting, 'map', {
            onMapLoad: function () {

            }
        });

        var pointLayer = new flagwind.EsriPointLayer(myMap, "car", {
            symbol: {
                imageUrl: "/images/tollgate.png",
                width: 16,
                height: 16
            }
        });

        var trackLayer = new flagwind.EsriTrackLayer(pointLayer, {
            routeUrl: "http://192.168.101.39:6080/arcgis/rest/services/dongying_nd/NAServer",
            routeType: "NA",
            symbol: {
                imageUrl: "/images/car.png",
                width: 48,
                height: 48
            }

        });


        document.getElementById("btnShow").onclick = function () {
            trackLayer.startTrack([{
                id: "1",
                longitude: 118.606,
                latitude: 37.696
            }, {
                id: "2",
                longitude: 118.803,
                latitude: 37.597
            }, {
                id: "3",
                longitude: 118.656,
                latitude: 37.585
            }], "test");
        }

        document.getElementById("btnHide").onclick = function () {
            trackLayer.hide();
        }

        document.getElementById("btnClear").onclick = function () {
            trackLayer.clear("trackline");
        }

        document.getElementById("btnPlay").onclick = function () {
            trackLayer.start("trackline");
        }
        document.getElementById("btnPause").onclick = function () {
            trackLayer.pause("trackline");
        }
        document.getElementById("btnContinue").onclick = function () {
            trackLayer.continue("trackline");
        }
    }
);
