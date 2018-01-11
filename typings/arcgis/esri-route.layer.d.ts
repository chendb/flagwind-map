declare namespace flagwind {
    class EsriRouteLayer extends FlagwindRouteLayer {
        flagwindMap: FlagwindMap;
        layerName: string;
        options: any;
        mapService: IMapService;
        moveLineLayer: FlagwindGroupLayer;
        moveMarkLayer: FlagwindGroupLayer;
        trackLines: Array<TrackLine>;
        constructor(flagwindMap: FlagwindMap, layerName: string, options: any);
        showSegmentLine(segment: TrackSegment): void;
        createMoveMark(trackline: TrackLine, graphic: any, angle: number): any;
        equalGraphic(originGraphic: any, targetGraphic: any): boolean;
        /**
         * 由网络分析服务来求解轨迹并播放
         *
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        /**
         * 由连线求解轨迹
         * @param segment
         */
        solveByJoinPoint(segment: TrackSegment): void;
    }
}
