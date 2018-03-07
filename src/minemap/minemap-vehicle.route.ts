namespace flagwind {
    export class MinemapVehicleRouteLayer extends MinemapRouteLayer {

        public showTrack(trackLineName: string, stopList: Array<any>, options: any): void {
            let stops = this.getStopsGraphicList(stopList);
            this.solveSegment(trackLineName, stops, options);
        }

        public getStopsGraphicList(stopList: Array<any>) {
            let dataList: Array<any> = [];
            stopList.forEach(g => {
                if ((g.tollCode || g.equipmentCode) && g.tollLatitude && g.tollLongitude) {
                    dataList.push(new flagwind.MinemapMarkerGraphic({
                        id: g.tollCode || g.equipmentCode,
                        symbol: this.options.symbol,
                        point: new flagwind.MinemapPoint(g.tollLongitude, g.tollLatitude),
                        attributes: g
                    }));
                }
            });
            return dataList;
        }

    }
}
