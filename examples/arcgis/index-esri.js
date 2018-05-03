var arcgisBasePath = 'http://27.17.34.22:8081/arcgis_js_v321_api/arcgis_js_api/library/3.21/3.21/';
require.config({
    //By default load any module IDs from js/lib
    baseUrl: arcgisBasePath,
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim: {},
    paths: {
        esri:  "esri",
        dojo:  "dojo",
        dojox:  "dojox",
        dijit:  "dijit"
    }
});


require(["esri/map", "dojo/domReady!"], function(Map) {
    var map = new Map("map", {
      center: [-118, 34.5],
      zoom: 8,
      basemap: "topo"
    });
  });

// // Start the main app logic.
// require(['esri/map'], function (Map) {

//         var flagwind = flagwindMap.default;
//         var mapSetting = {};
//         // mapSetting.basemap = "topo";
//         mapSetting.baseUrl = "http://192.168.101.39:6080/arcgis/rest/services/yantai_2018_04_18/MapServer";
//         //"http://27.17.34.22:6080/arcgis/rest/services/YTKFQ/MapServer",
//         //"http://27.17.34.22:6080/arcgis/rest/services/DY/MapServer";
//         // mapSetting.imageUrl = "http://10.52.86.242:6080/arcgis/rest/services/2013yingxiangditu/MapServer";
//         // mapSetting.zhujiImageUrl = "http://10.52.86.242:6080/arcgis/rest/services/2013yingxiangzhuji/MapServer";
//         mapSetting.center = [121.2701, 37.5652];
//         mapSetting.wkid = 4326;
//         mapSetting.zoom = 2;
//         mapSetting.slider = true;
//         // mapSetting.homeButtonId = "map-homeButton";
//         mapSetting.sliderPosition = "bottom-right";
//         mapSetting.autoResize = true;
//         // mapSetting.extent = [118.15453668117263, 37.08990840298345, 119.17770491367966, 37.77519317266256];
//         // mapSetting.mapDomain = "27.17.34.22:6080";
//         // mapSetting.accessToken="658e22d73c60405a8a7c82f69f298c2b";
 


//     }
// );



