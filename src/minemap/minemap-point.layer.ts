/// <reference path="../base/flagwind-business.layer.ts" />

namespace flagwind {
    /**
     * 点图层
     */
    export class MinemapPointLayer extends FlagwindBusinessLayer {

        public constructor(
            flagwindMap: FlagwindMap,
            id: string,
            options: any
        ) {
            super(flagwindMap, id, {
                ...{ autoInit: true },
                ...options,
                ...{ layerType: LayerType.point }
            });
        }

        public onCreateGraphicsLayer(options: any) {
            return new MinemapGraphicsLayer(options);
        }

        public getImageUrl(item: any): string {
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

        public getClassName(item: any): string {
            if (item.selected == null) {
                return "";
            }

            if (item.selected) {
                return "checked";
            } else {
                return "unchecked";
            }
        }

        /**
         * 创建要素方法
         * @param item 实体信息
         */
        public onCreatGraphicByModel(item: any): any {
            let className = this.options.symbol.className || "graphic-point";
            let imageUrl =
                this.options.symbol.imageUrl || (<any>this.options).imageUrl;
            let attr = { ...item, ...{ __type: this.layerType } };
            return new MinemapPointGraphic({
                id: item.id,
                className: className,
                symbol: {
                    imageUrl: imageUrl,
                    imageSize: this.options.symbol.imageSize || [20, 28],
                    imgOffset: this.options.symbol.imgOffset || [-10, -14]
                },
                point: {
                    y: this.getPoint(item).y,
                    x: this.getPoint(item).x,
                    spatial: { wkid: minemap.solution }
                },
                attributes: attr
            });
        }

        /**
         * 更新要素方法
         * @param item 实体信息
         */
        public onUpdateGraphicByModel(item: any): void {
            let graphic: MinemapPointGraphic = this.getGraphicById(item.id);
            if (graphic) {
                const originPoint = graphic.geometry;
                const currentPoint = new MinemapPoint(
                    item.longitude,
                    item.latitude
                );
                graphic.geometry = currentPoint;

                let attr = {
                    ...graphic.attributes,
                    ...item,
                    ...{ __type: this.layerType }
                };
                this.setGraphicStatus(attr);
                if (!MapUtils.isEqualPoint(currentPoint, originPoint)) {
                    this.options.onPositionChanged(currentPoint, originPoint, graphic.attributes);
                }
            } else {
                console.warn("待修改的要素不存在");
            }
        }

        protected setGraphicStatus(item: any): void {
            let graphic: MinemapPointGraphic = this.getGraphicById(item.id);
            graphic.setSymbol({
                className: this.getClassName(item),
                imageUrl: this.getImageUrl(item)
            });
        }

    }
}
