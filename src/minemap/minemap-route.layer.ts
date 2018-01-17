namespace flagwind {
    export class MinemapRouteLayer extends FlagwindRouteLayer {

        public onCreateGroupLayer(id: string): FlagwindGroupLayer {
            return new MinemapGroupLayer(id);
        }
        public onEqualGraphic(originGraphic: any, targetGraphic: any): boolean {
            throw new Error("Method not implemented.");
        }
        public onShowSegmentLine(segment: TrackSegment): void {
            throw new Error("Method not implemented.");
        }
        public onGetStandardStops(name: String, stops: Array<any>): Array<any> {
            throw new Error("Method not implemented.");
        }
        public onSolveByService(segment: TrackSegment, start: any, end: any, waypoints: Array<any>): void {
            throw new Error("Method not implemented.");
        }
        public onSolveByJoinPoint(segment: TrackSegment): void {
            throw new Error("Method not implemented.");
        }
        public onAddEventListener(moveMarkLayer: FlagwindGroupLayer, eventName: string, callBack: Function): void {
            throw new Error("Method not implemented.");
        }
        public onCreateMoveMark(trackline: TrackLine, graphic: any, angle: number) {
            throw new Error("Method not implemented.");
        }

    }
}
