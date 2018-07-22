namespace flagwind {

    export class EsriHeatmapLayer implements IFlagwindHeatmapLayer {
        private map: any;
        public heatLayer: any;

        public isShow: boolean = true;
        public id: string;
        public options: any;
        public heatmapRenderer: any;

        public constructor(public flagwindMap: FlagwindMap, id: string, options: any) {
            this.id = id || "heatmapLayer";
            this.options = options;
            this.map = flagwindMap;

            this.heatLayer = this.createHeatLayer();
            this.appendTo(this.map);
        }

        public createHeatLayer() {
            let featureCollection: any = {
                "featureSet": null,
                "layerDefinition": {
                    "geometryType": "esriGeometryPoint",
                    "fields": [{
                        "name": "count",
                        "type": "esriFieldTypeDouble",
                        "alias": "count"
                    }]
                }
            };
            let options = {
                id: this.id,
                opacity: 0.7
            };
            let layer = new esri.layers.FeatureLayer(featureCollection, options);

            this.heatmapRenderer = new esri.renderer.HeatmapRenderer({
                ...{
                    field: "count",
                    blurRadius: 12,
                    // maxPixelIntensity: 100,
                    // minPixelIntensity: 0,
                    colorStops: [
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
            let dataList = this.onChangeStandardModel(data);
            if (dataList.length === 0) {
                console.log("未传入热点数据");
                return;
            }

            this.setMaxPixelIntensity(dataList.reduce((max, item) => max = Math.max(item.count, max), 1));

            dataList.forEach(g => {
                let pt = this.map.getPoint(g); // new esri.geometry.Point(g.x, g.y, this.map.spatial);
                let symbol = new esri.symbol.SimpleMarkerSymbol();
                let graphic = new esri.Graphic(pt, symbol, g);
                this.heatLayer.add(graphic);
            });
        }
        public onChangeStandardModel(data: Array<any>) {
            let list: Array<any> = [];
            data.forEach(g => {
                if (Type.isArray(g)) {
                    list.push({ "x": g[0], "y": g[1], "count": g[2] });
                } else {
                    if ((g.x || g.longitude) && (g.y || g.latitude) < 90 && (g.y || g.latitude) > -90 && g.count) {
                        list.push({ "x": g.x || g.longitude, "y": g.y || g.latitude, "count": g.count });
                    } else {
                        console.warn("无法解析热力图点位对象：", g);
                    }
                }
            });
            return list;
        }

    }
}
