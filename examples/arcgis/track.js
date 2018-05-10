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
 

        var map = new esri.Map("map", {
            center: [118.64310559475189, 37.590262923833734]
        });
        var layer = new esri.layers.ArcGISTiledMapServiceLayer(
            "http://192.168.101.39:6080/arcgis/rest/services/DY/MapServer",{id:"test1"});
        map.addLayer(layer)
        //创建路径分析对象
        var shortestAnalyst = new esri.tasks.RouteTask(
            "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
        //创建路径参数对象
        var routeParas = new esri.tasks.RouteParameters();
        //障碍点，但是此时障碍点为空
        routeParas.barriers = new esri.tasks.FeatureSet();
        //停靠点，但是此时停靠点为空
        routeParas.stops = new esri.tasks.FeatureSet();
        //路径是否有方向
        routeParas.returnDirections = false;
        //是否返回路径，此处必须返回
        routeParas.returnRoutes = true;
        //空间参考
        routeParas.outSpatialReference = map.SpatialReference;
        //定义一个标志
        //selectPointID=0什么都不做
        //selectPointID=1说明是添加停靠点
        //selectPointID=2说明是添加障碍点
        var selectPointID;
        //给停靠点按钮添加点击事件
        dojo.on(dojo.dom.byId("stop"), "click", function () {
            selectPointID = 1;
        })
        //给障碍点按钮添加点击事件
        dojo.on(dojo.dom.byId("barriers"), "click", function () {
            selectPointID = 2;
        })
        //定义停靠点的符号
        var stopSymbol = new esri.symbol.SimpleMarkerSymbol();
        stopSymbol.style = esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
        stopSymbol.setSize(8);
        stopSymbol.setColor(new esri.Color("#FFFFCC"));
        //定义障碍点的符号
        var barrierSymbol = new esri.symbol.SimpleMarkerSymbol();
        barrierSymbol.style = esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
        barrierSymbol.setSize(8);
        barrierSymbol.setColor(new esri.Color("#f1a340"));
        dojo.on(map, "mouse-down", function (evt) {
            //通过selectPointID判断是添加是停靠点还是障碍点
            switch (selectPointID) {
                case 0:
                    break;
                case 1:
                    //获得停靠点的坐标
                    var pointStop = evt.mapPoint;
                    var gr = new esri.Graphic(pointStop, stopSymbol);
                    //构建停靠点的参数
                    routeParas.stops.features.push(gr);
                    break;
                case 2:
                    //获得障碍点的坐标
                    var pointBarrier = evt.mapPoint;
                    var gr = new esri.Graphic(pointBarrier, barrierSymbol);
                    //构建障碍点的参数
                    routeParas.barriers.features.push(gr);
                    break;
            }
            //如果selectPointID不等于0，将点的坐标在地图上显示出来
            if (selectPointID != 0) {
                addTextPoint("停靠点", pointStop, stopSymbol);
                addTextPoint("障碍点", pointBarrier, barrierSymbol);
                selectPointID = 0;
            }
        });
        //文本符号：文本信息，点坐标，符号
        function addTextPoint(text, point, symbol) {
            var textSymbol = new esri.symbol.TextSymbol(text);
            textSymbol.setColor(new esri.Color([128, 0, 0]));
            var graphicText = new esri.Graphic(point, textSymbol);
            var graphicpoint = new esri.Graphic(point, symbol);
            //用默认的图层添加
            map.graphics.add(graphicpoint);
            map.graphics.add(graphicText);
        }
        //给分析按钮添加点击事件
        dojo.on(dojo.dom.byId("analyse"), "click", function () {
            //如果障碍点或者停靠点的个数有一个为0，提示用户参数输入不对
            if (routeParas.stops.features.length == 0) {
                alert("输入参数不全，无法分析");
                return;
            }
            //执行路径分析函数
            shortestAnalyst.solve(routeParas, showRoute)
        })

        //处理路径分析返回的结果。
        function showRoute(solveResult) {
            //路径分析的结果
            var routeResults = solveResult.routeResults;
            //路径分析的长度
            var res = routeResults.length;
            //路径的符号
            routeSymbol = new esri.symbol.SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new esri.Color([255, 0, 0]), 3);
            if (res > 0) {
                for (var i = 0; i < res; i++) {
                    var graphicroute = routeResults[i];
                    var graphic = graphicroute.route;
                    graphic.setSymbol(routeSymbol);
                    map.graphics.add(graphic);
                }
            } else {
                alert("没有返回结果");
            }
        }
    }
);
