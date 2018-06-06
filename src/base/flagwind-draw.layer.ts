/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";

namespace flagwind {

    export const DRAW_LAYER_OPTIONS = {
        onDrawCompleteEvent: function (geometry: any) {
            // console.log(eventName);
        }
    };

    /**
     * 绘画图层
     */
    export interface IFlagwindDrawLayer {

        activate(mode: string, options?: any): void;

        finish(): void;
    }
}
