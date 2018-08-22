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



        var tollgateLayer = new flagwind.MinemapPointLayer(myMap, "tollgateLayer", {
            kind: "point",
            showTooltipOnHover: true,
            dataType: "tollgate",
            symbol:{
                imageUrl:"http://113.106.54.47:1180/minemapapi/demo/images/police.png"
            },
            onMapLoad: function () {
                alert("测试");
            }
        },businessService);


        tollgateLayer.showDataList();

        var graphic = null;

        document.getElementById("btnShow").onclick = function () {
            tollgateLayer.show();
        }

        document.getElementById("btnHide").onclick = function () {
            tollgateLayer.hide();
        }

        document.getElementById("btnClear").onclick = function () {
            tollgateLayer.clear();
        }

        document.getElementById("btnGetGraphic").onclick = function () {
            graphic = tollgateLayer.getGraphicById("1");
            if (tollgateLayer.graphics.length == 0) {
                alert("图层无数据，请重新加载数据");
                return;
            }
            if (graphic == null) {
                alert("获取失败");
            } else {
                alert("获取到要素" + graphic.attributes.tollName);
            }
        }

        document.getElementById("btnShowGraphic").onclick = function () {
            if (graphic == null) {
                alert("请先获取要素数据");
                return;
            }
            graphic.show();
        }

        document.getElementById("btnHideGraphic").onclick = function () {
            if (graphic == null) {
                alert("请先获取要素数据");
                return;
            }
            graphic.hide();
        }

    }
);