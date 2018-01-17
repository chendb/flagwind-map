requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    shim: {
    },
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
        mapSetting.center = [116.46, 39.92];
        var myMap = new flagwind.MinemapMap(mapSetting, 'map', {
            onLoad: function () {

            }
        });


        var businessService = {
            getDataList: function () {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        tollCode: "1",
                        tollName: "1234567",
                        lon: 116.46,
                        lat: 39.92
                    }, {
                        tollCode: "2",
                        tollName: "2234567",
                        lon: 116.76,
                        lat: 39.92
                    }]);
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



        var tollgateLayer = new flagwind.MinemapPointLayer(businessService, myMap, "tollgateLayer", {
            kind: "marker",
            dataType: "tollgate",
            onLoad: function () {
                alert("测试");
            }
        });


        tollgateLayer.showDataList();

    }
);