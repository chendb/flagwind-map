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
        // esri: "https://js.arcgis.com/3.23/",
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
"esri/symbols/SimpleLineSymbol",
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
"dojo/on", "dojo/dom","dojo/_base/event",
], function (flagwindMap, HeatmapLayer) {

        

        var flagwind = flagwindMap.default;
        var mapSetting = {};
        mapSetting.basemap = "streets";
        mapSetting.baseUrl = "http://27.17.34.22:6080/arcgis/rest/services/DY/MapServer";
        // mapSetting.imageUrl = "http://10.52.86.242:6080/arcgis/rest/services/2013yingxiangditu/MapServer";
        // mapSetting.zhujiImageUrl = "http://10.52.86.242:6080/arcgis/rest/services/2013yingxiangzhuji/MapServer";
        mapSetting.center = [102.71667, 25.04579];
        mapSetting.wkid = 4326;
        mapSetting.zoom = 6;
        mapSetting.autoResize = true;
        mapSetting.graphicBaseSize = 16;
        mapSetting.graphicSizeFactor = 3;
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
                tollName: "1234567",
                tollLongitude: 102.71667,
                tollLatitude: 25.04579
            }, {
                tollCode: "2",
                tollName: "2234567",
                tollLongitude: 102.72667,
                tollLatitude: 25.04579
            }, {
                tollCode: "3",
                tollName: "2234567",
                tollLongitude: 102.71667,
                tollLatitude: 25.06579
            }],
            getDataList: function () {
                return new Promise(function (resolve, reject) {
                    var data = [], badData = [];
                    businessService.tollList.forEach((item, index) => {
                        if (item.tollLongitude && item.tollLatitude) {
                            data.push({
                                tollCode: item.tollCode,
                                tollName: item.tollName,
                                lon: item.tollLongitude,
                                lat: item.tollLatitude
                            });
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
            getLastStatus: function () {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        tollCode: "1",
                        tollName: "1234567",
                        lon: 116.46,
                        lat: 39.92
                    }, {
                        tollCode: "2",
                        tollName: "2234567",
                        lon: 116.46,
                        lat: 39.92
                    }]);
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
                imageUrl: "scripts/images/pin-toll.png"
            },
            onMapLoad: function (eventName, evt) {
                console.log("---onMapLoad");
            },
            onEvent: function (eventName, evt) {
                console.log(eventName);
            }
        });

        var selectbox = new flagwind.EsriSelectBox(myMap);
        selectbox.addLayer(tollgateLayer);

        window.HeatmapLayer = HeatmapLayer;
        var hotmapLayer = new flagwind.EsriHeatmapLayer(myMap, {title: "热点图",});

        var routeLayer = new flagwind.EsriVehicleRouteLayer(myMap, "car", {routeType: "NA", 
        markerUrl: "scripts/images/carTop.png",
        routeUrl: "http://27.17.34.22:6080/arcgis/rest/services/Features/NAServer/Route", speed: 100, trackLevel: 2});



        var addBtn = document.querySelector(".tollgate");
        var clearBtn = document.querySelector(".clear");
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

        addBtn.onclick = function(){
            tollgateLayer.showDataList();
        };
        clearBtn.onclick = function(){
            tollgateLayer.layer.clear();
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
                tollLongitude: 102.71667,
                tollLatitude: 25.04579
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
            var list = [{ 'longitude': 100.79603, 'latitude': 22.003445, 'count': 2 }, { 'longitude': 121.09488, 'latitude': 37.55033, 'count': 5 }];
            hotmapLayer.showDataList(list);
        };
        closeHeatMapBtn.onclick = function(){
            hotmapLayer.clear();
        };
        showRouteBtn.onclick = function(){
            var dataList = [{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"530602000164201803160001438603","regionID":"530602","regionName":"","directionCode":"","directionName":"","cityID":"530600","cityName":"","tollCode":"530602000164","tollName":"昭阳区蒙泉路与望海路交叉口东向西2","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:01:43","speed":"23","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":103.4125,"tollLatitude":27.1993,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"2","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"04","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"530502000107201803160015155075","regionID":"530502","regionName":"","directionCode":"","directionName":"","cityID":"530500","cityName":"","tollCode":"530502000107","tollName":"龙泉路与同仁街交叉口东侧","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:15:15","speed":"81","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":99.16122,"tollLatitude":25.109047,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"2","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"04","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"532822000040201803160025511513","regionID":"532822","regionName":"","directionCode":"","directionName":"","cityID":"532800","cityName":"","tollCode":"532822000040","tollName":"勐海至勐满进城方向摩托车","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:25:51","speed":"69","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":100.132385,"tollLatitude":22.170467,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"04","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"530502000095201803160031161273","regionID":"530502","regionName":"","directionCode":"","directionName":"","cityID":"530500","cityName":"","tollCode":"530502000095","tollName":"保岫路与太保路交叉口南侧","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:31:16","speed":"38","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":99.159424,"tollLatitude":25.11465,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"2","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"04","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370606000054201803160031307815","regionID":"370606","regionName":"","directionCode":"","directionName":"","cityID":"370600","cityName":"","tollCode":"370606000054","tollName":"206国道平畅河卡口东","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:31:30","speed":"51","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":121.01758,"tollLatitude":37.69963,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"01","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370606000217201803160033475292","regionID":"370606","regionName":"","directionCode":"","directionName":"","cityID":"370600","cityName":"","tollCode":"370606000217","tollName":"河滨路夹河桥公园卡口南","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:33:47","speed":"20","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":121.28391,"tollLatitude":37.5562,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"01","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370606000203201803160050438872","regionID":"370606","regionName":"","directionCode":"","directionName":"","cityID":"370600","cityName":"","tollCode":"370606000203","tollName":"中古路郭家卡口西","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 00:50:43","speed":"60","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"00","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":121.09488,"tollLatitude":37.55033,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"01","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"370606000075201803160104523537","regionID":"370606","regionName":"","directionCode":"","directionName":"","cityID":"370600","cityName":"","tollCode":"370606000075","tollName":"302省道石岚卡口西","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 01:04:52","speed":"27","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"01","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":121.08445,"tollLatitude":37.58097,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"01","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"530621000013201803160110592386","regionID":"530621","regionName":"","directionCode":"","directionName":"","cityID":"530600","cityName":"","tollCode":"530621000013","tollName":"鲁甸县三角花园（柳树闸）进城1","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 01:10:59","speed":"119","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"01","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":103.575676,"tollLatitude":27.212095,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"1","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"07","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"},{"areaID":null,"equipmentCode":"","laneCode":null,"roadDirectionCode":null,"inOutDirectionCode":null,"segmentDirectionCode":null,"roadCode":null,"roadSegmentCode":null,"chargeStationCode":null,"serviceDistrictCode":null,"tollPointCode":null,"brandReliability":null,"plateReliability":null,"dangerousVehicle":null,"rowKey":"530502000094201803160134349295","regionID":"530502","regionName":"","directionCode":"","directionName":"","cityID":"530500","cityName":"","tollCode":"530502000094","tollName":"保岫路与太保路交叉口西侧","vehiclePlate":"鲁EAY765","vehiclePlateSrc":"鲁EAY765","vehicleTypeCode":"02","vehicleTypeName":"小型汽车","vehicleColor":"A","vehicleColorName":"白色","brandName":"大众","childBrandName":"桑塔纳","speciesName":"轿车","time":"2018-03-16 01:34:34","speed":"47","url":"http://27.17.34.22:8081/pic/鲁EAY765_02.jpg","year":"2018","month":"201803","day":"20180316","hour":"01","week":"6","dataClassify":"1","plateColor":"蓝牌","brand":"0034","childBrand":"0361","brandYear":"4075","model":"K33","modelName":"小型轿车","species":"02","manufacturer":"216","manufacturerName":"上汽大众","headOrTail":"1","vehiclePosition":"218-278-690-609","tollLongitude":113.95923,"tollLatitude":2.5114849,"brandYearName":"2013","firstTimeInCity":0,"firstTimeInCounty":0,"firstTimeInCommunity":0,"tollTypeCode":"2","tollTypeName":"","communityID":"0","communityName":"","reliability":"71","dataCompanyCode":"04","face":"","score":0.0,"featureData":"KQhTIY0MdB7t7XHLsZeDCIUhiG6oAyuSgdJekx69DM4=","imei":"","imsi":"","identificationType":"1"}];
            routeLayer.showTrack("trackline", dataList, {speed: 200});
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

    }
);



