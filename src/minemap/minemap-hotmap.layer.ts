namespace flagwind {

    export class MinemapHotmapLayer implements IFlagwindHotmapLayer {
        private _echartslayer: any;
        public isShow: boolean = false;
        public options: any;

        public chartOptions: any;

        public get echartslayer(): any {
            if (this._echartslayer == null) {
                this._echartslayer = minemap.Template.create({ map: this.flagwindMap.map, type: "heatmap" });
            }
            return this._echartslayer;
        }

        public constructor(public flagwindMap: FlagwindMap, options: any) {
            this.options = options;
            this.chartOptions = {
                GLMap: {
                    roam: true
                },
                coordinateSystem: "GLMap",
                title: {
                    text: options.title || "热力图展示",
                    subtext: "",
                    left: "center",
                    textStyle: {
                        color: "#fff"
                    }
                },
                tooltip: {
                    trigger: "item"
                },
                visualMap: {
                    show: false,
                    top: "top",
                    min: 0,
                    max: 10,
                    seriesIndex: 0,
                    calculable: true,
                    inRange: {
                        color: ["blue", "blue", "green", "yellow", "red"]
                    }
                },
                series: [{
                    type: "heatmap",
                    data: [],
                    coordinateSystem: "GLMap",
                    pointSize: 8,
                    blurSize: 12
                }]
            };
        }

        public resize(): void {
            this.echartslayer.resize();
        }

        public clear(): void {
            this.chartOptions.series[0].data = [];
            this.echartslayer.chart.setOption(this.chartOptions);
        }
        public show(): void {
            this.isShow = true;
            this.echartslayer._container.style.display = "";
        }
        public hide(): void {
            this.isShow = false;
            this.echartslayer._container.style.display = "none";
        }
        public showDataList(data: Array<any>): void {
            this.chartOptions.series[0].data = this.changeStandardData(data);
            this.echartslayer.chart.setOption(this.chartOptions);
        }
        public changeStandardData(data: Array<any>) {
            let list: Array<Array<any>> = [];
            data.forEach(g => {
                if (g instanceof Array && typeof g[0] === "number" && typeof g[1] === "number") {
                    list.push(g);
                } else if((g.x || g.lon) && (g.y || g.lat) && g.count) {
                    list.push([g.x || g.lon, g.y || g.lat, g.count]);
                }
            });
            return list;
        }

    }
}
