namespace flagwind {

    /**
     * 车辆路由服务(该类即将废弃)
     */
    export class EsriVehicleRouteLayer extends EsriRouteLayer {

        public showTrack(trackLineName: string, stopList: Array<any>, options: any): void {
            let trackOptions = { ...{ solveMode: "Line" }, ...options };
            let stops = this.getStopsGraphicList(stopList);
            if (trackOptions.solveMode === "Segment") {
                stops.forEach((g, i) => {
                    if (i < stops.length - 1) this.solveSegment(trackLineName, [stops[i], stops[i + 1]], trackOptions);
                });
                // this.solveSegment(trackLineName, stops, trackOptions);
            } else {
                this.solveLine(trackLineName, stops, trackOptions);
            }
        }

        public getStopsGraphicList(stopList: Array<any>) {
            let dataList: Array<any> = [];
            stopList.forEach(g => {
                g = this.changeStandardModel(g);

                if (this.validGeometryModel(g)) {
                    dataList.push(new esri.Graphic(this.toStopPoint(g),
                        this.options.stopSymbol || new esri.symbol.PictureMarkerSymbol(this.options.markerUrl, this.options.markerWidth, this.options.markerHeigth),
                        { type: "stop", line: name || this.options.name, attributes: g})
                    );
                }
            });
            return dataList;
        }

        private toStopPoint(item: any): any {
            let lnglat = { "lat": item.latitude, "lon": item.longitude };
            if (!this.validGeometryModel(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }

            // 以x,y属性创建点
            return this.flagwindMap.onToPoint(item);
        }

    }
}
