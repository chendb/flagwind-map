declare namespace flagwind {
    class EsriRouteService {
        flagwindRouteLayer: FlagwindRouteLayer;
        constructor(flagwindRouteLayer: FlagwindRouteLayer);
        showSegmentLine(segment: TrackSegment): void;
        /**
         * 由连线求解轨迹
         * @param segment
         */
        solveByJoinPoint(segment: TrackSegment): void;
        solveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void;
        setSegmentByLine(options: {
            points: Array<any>;
            spatial: any;
        }, segment: TrackSegment): void;
        setSegmentByPolyLine(options: {
            polyline: any;
            length: number;
        }, segment: TrackSegment): void;
        getSpatialReferenceFormNA(): any;
        protected cloneStopGraphic(graphic: any): any;
        protected getLength(tmppolyline: any, units: number): number;
        /**
         * 把一个直线，切成多个点
         * @param start 始点
         * @param end 终点
         * @param n 点数
         */
        static extractPoints(start: {
            x: number;
            y: number;
        }, end: {
            x: number;
            y: number;
        }, n: number): {
            x: number;
            y: number;
        }[];
        /**
         * 线段抽稀操作
         * @param paths  线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        static vacuate(paths: Array<any>, length: number, numsOfKilometer: number): any[];
        /**
         * 线路上移动要素的构建（子）
         */
        static getTrackLineMarkerGraphic(trackline: TrackLine, graphic: any, angle: number): any;
        /**
         * 标准化停靠点
         */
        static getStandardStops(name: string, stops: Array<any>, stopSymbol: any): any[];
    }
}
