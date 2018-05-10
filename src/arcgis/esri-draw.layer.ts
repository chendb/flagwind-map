/// <reference path="../base/flagwind-business.layer.ts" />import { resolve } from "url";

namespace flagwind {
    /**
     * 绘制图层
     */
    export class EsriDrawLayer {
        private symbolSetting: any;
        public flagwindMap: FlagwindMap;
        public draw: any;
        public mode: any;

        public options: any = {
            drawTime: 75,
            showTooltips: true,
            tolerance: 8,
            tooltipOffset: 15,
            onEvent: function (eventName: string, evt: any) {
                // console.log(eventName);
            }
        };

        public constructor(flagwindMap: FlagwindMap, options?: any) {
            this.flagwindMap = flagwindMap;
            this.options = { ...this.options, ...options };

            this.draw = new esri.toolbars.Draw(flagwindMap.map, this.options);
            this.draw.on("draw-complete", (evt: any) => {
                this.onDrawComplete(evt);
            });
        }

        public activate(mode: string, options?: any) {
            if(this.draw && options) {
                this.setSymbol(mode, options);
            }
            if (this.draw && mode) {
                let tool = mode.toUpperCase().replace(/ /g, "_");
                this.flagwindMap.map.disableMapNavigation();
                this.draw.activate(esri.toolbars.Draw[tool]);
            }
        }

        public clear(): void {
            if (this.draw) {
                this.draw.deactivate();
                this.flagwindMap.map.enableMapNavigation();
            }
        }

        public finish() {
            this.draw.finishDrawing();
        }

        private setSymbol(mode: string, options: any) {
            this.symbolSetting = options;
            switch (mode) {
                case "POLYLINE": this.draw.setLineSymbol(this.lineSymbol); break;
                case "POLYGON": this.draw.setFillSymbol(this.fillSymbol); break;
                case "FREEHAND_POLYGON": this.draw.setFillSymbol(this.fillSymbol); break;
            }
        }

        private onDrawComplete(evt: any) {
            this.clear();
            this.options.onEvent("draw-complete", evt.geometry);
        }

        private get lineSymbol() {
            let color = this.symbolSetting.color || [255, 0, 0];
            let width = this.symbolSetting.width || 4;
            let lineSymbol = new esri.symbol.CartographicLineSymbol(
                this.symbolSetting.style === "dash" ? esri.symbol.CartographicLineSymbol.STYLE_DASH : esri.symbol.CartographicLineSymbol.STYLE_SOLID,
                new esri.Color(color), width,
                esri.symbol.CartographicLineSymbol.CAP_ROUND,
                esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
            return lineSymbol;
        }

        private get fillSymbol() {
            let color = this.symbolSetting.color || [255, 49, 0, 0.45];
            let width = this.symbolSetting.width || 3;
            let polygonSymbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    this.symbolSetting.outlineStyle === "dash" ? esri.symbol.SimpleLineSymbol.STYLE_DASH : esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new esri.Color(this.symbolSetting.outlineColor || [255, 0, 0]),
                    width
                ),
                new esri.Color(color)
            );
            return polygonSymbol;
        }

        // public flagwindMap: FlagwindMap;
        // public options: any = {
        //     id: "draw-layer",
        //     autoCenter: true,
        //     routeUrl: "http://27.17.34.22:6080/arcgis/rest/services/Features/NAServer/Route",
        //     onEvent: function (eventName: string, evt?: any) {
        //         // console.log(eventName);
        //     }
        // };

        // public drawLayer: any;
        // public lineLayer: any;
        // public stopsLayer: any;
        // public barriersLayer: any;

        // public routeSymbol: any;
        // public stopSymbol: any;
        // public barrierSymbol: any;

        // public routes: Array<any> = [];     // 路径数据
        // // public routeName: string = "draw-line";
        // public routeTask: any;
        // public routeParams: any;
        // public MAPONCLICH_ADDSTOPS: any;
        // // public MAPONDBLCLICH_ADDSTOPS: any;
        // public MAPONCLICH_ADDBARRIERS: any;

        // public constructor(flagwindMap: FlagwindMap, options?: any) {
        //     this.flagwindMap = flagwindMap;
        //     this.options = { ...this.options, ...options };

        //     this.createDrawLayer();
        //     this.createDrawSymbol();
        // }

        // public draw() {
        //     // this.routeName = routeName;
        //     this.createDrawRoute();
        //     this.addStop();
        // }

        // public clear(): void {
        //     this.clearBarriers();
        //     this.clearRoutes();
        //     this.clearStops();
        //     this.addStop();
        // }

        // public finish() {
        //     return new Promise((rsolve, reject) => {
        //         let polyline: any;
        //         if (this.routes.length > 0) {
        //             polyline = this.routes[0].geometry;
        //         }
        //         this.clearDrawLayer();
        //         this.addDrawGraphic(polyline);
        //         rsolve(JSON.stringify(polyline.paths[0]));
        //         this.options.onEvent("finish", polyline);
        //         this.clear();
        //         this.removeEventHandlers();

        //         // let polyline: Array<any> = [];
        //         // if (this.routes.length > 0) {
        //         //     this.clearDrawLayer();
        //         //     this.routes.forEach(g => {
        //         //         this.addDrawGraphic(g.geometry);
        //         //         polyline.push(g.geometry);
        //         //     });
        //         // }
        //         // rsolve(polyline);
        //         // this.options.onEvent("finish", polyline);
        //         // this.clear();
        //         // this.removeEventHandlers();
        //     });
        // }

