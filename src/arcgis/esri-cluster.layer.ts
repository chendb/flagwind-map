/// <reference path="../base/flagwind-business.layer.ts" />;

namespace flagwind {

    export const ESRI_CLUSTER_LAYER_OPTIONS: any = {
        onEvent: (eventName: string, evt: any) => {  // 事件回调
            switch (eventName) {
                case "onMouseOver":
                    if (evt.graphic.getNode()) evt.graphic.getNode().classList.add("marker-scale"); break;
                case "onMouseOut":
                    if (evt.graphic.getNode()) evt.graphic.getNode().classList.remove("marker-scale"); break;
            }
        },
        symbol: {
            width: 32,
            height: 32
        },
        enableCluster: true,
        cluster: {
            font: {
                color: "#FF0000",
                outline: null,
                size: 6
            },
            singleFlareAtCount: 10,      // 当内聚点为10时，显示聚合点
            flareShowMode: "mouse",              // 扩散方式
            preClustered: false,
            ratio: 75,                           // 聚合比率
            areaDisplay: false,                  // 是否显示聚合区域
            levels: {
                xl: {
                    start: 1001,
                    end: Infinity,
                    size: 32,
                    color: { line: [200, 52, 59, 0.8], fill: [250, 65, 74, 0.8] }
                },
                lg: {
                    start: 151,
                    end: 1000,
                    size: 28,
                    color: { line: [41, 163, 41, 0.8], fill: [51, 204, 51, 0.8] }
                },
                md: {
                    start: 20,
                    end: 150,
                    size: 24,
                    color: { line: [82, 163, 204, 0.8], fill: [102, 204, 255, 0.8] }
                },
                sm: {
                    start: 0,
                    end: 19,
                    size: 22,
                    color: { line: [230, 184, 92, 0.8], fill: [255, 204, 102, 0.8] }
                }
            },
            clusteringBegin: () => {
                console.log("clustering begin");
            },
            clusteringComplete: () => {
                console.log("clustering complete");
            }
        },
        layerType: "point"
    };

    /**
     * 点图层
     */
    export class EsriClusterLayer extends FlagwindBusinessLayer {

        private dataManager: DataManager;

        public constructor(flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, { ...ESRI_CLUSTER_LAYER_OPTIONS, ...options });
            if ((<any>this.options).enableCluster) {
                this.dataManager = new DataManager();
            }
        }

        public onCreateGraphicsLayer(args: any) {
            let layer: any;
            if (this.enableCluster) {
                layer = this.createClusterLayer((<any>this.options).cluster);
            } else {
                layer = new esri.layers.GraphicsLayer(args);
            }
            layer.on("mouse-over", (evt: any) =>
                this.dispatchEvent("onMouseOver", evt)
            );
            layer.on("mouse-out", (evt: any) =>
                this.dispatchEvent("onMouseOut", evt)
            );
            layer.on("mouse-up", (evt: any) =>
                this.dispatchEvent("onMouseUp", evt)
            );
            layer.on("mouse-down", (evt: any) =>
                this.dispatchEvent("onMouseDown", evt)
            );
            layer.on("click", (evt: any) => this.dispatchEvent("onClick", evt));
            layer.on("dbl-click", (evt: any) =>
                this.dispatchEvent("onDblClick", evt)
            );
            layer.addToMap = function(map: any) {
                map.addLayer(this);
            };
            layer.removeFromMap = function(map: any) {
                try {
                    if (!this._map) {
                        this._map = map;
                    }
                    map.removeLayer(this);
                } catch (error) {
                    console.warn(error);
                }
            };
            return layer;
        }

