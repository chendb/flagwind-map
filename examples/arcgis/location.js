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

        var locationLayer = new flagwind.EsriLocationLayer(myMap, {
            id: "tollgateLocation",
            onMapClick: function (evt) {
                document.getElementById("location").innerHTML = "x:" + evt.point.x + ",y:" + evt.point.y;
            }
        });


    }
);