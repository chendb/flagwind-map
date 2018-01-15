namespace flagwind {
    export interface IFlagwindRouteService {

        // #region 轨迹

        setSegmentByLine(flagwindRouteLayer: FlagwindRouteLayer, options: { points: Array<any>; spatial: any }, segment: TrackSegment): void;

        setSegmentByPolyLine(flagwindRouteLayer: FlagwindRouteLayer, options: { polyline: any; length: number }, segment: TrackSegment): void;

        solveByService(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;

        solveByJoinPoint(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): void;

        getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): any;

        getStandardStops(name: string, stops: Array<any>): Array<any>;

        showSegmentLine(flagwindRouteLayer: FlagwindRouteLayer, segment: TrackSegment): any;

        //#endregion
    }
}
