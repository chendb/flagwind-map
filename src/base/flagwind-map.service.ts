namespace flagwind {
    export interface IFlagwindMapService {

        //#region 地图
        
        addEventListener(target: any, eventName: string, callback: Function): void;

        centerAt(point: any, map: any): void;

        createPoint(options: any): any;

        createSpatial(wkid: any): any;

        getInfoWindow(map: any): any;

        showInfoWindow(evt: { graphic: any; mapPoint: any }): void;

        // showInfoWindow(map: any): void;

        // hideInfoWindow(map: any): void;

        formPoint(point: any, flagwindMap: FlagwindMap): { longitude: number; latitude: number };

        toPoint(item: any, flagwindMap: FlagwindMap): any;

        createMap(setting: IMapSetting, flagwindMap: FlagwindMap): any;

        createContextMenu(options: { contextMenu: Array<any>; contextMenuClickEvent: any }, flagwindMap: FlagwindMap): void;

        showTitle(graphic: any, flagwindMap: FlagwindMap): void;

        hideTitle(flagwindMap: FlagwindMap): void;

        //#endregion

    }
}