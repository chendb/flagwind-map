var arcgisBasePath = 'http://27.17.34.22:8081/arcgis4js/library/3.16/';
require.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim: {},
    paths: {
        esri: arcgisBasePath + "esri",
        dojo: arcgisBasePath + "dojo",
        dojox: arcgisBasePath + "dojox",
        dijit: arcgisBasePath + "dijit",
        heatmap: "../heatmapJS/heatmap",
        heatmaparcgis: "../heatmapJS/heatmap-arcgis",
        // esri: "http://js.arcgis.com/3.21/init",
        // dojo: "http://js.arcgis.com/3.21/dojo",
        // dojox: "http://js.arcgis.com/3.21/dojox",
        // dijit: "http://js.arcgis.com/3.21/dijit",
        flagwindMap: "flagwind-map/flagwind-map"
    }
});

// Start the main app logic.
require(["flagwindMap", "heatmaparcgis", 'esri/map', "esri/toolbars/draw", "esri/layers/ArcGISImageServiceLayer", 
"esri/layers/GraphicsLayer", "esri/layers/DynamicMapServiceLayer", "esri/graphic",
"esri/geometry/Point", "esri/geometry/Multipoint", 
"esri/symbols/PictureMarkerSymbol", "esri/SpatialReference", "esri/symbols/CartographicLineSymbol",
// "DirectionalLineSymbol",

// "esri/renderers/SimpleRenderer",
"esri/symbols/SimpleLineSymbol", "esri/SpatialReference",
"esri/symbols/SimpleMarkerSymbol",
"esri/tasks/RouteTask",
"esri/tasks/RouteParameters",
"esri/tasks/FeatureSet",
"esri/units",
"esri/geometry/geodesicUtils",
"esri/graphicsUtils",
"esri/symbols/SimpleFillSymbol",
"esri/geometry/geometryEngine",
"esri/geometry/Polyline", "esri/geometry/Circle", "esri/Color",

"dojo/_base/connect",
"dojo/on", "dojo/dom","dojo/_base/event"
], function (flagwindMap, HeatmapLayer) {

        

        var flagwind = flagwindMap.default;
        var mapSetting = {};
        // mapSetting.basemap = "topo";
        mapSetting.baseUrl = "http://27.17.34.22:6080/arcgis/rest/services/YTKFQ/MapServer",//"http://27.17.34.22:6080/arcgis/rest/services/DY/MapServer";
        // mapSetting.imageUrl = "http://10.52.86.242:6080/arcgis/rest/services/2013yingxiangditu/MapServer";
        // mapSetting.zhujiImageUrl = "http://10.52.86.242:6080/arcgis/rest/services/2013yingxiangzhuji/MapServer";
        mapSetting.center = [121.2701, 37.5652];
        mapSetting.wkid = 4326;
        mapSetting.zoom = 2;
        mapSetting.slider = true;
        // mapSetting.homeButtonId = "map-homeButton";
        mapSetting.sliderPosition = "bottom-right";
        mapSetting.autoResize = true;
        // mapSetting.extent = [118.15453668117263, 37.08990840298345, 119.17770491367966, 37.77519317266256];
        // mapSetting.mapDomain = "27.17.34.22:6080";
        // mapSetting.accessToken="658e22d73c60405a8a7c82f69f298c2b";

        var myMap = new flagwind.EsriMap(mapSetting, 'map', {
            onMapLoad: function () {
                console.log("mapOnLoad");
            }
        });
        
        var businessService = {
            tollList: [{
                tollCode: "1",
                tollName: "东西湖路口东",
                tollLongitude: 118.678011,
                tollLatitude: 37.433081
            },
            {
                tollCode: "2",
                tollName: "东西湖路口西",
                tollLongitude: 118.668011,
                tollLatitude: 37.433081
            }],
            getDataList: function () {
                return new Promise(function (resolve, reject) {
                    var data = [], badData = [];
                    businessService.tollList.forEach((item, index) => {
                        if (item.tollLongitude && item.tollLatitude) {
                            data.push(item);
                        } else {
                            badData.push(item);
                        }
                        if (index == businessService.tollList.length - 1) {
                            resolve(data);
                            if (badData.length > 0) console.warn("未知位置卡口：", badData);
                        }
                    });
                });
            },
            changeStandardModel: function (item) {
                item.id = item.tollCode || item.id;
                item.name = item.tollName;
                item.longitude = item.lon || item.tollLongitude || (item.geometry?item.geometry.x:null);
                item.latitude = item.lat || item.tollLatitude || (item.geometry?item.geometry.y:null);
                return item;
            },
            getInfoWindowContext: function (item) {
                return {
                    title: item.name,
                    content: "这是一个测试" + item.name
                };
            }
        };
        
        var tollgateLayer = new flagwind.EsriPointLayer(businessService, myMap, "tollgateLayer", {
            kind: "marker",
            showInfoWindow: false,
            symbol: {
                imageUrl: {
                    online: "scripts/images/pin-toll.png"
                },
                width: 20,
                height: 27,
                className: "toll",
            },
            onMapLoad: function (eventName, evt) {
                console.log("---onMapLoad");
            },
            onEvent: function (eventName, evt) {
                console.log(eventName);
            }
        });

        var polylineService = {
            deviceList: [{"id":"3706061493282351163","name":"海滨路施工","describe":"","polyline":"121.26644,37.57334;121.26883,37.57366;121.27116,37.57395;121.27291,37.57407;121.27364,37.57412;121.27444,37.57413;","unitName":"城建","completionDate":"2017-04-30","startingDate":"2017-04-25","status":0,"statusName":"在建","roadId":"","roadName":null,"regionId":"370606","regionName":"","remark":"测试","phone":"18911115555"},{"id":"3706061493285774654","name":"漓江路施工","describe":"","polyline":"121.26837,37.55521;121.27237,37.55060;","unitName":"城建公司","completionDate":"2017-04-27","startingDate":"2017-04-21","status":0,"statusName":"在建","roadId":"","roadName":null,"regionId":"370606","regionName":"","remark":"测试","phone":"13767579981"}],
        
            getDataList: function() {
                var me = this;
                return new Promise(function (resolve, reject) {
                    if (!me.deviceList) {
                        resolve([]);
                        console.warn("线数据为空！");
                        return;
                    }
                    var data = [], badData = [];
                    me.deviceList.forEach((item, index) => {
                        if (item.id && item.polyline) {
                            data.push(item);
                        } else {
                            badData.push(item);
                        }
                        if (index === me.deviceList.length - 1) {
                            resolve(data);
                            if (badData.length > 0) console.warn("未知位置线数据：", badData);
                        }
                    });
                });
            },
        
            getLastStatus: function() {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        id: "1",
                        name: "1234567",
                        polyline: ""
                    }]);
                });
            },
        
            changeStandardModel: function(item) {
                item.id = item.id;
                item.name = item.name;
                item.polyline = item.polyline;
                // item.longitude = item.lon || item.tollLongitude || (item.geometry ? item.geometry.x : null);
                // item.latitude = item.lat || item.tollLatitude || (item.geometry ? item.geometry.y : null);
                return item;
            }
        };

        var polylineLayer = new flagwind.EsriPointLayer(polylineService, myMap, "polyline", {
            dataType: "polyline",
            symbol: {
                imageUrl: {
                    online: "scripts/images/pin-toll.png"
                },
                width: 20,
                height: 27,
                className: "toll"
            },
        });

        var selectbox = new flagwind.EsriSelectBox(myMap);
        selectbox.addLayer(tollgateLayer);

        window.HeatmapLayer = HeatmapLayer;
        var hotmapLayer = new flagwind.EsriHeatmapLayer(myMap, {title: "热点图",});

        var routeLayer = new flagwind.EsriVehicleRouteLayer(myMap, "car", {routeType: "NA", 
        markerUrl: "scripts/images/carTop.png",
        routeUrl: "http://27.17.34.22:6080/arcgis/rest/services/Features/NAServer/Route", speed: 100, trackLevel: 2});

        var drawLayer = new flagwind.EsriDrawLayer(myMap, {});

        // var editLayer = new flagwind.EsriEditLayer(tollgateLayer, {});


        var addBtn = document.querySelector(".tollgate");
        var clearBtn = document.querySelector(".clear");
        var activeEditBtn = document.querySelector(".activeEdit");
        var centerAtBtn = document.querySelector(".centerAt");
        var openInfoWindowBtn = document.querySelector(".openInfoWindow");
        var closeInfoWindowBtn = document.querySelector(".closeInfoWindow");
        var getSelectedBtn = document.querySelector(".getSelectedToll");
        var setSelectedBtn = document.querySelector(".setSelectedToll");
        var clearSelectedBtn = document.querySelector(".clearSelectedToll");
        var showSelectBarBtn = document.querySelector(".showSelectBar");
        var showHeatMapBtn = document.querySelector(".showHeatMap");
        var closeHeatMapBtn = document.querySelector(".closeHeatMap");
        var showRouteBtn = document.querySelector(".showRoute");
        var playBtn = document.querySelector(".play");
        var continueBtn = document.querySelector(".continue");
        var pauseBtn = document.querySelector(".pause");
        var clearRouteBtn = document.querySelector(".clearRoute");
        var showPolylineBtn = document.querySelector(".showPolyline");
        var drawPolylineBtn = document.querySelector(".drawPolyline");
        var clearPolylineBtn = document.querySelector(".clearPolyline");
        var finishPolylineBtn = document.querySelector(".finishPolyline");

        addBtn.onclick = function(){
            tollgateLayer.showDataList();
        };
        clearBtn.onclick = function(){
            tollgateLayer.layer.clear();
        };
        activeEditBtn.onclick = function(){
            editLayer.activateEdit("1");
        };
        centerAtBtn.onclick = function(){
            tollgateLayer.gotoCenterById("1");
        };
        openInfoWindowBtn.onclick = function(){
            var context = {
                title: "过车信息",
                content: "卡口信息内容"
            };
            tollgateLayer.openInfoWindow("1", context);
        };
        closeInfoWindowBtn.onclick = function(){
            tollgateLayer.closeInfoWindow();
        };
        setSelectedBtn.onclick = function(){
            tollgateLayer.setSelectStatusByModels([{
                tollCode: "1",
                tollName: "1234567",
                tollLongitude: 118.66587,
                tollLatitude: 37.43251
            }], false);
        };
        getSelectedBtn.onclick = function(){
            var selected = tollgateLayer.getSelectedGraphics();
            console.log("----------选择的卡口：", selected);
        };
        clearSelectedBtn.onclick = function(){
            tollgateLayer.clearSelectStatus();
        };
        showSelectBarBtn.onclick = function(){
            selectbox.showSelectBar("map");
        };
        showHeatMapBtn.onclick = function(){
            var list = [{ 'longitude': 118.66587, 'latitude': 37.43251, 'count': 2 }, { 'longitude': 118.76587, 'latitude': 37.43251, 'count': 15 }];
            hotmapLayer.showDataList(list, false);
        };
        closeHeatMapBtn.onclick = function(){
            hotmapLayer.clear();
        };
        showRouteBtn.onclick = function(){
            var dataList = [{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"203100009600201803190748072766","regionID":"370503","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"203100009600","tollName":"河口区S310省道9KM+600M处","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"鲁E1215K","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 07:48:07","speed":"35","url":"ftp://guoche:guoche@10.52.120.15:21/guocheData/kakou/201803/Hisense/3C003A9PAJ00126/19/07/37050300000003002220180319074807938.jpg","year":"2018","month":"201803","day":"20180319","hour":"07","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"4062","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"943,582,419,302","tollLongitude":118.83786,"tollLatitude":37.94523,"brandYearName":"2012","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"98","dataCompanyCode":"05","face":"","score":0.0,"featureData":"MSh/neOxjNr0eWNoC5yabr0syAHwhGOiyc78H1vw3Vw=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"203100000650201803190750215440","regionID":"370503","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"203100000650","tollName":"河口区S310-兴港路1卡口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"鲁E1215K","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 07:50:21","speed":"51","url":"ftp://guoche:guoche@10.52.120.15:21/guocheData/kakou/201803/Hisense/370503000000030019/19/07/37050300000003001920180319075021166.jpg","year":"2018","month":"201803","day":"20180319","hour":"07","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"4062","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"458,468,806,726","tollLongitude":118.90509,"tollLatitude":38.02963,"brandYearName":"2012","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"99","dataCompanyCode":"05","face":"","score":0.0,"featureData":"MSh/neexjNrVfUNIi5n6Tr0+iACQhGOyycbcF3vUnVQ=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"203100008000201803190757288793","regionID":"370503","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"203100008000","tollName":"河口区S310-兴港路2卡口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"鲁E1215K","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 07:57:28","speed":"62","url":"ftp://guoche:guoche@10.52.120.15:21/guocheData/kakou/201803/Hisense/370503000000030020/19/07/37050300000003002020180319075728851.jpg","year":"2018","month":"201803","day":"20180319","hour":"07","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"4062","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"439,349,838,733","tollLongitude":118.90588,"tollLatitude":38.03829,"brandYearName":"2012","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"99","dataCompanyCode":"05","face":"","score":0.0,"featureData":"ESh/neexjNqV/WNoi53STr08yAKwhGOyyc7cF3vwnVw=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"272010002800201803190800354652","regionID":"370502","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"272010002800","tollName":"东营港经济开发区东港高速2KM+800M处","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"鲁E1215K","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 08:00:35","speed":"61","url":"ftp://guoche:guoche@10.52.120.14:21/guoche/guocheData/201803/zhongmeng/272010002800/19/08/37050000000002000520180319080035954_V1(0)V2(0)S(61)0224K.jpg","year":"2018","month":"201803","day":"20180319","hour":"08","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"4062","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1949,1194,541,434","tollLongitude":118.95507,"tollLatitude":37.07592,"brandYearName":"2012","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"97","dataCompanyCode":"05","face":"","score":0.0,"featureData":"ESh/nefxDN7UfUJIi5n6Tt04iACUhGOyyM7cF1v0/Uw=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370505040031009201803190931024166","regionID":"370505","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"370505040031009","tollName":"丽港国际东门进口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"--------","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 09:31:02","speed":"0","url":"http://10.52.86.12:8106/d/1000004$1$0$0/20180319/09/1620-377438-0.jpg?streamID:63@capTime:1521422172","year":"2018","month":"201803","day":"20180319","hour":"09","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"9007","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1145,328,460,340","tollLongitude":98.3455,"tollLatitude":25.5454,"brandYearName":"2012&2015","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"7","tollTypeName":"","communityID":"0","communityName":"","reliability":"44","dataCompanyCode":"04","face":"","score":0.0,"featureData":"CXlsnfslZhOvEordH0ROcpPAOYPWYFTY0iva2a609wM=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370505040031009201803190934423956","regionID":"370505","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"370505040031009","tollName":"丽港国际东门进口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"鲁E173C7","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 09:34:42","speed":"0","url":"http://10.52.86.12:8106/d/1000004$1$0$0/20180319/09/1953-377523-0.jpg?streamID:63@capTime:1521422381","year":"2018","month":"201803","day":"20180319","hour":"09","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"9007","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1159,334,444,334","tollLongitude":98.3455,"tollLatitude":25.5454,"brandYearName":"2012&2015","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"7","tollTypeName":"","communityID":"0","communityName":"","reliability":"55","dataCompanyCode":"04","face":"","score":0.0,"featureData":"CXFtnbslZRvvFpLcV1xMcpPAGY3WYETw1mPa26608wM=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370505040031009201803190936023963","regionID":"370505","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"370505040031009","tollName":"丽港国际东门进口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"--------","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 09:36:02","speed":"0","url":"http://10.52.86.12:8106/d/1000004$1$0$0/20180319/09/1620-377438-0.jpg?streamID:63@capTime:1521422172","year":"2018","month":"201803","day":"20180319","hour":"09","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"9007","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1145,328,460,340","tollLongitude":98.3455,"tollLatitude":25.5454,"brandYearName":"2012&2015","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"7","tollTypeName":"","communityID":"0","communityName":"","reliability":"44","dataCompanyCode":"04","face":"","score":0.0,"featureData":"CXlsnfslZhOvEordH0ROcpPAOYPWYFTY0iva2a609wM=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370505040031009201803190947224063","regionID":"370505","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"370505040031009","tollName":"丽港国际东门进口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"--------","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 09:47:22","speed":"0","url":"http://10.52.86.12:8106/d/1000004$1$0$0/20180319/09/3243-377825-0.jpg?streamID:63@capTime:1521423155","year":"2018","month":"201803","day":"20180319","hour":"09","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"9007","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1145,335,452,319","tollLongitude":98.3455,"tollLatitude":25.5454,"brandYearName":"2012&2015","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"7","tollTypeName":"","communityID":"0","communityName":"","reliability":"37","dataCompanyCode":"04","face":"","score":0.0,"featureData":"CXl0nfs1YxPvEor8HkROchPIOYDXYFTQ1iLa2+6k9wM=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370505040031009201803190951024249","regionID":"370505","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"370505040031009","tollName":"丽港国际东门进口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"--------","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"J","vehicleColorName":"黑色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 09:51:02","speed":"0","url":"http://10.52.86.12:8106/d/1000004$1$0$0/20180319/09/3243-377825-0.jpg?streamID:63@capTime:1521423155","year":"2018","month":"201803","day":"20180319","hour":"09","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"9007","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1145,335,452,319","tollLongitude":98.3455,"tollLatitude":25.5454,"brandYearName":"2012&2015","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"7","tollTypeName":"","communityID":"0","communityName":"","reliability":"37","dataCompanyCode":"04","face":"","score":0.0,"featureData":"CXl0nfs1YxPvEor8HkROchPIOYDXYFTQ1iLa2+6k9wM=","imei":"","imsi":""},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370505040031009201803191002224137","regionID":"370505","regionName":"","directionCode":"","directionName":"","cityID":"370500","cityName":"","tollCode":"370505040031009","tollName":"丽港国际东门进口","vehiclePlate":"鲁E1215K","vehiclePlateSrc":"鲁EM8878","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"H","vehicleColorName":"蓝色","brandName":"大众","childBrandName":"迈腾","speciesName":"轿车","time":"2018-03-19 10:02:22","speed":"0","url":"http://10.52.86.12:8106/d/1000004$1$0$0/20180319/09/4724-378174-0.jpg?streamID:63@capTime:1521424031","year":"2018","month":"201803","day":"20180319","hour":"10","week":"2","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0596","brandYear":"9007","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"0185","manufacturerName":"一汽大众","headOrTail":"1","vehiclePosition":"1167,337,437,330","tollLongitude":98.3455,"tollLatitude":25.5454,"brandYearName":"2012&2015","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"7","tollTypeName":"","communityID":"0","communityName":"","reliability":"74","dataCompanyCode":"04","face":"","score":0.0,"featureData":"KXl9nbslZxrrFoL9BkBMcoPQGY3WYETa1iL626608wM=","imei":"","imsi":""}];
            routeLayer.showTrack("trackline", dataList, {
                speed: 200,
                symbol: {
                    className: "route-point",
                    imageUrl: "scripts/images/elliptical.png",
                    width: 10,
                    height: 10
                }
            });
        };
        playBtn.onclick = function(){
            routeLayer.start("trackline");
        };
        pauseBtn.onclick = function(){
            routeLayer.pause("trackline");
        };
        continueBtn.onclick = function(){
            routeLayer.continue("trackline");
        };
        clearRouteBtn.onclick = function(){
            routeLayer.clear("trackline");
        };
        showPolylineBtn.onclick = function(){
            polylineLayer.showDataList();
        };
        drawPolylineBtn.onclick = function(){
            drawLayer.draw("draw-line");
        };
        clearPolylineBtn.onclick = function(){
            drawLayer.clear();
        };
        finishPolylineBtn.onclick = function(){
            drawLayer.finish();
        };


    }
);



