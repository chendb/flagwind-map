namespace flagwind {
    export class EsriVehicleRouteLayer extends EsriRouteLayer {

        private vehicleOptions: any = {
            dataType: "marker",
            symbol: {
                className: "route-point",
                imageUrl: "",
                width: 10,
                height: 10
            }
        };

        public showTrack(trackLineName: string, stopList: Array<any>, options: any): void {
            this.vehicleOptions = {...this.vehicleOptions, ...options};
            let stops = this.getStopsGraphicList(stopList);
            this.solveSegment(trackLineName, stops, this.vehicleOptions);
        }

        public getStopsGraphicList(stopList: Array<any>) {
            let dataList: Array<any> = [];
            stopList.forEach(g => {
                g = this.changeStandardModel(g);
                if (g.id && g.longitude && g.latitude) {
                    dataList.push(new flagwind.EsriMarkerGraphic({
                        id: g.id,
                        dataType: this.vehicleOptions.dataType,
                        symbol: this.vehicleOptions.symbol,
                        point: new flagwind.EsriPoint(g.longitude, g.latitude, this.flagwindMap.spatial),
                        spatial: this.flagwindMap.spatial,
                        attributes: g
                    }));
                }
            });
            return dataList;
        }

        private changeStandardModel(item: any) {
            item.id =  item.id || item.tollCode || item.equipmentCode;
            item.longitude = item.longitude || item.tollLongitude;
            item.latitude = item.latitude || item.tollLatitude;
            return item;
        }

    }
}
