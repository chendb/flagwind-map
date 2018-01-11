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

    }
);