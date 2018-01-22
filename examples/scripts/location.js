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



        var locationLayer = new flagwind.MinemapLocationLayer(myMap, {
            id: "tollgateLocation",
            onMapClick: function (evt) {
                document.getElementById("location").innerHTML = "x:" + evt.point.x + ",y:" + evt.point.y;
            }
        });


    }
);