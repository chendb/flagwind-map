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
        // var FlagwindMapFactory = (function () {
        //     function FlagwindMapFactory() {
        //         return this;
        //     }
        //     FlagwindMapFactory.prototype.createMapSetting = function () {
        //        return new flagwind.MinemapSetting(); 
        //     };

        //     FlagwindMapFactory.prototype.createMap = function (mapSetting) {
        //         return new flagwind.MinemapMap(); 
        //      };
        //     return Animation;
        // }());
        var flagwind = flagwindMap.default;
        var mapSetting = new flagwind.MinemapSetting();
        mapSetting.center = [116.46, 39.92];
        var myMap = new flagwind.MinemapMap(mapSetting, 'map', {
            onLoad: function () {

            }
        });
        // var el = document.getElementById("infoWindow");
        // var html = "<h4>HTML信息窗口</h4>";
        // // var infoWindowOption = {type: "dom", content:el, point:{x:116.46, y: 39.92}, closeOnClick: false};
        // var infoWindowOption = {type: "html", content:html, point:{x:116.46, y: 39.92}, closeButton: false, offset: [0, -35]};
        // myMap.openInfoWindow(infoWindowOption);

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
            onLoad: function () {
                alert("测试");
            }
        });

        tollgateLayer.showDataList();


        // var popup = new minemap.Popup({ offset: [0, -30] })
        //     .setText('这里是一个执勤人员');
        // var el = document.createElement('div');
        // el.id = 'marker11';

        // var marker = new minemap.Marker(el, { offset: [-25, -25] })
        //     .setLngLat([116.46, 39.92])
        //     .setPopup(popup)
        //     .addTo(myMap.innerMap);

        // var layer = new flagwind.MinemapMarkerLayer({
        //     id: "tollgate"
        // });
        // var marker = new flagwind.MinemapMarker({
        //     id: "1",
        //     point: { x: 116.46, y: 39.92 },
        //     symbol:{
        //         className:"mymarker"
        //     }
        // });
        // layer.add(marker);
        // layer.addToMap(myMap.innerMap)
    }
);