        // public clearDrawLayer(): void {
        //     this.drawLayer.clear();
        // }

        // private addStop(): void {
        //     let me = this;
        //     this.removeEventHandlers();
        //     this.MAPONCLICH_ADDSTOPS = this.flagwindMap.map.on("click", function (evt: any) {
        //         let g = new esri.Graphic(evt.mapPoint, me.stopSymbol, { RouteName: "draw-route-line" });
        //         me.stopsLayer.add(g);
        //         me.routeParams.stops.features.push(g);
        //         if (me.options.autoCenter) {
        //             me.flagwindMap.map.centerAt(evt.mapPoint).then(function () {
        //                 // console.log("centerAt:" + x + "," + y);
        //             });
        //         }
        //         // 增加完点后自动求解
        //         if (me.routeParams.stops.features.length > 1) {
        //             me.routeTask.solve(me.routeParams);
        //         }
        //     });
        //     // this.MAPONDBLCLICH_ADDSTOPS = this.flagwindMap.map.on("dbl-click", function (evt: any) {
        //     //     me.clearStops();
        //     //     me.routeParams.stops.features = [];
        //     // });
        // }

        // private createDrawLayer(): void {
        //     this.drawLayer = new esri.layers.GraphicsLayer({ id: this.options.id });
        //     this.lineLayer = new esri.layers.GraphicsLayer({ id: "draw-lineLayer" });
        //     this.stopsLayer = new esri.layers.GraphicsLayer({ id: "draw-stopsLayer" });
        //     this.barriersLayer = new esri.layers.GraphicsLayer({ id: "draw-barriersLayer" });
        //     this.flagwindMap.map.addLayer(this.drawLayer);
        //     this.flagwindMap.map.addLayer(this.lineLayer);
        //     this.flagwindMap.map.addLayer(this.stopsLayer);
        //     this.flagwindMap.map.addLayer(this.barriersLayer);
        // }

        // private createDrawSymbol(): void {
        //     this.routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(new esri.Color([0, 0, 255, 0.5])).setWidth(5);
        //     this.stopSymbol = new esri.symbol.SimpleMarkerSymbol().setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS).setSize(15);
        //     this.stopSymbol.outline.setWidth(3);
        //     this.barrierSymbol = new esri.symbol.SimpleMarkerSymbol().setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_X).setSize(10);
        //     this.barrierSymbol.outline.setWidth(3).setColor(new esri.Color([255, 0, 0]));
        // }

        // private createDrawRoute(): void {
        //     this.routeTask = new esri.tasks.RouteTask(this.options.routeUrl);
        //     this.routeParams = new esri.tasks.RouteParameters();
        //     this.routeParams.stops = new esri.tasks.FeatureSet();
        //     this.routeParams.barriers = new esri.tasks.FeatureSet();
        //     this.routeParams.outSpatialReference = this.flagwindMap.spatial;

        //     let me = this;
        //     this.routeTask.on("solve-complete", function (evt: any) {
        //         me.showRoute(evt);
        //     });
        //     this.routeTask.on("error", function (err: any) {
        //         me.errorHandler(err);
        //     });
        // }

        // private addDrawGraphic(geometry: any): void {
        //     let playedLineSymbol = new esri.symbol.CartographicLineSymbol(
        //         esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196]), 2,
        //         esri.symbol.CartographicLineSymbol.CAP_ROUND,
        //         esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
        //     let lineGraphic = new esri.Graphic(geometry, playedLineSymbol);
        //     this.drawLayer.add(lineGraphic);
        // }

        // /**
        //  * 清除障碍点
        //  */
        // private clearBarriers(): void {
        //     for (let i = this.routeParams.barriers.features.length - 1; i >= 0; i--) {
        //         let g = this.routeParams.barriers.features.splice(i, 1)[0];
        //         this.barriersLayer.remove(g);
        //     }
        // }

        // /**
        //  * 清除停靠点
        //  */
        // private clearStops(): void {
        //     for (let i = this.routeParams.stops.features.length - 1; i >= 0; i--) {
        //         let g = this.routeParams.stops.features.splice(i, 1)[0];
        //         this.stopsLayer.remove(g);
        //     }
        // }

        // /**
        //  * 清除路径信息
        //  */
        // private clearRoutes() {
        //     for (let i = this.routes.length - 1; i >= 0; i--) {
        //         let r = this.routes.splice(i, 1)[0];
        //         this.lineLayer.remove(r);
        //     }
        //     this.routes = [];
        // }

        // /**
        //  * 显示路径信息
        //  */
        // private showRoute(evt: any): void {
        //     // this.clearRoutes();
        //     for (let i = 0; i < evt.result.routeResults.length; i++) {
        //         let routeResult = evt.result.routeResults[i];
        //         routeResult.route.setSymbol(this.routeSymbol);
        //         this.lineLayer.add(routeResult.route);
        //         this.routes.push(routeResult.route);
        //     }
        // }

        // private errorHandler(err: any) {
        //     // console.warn("An error occured\n" + err.message + "\n" + err.details.join("\n"));
        //     console.warn(`路径解析出错：\n ${err.message}\n${err.details}`);
        // }

        // private removeEventHandlers(): void {
        //     if (this.MAPONCLICH_ADDSTOPS) this.MAPONCLICH_ADDSTOPS.remove();
        //     if (this.MAPONCLICH_ADDBARRIERS) this.MAPONCLICH_ADDBARRIERS.remove();
        //     // this.options.onEventChanged("removeEventHandlers");
        // }

    }
}