        public createClusterLayer(options: any) {
            // init the layer, more options are available and explained in the cluster layer constructor
            let layer = new esri.layers.ClusterLayer({
                id: this.id,
                spatialReference: this.flagwindMap.spatial,
                xPropertyName: "longitude",
                yPropertyName: "latitude",
                subTypeFlareProperty: "kind",
                singleFlareTooltipProperty: "", // 'Name',
                ...options
            });

            // set up a class breaks renderer to render different symbols based on the cluster count. Use the required clusterCount property to break on.
            let defaultSym = new esri.symbol.SimpleMarkerSymbol().setSize(6).setColor(options.font.color).setOutline(options.font.outline);
            let renderer = new esri.renderer.ClassBreaksRenderer(defaultSym, "clusterCount");
            let xlSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.xl.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.xl.color.line), 1), new dojo.Color(options.levels.xl.color.fill));
            let lgSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.lg.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.lg.color.line), 1), new dojo.Color(options.levels.lg.color.fill));
            let mdSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.md.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.md.color.line), 1), new dojo.Color(options.levels.md.color.fill));
            let smSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.sm.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.sm.color.line), 1), new dojo.Color(options.levels.sm.color.fill));
            renderer.addBreak(options.levels.sm.start, options.levels.sm.end, smSymbol);
            renderer.addBreak(options.levels.md.start, options.levels.md.end, mdSymbol);
            renderer.addBreak(options.levels.lg.start, options.levels.lg.end, lgSymbol);
            renderer.addBreak(options.levels.xl.start, options.levels.xl.end, xlSymbol);

            if (options.areaDisplay) {
                // if area display mode is set. Create a renderer to display cluster areas. Use SimpleFillSymbols as the areas are polygons
                let defaultAreaSym = new esri.symbol.SimpleFillSymbol().setStyle(esri.symbol.SimpleFillSymbol.STYLE_SOLID).setColor(new dojo.Color([0, 0, 0, 0.2])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.3]), 1));
                let areaRenderer = new esri.renderer.ClassBreaksRenderer(defaultAreaSym, "clusterCount");
                let xlAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.xl.color.line), 1), new dojo.Color(options.levels.xl.color.fill));
                let lgAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.lg.color.line), 1), new dojo.Color(options.levels.lg.color.fill));
                let mdAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.md.color.line), 1), new dojo.Color(options.levels.md.color.fill));
                let smAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.sm.color.line), 1), new dojo.Color(options.levels.sm.color.fill));

                areaRenderer.addBreak(options.levels.sm.start, options.levels.sm.end, smAreaSymbol);
                areaRenderer.addBreak(options.levels.md.start, options.levels.md.end, mdAreaSymbol);
                areaRenderer.addBreak(options.levels.lg.start, options.levels.lg.end, lgAreaSymbol);
                areaRenderer.addBreak(options.levels.xl.start, options.levels.xl.end, xlAreaSymbol);

                // use the custom overload of setRenderer to include the renderer for areas.
                layer.setRenderer(renderer, areaRenderer);
            } else {
                layer.setRenderer(renderer); // use standard setRenderer.
            }
            // 初始化数据仓库
            layer.allData = [];
            // 创建graphic仓库
            layer._graphics = [];
            return layer;
        }

        public addClusters() {
            const datas = this.graphics.map(g => g.attributes);
            this.layer.clear();
            this.dataManager.setData(datas);

            if ((<any>this.options).cluster.preClustered) {
                this.getPreClusteredGraphics();
            } else {
                let list = this.dataManager.getData();
                this.layer.addData(list);
            }
        }
        
        public getPreClusteredGraphics() {
            let clusterOptions = (<any>this.options);
            let maxSingleFlareCount = clusterOptions.displaySingleFlaresAtCount;

            let clusterRatio = clusterOptions.ratio;
            let clusteredData = this.dataManager.clientSideClustering(clusterRatio, maxSingleFlareCount, clusterOptions.areaDisplay, this.flagwindMap.map);
            this.layer.addPreClusteredData(clusteredData);
        }

        public getImageUrl(item: any): string {
            let imageUrl = this.options.symbol.imageUrl;
            if (typeof imageUrl === "string" && imageUrl) {
                const key = `imageUrl${item.status || ""}${item.selected ? "checked" : ""}`;
                let statusImageUrl: string = this.options[key] || this.options.symbol[key] || imageUrl;
                let suffixIndex = statusImageUrl.lastIndexOf(".");
                const path = statusImageUrl.substring(0, suffixIndex);
                const suffix = statusImageUrl.substring(suffixIndex + 1);
                if (item.selected) {
                    return `${path}_checked.${suffix}`;
                } else {
                    return `${path}.${suffix}`;
                }
            } else {
                let status = item.status;
                if (status === undefined || status === null) {
                    status = "";
                }
                const key =
                    "image" + status + (item.selected ? "checked" : "");
                return (
                    this.options[key] ||
                    this.options.symbol[key] ||
                    (<any>this.options).image
                );
            }
        }

        public get enableCluster(): boolean {
            return ((<any>this.options).enableCluster);
        }

        public get singles() {
            return this.layer.singles || [];
        }

        public get clusters() {
            return this.layer.clusters || [];
        }

        public get graphics(): Array<FlagwindGraphic> {
            if (this.enableCluster) {
                return this.layer._graphics;
            } else {
                return this.layer.graphics;
            }
        }

        public saveGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                this.saveGraphicByModel(dataList[i]);
            }
            if (this.enableCluster) {
                this.addClusters();
            }
        }

        public addGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                this.addGraphicByModel(dataList[i]);
            }
            if (this.enableCluster) {
                this.addClusters();
            }
        }

        /**
         * 根据对象集合修改要素集合（无则忽略）
         * @param dataList 对象集合
         */
        public updateGraphicList(dataList: Array<any>): void {
            for (let i = 0; i < dataList.length; i++) {
                this.updateGraphicByModel(dataList[i]);
            }
            if (this.enableCluster) {
                this.addClusters();
            }
        }
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            const iconUrl = this.getImageUrl(item);
            const pt = this.getPoint(item);
            const width = this.options.symbol.width;
            const height = this.options.symbol.height;
            const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            let attr = { ...item, ...{ __type: this.layerType } };
            const graphic = new esri.Graphic(pt, markerSymbol, attr);
            return graphic;
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            const iconUrl = this.getImageUrl(item);
            const pt = this.getPoint(item);
            const width = this.options.symbol.width;
            const height = this.options.symbol.height;
            const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            const graphic = this.getGraphicById(item.id);
            const originPoint = graphic.geometry;

            graphic.setGeometry(pt);
            graphic.setSymbol(markerSymbol);
            graphic.attributes = {
                ...graphic.attributes,
                ...item,
                ...{ __type: this.layerType }
            };
            graphic.draw(); // 重绘
            if (!MapUtils.isEqualPoint(pt, originPoint)) {
                this.options.onPositionChanged(pt, originPoint, graphic.attributes);
            }
        }

        protected add(graphic: FlagwindGraphic) {
            if (this.enableCluster) {
                this.layer._graphics.push(graphic);
            } else {
                this.layer.add(graphic);
            }
        }

        protected remove(graphic: FlagwindGraphic) {
            if (this.enableCluster) {
                const index = this.layer._graphics.indexOf(graphic);
                if (index >= 0) {
                    this.layer._graphics.splice(index, 1);
                }
            } else {
                this.layer.remove(graphic);
            }
        }

    }
}
