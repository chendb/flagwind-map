namespace flagwind {

    export class EsriHeatmapLayer implements IFlagwindHeatmapLayer {
        private map: any;

        public options: any;
        public heatLayer: any;
        public heatContainer: HTMLElement;

        public constructor(public flagwindMap: FlagwindMap, options: any) {
            this.options = { ...{ id: "heatLayer", config: {} }, ...options };
            this.map = flagwindMap;

            this.heatLayer = this.createHeatLayer();
            this.map.innerMap.addLayer(this.heatLayer);
        }

        public createHeatLayer() {
            let heatObj = document.createElement("div");
            heatObj.setAttribute("id", this.options.id);
            this.map.innerMap.container.appendChild(heatObj);
            this.heatContainer = heatObj;

            return new HeatmapLayer({
                config: {
                    ...{
                        "useLocalMaximum": false,
                        "radius": 40,
                        "gradient": {
                            0.45: "rgb(000,000,255)",
                            0.55: "rgb(000,255,255)",
                            0.65: "rgb(000,255,000)",
                            0.95: "rgb(255,255,000)",
                            1.00: "rgb(255,000,000)"
                        },
                        ...this.options.config
                    }
                },
                map: this.map.innerMap,
                domNodeId: this.options.id,
                opacity: 0.85
            });
        }

        public resize(): void {
            this.heatLayer.resizeHeatmap();
        }

        public clear(): void {
            this.heatLayer.clearData();
        }
        public show(): void {
            this.heatContainer.style.display = "block";
        }
        public hide(): void {
            this.heatContainer.style.display = "none";
        }
        public showDataList(data: Array<any>, changeExtent: boolean): void {
            let dataList = this.onChangeStandardModel(data);
            if (dataList.length === 0) {
                console.log("未传入热点数据");
                return;
            }

            let points = new esri.geometry.Multipoint(this.map.spatial);
            let heatDatas = dataList.map(g => {
                let pt = this.map.onFormPoint(g); // new esri.geometry.Point(g.x, g.y, this.map.spatial);
                points.addPoint(pt);
                return {
                    "attributes": { "count": g.count || 1 },
                    "geometry": {
                        "spatialReference": { "wkid": 4326 },
                        "type": "point",
                        "x": g.x,
                        "y": g.y
                    }
                };
            });
            if (changeExtent) {
                this.map.innerMap.setExtent(points.getExtent(), false);
            }
            this.heatLayer.setData(heatDatas);
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
                        console.warn("无法解析热力图点位对象：" + g);
                    }
                }
            });
            return list;
        }

    }
}
