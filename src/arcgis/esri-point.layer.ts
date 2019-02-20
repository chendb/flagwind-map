/// <reference path="../base/flagwind-business.layer.ts" />;

namespace flagwind {

    export const ESRI_POINT_LAYER_OPTIONS: any = {
        getImageUrl: null,  // getImageUrl: (item: any) => String,
        onEvent: (eventName: string, evt: any) => {  // 事件回调
            switch (eventName) {
                case "onMouseOver":
                    if (evt.graphic.getNode()) evt.graphic.getNode().classList.add("marker-scale"); break;
                case "onMouseOut":
                    if (evt.graphic.getNode()) evt.graphic.getNode().classList.remove("marker-scale"); break;
            }
        },
        symbol: {
            width: 32,
            height: 32
        },
        layerType: "point"
    };

    /**
     * 点图层
     */
    export class EsriPointLayer extends FlagwindBusinessLayer {

        public constructor(flagwindMap: FlagwindMap, id: string, options: any) {
            super(flagwindMap, id, { ...ESRI_POINT_LAYER_OPTIONS, ...options });
        }

        public onCreateGraphicsLayer(options: any) {
            const layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", (evt: any) =>
                this.dispatchEvent("onMouseOver", evt)
            );
            layer.on("mouse-out", (evt: any) =>
                this.dispatchEvent("onMouseOut", evt)
            );
            layer.on("mouse-up", (evt: any) =>
                this.dispatchEvent("onMouseUp", evt)
            );
            layer.on("mouse-down", (evt: any) =>
                this.dispatchEvent("onMouseDown", evt)
            );
            layer.on("click", (evt: any) => this.dispatchEvent("onClick", evt));
            layer.on("dbl-click", (evt: any) =>
                this.dispatchEvent("onDblClick", evt)
            );
            layer.addToMap = function(map: any) {
                map.addLayer(this);
            };
            layer.removeFromMap = function(map: any) {
                try {
                    if (!this._map) {
                        this._map = map;
                    }
                    map.removeLayer(this);
                } catch (error) {
                    console.warn(error);
                }
            };
            return layer;
            // return new EsriGraphicsLayer(options);
        }

        public getImageUrl(item: any): string {
            if((<any>this.options).getImageUrl) {
                return (<any>this.options).getImageUrl(item);
            }
            let imageUrl = this.options.symbol.imageUrl;
            if (typeof imageUrl === "string" && imageUrl) {
                const key = `imageUrl${item.status || ""}${item.selected ? "checked" : ""}`;
                let statusImageUrl: string = this.options[key] || this.options.symbol[key] || imageUrl;
                let suffixIndex = statusImageUrl.lastIndexOf(".");
                const path = statusImageUrl.substring(0, suffixIndex);
                const suffix = statusImageUrl.substring(suffixIndex + 1);
                if (item.selected) {
                    return `${path}_checked.${suffix}`;
                } else {
                    return `${path}.${suffix}`;
                }
            } else {
                let status = item.status;
                if (status === undefined || status === null) {
                    status = "";
                }
                const key =
                    "image" + status + (item.selected ? "checked" : "");
                return (
                    this.options[key] ||
                    this.options.symbol[key] ||
                    (<any>this.options).image
                );
            }
        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            const iconUrl = this.getImageUrl(item);
            const pt = this.getPoint(item);
            const width = this.options.symbol.width;
            const height = this.options.symbol.height;
            const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            let attr = { ...item, ...{ __type: this.layerType } };
            const graphic = new esri.Graphic(pt, markerSymbol, attr);
            return graphic;
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            const iconUrl = this.getImageUrl(item);
            const pt = this.getPoint(item);
            const width = this.options.symbol.width;
            const height = this.options.symbol.height;
            const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            const graphic = this.getGraphicById(item.id);
            const originPoint = graphic.geometry;

            graphic.setGeometry(pt);
            graphic.setSymbol(markerSymbol);
            graphic.attributes = {
                ...graphic.attributes,
                ...item,
                ...{ __type: this.layerType }
            };
            graphic.draw(); // 重绘
            if (!MapUtils.isEqualPoint(pt, originPoint)) {
                this.options.onPositionChanged(pt, originPoint, graphic.attributes);
            }
        }

    }
}
