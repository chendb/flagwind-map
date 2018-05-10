namespace flagwind {
    export class MinemapVehicleRouteLayer extends MinemapRouteLayer {

        public showTrack(trackLineName: string, stopList: Array<any>, options: any): void {
            let trackOptions = { ...{ solveMode: "Line" }, ...options };
            let stops = this.getStopsGraphicList(stopList);
            if (trackOptions.solveMode === "Segment") {
                this.solveSegment(trackLineName, stops, trackOptions);
            } else {
                this.solveLine(trackLineName, stops, trackOptions);
            }
        }

        public getStopsGraphicList(stopList: Array<any>) {
            let dataList: Array<any> = [];
            stopList.forEach(g => {
                g = this.changeStandardModel(g);
                if (this.validGeometryModel(g)) {
                    dataList.push(new flagwind.MinemapMarkerGraphic({
                        id: g.id,
                        symbol: this.options.stopSymbol,
                        point: this.toStopPoint(g),
                        attributes: g
                    }));
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

        // private validGeometryModel(item: any) {
        //     return MapUtils.validGeometryModel(item);
        // }

        // private changeStandardModel(item: any): void {
        //     if (this.options.changeStandardModel) {
        //         return this.options.changeStandardModel(item);
        //     } else {
        //         item.id = item.id || item.tollCode || item.equipmentCode;
        //         item.longitude = item.longitude || item.tollLongitude;
        //         item.latitude = item.latitude || item.tollLatitude;
        //         return item;
        //     }
        // }

    }
}
