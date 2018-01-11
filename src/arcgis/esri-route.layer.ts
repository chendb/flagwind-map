/// <reference path="../base/flagwind-route.layer.ts" />
namespace flagwind {
    
    export class EsriRouteLayer extends FlagwindRouteLayer {

        public mapService: IMapService;

        public moveLineLayer: FlagwindGroupLayer;
        public moveMarkLayer: FlagwindGroupLayer;
        // public moveMarkLayer: { graphics: any; remove: (arg0: any) => void; _map: null; clear: () => void; id: any; add: (arg0: any) => void; show: () => void; hide: () => void; };

        public trackLines: Array<TrackLine> = [];

        public constructor(public flagwindMap: FlagwindMap, public layerName: string, public options: any) {
            super(flagwindMap, layerName, options);
        }

        public showSegmentLine(segment: TrackSegment) {
            let playedLineSymbol = new esri.symbol.CartographicLineSymbol(
                esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);

            segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
                type: "segment",
                index: segment.index,
                line: segment.name
            });
            this.moveLineLayer.addGraphice(segment.name, [segment.lineGraphic]);
        }

        public createMoveMark(trackline: TrackLine, graphic: any, angle: number) {
            return this.mapService.getTrackLineMarkerGraphic(trackline, graphic, angle);
        }

        public equalGraphic(originGraphic: any, targetGraphic: any): boolean {
            return MapUtils.isEqualPoint(originGraphic.geometry, targetGraphic.geometry);
        }

        /**
         * 由网络分析服务来求解轨迹并播放
         * 
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        public solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>) {
            this.mapService.solveByService(this, segment, start, end, waypoints);
        }

        /**
         * 由连线求解轨迹
         * @param segment
         */
        public solveByJoinPoint(segment: TrackSegment) {
            this.mapService.solveByJoinPoint(this, segment);
        }

    }
}
