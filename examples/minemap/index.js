requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim: {},
    paths: {
        esri: "http://js.arcgis.com/3.21/esri",
        dojo: "http://js.arcgis.com/3.21/dojo",
        dojox: "http://js.arcgis.com/3.21/dojox",
        dijit: "http://js.arcgis.com/3.21/dijit",
        flagwindMap: "flagwind-map/flagwind-map"
    }
});

// Start the main app logic.
requirejs(['flagwindMap'],
    function (flagwindMap) {

        var flagwind = flagwindMap.default;
        var mapSetting = new flagwind.MinemapSetting();
        mapSetting.mapDomain="113.106.54.47:1180";
        mapSetting.accessToken="658e22d73c60405a8a7c82f69f298c2b";
        mapSetting.center = [116.46, 39.92];
        mapSetting.wkid = 3591
        
        var myMap = new flagwind.MinemapMap(mapSetting, 'map', {
            onMapLoad: function () {}
        });

        var businessService = {
            tollList: [{
                tollCode: "1",
                tollName: "1234567",
                tollLongitude: 116.462,
                tollLatitude: 39.92
            }, {
                tollCode: "2",
                tollName: "2234567",
                tollLongitude: 116.464,
                tollLatitude: 39.92
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



        var tollgateLayer = new flagwind.MinemapPointLayer( myMap, "tollgateLayer", {
            kind: "marker",
            showInfoWindow: false,
            symbol: {
                imageUrl: "//minedata.cn/minemapapi/demo/images/police.png"
            },
            onLoad: function () {
                alert("测试");
            }
        },businessService);

        tollgateLayer.showDataList();

    }
);
