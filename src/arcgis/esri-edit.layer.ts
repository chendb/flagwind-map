/// <reference path="../base/flagwind-feature.layer.ts" />

declare let esri: any;
declare let dojo: any;
declare let dijit: any;

namespace flagwind {

    export class EsriEditLayer extends FlagwindFeatureLayer implements IFlagwindEditLayer {

        public editObj: any;
        public options: any;
        public businessLayer: FlagwindBusinessLayer;
        public flagwindMap: FlagwindMap;

        public constructor(
            businessLayer: FlagwindBusinessLayer,
            options: any) {
            options = { ...EDIT_LAYER_OPTIONS, ...options };
            super("edit_" + businessLayer.id, "编辑图层");
            this.businessLayer = businessLayer;
            this.flagwindMap = businessLayer.flagwindMap;
            this.options = options;

            this.editObj = new esri.toolbars.Edit(this.flagwindMap.innerMap); // 编辑对象,在编辑图层进行操作
            this.flagwindMap.addFeatureLayer(this);
            if (this.flagwindMap.innerMap.loaded) {
                this.onLoad();
            } else {
                const me = this;
                this.flagwindMap.innerMap.on("load", function () {
                    me.onLoad();
                });
            }
        }

        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        public activateEdit(key: string): void {

            let graphic = this.businessLayer.getGraphicById(key);
            if (!graphic) {
                console.log("无效的代码：" + key);
                return;
            }
            this.businessLayer.hide();
            this.show();
            let editGraphic = this.businessLayer.creatGraphicByModel(graphic.attributes);
            this.layer.add(editGraphic);
            editGraphic.attributes.eventName = "start";
            let tool = esri.toolbars.Edit.MOVE;
            // map.disableDoubleClickZoom();//禁掉鼠标双击事件
            this.editObj.activate(tool, editGraphic, null); // 激活编辑工具
            this.businessLayer.onShowInfoWindow({
                graphic: graphic
            });
        }

        /**
         * 取消编辑要素
         */
        public cancelEdit(key: string) {
            this.editObj.deactivate();
            this.clear();
            this.hide();
            this.flagwindMap.innerMap.infoWindow.hide();
            this.businessLayer.show();

            let graphic = this.businessLayer.getGraphicById(key);
            graphic.attributes.eventName = "delete";
            this.businessLayer.onShowInfoWindow({
                graphic: graphic
            });
        }

        public registerModifyEvent(modifySeletor: string): void {
            const me = this;
            dojo.connect(dojo.byId(modifySeletor), "onclick", function (evt: any) {
                const key = evt.target.attributes["key"].value;
                me.activateEdit(key);
            });
        }

        public registerDeleteEvent(deleteSeletor: string): void {
            const _editLayer = this;
            dojo.connect(dojo.byId(deleteSeletor), "onclick", function (evt: any) {
                const key = evt.target.attributes["key"].value;
                _editLayer.cancelEdit(key);
            });
        }

        public onLoad() {
            if (!this.layer._map) {
                this.layer._map = this.flagwindMap.innerMap;
            }
            try {
                this.registerEvent();
            } catch (error) {
                console.error(error);
            }
        }

        public get map(): any {
            return this.flagwindMap.map;
        }

        public get spatial(): any {
            return this.flagwindMap.spatial;
        }

        public onCreateGraphicsLayer(args: any) {
            let layer = new esri.layers.GraphicsLayer(args);
            layer.addToMap = function (map: any) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map: any) {
                map.removeLayer(this);
            };
            return layer;
        }

        public onChanged(options: any, isSave: boolean): Promise<boolean> {
            return this.options.onEditInfo(options, isSave);
        }

        protected registerEvent(): void {
            let _editLayer = this;
            dojo.connect(this.layer, "onClick", function (evt: any) {
                _editLayer.onLayerClick(_editLayer, evt);
            });

            let originInfo: any = {}; // 存放资源的初始值		
            console.log("编辑对象：" + this.editObj);
            dojo.on(this.editObj, "graphic-first-move", function (ev: any) {
                console.log("要素移动---------graphic-first-move");
                _editLayer.flagwindMap.innerMap.infoWindow.hide();
                originInfo = ev.graphic.attributes;
            });
            dojo.on(this.editObj, "graphic-move-stop", function (ev: any) { // 这里要更新一下属性值	
                console.log("要素移动---------graphic-move-stop");
                _editLayer.editObj.deactivate();
                let key = ev.graphic.attributes.id;

                (<any>window).$Modal.confirm({
                    title: "确定要进行更改吗？",
                    content: "初始坐标值（经度）:" + originInfo.longitude +
                        ",（纬度）:" + originInfo.latitude +
                        "\r当前坐标值（经度）:" + ev.graphic.geometry.x.toFixed(8) +
                        ",（纬度）:" + ev.graphic.geometry.y.toFixed(8),
                    onOk: () => {
                        let pt = ev.graphic.geometry;
                        let lonlat = _editLayer.businessLayer.formPoint(pt);
                        let changeInfo = { ...ev.graphic.attributes, ...lonlat };

                        // 异步更新，请求成功才更新位置，否则不处理，
                        _editLayer.onChanged({
                            id: key,
                            latitude: changeInfo.latitude,
                            longitude: changeInfo.longitude
                        }, true).then(success => {
                            if (success) {
                                _editLayer.businessLayer.removeGraphicById(changeInfo.id);
                                _editLayer.businessLayer.addGraphicByModel(changeInfo);
                            }
                        });
                    },
                    onCancel: () => {
                        _editLayer.onChanged({
                            id: key,
                            latitude: originInfo.latitude,
                            longitude: originInfo.longitude
                        }, false);
                    }
                });
                ev.graphic.attributes.eventName = "stop";
                _editLayer.clear();
                _editLayer.hide();
                _editLayer.flagwindMap.innerMap.infoWindow.hide();
                _editLayer.businessLayer.show();
            });
        }

        protected onLayerClick(editLayer: this, evt: any) {

            if (editLayer.businessLayer.options.onLayerClick) {
                editLayer.businessLayer.options.onLayerClick(evt);
            }

            if (editLayer.businessLayer.options.showInfoWindow) {
                editLayer.businessLayer.onShowInfoWindow(evt);
            }
        }

    }
}
