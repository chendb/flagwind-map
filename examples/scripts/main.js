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
        var mapService = new flagwind.MinemapService();
        var mapSetting = new flagwind.MinemapSetting();
        mapSetting.center = [116.46, 39.92];
        var myMap = new flagwind.FlagwindMap(mapService, mapSetting, 'map', {
            onLoad: function () {

            }
        });

        // var popup = new minemap.Popup({ offset: [0, -30] })
        //     .setText('这里是一个执勤人员');
        var el = document.createElement('div');
        el.id = 'marker11';

        var marker = new minemap.Marker(el, { offset: [-25, -25] })
            .setLngLat([116.46, 39.92])
            .setPopup(popup)
            .addTo(myMap.innerMap);

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