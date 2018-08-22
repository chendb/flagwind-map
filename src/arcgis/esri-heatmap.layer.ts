namespace flagwind {
    export class EsriHeatmapLayer implements IFlagwindHeatmapLayer {
        private dataMap: Map<String, HeatmapPoint>;

        private map: any;
        public heatLayer: any;

        public isShow: boolean = true;
        public id: string;
        public options: any;
        public heatmapRenderer: any;

        public constructor(
            public flagwindMap: FlagwindMap,
            id: string,
            options: any
        ) {
            this.id = id || "heatmapLayer";
            this.options = { ...HEATMAP_LAYER_OPTIONS, ...options };
            this.map = flagwindMap.map;
            this.dataMap = new Map<String, HeatmapPoint>();
            this.heatLayer = this.createHeatLayer();
            this.appendTo(this.map);
        }

        public createHeatLayer() {
            let featureCollection: any = {
                featureSet: null,
                layerDefinition: {
                    geometryType: "esriGeometryPoint",
                    fields: [
                        {
                            name: "count",
                            type: "esriFieldTypeDouble",
                            alias: "count"
                        }
                    ]
                }
            };
            let options = { id: this.id, opacity: 0.7 };
            
            let layer = new esri.layers.FeatureLayer(
                featureCollection,
                options
            );

            this.heatmapRenderer = new esri.renderer.HeatmapRenderer({
                ...{
                    field: "count",
                    blurRadius: this.options.blurRadius || 12,
                    colorStops: this.options.colorStops || [
                        { ratio: 0, color: "rgb(255, 219, 0, 0)" },
                        { ratio: 0.6, color: "rgb(250, 146, 0)" },
                        { ratio: 0.85, color: "rgb(250, 73, 0)" },
                        { ratio: 0.95, color: "rgba(250, 0, 0)" }
                    ]
                },
                ...this.options
            });

            layer.setRenderer(this.heatmapRenderer);
            return layer;
        }

        public appendTo(map: any): void {
            map.addLayer(this.heatLayer);
        }

        public removeLayer(map: any): void {
            map.removeLayer(this.heatLayer);
        }

        public resize(): void {
            this.map.innerMap.resize();
        }
        public clear(): void {
            this.dataMap.clear();
            this.heatLayer.clear();
        }
        public show(): void {
            this.isShow = true;
            this.heatLayer.show();
        }
        public hide(): void {
            this.isShow = false;
            this.heatLayer.hide();
        }
        public setMaxPixelIntensity(value: number): void {
            this.heatmapRenderer.setMaxPixelIntensity(value);
        }
        public showDataList(data: Array<any>): void {
            let dataList = <Array<any>>this.onChangeStandardModel(data);

            if (dataList.length === 0) {
                console.log("未传入热点数据");
                return;
            }

            this.setMaxPixelIntensity(
                dataList.reduce((max, item) => (max = Math.max(item.count, max)),1)
            );

            dataList.forEach(g => {
                let pt = this.flagwindMap.getPoint(g); // new esri.geometry.Point(g.x, g.y, this.map.spatial);
                let symbol = new esri.symbol.SimpleMarkerSymbol();
                let graphic = new esri.Graphic(pt, symbol, g);
                this.heatLayer.add(graphic);
            });
        }

        public onChangeStandardModel(data: Array<any>): Array<any> {
            data.forEach(g => {
                let node = this.options.changeStandardModel(g);
                if (node) {
                    let key = node.longitude + ":" + node.latitude;
                    let value = this.dataMap.get(key);
                    if (value !== undefined) {
                        value.members.push(g);
                        value.count = value.count + (node.count || 1);
                    } else {
                        value = {
                            longitude: node.longitude,
                            latitude: node.latitude,
                            members: [g],
                            count: (node.count || 1)
                        };
                        this.dataMap.set(key, value);
                    }
                }
            });
            return this.dataMap.values();
        }
    }
}
