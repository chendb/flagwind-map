/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";

namespace flagwind {
    // tslint:disable-next-line:interface-name
    export interface SelectBoxOptions {
        selectMode: number;
        onCheckChanged: (
            checkItems: Array<any>,
            layer: FlagwindBusinessLayer
        ) => void;
    }

    /**
     * 地图选择工具
     */
    export interface IFlagwindSelectBox {

        layers: Array<FlagwindBusinessLayer>;

        active(mode: string): void;

        showSelectBar(): void;

        deleteSelectBar(): void;

        getLayerById(id: string): FlagwindBusinessLayer;

        deleteSelectBar(): void;

        addLayer(layer: FlagwindBusinessLayer): void;

        removeLayer(layer: FlagwindBusinessLayer): void;

        show(): void;

        hide(): void;

        clear(): void;

        destroy(): void;
    }
}
