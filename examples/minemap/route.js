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
            onLoad: function () {

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
                        lon: 116.465,
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

        var routeLayer = new flagwind.MinemapRouteLayer(myMap, "car", {
            routeType: "NA"
        });

        var start = new flagwind.MinemapMarkerGraphic({
            id: "1",
            symbol: {
                imageUrl: "http://113.106.54.47:1180/minemapapi/demo/images/police.png",
                className: "graphic-tollgate"
            },
            point: new flagwind.MinemapPoint(116.461, 39.929),
            attributes: {}
        });
        var middle = new flagwind.MinemapMarkerGraphic({
            id: "2",
            symbol: {
                imageUrl: "http://113.106.54.47:1180/minemapapi/demo/images/police.png",
                className: "graphic-tollgate"
            },
            point: new flagwind.MinemapPoint(116.452, 39.919),
            attributes: {}
        });

        var end = new flagwind.MinemapMarkerGraphic({
            id: "3",
            symbol: {
                imageUrl: "http://113.106.54.47:1180/minemapapi/demo/images/police.png",
                className: "graphic-tollgate"
            },
            point: new flagwind.MinemapPoint(116.466, 39.9298),
            attributes: {}
        });

        document.getElementById("btnShow").onclick = function () {
            routeLayer.solveSegment("trackline", [start, middle, end], {});
        }

        document.getElementById("btnHide").onclick = function () {
            routeLayer.hide();
        }

        document.getElementById("btnClear").onclick = function () {
            routeLayer.clear("trackline");
        }

        document.getElementById("btnPlay").onclick = function () {
            routeLayer.start("trackline");
        }
        document.getElementById("btnPause").onclick = function () {
            routeLayer.pause("trackline");
        }
        document.getElementById("btnContinue").onclick = function () {
            routeLayer.continue("trackline");
        }
    }
);