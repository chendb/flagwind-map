namespace flagwind {
    export class EsriVehicleRouteLayer extends EsriRouteLayer {

        public showTrack(trackLineName: string, stopList: Array<any>, options: any): void {
            let stops = this.getStopsGraphicList(stopList);
            this.solveSegment(trackLineName, stops, options);
        }

        public getStopsGraphicList(stopList: Array<any>) {
            let dataList: Array<any> = [];
            stopList.forEach(g => {
                if ((g.tollCode || g.equipmentCode) && g.tollLatitude && g.tollLongitude) {
                    dataList.push(new flagwind.EsriMarkerGraphic({
                        id: g.tollCode || g.equipmentCode,
                        symbol: this.options.symbol,
                        point: new flagwind.EsriPoint(g.tollLongitude, g.tollLatitude, this.flagwindMap.spatial),
                        spatial: this.flagwindMap.spatial,
                        attributes: g
                    }));
                }
            });
            return dataList;
        }

    }
}
