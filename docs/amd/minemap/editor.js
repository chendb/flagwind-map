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
        mapSetting.mapDomain="113.106.54.47:1180";
        mapSetting.accessToken="658e22d73c60405a8a7c82f69f298c2b";
        mapSetting.center = [116.46, 39.92];
        mapSetting.wkid = 3591
        var myMap = new flagwind.MinemapMap(mapSetting, 'map', {
            onMapLoad: function () {

            }
        });


        var businessService = {
            getDataList: function () {
                return new Promise(function (resolve, reject) {
                    resolve([{
                        tollCode: "1",
                        tollName: "关山大道卡口",
                        lon: 116.461,
                        lat: 39.929
                    }, {
                        tollCode: "2",
                        tollName: "北京路卡口",
                        lon: 116.465,
                        lat: 39.922
                    }, {
                        tollCode: "3",
                        tollName: "天津路卡口",
                        lon: 116.469,
                        lat: 39.922
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



        var tollgateLayer = new flagwind.MinemapPointLayer(myMap, "tollgateLayer", {
            kind: "point",
            dataType: "tollgate",
            symbol:{
                imageUrl:"http://113.106.54.47:1180/minemapapi/demo/images/police.png"
            },
            onLoad: function () {
                alert("测试");
            }
        },businessService);

        var editLayer = new flagwind.MinemapEditLayer(tollgateLayer);


        tollgateLayer.showDataList();



        document.getElementById("btnActive").onclick = function () {
            editLayer.activateEdit("1");
        }

        document.getElementById("btnCancel").onclick = function () {
            editLayer.cancelEdit("1");
        }


    }
);