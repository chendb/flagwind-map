/*!
* flagwind-map v1.0.0 
* 
* Authors:
*      chendebao <hbchendb1985@gmail.com>
* 
* Licensed under the MIT License.
* Copyright (C) 2018-2018 Flagwind Inc. All rights reserved. 
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.flagwind = {})));
}(this, (function (exports) { 'use strict';

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var flagwind;
(function (flagwind) {
    /**
     * 动画对象
     */
    var Animation = /** @class */ (function () {
        function Animation() {
        }
        return Animation;
    }());
    flagwind.Animation = Animation;
    /**
     * 亮光动画对象
     */
    var LightingAnimation = /** @class */ (function (_super) {
        __extends(LightingAnimation, _super);
        function LightingAnimation(item, graphic, options) {
            var _this = _super.call(this) || this;
            _this.graphic = graphic;
            _this.options = options;
            _this.attributes = item;
            _this.graphic = graphic;
            _this._id = item.id;
            _this._alpha = 1;
            _this._fadeIn = false;
            _this.options = options;
            return _this;
        }
        Object.defineProperty(LightingAnimation.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        LightingAnimation.prototype.updateGraphic = function () {
            if (this._fadeIn) {
                this._alpha += .01;
                if (this._alpha >= 1) {
                    this._alpha = 1;
                    this._fadeIn = false;
                }
            }
            else {
                this._alpha -= .01;
                if (this._alpha <= 0) {
                    this._alpha = 0;
                    this._fadeIn = true;
                }
            }
            var symbol = this.getSymbol();
            var color = this.getColor();
            color.push(this._alpha);
            symbol.setColor(color);
            this.graphic.setSymbol(symbol);
            this.graphic.draw();
        };
        LightingAnimation.prototype.getSymbol = function () {
            var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            markerSymbol.setPath(this.options.path);
            markerSymbol.setSize(this.options.size);
            markerSymbol.setColor(new dojo.Color(this.getColor()));
            markerSymbol.setOutline(null);
            return markerSymbol;
        };
        LightingAnimation.prototype.getColor = function () {
            var iconColor = this.options.color;
            if (!iconColor) {
                iconColor = this.options.getColor(this.attributes);
            }
            if (iconColor.length > 3) {
                iconColor.splice(3, 1);
            }
            return iconColor;
        };
        return LightingAnimation;
    }(Animation));
    flagwind.LightingAnimation = LightingAnimation;
    /**
     * 闪烁星星
     */
    var StarAnimation = /** @class */ (function (_super) {
        __extends(StarAnimation, _super);
        /**
         * 构造函数
         * @param {*} item 实体
         * @param {*} graphic 地图初始要素
         * @param {height:number,width:number,images:[]} options 动画属性
         */
        function StarAnimation(item, graphic, options) {
            var _this = _super.call(this) || this;
            _this.graphic = graphic;
            _this.options = options;
            _this.index = 0;
            _this.attributes = item;
            _this.graphic = graphic;
            _this.id = item.id;
            _this.index = 0;
            _this.options = options;
            return _this;
        }
        StarAnimation.prototype.getRandomNum = function (min, max) {
            var range = max - min;
            var rand = Math.random();
            return (min + Math.round(rand * range));
        };
        StarAnimation.prototype.updateGraphic = function () {
            var iconUrl = this.options.images[this.index];
            var width = this.options.width || 48;
            var height = this.options.height || 48;
            var symbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            this.graphic.setSymbol(symbol);
            this.index = ((this.index + 1) % this.options.images.length);
            this.graphic.draw();
        };
        return StarAnimation;
    }(Animation));
    flagwind.StarAnimation = StarAnimation;
    /**
     * 动画图层
     */
    var AnimationLayer = /** @class */ (function () {
        function AnimationLayer(options) {
            this.options = options;
            this.isRunning = false;
            this.animations = [];
            this.options = options;
        }
        AnimationLayer.prototype.getRandomNum = function (min, max) {
            var range = max - min;
            var rand = Math.random();
            return (min + Math.round(rand * range));
        };
        AnimationLayer.prototype.getAnimationId = function (id) {
            var animations = this.animations.filter(function (g) { return g.id === id; });
            return animations && animations.length > 0 ? animations[0] : null;
        };
        AnimationLayer.prototype.start = function () {
            this.isRunning = true;
            var _this = this;
            this._timer = setInterval(function () {
                _this.animations.forEach(function (g) {
                    var n = _this.getRandomNum(0, 10);
                    if (n > 5) {
                        g.updateGraphic();
                    }
                });
            }, this.options.timeout || 20);
        };
        AnimationLayer.prototype.stop = function () {
            this.isRunning = false;
            if (this._timer) {
                clearInterval(this._timer);
            }
        };
        AnimationLayer.prototype.add = function (animation) {
            this.animations.push(animation);
        };
        AnimationLayer.prototype.removeAnimationById = function (id) {
            var animation = this.getAnimationId(id);
            if (animation) {
                var i = this.animations.indexOf(animation);
                if (i >= 0) {
                    this.animations.splice(i, 1);
                }
            }
        };
        AnimationLayer.prototype.clear = function () {
            this.stop();
            this.animations = [];
        };
        return AnimationLayer;
    }());
    flagwind.AnimationLayer = AnimationLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 底图包装类
     *
     * @export
     * @class FlagwindTiledLayer
     */
    var FlagwindTiledLayer = /** @class */ (function () {
        function FlagwindTiledLayer(mapService, id, url, title) {
            this.mapService = mapService;
            this.id = id;
            this.url = url;
            this.title = title;
            this.isShow = true;
            if (url) {
                this.layer = mapService.createTiledLayer({
                    url: url,
                    id: id,
                    title: title
                });
            }
        }
        FlagwindTiledLayer.prototype.appendTo = function (map) {
            if (this.layer) {
                this.mapService.addLayer(this.layer, map);
            }
        };
        FlagwindTiledLayer.prototype.removeLayer = function (map) {
            this.mapService.removeLayer(this.layer, map);
        };
        FlagwindTiledLayer.prototype.show = function () {
            this.isShow = true;
            this.mapService.showLayer(this.layer);
        };
        FlagwindTiledLayer.prototype.hide = function () {
            this.isShow = false;
            this.mapService.hideLayer(this.layer);
        };
        return FlagwindTiledLayer;
    }());
    flagwind.FlagwindTiledLayer = FlagwindTiledLayer;
    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    var FlagwindFeatureLayer = /** @class */ (function () {
        function FlagwindFeatureLayer(mapService, id, title) {
            this.mapService = mapService;
            this.id = id;
            this.title = title;
            this.isShow = true;
            this.id = id;
            this.layer = mapService.createGraphicsLayer({ id: id });
        }
        Object.defineProperty(FlagwindFeatureLayer.prototype, "graphics", {
            get: function () {
                return this.mapService.getGraphicListByLayer(this.layer);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindFeatureLayer.prototype, "items", {
            get: function () {
                var _this = this;
                return this.graphics.map(function (g) { return _this.mapService.getGraphicAttributes(g); });
            },
            enumerable: true,
            configurable: true
        });
        FlagwindFeatureLayer.prototype.appendTo = function (map) {
            this.mapService.addLayer(this.layer, map);
        };
        FlagwindFeatureLayer.prototype.removeLayer = function (map) {
            this.mapService.removeLayer(this.layer, map);
        };
        Object.defineProperty(FlagwindFeatureLayer.prototype, "count", {
            get: function () {
                if (this.layer) {
                    return this.graphics.length;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        FlagwindFeatureLayer.prototype.clear = function () {
            this.mapService.clearLayer(this.layer);
        };
        FlagwindFeatureLayer.prototype.show = function () {
            this.isShow = true;
            this.mapService.showLayer(this.layer);
        };
        FlagwindFeatureLayer.prototype.hide = function () {
            this.isShow = false;
            this.mapService.hideLayer(this.layer);
        };
        /**
         * 获取资源要素点
         */
        FlagwindFeatureLayer.prototype.getGraphicById = function (key) {
            var graphics = this.graphics;
            for (var i = 0; i < graphics.length; i++) {
                var attrs = this.mapService.getGraphicAttributes(graphics[i]);
                if (attrs.id === key) {
                    return graphics[i];
                }
            }
            return null;
        };
        /**
         * 删除资源要素点
         */
        FlagwindFeatureLayer.prototype.removeGraphicById = function (key) {
            var graphic = this.getGraphicById(key);
            if (graphic != null) {
                this.mapService.removeGraphic(graphic, this.layer);
            }
        };
        return FlagwindFeatureLayer;
    }());
    flagwind.FlagwindFeatureLayer = FlagwindFeatureLayer;
    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     *
     * @export
     * @class FlagwindGroupLayer
     */
    var FlagwindGroupLayer = /** @class */ (function () {
        function FlagwindGroupLayer(mapService, id) {
            this.mapService = mapService;
            this.id = id;
            this.isShow = true;
            this.layer = this.mapService.createGraphicsLayer({ id: id });
        }
        Object.defineProperty(FlagwindGroupLayer.prototype, "graphics", {
            get: function () {
                return this.mapService.getGraphicListByLayer(this.layer);
            },
            enumerable: true,
            configurable: true
        });
        FlagwindGroupLayer.prototype.appendTo = function (map) {
            this.mapService.addLayer(this.layer, map);
        };
        FlagwindGroupLayer.prototype.removeLayer = function (map) {
            this.mapService.removeLayer(this.layer, map);
        };
        FlagwindGroupLayer.prototype.clear = function () {
            this.mapService.clearLayer(this.layer);
        };
        FlagwindGroupLayer.prototype.show = function () {
            this.isShow = true;
            this.mapService.showLayer(this.layer);
        };
        FlagwindGroupLayer.prototype.hide = function () {
            this.isShow = false;
            this.mapService.hideLayer(this.layer);
        };
        FlagwindGroupLayer.prototype.setGeometry = function (name, geometry) {
            var _this = this;
            this.getGraphicByName(name).forEach(function (g) {
                _this.mapService.setGeometryByGraphic(g, geometry);
            });
        };
        FlagwindGroupLayer.prototype.setSymbol = function (name, symbol) {
            var _this = this;
            this.getGraphicByName(name).forEach(function (g) {
                _this.mapService.setSymbolByGraphic(g, symbol);
            });
        };
        FlagwindGroupLayer.prototype.showGraphice = function (name) {
            var _this = this;
            this.getGraphicByName(name).forEach(function (g) {
                _this.mapService.showGraphic(g);
            });
        };
        FlagwindGroupLayer.prototype.hideGraphice = function (name) {
            var _this = this;
            this.getGraphicByName(name).forEach(function (g) {
                _this.mapService.hideGraphic(g);
            });
        };
        FlagwindGroupLayer.prototype.addGraphice = function (name, graphics) {
            var _this = this;
            if (graphics === undefined)
                return;
            graphics.forEach(function (g, index) {
                if (g) {
                    var item = _this.mapService.getGraphicAttributes(g);
                    item.__master = index === 0;
                    item.__name = name;
                    _this.mapService.addGraphic(g, _this.layer);
                }
            });
        };
        FlagwindGroupLayer.prototype.getMasterGraphicByName = function (name) {
            var _this = this;
            this.graphics.forEach(function (element) {
                var item = _this.mapService.getGraphicAttributes(element);
                if (name === item.__name && item.__master) {
                    return element;
                }
            });
            return null;
        };
        /**
         * 获取资源要素点
         */
        FlagwindGroupLayer.prototype.getGraphicByName = function (name) {
            var list = [];
            for (var i = 0; i < this.graphics.length; i++) {
                var attrs = this.mapService.getGraphicAttributes(this.graphics[i]);
                if (attrs.__name === name) {
                    list.push(this.graphics[i]);
                }
            }
            return list;
        };
        /**
         * 删除资源要素点
         */
        FlagwindGroupLayer.prototype.removeGraphicByName = function (name) {
            var _this = this;
            var graphics = this.getGraphicByName(name);
            if (graphics != null) {
                var _layer_1 = this.layer;
                graphics.forEach(function (g) {
                    _this.mapService.removeGraphic(g, _layer_1);
                });
            }
        };
        return FlagwindGroupLayer;
    }());
    flagwind.FlagwindGroupLayer = FlagwindGroupLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriEditLayer = /** @class */ (function (_super) {
        __extends(EsriEditLayer, _super);
        function EsriEditLayer(flagwindMap, deviceLayer, options) {
            var _this = this;
            options = __assign({}, flagwind.editLayerOptions, options);
            _this = _super.call(this, flagwindMap.mapService, "edit_" + deviceLayer.id, "编辑图层") || this;
            _this.flagwindMap = flagwindMap;
            _this.mapService = flagwindMap.mapService;
            _this.deviceLayer = deviceLayer;
            _this.options = options;
            _this.editObj = new esri.toolbars.Edit(_this.flagwindMap.innerMap); // 编辑对象,在编辑图层进行操作
            _this.flagwindMap.addDeviceLayer(_this);
            if (_this.flagwindMap.innerMap.loaded) {
                _this.onLoad();
            }
            else {
                var me_1 = _this;
                _this.flagwindMap.innerMap.on("load", function () {
                    me_1.onLoad();
                });
            }
            return _this;
        }
        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        EsriEditLayer.prototype.activateEdit = function (key) {
            var graphic = this.deviceLayer.getGraphicById(key);
            if (!graphic) {
                console.log("无效的代码：" + key);
                return;
            }
            this.deviceLayer.hide();
            this.show();
            var editGraphic = this.deviceLayer.creatGraphicByDevice(graphic.attributes);
            this.layer.add(editGraphic);
            editGraphic.attributes.eventName = "start";
            var tool = esri.toolbars.Edit.MOVE;
            // map.disableDoubleClickZoom();//禁掉鼠标双击事件
            this.editObj.activate(tool, editGraphic, null); // 激活编辑工具
            this.deviceLayer.showInfoWindow({
                graphic: graphic
            });
        };
        /**
         * 取消编辑要素
         */
        EsriEditLayer.prototype.cancelEdit = function (key) {
            this.editObj.deactivate();
            this.clear();
            this.hide();
            this.flagwindMap.innerMap.infoWindow.hide();
            this.deviceLayer.show();
            var graphic = this.deviceLayer.getGraphicById(key);
            graphic.attributes.eventName = "delete";
            this.deviceLayer.showInfoWindow({
                graphic: graphic
            });
        };
        EsriEditLayer.prototype.bindModifyEvent = function (modifySeletor) {
            var me = this;
            dojo.connect(dojo.byId(modifySeletor), "onclick", function (evt) {
                var key = evt.target.attributes["key"].value;
                me.activateEdit(key);
            });
        };
        EsriEditLayer.prototype.bindDeleteEvent = function (deleteSeletor) {
            var _editLayer = this;
            dojo.connect(dojo.byId(deleteSeletor), "onclick", function (evt) {
                var key = evt.target.attributes["key"].value;
                _editLayer.cancelEdit(key);
            });
        };
        EsriEditLayer.prototype.onLoad = function () {
            if (!this.layer._map) {
                this.layer._map = this.flagwindMap.innerMap;
            }
            try {
                this.registerEvent();
            }
            catch (error) {
                console.error(error);
            }
        };
        Object.defineProperty(EsriEditLayer.prototype, "map", {
            get: function () {
                return this.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EsriEditLayer.prototype, "spatial", {
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        EsriEditLayer.prototype.onChanged = function (options, isSave) {
            return this.options.onEditInfo(options, isSave);
        };
        EsriEditLayer.prototype.registerEvent = function () {
            var _editLayer = this;
            dojo.connect(this.layer, "onClick", function (evt) {
                _editLayer.onLayerClick(_editLayer, evt);
            });
            var originInfo = {}; // 存放资源的初始值		
            console.log("编辑对象：" + this.editObj);
            dojo.on(this.editObj, "graphic-first-move", function (ev) {
                console.log("要素移动---------graphic-first-move");
                _editLayer.flagwindMap.innerMap.infoWindow.hide();
                originInfo = ev.graphic.attributes;
            });
            dojo.on(this.editObj, "graphic-move-stop", function (ev) {
                console.log("要素移动---------graphic-move-stop");
                _editLayer.editObj.deactivate();
                var key = ev.graphic.attributes.id;
                window.$Modal.confirm({
                    title: "确定要进行更改吗？",
                    content: "初始坐标值（经度）:" + originInfo.longitude +
                        ",（纬度）:" + originInfo.latitude +
                        "\r当前坐标值（经度）:" + ev.graphic.geometry.x.toFixed(8) +
                        ",（纬度）:" + ev.graphic.geometry.y.toFixed(8),
                    onOk: function () {
                        var pt = ev.graphic.geometry;
                        var lonlat = _editLayer.deviceLayer.formPoint(pt);
                        var changeInfo = __assign({}, ev.graphic.attributes, lonlat);
                        // 异步更新，请求成功才更新位置，否则不处理，
                        _editLayer.onChanged({
                            id: key,
                            latitude: changeInfo.latitude,
                            longitude: changeInfo.longitude
                        }, true).then(function (success) {
                            if (success) {
                                _editLayer.deviceLayer.removeGraphicById(changeInfo.id);
                                _editLayer.deviceLayer.addGraphicByDevice(changeInfo);
                            }
                        });
                    },
                    onCancel: function () {
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
                _editLayer.deviceLayer.show();
            });
        };
        EsriEditLayer.prototype.onLayerClick = function (editLayer, evt) {
            if (editLayer.deviceLayer.options.onLayerClick) {
                editLayer.deviceLayer.options.onLayerClick(evt);
            }
            if (editLayer.deviceLayer.options.showInfoWindow) {
                editLayer.deviceLayer.showInfoWindow(evt);
            }
        };
        return EsriEditLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.EsriEditLayer = EsriEditLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriLocationLayer = /** @class */ (function (_super) {
        __extends(EsriLocationLayer, _super);
        function EsriLocationLayer(flagwindMap, options) {
            var _this = _super.call(this, flagwindMap.mapService, "commonLocationLayer", "定位图层") || this;
            _this.flagwindMap = flagwindMap;
            _this.options = options;
            _this.mapService = flagwindMap.mapService;
            options = __assign({}, flagwind.locationLayerOptions, options);
            _this.flagwindMap = flagwindMap;
            _this.options = options;
            var me = _this;
            if (_this.flagwindMap.innerMap.loaded) {
                _this.onLoad();
            }
            else {
                _this.flagwindMap.innerMap.on("load", function () {
                    me.onLoad();
                });
            }
            _this.flagwindMap.addDeviceLayer(_this);
            return _this;
        }
        Object.defineProperty(EsriLocationLayer.prototype, "map", {
            get: function () {
                return this.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EsriLocationLayer.prototype, "spatial", {
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        EsriLocationLayer.prototype.onLoad = function () {
            var me = this;
            // if (!this.layer._map) {
            //     this.layer._map = this.flagwindMap.innerMap;
            // }
            try {
                this.mapService.addEventListener(this.map, "click", function (evt) {
                    me.onMapClick(evt);
                });
            }
            catch (error) {
                console.error(error);
            }
        };
        EsriLocationLayer.prototype.createAnimation = function () {
            if (this.timer) {
                clearInterval(this.timer);
            }
            var me = this;
            var oneSymbol = this.createSymbol("#de3700");
            var twoSymbol = this.createSymbol("#13227a");
            me.timer = setInterval(function () {
                if (me.graphic.__symbol) {
                    me.graphic.__symbol = false;
                    me.mapService.setSymbolByGraphic(me.graphic, oneSymbol);
                }
                else {
                    me.graphic.__symbol = true;
                    me.mapService.setSymbolByGraphic(me.graphic, twoSymbol);
                }
            }, 300);
        };
        EsriLocationLayer.prototype.onMapClick = function (evt) {
            console.log("地图加载：" + evt);
            var graphic = (this.graphic = this.creatGraphic(evt.mapPoint));
            this.createAnimation();
            this.clear();
            this.layer.add(graphic);
            var item = this.flagwindMap.formPoint(evt.mapPoint);
            this.options.onMapClick(item);
        };
        EsriLocationLayer.prototype.createSymbol = function (color) {
            var iconPath = "M511.999488 299.209616m-112.814392 0a110.245 110.245 0 1 0 225.628784 0 110.245 110.245 0 1 0-225.628784 0ZM47.208697 523.662621A0 11.396 0 1 1 47.208697 524.685927ZM511.949346 7.981788c-173.610036 0-314.358641 140.748604-314.358641 314.358641s314.358641 523.932774 314.358641 523.932774 314.358641-350.322737 314.358641-523.932774S685.558359 7.981788 511.949346 7.981788L511.949346 7.981788zM511.949346 453.323623c-86.805018 0-157.177785-70.371744-157.177785-157.176762 0-86.830601 70.372767-157.182902 157.177785-157.182902 86.825484 0 157.201322 70.352301 157.201322 157.182902C669.150668 382.952902 598.774831 453.323623 511.949346 453.323623L511.949346 453.323623zM511.949346 453.323623M583.236949 788.686646l-19.674085 34.075073c201.221908 3.617387 357.506347 30.455639 357.506347 63.026452 0 35.039028-180.857091 63.442938-403.955238 63.442938-309.208341 0-403.962401-28.404933-403.962401-63.442938 0-32.067346 151.486156-58.57507 348.201423-62.841234l-19.780509-34.259268c-214.366276 7.369851-378.251833 47.647183-378.251833 96.232738 0 53.81465 105.338117 97.443309 449.084065 97.443309 248.02077 0 449.082018-43.62559 449.082018-97.443309C961.487759 836.332806 797.602202 796.055474 583.236949 788.686646z";
            return this.mapService.createMarkerSymbol({
                path: iconPath,
                size: 40,
                color: color,
                outline: null
            });
        };
        EsriLocationLayer.prototype.creatGraphic = function (pt) {
            var initColor = "#13227a";
            var graphic = new esri.Graphic(pt, this.createSymbol(initColor));
            return graphic;
        };
        return EsriLocationLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.EsriLocationLayer = EsriLocationLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var EsriMapService = /** @class */ (function () {
        function EsriMapService() {
            this.ROUTE_MAP = new flagwind.Map();
            this.GRAPHIC_SYMBOL_MAP = new flagwind.Map();
        }
        EsriMapService.prototype.showInfoWindow = function (evt) {
            throw new Error("Method not implemented.");
        };
        //#region 轨迹
        EsriMapService.prototype.getTrackLineMarkerGraphic = function (trackline, graphic, angle) {
            return flagwind.EsriRouteService.getTrackLineMarkerGraphic(trackline, graphic, angle);
        };
        EsriMapService.prototype.getStandardStops = function (name, stops) {
            return flagwind.EsriRouteService.getStandardStops(name, stops, null);
        };
        EsriMapService.prototype.showSegmentLine = function (flagwindRouteLayer, segment) {
            var service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null)
                service = new flagwind.EsriRouteService(flagwindRouteLayer);
            service.showSegmentLine(segment);
        };
        EsriMapService.prototype.solveByService = function (flagwindRouteLayer, segment, start, end, waypoints) {
            var service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null)
                service = new flagwind.EsriRouteService(flagwindRouteLayer);
            service.solveByService(segment, start, end, waypoints);
        };
        EsriMapService.prototype.solveByJoinPoint = function (flagwindRouteLayer, segment) {
            var service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null)
                service = new flagwind.EsriRouteService(flagwindRouteLayer);
            service.solveByJoinPoint(segment);
        };
        EsriMapService.prototype.setSegmentByLine = function (flagwindRouteLayer, options, segment) {
            var service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null)
                service = new flagwind.EsriRouteService(flagwindRouteLayer);
            service.setSegmentByLine(options, segment);
        };
        EsriMapService.prototype.setSegmentByPolyLine = function (flagwindRouteLayer, options, segment) {
            var service = this.ROUTE_MAP.get(flagwindRouteLayer);
            if (service == null)
                service = new flagwind.EsriRouteService(flagwindRouteLayer);
            service.setSegmentByPolyLine(options, segment);
        };
        //#endregion
        EsriMapService.prototype.createMarkerSymbol = function (options) {
            var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            if (options.path)
                markerSymbol.setPath(options.path);
            if (options.size)
                markerSymbol.setSize(options.size);
            if (options.color)
                markerSymbol.setColor(new dojo.Color(options.color));
            if (options.outline)
                markerSymbol.setOutline(options.outline);
            return markerSymbol;
        };
        EsriMapService.prototype.showTitle = function (graphic, flagwindMap) {
            var info = graphic.attributes;
            var pt = new esri.geometry.Point(info.longitude, info.latitude, flagwindMap.spatial);
            var screenpt = flagwindMap.innerMap.toScreen(pt);
            var title = info.name;
            flagwindMap.titleDiv.innerHTML = "<div>" + title + "</div>";
            flagwindMap.titleDiv.style.left = (screenpt.x + 8) + "px";
            flagwindMap.titleDiv.style.top = (screenpt.y + 8) + "px";
            flagwindMap.titleDiv.style.display = "block";
        };
        EsriMapService.prototype.hideTitle = function (flagwindMap) {
            flagwindMap.titleDiv.style.display = "none";
        };
        EsriMapService.prototype.createTiledLayer = function (options) {
            return new esri.layers.ArcGISTiledMapServiceLayer(options.url, { id: options.id, title: options.title });
        };
        EsriMapService.prototype.clearLayer = function (layer) {
            if (layer && layer._map != null) {
                layer.clear();
            }
        };
        EsriMapService.prototype.removeLayer = function (layer, map) {
            map.removeLayer(layer);
        };
        EsriMapService.prototype.addLayer = function (layer, map) {
            map.addLayer(layer);
        };
        EsriMapService.prototype.showLayer = function (layer) {
            layer.show();
        };
        EsriMapService.prototype.hideLayer = function (layer) {
            layer.hide();
        };
        EsriMapService.prototype.getGraphicListByLayer = function (lay) {
            return lay.graphics;
        };
        EsriMapService.prototype.createGraphicsLayer = function (options) {
            return new esri.layers.GraphicsLayer(options);
        };
        EsriMapService.prototype.removeGraphic = function (graphic, layer) {
            layer.remove(graphic);
        };
        EsriMapService.prototype.addGraphic = function (graphic, layer) {
            layer.add(graphic);
        };
        EsriMapService.prototype.showGraphic = function (graphic) {
            var symbol = this.GRAPHIC_SYMBOL_MAP.get(graphic);
            graphic.setSymbol(symbol);
        };
        EsriMapService.prototype.hideGraphic = function (graphic) {
            var symbol = graphic.symbol;
            this.GRAPHIC_SYMBOL_MAP.set(graphic, symbol);
            graphic.setSymbol(null);
        };
        EsriMapService.prototype.setGeometryByGraphic = function (graphic, geometry) {
            graphic.setGeometry(geometry);
        };
        EsriMapService.prototype.setSymbolByGraphic = function (graphic, symbol) {
            graphic.setSymbol(symbol);
        };
        EsriMapService.prototype.getGraphicAttributes = function (graphic) {
            return graphic.attributes;
        };
        EsriMapService.prototype.addEventListener = function (target, eventName, callback) {
            dojo.on(target, eventName, callback);
        };
        EsriMapService.prototype.centerAt = function (map, point) {
            map.centerAt(point).then(function () {
                console.log("centerAt:" + point.x + "," + point.y);
            });
        };
        EsriMapService.prototype.createPoint = function (options) {
            return new esri.geometry.Point(options.x, options.y, options.spatial);
        };
        EsriMapService.prototype.createSpatial = function (wkid) {
            var spatial = new esri.SpatialReference({
                wkid: wkid
            });
            return spatial;
        };
        EsriMapService.prototype.getInfoWindow = function (map) {
            return map.infoWindow;
        };
        EsriMapService.prototype.hideInfoWindow = function (map) {
            map.infoWindow.hide();
        };
        EsriMapService.prototype.formPoint = function (point, flagwindMap) {
            var lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.point25To2(lnglat.lon, lnglat.lat);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.gcj_decrypt(lnglat.lat, lnglat.lon);
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                    }
                    else {
                        lnglat = flagwind.MapUtils.mercator2lonlat(lnglat.lat, lnglat.lon);
                    }
                }
                else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
                else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
            }
            // console.log("-->坐标转换之后:" + lnglat.lon + "," + lnglat.lat);
            // 以x,y属性创建点
            return {
                longitude: parseFloat(lnglat.lon.toFixed(8)),
                latitude: parseFloat(lnglat.lat.toFixed(8))
            };
        };
        EsriMapService.prototype.toPoint = function (item, flagwindMap) {
            var lnglat = { "lat": item.latitude || item.lat, "lon": item.longitude || item.lon };
            if (!flagwind.MapUtils.validDevice(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.point2To25(lnglat.lon, lnglat.lat);
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                    }
                    else {
                        lnglat = flagwind.MapUtils.lonlat2mercator(lnglat.lat, lnglat.lon);
                    }
                    // lnglat.lon = lnglat.lon - (MapSetting.offsetX || 0);
                    // lnglat.lat = lnglat.lat - (MapSetting.offsetY || 0);
                }
                else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    // console.log("--原始坐标：" + lnglat.lon + "," + lnglat.lat);
                    // let _lnglat = MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                    // console.log("--高德坐标：" + _lnglat.lon + "," + _lnglat.lat);
                    // _lnglat = MapUtils.gcj_decrypt(_lnglat.lat, _lnglat.lon);
                    // console.log("--原始坐标：" + _lnglat.lon + "," + _lnglat.lat);
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
                else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return new esri.geometry.Point(lnglat.lon, lnglat.lat, flagwindMap.spatial);
        };
        EsriMapService.prototype.createBaseLayer = function (flagwindMap) {
            var baseLayers = new Array();
            if (flagwindMap.mapSetting.baseUrl) {
                var layer = new flagwind.FlagwindTiledLayer(flagwindMap.mapService, "base_arcgis_tiled", flagwindMap.mapSetting.baseUrl, "瓦片图层");
                baseLayers.push(layer);
            }
            if (flagwindMap.mapSetting.webTiledUrl) {
                var tileInfo1 = this.getTileInfo(flagwindMap);
                var cycleLayer = new esri.layers.WebTiledLayer(flagwindMap.mapSetting.webTiledUrl, {
                    tileInfo: tileInfo1
                });
                var layer = new flagwind.FlagwindTiledLayer(flagwindMap.mapService, "base_arcgis_tiled", null, "瓦片图层");
                layer.layer = cycleLayer;
                baseLayers.push(layer);
            }
            return baseLayers;
        };
        EsriMapService.prototype.createMap = function (setting, flagwindMap) {
            var mapArguments = {
                logo: setting.logo,
                slider: setting.slider,
                zoom: setting.zoom,
                minZoom: setting.minZoom,
                maxZoom: setting.maxZoom
            };
            if (setting.basemap) {
                mapArguments.basemap = setting.basemap;
            }
            if (setting.extent && setting.extent.length === 4) {
                var minXY = flagwindMap.getPoint({
                    x: setting.extent[0],
                    y: setting.extent[1]
                });
                var maxXY = flagwindMap.getPoint({
                    x: setting.extent[2],
                    y: setting.extent[3]
                });
                var tileExtent = new esri.geometry.Extent(minXY.x, minXY.y, maxXY.x, maxXY.y, flagwindMap.spatial);
                mapArguments.extent = tileExtent;
            }
            if (setting.webTiledUrl) {
                mapArguments.lods = this.getTileInfo(flagwindMap).lods;
            }
            // 地图对象
            var map = new esri.Map(flagwindMap.mapEl, mapArguments);
            map.infoWindow.anchor = "top";
            var div = flagwindMap.titleDiv = document.createElement("div");
            div.classList.add("eg-map-title");
            flagwindMap.innerMap.root.parentElement.appendChild(div);
        };
        EsriMapService.prototype.createContextMenu = function (options, flagwindMap) {
            var menus = options.contextMenu;
            var ctxMenu = flagwindMap.ctxMenuForMap = new dijit.Menu({
                onOpen: function (box) {
                    flagwindMap.currentLocation = this.getMapPointFromMenuPosition(box, flagwindMap.innerMap);
                }
            });
            for (var i = 0; i < menus.length; i++) {
                ctxMenu.addChild(new dijit.MenuItem({
                    label: menus[i],
                    onClick: function (evt) {
                        options.contextMenuClickEvent(this.label);
                    }
                }));
            }
            ctxMenu.startup();
            ctxMenu.bindDomNode(flagwindMap.innerMap.container);
        };
        /**
         * 获取菜单单击的坐标信息
         *
         * @param {any} box
         * @returns {*}
         * @memberof FlagwindMap
         */
        EsriMapService.prototype.getMapPointFromMenuPosition = function (box, map) {
            var x = box.x, y = box.y;
            switch (box.corner) {
                case "TR":
                    x += box.w;
                    break;
                case "BL":
                    y += box.h;
                    break;
                case "BR":
                    x += box.w;
                    y += box.h;
                    break;
            }
            var screenPoint = new esri.geometry.Point(x - map.position.x, y - map.position.y);
            return map.toMap(screenPoint);
        };
        /**
         * tileInfo必须是单例模式，否则地图无法正常显示
         *
         * @returns
         * @memberof FlagwindMap
         */
        EsriMapService.prototype.getTileInfo = function (flagwindMap) {
            if (flagwindMap.tileInfo)
                return flagwindMap.tileInfo;
            // tslint:disable-next-line:align
            var tileInfo = new esri.layers.TileInfo({
                "dpi": 96,
                "spatialReference": flagwindMap.spatial,
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -2.0037508342787E7,
                    "y": 2.0037508342787E7,
                    "spatialReference": flagwindMap.spatial
                },
                "lods": [
                    {
                        "level": "0",
                        "scale": 5.91657527591555E8,
                        "resolution": 156543.03392800014
                    },
                    {
                        "level": "1",
                        "scale": 2.95828763795777E8,
                        "resolution": 78271.51696399994
                    },
                    {
                        "level": "2",
                        "scale": 1.47914381897889E8,
                        "resolution": 39135.75848200009
                    },
                    {
                        "level": "3",
                        "scale": 7.3957190948944E7,
                        "resolution": 19567.87924099992
                    },
                    {
                        "level": "4",
                        "scale": 3.6978595474472E7,
                        "resolution": 9783.93962049996
                    },
                    {
                        "level": "5",
                        "scale": 1.8489297737236E7,
                        "resolution": 4891.96981024998
                    },
                    {
                        "level": "6",
                        "scale": 9244648.868618,
                        "resolution": 2445.98490512499
                    },
                    {
                        "level": "7",
                        "scale": 4622324.434309,
                        "resolution": 1222.992452562495
                    },
                    {
                        "level": "8",
                        "scale": 2311162.217155,
                        "resolution": 611.4962262813797
                    },
                    {
                        "level": "9",
                        "scale": 305.74811314055756,
                        "resolution": 1155581.108577
                    },
                    {
                        "level": "10",
                        "scale": 577790.554289,
                        "resolution": 152.87405657041106
                    },
                    {
                        "level": "11",
                        "scale": 288895.277144,
                        "resolution": 76.43702828507324
                    },
                    {
                        "level": "12",
                        "scale": 144447.638572,
                        "resolution": 38.21851414253662
                    },
                    {
                        "level": "13",
                        "scale": 72223.819286,
                        "resolution": 19.10925707126831
                    },
                    {
                        "level": "14",
                        "scale": 36111.909643,
                        "resolution": 9.554628535634155
                    },
                    {
                        "level": "15",
                        "scale": 18055.954822,
                        "resolution": 4.77731426794937
                    },
                    {
                        "level": "16",
                        "scale": 9027.977411,
                        "resolution": 2.388657133974685
                    },
                    {
                        "level": "17",
                        "scale": 4513.988705,
                        "resolution": 1.1943285668550503
                    },
                    {
                        "level": "18",
                        "scale": 2256.994353,
                        "resolution": 0.5971642835598172
                    },
                    {
                        "level": "19",
                        "scale": 1128.497176,
                        "resolution": 0.29858214164761665
                    }
                ]
            });
            flagwindMap.tileInfo = tileInfo;
            console.log(tileInfo);
            return tileInfo;
        };
        return EsriMapService;
    }());
    flagwind.EsriMapService = EsriMapService;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.flagwindRouteOptions = {
        routeType: "Line",
        onLineStartEvent: function (lineName, segmentIndex, trackLine) {
            console.log("onLineStartEvent");
        },
        onLineEndEvent: function (lineName, segmentIndex, trackLine) {
            console.log("onLineEndEvent");
        },
        onMoveEvent: function (lineName, segmentIndex, xy, angle) {
            console.log("onMoveEvent");
        },
        onStationEvent: function (lineName, segmentIndex, graphic, enter, trackLine) {
            console.log("onStationEvent");
        }
    };
    flagwind.lineOptions = {
        markerUrl: "",
        markerLabel: "",
        markerHeight: 48,
        markerWidth: 48
    };
    var FlagwindRouteLayer = /** @class */ (function () {
        function FlagwindRouteLayer(flagwindMap, layerName, options) {
            this.flagwindMap = flagwindMap;
            this.layerName = layerName;
            this.options = options;
            // public moveMarkLayer: { graphics: any; remove: (arg0: any) => void; _map: null; clear: () => void; id: any; add: (arg0: any) => void; show: () => void; hide: () => void; };
            this.trackLines = [];
            this.options = __assign({}, flagwind.flagwindRouteOptions, options);
            this.mapService = flagwindMap.mapService;
            this.moveLineLayer = new flagwind.FlagwindGroupLayer(flagwindMap.mapService, layerName + "LineLayer");
            // 移动小车
            this.moveMarkLayer = new flagwind.FlagwindGroupLayer(flagwindMap.mapService, layerName + "MarkerLayer");
            this.onAddLayerBefor();
            this.moveLineLayer.appendTo(this.flagwindMap.innerMap);
            this.moveMarkLayer.appendTo(this.flagwindMap.innerMap);
            this.onAddLayerAfter();
            var me = this;
            // 当地图已经加载时直接执行_onLoad方法
            this.mapService.addEventListener(this.flagwindMap.innerMap, "load", function () {
                me.onLoad();
            });
            // if (this.flagwindMap.innerMap.loaded) {
            //     me.onLoad();
            // } else {
            //     this.flagwindMap.innerMap.on("load", function () {
            //         me.onLoad();
            //     });
            // }
        }
        Object.defineProperty(FlagwindRouteLayer.prototype, "spatial", {
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        FlagwindRouteLayer.prototype.show = function () {
            if (this.moveMarkLayer) {
                this.moveMarkLayer.show();
            }
            if (this.moveLineLayer != null) {
                this.moveLineLayer.show();
            }
        };
        FlagwindRouteLayer.prototype.hide = function () {
            if (this.moveMarkLayer) {
                this.moveMarkLayer.hide();
            }
            if (this.moveLineLayer) {
                this.moveLineLayer.hide();
            }
        };
        /**
         * 获取指定名称的线路
         * @param name 指定名称
         */
        FlagwindRouteLayer.prototype.getTrackLine = function (name) {
            var lines = this.trackLines.filter(function (g) { return g.name === name; });
            return lines && lines.length > 0 ? lines[0] : null;
        };
        /**
         * 向指定线路中增加路段
         */
        FlagwindRouteLayer.prototype.addTrackSegment = function (name, segment, lineOptions) {
            var trackline = this.getTrackLine(name);
            if (!trackline) {
                trackline = new flagwind.TrackLine(this.flagwindMap, name, lineOptions);
                this.trackLines.push(trackline);
            }
            trackline.add(segment);
        };
        /**
         * 计算线路的下一个路段索引
         */
        FlagwindRouteLayer.prototype.getNextSegmentIndex = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.nextSegmentIndex;
            return 0;
        };
        /**
         * 获取线路的下一路段
         */
        FlagwindRouteLayer.prototype.getNextSegment = function (name, index) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.getNextSegment(index);
            return undefined;
        };
        /**
         * 获取线路中的最后一路段
         */
        FlagwindRouteLayer.prototype.getLastSegment = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.lastSegment;
            return undefined;
        };
        /**
         * 获取监控最近播放完成的路段线路
         */
        FlagwindRouteLayer.prototype.getActiveCompletedSegment = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.activeCompletedSegment;
            return undefined;
        };
        /**
         * 判断线路是否在运行
         */
        FlagwindRouteLayer.prototype.getIsRunning = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                return trackline.isRunning;
            }
            else {
                return false;
            }
        };
        /*********************轨迹线路**************************/
        /*********************播放控制**************************/
        FlagwindRouteLayer.prototype.stop = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline != null) {
                trackline.stop();
            }
        };
        /**
         * 启动线路播放（起点为上次播放的终点）
         */
        FlagwindRouteLayer.prototype.move = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                trackline.move();
        };
        /**
         * 启动线路播放（起点为线路的始点）
         */
        FlagwindRouteLayer.prototype.start = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.stop();
                trackline.start();
            }
        };
        /**
         * 暂停
         */
        FlagwindRouteLayer.prototype.pause = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.pause();
            }
        };
        /**
         * 继续
         */
        FlagwindRouteLayer.prototype.continue = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.continue();
            }
        };
        /**
         * 调速
         */
        FlagwindRouteLayer.prototype.changeSpeed = function (name, speed) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.changeSpeed(speed);
            }
        };
        FlagwindRouteLayer.prototype.clear = function (name) {
            if (!name) {
                console.error("没有指定清除的线路名称");
                return;
            }
            var trackline = this.getTrackLine(name);
            if (trackline == null)
                return;
            trackline.stop();
            this.moveMarkLayer.removeGraphicByName(name);
            this.moveLineLayer.removeGraphicByName(name);
            trackline.markerGraphic = null;
        };
        FlagwindRouteLayer.prototype.clearLine = function (name) {
            if (!name) {
                console.error("没有指定清除的线路名称");
                return;
            }
            this.moveLineLayer.removeGraphicByName(name);
        };
        /**
         * 清除所有
         */
        FlagwindRouteLayer.prototype.clearAll = function () {
            this.checkMapSetting();
            for (var i = 0; i < this.trackLines.length; i++) {
                var trackline = this.trackLines[i];
                trackline.stop();
                trackline.reset();
            }
            this.trackLines = [];
            if (this.moveMarkLayer) {
                this.moveMarkLayer.clear();
            }
            if (this.moveLineLayer) {
                this.moveLineLayer.clear();
            }
        };
        /*********************播放控制**************************/
        /**
         * 求解最短路径（与solve不同，它求解的是一个路段，该路段起点为stops[0],终点为stops[stops.length-1]
         *
         * @param {any} name  线路名称
         * @param {any} stops 经过的站点
         * @param {any} options 可选参数
         */
        FlagwindRouteLayer.prototype.solveSegment = function (name, stops, options) {
            options = __assign({}, flagwind.lineOptions, options);
            this.checkMapSetting();
            if (stops.length < 1) {
                throw Error("站点不能少于2");
            }
            var stopGraphics = this.mapService.getStandardStops(name, stops);
            var segment = this.getLastSegment(name);
            var startLineIndex = segment ? segment.index + 1 : 0;
            if (segment) {
                var isEqual = this.equalGraphic(segment.endGraphic, stopGraphics[0]);
                var isNA = this.options.routeType === "NA";
                // 若是网络分析服务且新增的路段与前一路段没有对接上，则增加一个路段用于连接他们
                if (isNA && !isEqual) {
                    this.post(startLineIndex, name, segment.endGraphic, stopGraphics[0], options);
                    startLineIndex += 1;
                }
            }
            var start = stopGraphics.splice(0, 1)[0]; // 从数组中取出第一个
            var end = stopGraphics.splice(stopGraphics.length - 1, 1)[0]; // 从数组中取出最后一个
            var waypoints = stopGraphics; //
            this.post(startLineIndex, name, start, end, options, waypoints);
        };
        /**
         * 发送路由请求
         * @ index:路段索引
         * @ name:线路名称
         * @ start:开始要素
         * @ end:终点要素
         * @ lineOptions:线路控制的参数
         * @ waypoints:经过的点
         */
        FlagwindRouteLayer.prototype.post = function (index, name, start, end, lineOptions, waypoints) {
            if (waypoints === void 0) { waypoints = []; }
            var flagwindRoute = this;
            var trackSegmentOptions = new flagwind.TrackSegmentOptions(lineOptions.numsOfKilometer, lineOptions.speed, lineOptions.autoShowLine);
            trackSegmentOptions.onShowSegmentLineEvent = function (segment) {
                flagwindRoute.onShowSegmentLineEvent(flagwindRoute, segment, lineOptions);
            };
            trackSegmentOptions.onMoveStartEvent = function (segment, graphic, angle) {
                flagwindRoute.onMoveStartEvent(flagwindRoute, segment, graphic, angle);
            };
            trackSegmentOptions.onMoveEvent = function (segment, point, angle) {
                flagwindRoute.onMoveEvent(flagwindRoute, segment, point, angle);
            };
            trackSegmentOptions.onMoveEndEvent = function (segment, graphic, angle) {
                flagwindRoute.onMoveEndEvent(flagwindRoute, segment, graphic, angle);
            };
            var segment = new flagwind.TrackSegment(this, index, name, start, end, trackSegmentOptions);
            if (waypoints) {
                segment.waypoints = waypoints;
            }
            this.addTrackSegment(name, segment, lineOptions);
            if (this.options.routeType === "NA") {
                this.solveByService(segment, start, end, waypoints);
            }
            else {
                this.solveByJoinPoint(segment);
            }
        };
        /**
         * 由网络分析服务来求解轨迹并播放
         *
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        FlagwindRouteLayer.prototype.solveByService = function (segment, start, end, waypoints) {
            this.mapService.solveByService(this, segment, start, end, waypoints);
        };
        /**
         * 由连线求解轨迹
         * @param segment
         */
        FlagwindRouteLayer.prototype.solveByJoinPoint = function (segment) {
            this.mapService.solveByJoinPoint(this, segment);
        };
        /**
         * 路由分析完成回调
         */
        FlagwindRouteLayer.prototype.solveComplete = function (options, segment) {
            var polyline = options.polyline;
            var length = options.length;
            // 设置路段播放线路信息
            segment.setPolyLine(polyline, length);
            this.onCreateSegmentLineComplete(segment);
        };
        /**
         * 路由分析失败回调
         */
        FlagwindRouteLayer.prototype.errorHandler = function (err, segment) {
            console.log("路由分析异常" + err + "");
            var points = [];
            points.push(segment.startGraphic.geometry);
            if (segment.waypoints) {
                for (var i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }
            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setLine(points);
            this.onCreateSegmentLineComplete(segment);
        };
        /**
         * 线段创建完成事件回调
         * @param {*} segment
         */
        FlagwindRouteLayer.prototype.onCreateSegmentLineComplete = function (segment) {
            console.log();
        };
        // 检测地图设置，防止图层未加载到地图上
        FlagwindRouteLayer.prototype.checkMapSetting = function () {
            // if (this.moveMarkLayer._map == null) {
            //     this.moveMarkLayer = this.flagwindMap.innerMap.getLayer(this.moveMarkLayer.id);
            // }
        };
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        FlagwindRouteLayer.prototype.changeMovingGraphicSymbol = function (trackline, point, angle) {
            if (trackline === undefined)
                return;
            var symbol = trackline.markerGraphic.symbol;
            symbol.setAngle(360 - angle);
            trackline.markerGraphic.setSymbol(symbol);
            trackline.markerGraphic.setGeometry(point);
            trackline.markerGraphic.draw(); // 重绘
        };
        /**
         *
         * 显示路段事件
         *
         * @protected
         * @memberof flagwindRoute
         */
        FlagwindRouteLayer.prototype.onShowSegmentLineEvent = function (flagwindRoute, segment, lineOptions) {
            // 是否自动显示轨迹
            if (lineOptions.autoShowSegmentLine) {
                if (!segment.lineGraphic) {
                    flagwindRoute.showSegmentLine(segment);
                }
            }
            if (lineOptions.onShowSegmentLineEvent) {
                lineOptions.onShowSegmentLineEvent(segment);
            }
        };
        /**
         * 线段播放开始事故
         */
        FlagwindRouteLayer.prototype.onMoveStartEvent = function (flagwindRoute, segment, graphic, angle) {
            var trackline = flagwindRoute.getTrackLine(segment.name);
            if (trackline === undefined) {
                return;
            }
            if (!trackline.markerGraphic) {
                flagwindRoute.createMoveMark(trackline, graphic, angle);
            }
            flagwindRoute.flagwindMap.centerAt(graphic.geometry.x, graphic.geometry.y);
            if (!segment.lineGraphic) {
                flagwindRoute.showSegmentLine(segment);
            }
            flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, true, flagwindRoute.getTrackLine(segment.name));
            if (segment.index === 0) {
                // 线路播放开始事故回调
                this.options.onLineStartEvent(segment.name, segment.index, flagwindRoute.getTrackLine(segment.name));
            }
        };
        /**
         * 线段播放完成事件
         */
        FlagwindRouteLayer.prototype.onMoveEndEvent = function (flagwindRoute, segment, graphic, angle) {
            var nextSegment = flagwindRoute.getNextSegment(segment.name, segment.index);
            var currentLine = flagwindRoute.getTrackLine(segment.name);
            if (nextSegment) {
                flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, false, currentLine);
                // 到达站点
                nextSegment.start();
            }
            else {
                flagwindRoute.options.onStationEvent(segment.name, segment.index, graphic, false, currentLine);
                segment.stop();
                // 如果没有下一条线路，说明线路播放结束，此时调用线路播放结束回调
                flagwindRoute.options.onLineEndEvent(segment.name, segment.index, currentLine);
            }
        };
        /**
         * 移动回调事件
         */
        FlagwindRouteLayer.prototype.onMoveEvent = function (flagwindRoute, segment, xy, angle) {
            var point = this.mapService.createPoint({
                x: parseFloat(xy[0]),
                y: parseFloat(xy[1]),
                spatial: flagwindRoute.flagwindMap.spatial
            });
            var trackline = flagwindRoute.getTrackLine(segment.name);
            if (trackline) {
                flagwindRoute.changeMovingGraphicSymbol(trackline, point, angle);
                flagwindRoute.options.onMoveEvent(segment.name, segment.index, xy, angle);
            }
        };
        FlagwindRouteLayer.prototype.onAddLayerBefor = function () {
            console.log("onAddLayerBefor");
        };
        FlagwindRouteLayer.prototype.onAddLayerAfter = function () {
            console.log("onAddLayerAfter");
        };
        FlagwindRouteLayer.prototype.onLoad = function () {
            var me = this;
            this.mapService.addEventListener(this.moveMarkLayer, "onClick", function (evt) {
                if (me.options.onMovingClick) {
                    me.options.onMovingClick(evt);
                }
            });
        };
        return FlagwindRouteLayer;
    }());
    flagwind.FlagwindRouteLayer = FlagwindRouteLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-route.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriRouteLayer = /** @class */ (function (_super) {
        __extends(EsriRouteLayer, _super);
        function EsriRouteLayer(flagwindMap, layerName, options) {
            var _this = _super.call(this, flagwindMap, layerName, options) || this;
            _this.flagwindMap = flagwindMap;
            _this.layerName = layerName;
            _this.options = options;
            // public moveMarkLayer: { graphics: any; remove: (arg0: any) => void; _map: null; clear: () => void; id: any; add: (arg0: any) => void; show: () => void; hide: () => void; };
            _this.trackLines = [];
            return _this;
        }
        EsriRouteLayer.prototype.showSegmentLine = function (segment) {
            var playedLineSymbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
            segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
                type: "segment",
                index: segment.index,
                line: segment.name
            });
            this.moveLineLayer.addGraphice(segment.name, [segment.lineGraphic]);
        };
        EsriRouteLayer.prototype.createMoveMark = function (trackline, graphic, angle) {
            return this.mapService.getTrackLineMarkerGraphic(trackline, graphic, angle);
        };
        EsriRouteLayer.prototype.equalGraphic = function (originGraphic, targetGraphic) {
            return flagwind.MapUtils.isEqualPoint(originGraphic.geometry, targetGraphic.geometry);
        };
        /**
         * 由网络分析服务来求解轨迹并播放
         *
         * @param {TrackSegment} segment 要播放的路段
         * @param {*} start 起点要素
         * @param {*} end 终点要素
         * @param {any[]} [waypoints] 途经要素点
         * @memberof flagwindRoute
         */
        EsriRouteLayer.prototype.solveByService = function (segment, start, end, waypoints) {
            this.mapService.solveByService(this, segment, start, end, waypoints);
        };
        /**
         * 由连线求解轨迹
         * @param segment
         */
        EsriRouteLayer.prototype.solveByJoinPoint = function (segment) {
            this.mapService.solveByJoinPoint(this, segment);
        };
        return EsriRouteLayer;
    }(flagwind.FlagwindRouteLayer));
    flagwind.EsriRouteLayer = EsriRouteLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var EsriRouteService = /** @class */ (function () {
        function EsriRouteService(flagwindRouteLayer) {
            this.flagwindRouteLayer = flagwindRouteLayer;
        }
        EsriRouteService.prototype.showSegmentLine = function (segment) {
            var playedLineSymbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
            segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
                type: "segment",
                index: segment.index,
                line: segment.name
            });
            this.flagwindRouteLayer.moveLineLayer.addGraphice(segment.name, [segment.lineGraphic]);
            // this.moveLineLayer.add(segment.lineGraphic);
        };
        /**
         * 由连线求解轨迹
         * @param segment
         */
        EsriRouteService.prototype.solveByJoinPoint = function (segment) {
            var points = [];
            points.push(segment.startGraphic.geometry);
            if (segment.waypoints) {
                for (var i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }
            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setLine(points);
        };
        EsriRouteService.prototype.solveByService = function (segment, start, end, waypoints) {
            var routeTask = new esri.tasks.RouteTask(this.flagwindRouteLayer.options.routeUrl);
            var routeParams = new esri.tasks.RouteParameters();
            routeParams.stops = new esri.tasks.FeatureSet();
            routeParams.returnRoutes = true;
            routeParams.returnDirections = true;
            routeParams.directionsLengthUnits = esri.Units.MILES;
            routeParams.outSpatialReference = this.getSpatialReferenceFormNA();
            var flagwindRoute = this.flagwindRouteLayer;
            routeTask.on("solve-complete", function (evt) {
                var routeResult = evt.result.routeResults[0];
                var polyline = routeResult.route.geometry;
                var length = routeResult.directions.totalLength;
                flagwindRoute.solveComplete({ polyline: polyline, length: length }, segment);
            });
            routeTask.on("error", function (err) {
                flagwindRoute.errorHandler(err, segment);
            });
            // 起点
            routeParams.stops.features.push(this.cloneStopGraphic(start));
            // 途径点
            if (waypoints) {
                for (var i = 0; i < waypoints.length; i++) {
                    routeParams.stops.features.push(this.cloneStopGraphic(waypoints[i]));
                }
            }
            // 终点
            routeParams.stops.features.push(this.cloneStopGraphic(end));
            routeTask.solve(routeParams);
        };
        EsriRouteService.prototype.setSegmentByLine = function (options, segment) {
            var points = options.points;
            var spatial = options.spatial || segment.flagwindRouteLayer.spatial;
            // 每公里抽取的点数
            var numsOfKilometer = segment.options.numsOfKilometer;
            if (numsOfKilometer === undefined) {
                numsOfKilometer = 20;
            }
            var polyline = new esri.geometry.Polyline(spatial);
            for (var i = 0; i < points.length - 1; i++) {
                var start = points[i], end = points[i + 1];
                var tmppolyline = (new esri.geometry.Polyline(spatial)).addPath([start, end]);
                // 求两点之间距离
                var length_1 = this.getLength(tmppolyline, esri.Units.KILOMETERS);
                var tmppoints = EsriRouteService.extractPoints(start, end, length_1 * numsOfKilometer);
                polyline.addPath(tmppoints);
            }
            segment.polyline = polyline;
            segment.length = this.getLength(polyline, esri.Units.KILOMETERS);
            segment.line = EsriRouteService.vacuate(polyline.paths, segment.length, numsOfKilometer);
        };
        EsriRouteService.prototype.setSegmentByPolyLine = function (options, segment) {
            segment.polyline = options.polyline;
            segment.length = length; // egMapUtils.getPolylineDistance(graphic);
            if (segment.polyline.paths.length > 0) {
                var paths = segment.polyline.paths;
                // 每公里抽取的点数
                var numsOfKilometer = segment.options.numsOfKilometer;
                if (numsOfKilometer === undefined) {
                    numsOfKilometer = 100;
                }
                segment.line = EsriRouteService.vacuate(paths, segment.length, numsOfKilometer);
            }
        };
        EsriRouteService.prototype.getSpatialReferenceFormNA = function () {
            return new esri.SpatialReference({ wkid: this.flagwindRouteLayer.flagwindMap.spatial.wkid });
        };
        EsriRouteService.prototype.cloneStopGraphic = function (graphic) {
            return new esri.Graphic(graphic.geometry, graphic.symbol, {
                type: graphic.attributes.type,
                line: graphic.attributes.line
            });
        };
        EsriRouteService.prototype.getLength = function (tmppolyline, units) {
            var length = esri.geometry.geodesicLengths([tmppolyline], units)[0];
            return this.flagwindRouteLayer.flagwindMap.mapSetting.units * length;
        };
        /**
         * 把一个直线，切成多个点
         * @param start 始点
         * @param end 终点
         * @param n 点数
         */
        EsriRouteService.extractPoints = function (start, end, n) {
            var resList = [];
            if (n === 0) {
                resList.push({ x: start.x, y: start.y });
                resList.push({ x: end.x, y: end.y });
                return resList;
            }
            var xDiff = (end.x - start.x) / n;
            var yDiff = (end.y - start.y) / n;
            for (var j = 0; j < n; j++) {
                resList.push({ x: start.x + j * xDiff, y: start.y + j * yDiff });
            }
            resList.push({ x: end.x, y: end.y });
            return resList;
        };
        /**
         * 线段抽稀操作
         * @param paths  线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        EsriRouteService.vacuate = function (paths, length, numsOfKilometer) {
            if (numsOfKilometer === 0) {
                var startPath = paths[0];
                var endPath = paths[paths.length - 1];
                return [startPath[0], endPath[endPath.length - 1]];
            }
            var points = [];
            for (var i = 0; i < paths.length; i++) {
                points = points.concat(paths[i]);
            }
            var total = length * (numsOfKilometer);
            if (points.length > total) {
                var s = 0;
                var interval = Math.max(Math.floor(points.length / total), 1);
                var sLine = [];
                while (s < total) {
                    sLine.push(points[s]);
                    s += interval;
                }
                if (s !== points.length - 1) {
                    sLine.push(points[points.length - 1]);
                }
                return sLine;
            }
            return points;
        };
        /**
         * 线路上移动要素的构建（子）
         */
        EsriRouteService.getTrackLineMarkerGraphic = function (trackline, graphic, angle) {
            var markerUrl = trackline.options.markerUrl;
            var markerHeight = trackline.options.markerHeight || 48;
            var markerWidth = trackline.options.markerWidth || 48;
            var symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
            return new esri.Graphic(graphic.geometry, symbol, { type: "marker", line: trackline.name });
        };
        /**
         * 标准化停靠点
         */
        EsriRouteService.getStandardStops = function (name, stops, stopSymbol) {
            if (stopSymbol == null) {
                stopSymbol = new esri.symbol.SimpleMarkerSymbol()
                    .setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS)
                    .setSize(15).outline.setWidth(3);
            }
            var stopGraphics = [];
            for (var i = 0; i < stops.length; i++) {
                if (stops[i] instanceof Array) {
                    stopGraphics.push(new esri.Graphic(new esri.geometry.Point(stops[i][0], stops[i][1]), stopSymbol, { type: "stop", line: name }));
                }
                else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                    stopGraphics.push(new esri.Graphic(stops[i], stopSymbol, { type: "stop", line: name }));
                }
                else {
                    stopGraphics.push(new esri.Graphic(stops[i].geometry, stopSymbol, { type: "stop", model: stops[i].attributes, line: name }));
                }
            }
            return stopGraphics;
        };
        return EsriRouteService;
    }());
    flagwind.EsriRouteService = EsriRouteService;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.deviceLayerOptions = {
        onLayerClick: function (evt) {
            console.log("onLayerClick");
        },
        onMapLoad: function () {
            console.log("onMapLoad");
        },
        onEvent: function (eventName, evt) {
            console.log("onEvent");
        },
        onCheck: function (evt) {
            console.log("onCheck");
        },
        onEditInfo: function (evt, isSave) {
            console.log("onEditInfo");
        },
        enableEdit: true,
        enableSelectMode: false,
        selectMode: 1,
        showTooltipOnHover: true,
        showInfoWindow: true
    };
    var DeviceLayer = /** @class */ (function (_super) {
        __extends(DeviceLayer, _super);
        function DeviceLayer(flagwindMap, id, options) {
            var _this = _super.call(this, flagwindMap.mapService, id, options.title || "设备图层") || this;
            _this.flagwindMap = flagwindMap;
            _this.id = id;
            _this.options = options;
            options = __assign({}, flagwind.deviceLayerOptions, options);
            _this.flagwindMap = flagwindMap;
            _this.options = options;
            _this.onInit();
            _this.onAddLayerBefor();
            _this.flagwindMap.addDeviceLayer(_this);
            _this.onAddLayerAfter();
            if (_this.flagwindMap.innerMap.loaded) {
                _this.onLoad();
            }
            else {
                var me_2 = _this;
                _this.flagwindMap.innerMap.on("load", function () {
                    me_2.onLoad();
                });
            }
            return _this;
        }
        Object.defineProperty(DeviceLayer.prototype, "map", {
            // /**
            //  * 获取资源图标
            //  */
            // public abstract getIconUrl(info: any): void;
            // public abstract getGraphicWidth(level: number | null): number;
            // public abstract getGraphicHeight(level: number | null): number;
            get: function () {
                return this.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DeviceLayer.prototype, "spatial", {
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        DeviceLayer.prototype.gotoCenterById = function (key) {
            var graphic = this.getGraphicById(key);
            var pt = this.getPoint(graphic.attributes);
            this.map.centerAt(pt).then(function () {
                console.log(pt);
            });
        };
        DeviceLayer.prototype.saveGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.saveGraphicByDevice(dataList[i]);
            }
        };
        DeviceLayer.prototype.updateGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.updateGraphicByDevice(dataList[i]);
            }
        };
        // 设置选择状态
        DeviceLayer.prototype.setSelectStatusByDevices = function (dataList) {
            this.clearSelectStatus();
            for (var i = 0; i < dataList.length; i++) {
                var model = this.changeStandardModel(dataList[i]);
                var graphic = this.getGraphicById(model.id);
                if (graphic) {
                    this.setSelectStatus(graphic, true);
                }
            }
        };
        /**
         * 保存要素（如果存在，则修改，否则添加）
         */
        DeviceLayer.prototype.saveGraphicByDevice = function (item) {
            var graphic = this.getGraphicById(item.id);
            if (graphic) {
                return this.updateGraphicByDevice(item, graphic);
            }
            else {
                return this.addGraphicByDevice(item);
            }
        };
        DeviceLayer.prototype.addGraphicByDevice = function (item) {
            var graphic = this.creatGraphicByDevice(item);
            this.layer.add(graphic);
        };
        DeviceLayer.prototype.creatGraphicByDevice = function (item) {
            item = this.changeStandardModel(item);
            if (!this.validDevice(item)) {
                return null;
            }
            item.select = false; // select属性为true表示当前选中，false表示未选中
            var graphic = this.onCreatGraphicByDevice(item);
            // const pt = this.getPoint(item);
            // const iconUrl = this.getIconUrl(item);
            // const width = this.getGraphicWidth(null);
            // const height = this.getGraphicHeight(null);
            // const markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            // const graphic = new esri.Graphic(pt, markerSymbol, item);
            return graphic;
        };
        /**
         * 修改要素
         */
        DeviceLayer.prototype.updateGraphicByDevice = function (item, graphic) {
            if (graphic === void 0) { graphic = null; }
            item = this.changeStandardModel(item);
            if (!this.validDevice(item)) {
                return;
            }
            if (!graphic) {
                graphic = this.getGraphicById(item.id);
            }
            if (graphic == null) {
                return;
            }
            var pt = this.getPoint(item);
            this.onUpdateGraphicByDevice(item);
            // const iconUrl = this.getIconUrl(item);
            // graphic.setSymbol(new esri.symbol.PictureMarkerSymbol(
            //     iconUrl,
            //     this.getGraphicWidth(null),
            //     this.getGraphicHeight(null)));
            // graphic.setGeometry(pt);
            // graphic.attributes = item;
            // graphic.draw(); // 重绘
            return pt;
        };
        DeviceLayer.prototype.clearSelectStatus = function () {
            var graphics = this.layer.graphics;
            for (var i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected) {
                    this.setSelectStatus(graphics[i], false);
                }
            }
        };
        DeviceLayer.prototype.getSelectedGraphics = function () {
            return this.layer.graphics.filter(function (g) { return g.attributes && g.attributes.selected; });
        };
        /**
         * 创建点要素（把业务数据的坐标转换成地图上的点）
         */
        DeviceLayer.prototype.getPoint = function (item) {
            return this.flagwindMap.getPoint(item);
        };
        /**
         * 把地图上的点转换成业务的坐标
         * @param {*} point
         */
        DeviceLayer.prototype.formPoint = function (point) {
            return this.flagwindMap.formPoint(point);
        };
        DeviceLayer.prototype.onAddLayerBefor = function () {
            console.log("onAddLayerBefor");
        };
        DeviceLayer.prototype.onAddLayerAfter = function () {
            console.log("onAddLayerAfter");
        };
        DeviceLayer.prototype.onInit = function () {
            console.log("onInit");
        };
        DeviceLayer.prototype.onLoad = function () {
            if (!this.layer._map) {
                this.layer._map = this.flagwindMap.innerMap;
            }
            this.registerEvent();
            this.onMapLoad();
        };
        DeviceLayer.prototype.onMapLoad = function () {
            this.options.onMapLoad();
        };
        DeviceLayer.prototype.registerEvent = function () {
            var _deviceLayer = this;
            this.addEventListener(this.layer, "onClick", function (evt) {
                _deviceLayer.onLayerClick(_deviceLayer, evt);
            });
            if (this.options.showTooltipOnHover) {
                this.addEventListener(this.layer, "onMouseOver", function (evt) {
                    _deviceLayer.flagwindMap.showTitle(evt.graphic);
                });
                this.addEventListener(this.layer, "onMouseOut", function (evt) {
                    _deviceLayer.flagwindMap.hideTitle();
                });
            }
        };
        DeviceLayer.prototype.onLayerClick = function (deviceLayer, evt) {
            if (deviceLayer.options.onLayerClick) {
                deviceLayer.options.onLayerClick(evt);
            }
            if (deviceLayer.options.showInfoWindow) {
                evt.graphic.attributes.eventName = "";
                deviceLayer.showInfoWindow(evt);
            }
            if (deviceLayer.options.enableSelectMode) {
                if (deviceLayer.options.selectMode === 1) {
                    var item = evt.graphic.attributes;
                    if (evt.graphic.attributes.selected) {
                        deviceLayer.setSelectStatus(item, false);
                    }
                    else {
                        deviceLayer.setSelectStatus(item, true);
                    }
                }
                else {
                    deviceLayer.clearSelectStatus();
                    var item = evt.graphic.attributes;
                    deviceLayer.setSelectStatus(item, true);
                }
                console.log("check-------" + evt.graphic.attributes);
                deviceLayer.options.onCheck({
                    target: [evt.graphic.attributes],
                    check: evt.graphic.attributes.selected,
                    selectGraphics: deviceLayer.getSelectedGraphics()
                });
            }
        };
        DeviceLayer.prototype.fireEvent = function (eventName, event) {
            this.options.onEvent(eventName, event);
        };
        DeviceLayer.prototype.validDevice = function (item) {
            return item.longitude && item.latitude;
        };
        /**
         * 变换成标准实体（最好子类重写）
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindDeviceLayer
         */
        DeviceLayer.prototype.changeStandardModel = function (item) {
            if (item.tollLongitude && item.tollLatitude) {
                item.id = item.tollCode;
                item.name = item.tollName;
                item.longitude = item.tollLongitude;
                item.latitude = item.tollLatitude;
            }
            return item;
        };
        DeviceLayer.prototype.setSelectStatus = function (item, selected) {
            item.selected = selected;
            this.onUpdateGraphicByDevice(item);
        };
        return DeviceLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.DeviceLayer = DeviceLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.editLayerOptions = {
        onEditInfo: function (key, lon, lat, isSave) {
            console.log("onEditInfo");
        }
    };
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    // tslint:disable-next-line:variable-name
    flagwind.flagwindMapOptions = {
        onMapLoad: function () {
            console.log("onMapLoad");
        },
        onMapZoomEnd: function (level) {
            console.log("onMapZoomEnd");
        },
        onMapClick: function (evt) {
            console.log("onMapClick");
        }
    };
    var FlagwindMap = /** @class */ (function () {
        function FlagwindMap(mapService, mapSetting, mapEl, options) {
            this.mapService = mapService;
            this.mapSetting = mapSetting;
            this.baseLayers = [];
            this.featureLayers = [];
            this.mapEl = mapEl;
            this.options = __assign({}, flagwind.flagwindMapOptions, options);
            this.createMap();
            this.createBaseLayer();
            var _this = this;
            mapService.addEventListener(_this.innerMap, "onLoad", function () {
                try {
                    _this.goToCenter();
                    _this.onMapLoad();
                }
                catch (ex) {
                    console.error(ex);
                }
            });
            mapService.addEventListener(_this.innerMap, "zoom-end", function (evt) {
                _this.onMapZoomEnd(evt);
            });
        }
        FlagwindMap.prototype.goToCenter = function () {
            if (this.mapSetting.center && this.mapSetting.center.length === 2) {
                var pt = this.getPoint({
                    x: this.mapSetting.center[0],
                    y: this.mapSetting.center[1]
                });
                this.mapService.centerAt(pt, this.innerMap);
            }
        };
        FlagwindMap.prototype.getBaseLayerById = function (id) {
            var layers = this.baseLayers.filter(function (g) { return g.id === id; });
            if (layers && layers.length > 0) {
                return layers[0];
            }
            return null;
        };
        FlagwindMap.prototype.formPoint = function (point) {
            var lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            return this.mapService.formPoint(lnglat, this);
        };
        /**
         * 中心定位
         */
        FlagwindMap.prototype.centerAt = function (x, y) {
            var pt = this.mapService.createPoint({
                x: x,
                y: y,
                spatial: this.spatial
            });
            this.mapService.centerAt(pt, this.innerMap);
        };
        /**
         *
         * 创建菜单
         *
         * @param {{ contextMenu: any[], contextMenuClickEvent: any }} options
         * @memberof FlagwindMap
         */
        FlagwindMap.prototype.createContextMenu = function (options) {
            this.mapService.createContextMenu(options, this);
        };
        /**
         * 创建点要素
         */
        FlagwindMap.prototype.getPoint = function (item) {
            var lnglat = { "lat": item.latitude || item.lat, "lon": item.longitude || item.lon };
            if (!flagwind.MapUtils.validDevice(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }
            return this.mapService.toPoint(lnglat, this);
        };
        FlagwindMap.prototype.createBaseLayer = function () {
            var _this = this;
            var layers = this.mapService.createBaseLayer(this);
            layers.forEach(function (g) {
                g.appendTo(_this.innerMap);
            });
        };
        FlagwindMap.prototype.addDeviceLayer = function (deviceLayer) {
            if (this.getFeatureLayerById(deviceLayer.id)) {
                throw Error("图层" + deviceLayer.id + "已存在");
            }
            this.featureLayers.push(deviceLayer);
            deviceLayer.appendTo(this.innerMap);
        };
        /**
         * 鼠标移动到点要素时显示title
         */
        FlagwindMap.prototype.showTitle = function (graphic) {
            this.mapService.showTitle(graphic, this);
        };
        FlagwindMap.prototype.hideTitle = function () {
            this.mapService.hideTitle(this);
        };
        FlagwindMap.prototype.onMapLoad = function () {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }
            var me = this;
            this.mapService.addEventListener(this.innerMap, "click", function (evt) {
                me.options.onMapClick(evt);
            });
        };
        FlagwindMap.prototype.showBaseLayer = function (id) {
            var layer = this.getBaseLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        };
        FlagwindMap.prototype.getFeatureLayerById = function (id) {
            var layers = this.featureLayers.filter(function (g) { return g.id === id; });
            return layers != null && layers.length > 0 ? layers[0] : null;
        };
        FlagwindMap.prototype.addFeatureLayer = function (id, title) {
            if (this.getFeatureLayerById(id)) {
                throw Error("图层" + id + "已存在");
            }
            var layer = new flagwind.FlagwindFeatureLayer(this.mapService, id, title);
            this.featureLayers.push(layer);
            layer.appendTo(this.innerMap);
        };
        FlagwindMap.prototype.showFeatureLayer = function (id) {
            var layer = this.getFeatureLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        };
        FlagwindMap.prototype.removeFeatureLayer = function (id) {
            var flayer = this.getFeatureLayerById(id);
            if (flayer) {
                flayer.removeLayer(this.innerMap);
                var i = this.featureLayers.indexOf(flayer);
                this.featureLayers.splice(i, 1);
                return true;
            }
            return false;
        };
        Object.defineProperty(FlagwindMap.prototype, "map", {
            // public get infoWindow() {
            //     return this.mapService.getInfoWindow(this.innerMap);
            // }
            get: function () {
                return this.innerMap;
            },
            enumerable: true,
            configurable: true
        });
        FlagwindMap.prototype.onMapZoomEnd = function (evt) {
            this.options.onMapZoomEnd(evt.level);
        };
        FlagwindMap.prototype.createMap = function () {
            this.spatial = this.mapService.createSpatial(this.mapSetting.wkid);
            var map = this.mapService.createMap(this.mapSetting, this);
            this.innerMap = map;
        };
        return FlagwindMap;
    }());
    flagwind.FlagwindMap = FlagwindMap;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var TrackSegmentOptions = /** @class */ (function () {
        function TrackSegmentOptions(numsOfKilometer, speed, autoShowLine) {
            if (speed === void 0) { speed = 100; }
            if (autoShowLine === void 0) { autoShowLine = false; }
            this.numsOfKilometer = numsOfKilometer;
            this.speed = speed;
            this.autoShowLine = autoShowLine;
        }
        TrackSegmentOptions.prototype.onShowSegmentLineEvent = function (segment) {
            console.log("onShowSegmentLineEvent");
        };
        TrackSegmentOptions.prototype.onMoveStartEvent = function (target, startGraphic, angle) {
            console.log("onMoveStartEvent");
        };
        TrackSegmentOptions.prototype.onMoveEndEvent = function (target, endGraphic, angle) {
            console.log("onMoveEndEvent");
        };
        TrackSegmentOptions.prototype.onMoveEvent = function (target, point, angle) {
            console.log("onMoveEvent");
        };
        return TrackSegmentOptions;
    }());
    flagwind.TrackSegmentOptions = TrackSegmentOptions;
    /**
     * 对轨迹播放中线路的路段的定义
     *
     * @export
     * @class TrackSegment
     */
    var TrackSegment = /** @class */ (function () {
        function TrackSegment(flagwindRouteLayer, index, // 线路对应路段索引
            name, // 线路名
            startGraphic, // 起点要素
            endGraphic, // 终点要素
            options) {
            this.flagwindRouteLayer = flagwindRouteLayer;
            this.index = index;
            this.name = name;
            this.startGraphic = startGraphic;
            this.endGraphic = endGraphic;
            this.options = options;
            this.position = -1;
            this.isCompleted = false;
            this.isRunning = false;
            this.time = 200;
            /**
             *
             * 途经的点
             *
             * @type {any[]}
             * @memberof TrackSegment
             */
            this.waypoints = [];
            this.options = options;
            this.mapService = flagwindRouteLayer.mapService;
        }
        /**
         * 设置拆线
         */
        TrackSegment.prototype.setPolyLine = function (polyline, length) {
            this.mapService.setSegmentByPolyLine(this.flagwindRouteLayer, {
                polyline: polyline,
                length: length
            }, this);
            if (!this.speed)
                this.changeSpeed();
            this.options.onShowSegmentLineEvent(this);
        };
        /**
         * 设置直线
         */
        TrackSegment.prototype.setLine = function (points) {
            this.mapService.setSegmentByLine(this.flagwindRouteLayer, {
                points: points,
                spatial: this.flagwindRouteLayer.flagwindMap.spatial
            }, this);
            if (!this.speed)
                this.changeSpeed();
            console.debug("路段" + this.index + "长度：" + this.length + "km");
            console.debug("路段" + this.index + "取点：" + this.line.length + "个");
            console.debug("路段" + this.index + "速度：" + this.speed + "km/h");
            console.debug("路段" + this.index + "定时：" + this.time + "ms");
            this.options.onShowSegmentLineEvent(this);
        };
        TrackSegment.prototype.changeSpeed = function (speed) {
            if (speed === void 0) { speed = null; }
            if (this.options.numsOfKilometer === 0) {
                this.speed = 10000000;
                this.time = 1;
            }
            else {
                this.speed = (speed || this.options.speed);
                this.time = (this.length || 0) * 3600 / ((this.speed || 100) * 15 * this.line.length);
            }
            // 若正在跑，则暂停，改变速度后再执行
            if (this.timer) {
                this.pause();
                this.start();
            }
        };
        TrackSegment.prototype.move = function (segment) {
            segment.position = segment.position + 1;
            var angle = 0;
            if (segment.position === 0) {
                if (segment.line.length > 1) {
                    angle = flagwind.MapUtils.getAngle(segment.startGraphic.geometry, {
                        x: segment.line[0][0], y: segment.line[0][1]
                    }) || 0;
                }
                segment.options.onMoveStartEvent(segment, segment.startGraphic, angle);
                segment.options.onMoveEvent(segment, [segment.startGraphic.geometry.x, segment.startGraphic.geometry.y], angle);
                return;
            }
            if (segment.position >= segment.line.length) {
                if (this.line.length > 1) {
                    angle = flagwind.MapUtils.getAngle({
                        x: this.line[segment.line.length - 1][0],
                        y: this.line[segment.line.length - 1][1]
                    }, this.endGraphic.geometry) || 0;
                }
                segment.isCompleted = true;
                segment.stop();
                segment.options.onMoveEvent(segment, [segment.endGraphic.geometry.x, segment.endGraphic.geometry.y], angle);
                segment.options.onMoveEndEvent(segment, segment.endGraphic, angle);
                return;
            }
            angle = flagwind.MapUtils.getAngle({
                x: this.line[this.position - 1][0],
                y: this.line[this.position - 1][1]
            }, {
                x: this.line[this.position][0],
                y: this.line[this.position][1]
            });
            var xx = parseFloat(segment.line[this.position - 1][0]).toFixed(5);
            var yy = parseFloat(segment.line[this.position - 1][1]).toFixed(5);
            segment.options.onMoveEvent(segment, [xx, yy], angle);
        };
        TrackSegment.prototype.start = function () {
            // if (!this.line) return false;
            this.isRunning = true;
            var _segment = this;
            _segment.timer = window.setInterval(function () {
                if (!_segment.line) {
                    console.log("线路" + _segment.name + "的第" + (_segment.index + 1) + "路段等待设置");
                }
                else {
                    _segment.move(_segment);
                }
            }, _segment.time);
            return true;
        };
        Object.defineProperty(TrackSegment.prototype, "isPaused", {
            /**
             * 当定时器为空，且运行状态为true时表示是暂停
             */
            get: function () {
                return (!this.timer) && this.isRunning;
            },
            enumerable: true,
            configurable: true
        });
        TrackSegment.prototype.pause = function () {
            window.clearInterval(this.timer);
            this.timer = null;
        };
        TrackSegment.prototype.stop = function () {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = null;
            this.isRunning = false;
            this.position = -1;
        };
        TrackSegment.prototype.reset = function () {
            this.timer = null;
            this.isRunning = false;
            this.position = -1;
            this.isCompleted = false;
        };
        return TrackSegment;
    }());
    flagwind.TrackSegment = TrackSegment;
    /**
     * 对轨迹播放中线路的定义（它由多个路段组成）
     *
     * @export
     * @class TrackLine
     */
    var TrackLine = /** @class */ (function () {
        function TrackLine(flagwindMap, name, options) {
            this.flagwindMap = flagwindMap;
            this.name = name;
            this.options = options;
            this.segments = [];
            this.isMovingGraphicHide = false;
            this.mapService = flagwindMap.mapService;
        }
        /**
         * 隐藏移动要素
         *
         * @memberof TrackLine
         */
        TrackLine.prototype.hideMovingGraphic = function () {
            this.isMovingGraphicHide = true;
            this.mapService.hideGraphic(this.markerGraphic);
        };
        /**
         * 显示移动要素
         *
         * @memberof TrackLine
         */
        TrackLine.prototype.showMovingGraphic = function () {
            if (this.isMovingGraphicHide) {
                this.isMovingGraphicHide = false;
                this.mapService.showGraphic(this.markerGraphic);
            }
        };
        Object.defineProperty(TrackLine.prototype, "isRunning", {
            /**
             * 若有一个路段正在跑，代表该线路是正在运行
             */
            get: function () {
                if (this.segments.length === 0)
                    return false;
                for (var i = 0; i < this.segments.length; i++) {
                    var segemtn = this.segments[i];
                    if (segemtn.isRunning === true) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TrackLine.prototype, "isCompleted", {
            /**
             * 当所有的路段完成时，说明线路是跑完状态
             */
            get: function () {
                if (this.segments.length === 0)
                    return false;
                for (var i = 0; i < this.segments.length; i++) {
                    var segemtn = this.segments[i];
                    if (segemtn.isCompleted === false) {
                        return false;
                    }
                }
                return true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 调速
         */
        TrackLine.prototype.changeSpeed = function (speed) {
            if (this.segments.length === 0)
                return;
            for (var i = 0; i < this.segments.length; i++) {
                var segemtn = this.segments[i];
                segemtn.changeSpeed(speed);
            }
        };
        /**
         * 启动线路播放（从第一个路段的起点开始）
         */
        TrackLine.prototype.start = function () {
            if (this.isRunning)
                return;
            var playSegment = this.segments[0];
            for (var i = 0; i < this.segments.length; i++) {
                var segemtn = this.segments[i];
                if (playSegment.index > segemtn.index) {
                    playSegment = segemtn;
                }
            }
            playSegment.start();
        };
        /**
         * 停止线路
         */
        TrackLine.prototype.stop = function () {
            for (var i = 0; i < this.segments.length; i++) {
                var segemtn = this.segments[i];
                segemtn.stop();
            }
        };
        TrackLine.prototype.reset = function () {
            for (var i = 0; i < this.segments.length; i++) {
                var segemtn = this.segments[i];
                segemtn.reset();
            }
        };
        /**
         * 暂停
         */
        TrackLine.prototype.pause = function () {
            for (var i = 0; i < this.segments.length; i++) {
                var segemtn = this.segments[i];
                if (segemtn.isRunning) {
                    segemtn.pause();
                    return;
                }
            }
        };
        /**
         * 继续（与 暂停 是操作对，只能是在调用了暂停 才可以启用它）
         */
        TrackLine.prototype.continue = function () {
            // 若没有路段进行运行，则启动线路
            if (!this.isRunning) {
                this.start();
            }
            // 找到暂停路段，并启动路段
            for (var i = 0; i < this.segments.length; i++) {
                var segemtn = this.segments[i];
                if (segemtn.isRunning && (!segemtn.timer)) {
                    segemtn.start();
                    return;
                }
            }
        };
        /**
         * 移动(起点为上一次的终点，如果之前没有播放过，则从线路的起点开始)
         */
        TrackLine.prototype.move = function () {
            // 若没有路段进行运行，则启动线路
            if (this.isRunning) {
                return;
            }
            var segment = this.activeCompletedSegment;
            var playSegment = null;
            if (!segment) {
                playSegment = this.getSegment(0);
            }
            else {
                playSegment = this.getSegment(segment.index + 1);
            }
            if (playSegment) {
                playSegment.start();
            }
        };
        /**
         * 增加路段
         */
        TrackLine.prototype.add = function (segment) {
            this.segments.push(segment);
        };
        Object.defineProperty(TrackLine.prototype, "nextSegmentIndex", {
            /**
             * 计算线路的下一个路段索引
             */
            get: function () {
                if (this.segments.length === 0)
                    return 0;
                var startLineIndex = 0;
                for (var i = 0; i < this.segments.length; i++) {
                    var rl = this.segments[i];
                    if (rl.index > startLineIndex) {
                        startLineIndex = rl.index;
                    }
                }
                if (startLineIndex > 0) {
                    startLineIndex += 1;
                }
                return startLineIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TrackLine.prototype, "lastSegment", {
            /**
             * 获取最后的一个路段
             */
            get: function () {
                if (this.segments.length === 0)
                    return null;
                var segment = null;
                for (var i = 0; i < this.segments.length; i++) {
                    var rl = this.segments[i];
                    if ((!segment) || rl.index > segment.index) {
                        segment = rl;
                    }
                }
                return segment;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取线路的下一路段
         */
        TrackLine.prototype.getNextSegment = function (index) {
            if (this.segments.length === 0)
                return null;
            return this.getSegment(index + 1);
        };
        /**
         * 获取线路的路段
         */
        TrackLine.prototype.getSegment = function (index) {
            var line = null;
            if (this.segments.length === 0)
                return null;
            for (var i = 0; i < this.segments.length; i++) {
                var rl = this.segments[i];
                if (rl.name === name && rl.index === index) {
                    line = rl;
                }
            }
            return line;
        };
        Object.defineProperty(TrackLine.prototype, "activeCompletedSegment", {
            /**
             * 获取监控最近播放完成的路段线路
             */
            get: function () {
                var line = null;
                if (this.segments.length === 0)
                    return undefined;
                for (var i = 0; i < this.segments.length; i++) {
                    var rl = this.segments[i];
                    if (rl.isCompleted && (line == null || rl.index > line.index)) {
                        line = rl;
                    }
                }
                return line;
            },
            enumerable: true,
            configurable: true
        });
        return TrackLine;
    }());
    flagwind.TrackLine = TrackLine;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.locationLayerOptions = {
        onMapClick: function (evt) {
            console.log("onMapClick");
        }
    };
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MapUtils = /** @class */ (function () {
        function MapUtils() {
        }
        /**
         * 判断原始点坐标与目标点坐标是否一样
         *
         * @static
         * @param {*} originGeometry 原始点
         * @param {*} targetGeometry 要比较的目标点
         * @returns {boolean} true:一样,false:不一样
         * @memberof MapUtils
         */
        MapUtils.isEqualPoint = function (originGeometry, targetGeometry) {
            if ((originGeometry != null) || (targetGeometry != null)) {
                return false;
            }
            return originGeometry.x === targetGeometry.x && originGeometry.y === targetGeometry.y;
        };
        /**
         * 获取角度的方法
         */
        MapUtils.getAngle = function (pt1, pt2) {
            var x1 = pt1.x, y1 = pt1.y;
            var x2 = pt2.x, y2 = pt2.y;
            var x = x2 - x1, y = y2 - y1;
            // 第一象限
            if (x > 0 && y >= 0) {
                return Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            else if (x > 0 && y < 0) {
                return 360 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            else if (x < 0 && y >= 0) {
                return 180 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            else if (x < 0 && y < 0) {
                return 180 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            else if (x === 0) {
                return 90;
            }
            return 0;
        };
        MapUtils.validDevice = function (item) {
            return item.longitude && item.latitude;
        };
        MapUtils.delta = function (lat, lon) {
            var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。  
            var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。  
            var dLat = MapUtils.transformLat(lon - 105.0, lat - 35.0);
            var dLon = MapUtils.transformLon(lon - 105.0, lat - 35.0);
            var radLat = lat / 180.0 * MapUtils.PI;
            var magic = Math.sin(radLat);
            magic = 1 - ee * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * MapUtils.PI);
            dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * MapUtils.PI);
            return { "lat": dLat, "lon": dLon };
        };
        MapUtils.point25To2 = function (x, y) {
            var A = 629486.1;
            var B = 850786;
            var C = 106392700;
            var D = 321586.1;
            var E = 380061.7;
            var F = 23949170;
            var xx = 0;
            var yy = 0;
            // 鞍山项目用加法反解出来,暂时写死
            // if("anshan".equals(projectName)){
            // 	xx = (E * x - B * y + F * B - E * C) / (A * E - B * D);
            // 	yy = (D * x - A * y + A * F - C * D) / (B * D - A * E);
            // }else{
            // 其他
            xx = (E * x - B * y + F * B + E * C) / (A * E + B * D);
            yy = (0 - D * x - A * y + A * F - C * D) / (0 - B * D - A * E);
            // }
            return { "lat": yy, "lon": xx };
        };
        // x 为lng ,y 为lat
        MapUtils.point2To25 = function (x, y) {
            var A = 629486.1;
            var B = 850786;
            var C = 106392700;
            var D = 321586.1;
            var E = 380061.7;
            var F = 23949170;
            var xx = 0;
            var yy = 0;
            // 鞍山项目用加法,暂时写死
            // if("anshan".equals(projectName)){
            // 	xx = A * x + B * y + C;
            // 	yy = E * y + D * x + F;
            // }else{
            xx = A * x + B * y - C;
            yy = E * y - D * x + F;
            // }
            // return MapUtils.mercatorUnproject(xx, yy);
            return { "lat": yy, "lon": xx };
        };
        MapUtils.mercatorUnproject = function (lng, lat) {
            var d = 180 / Math.PI;
            var R_MINOR = 6356752.314245179;
            var r = 6378137;
            var tmp = R_MINOR / r;
            var e = Math.sqrt(1 - tmp * tmp);
            var ts = Math.exp(-lat / r);
            var phi = Math.PI / 2 - 2 * Math.atan(ts);
            var dphi = 0.1;
            var con = 0;
            for (var j = 0; j < 15 && Math.abs(dphi) > 1e-7; j++) {
                con = e * Math.sin(phi);
                con = Math.pow((1 - con) / (1 + con), e / 2);
                dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
                phi += dphi;
            }
            var rstlng = lng * d / r;
            var rstlat = phi * d;
            return { "lat": rstlat, "lon": rstlng };
        };
        /**
         * WGS-84 to GCJ-02
         */
        MapUtils.gcj_encrypt = function (wgsLat, wgsLon) {
            if (MapUtils.outOfChina(wgsLat, wgsLon)) {
                return { "lat": wgsLat, "lon": wgsLon };
            }
            var d = MapUtils.delta(wgsLat, wgsLon);
            return { "lat": wgsLat + d.lat, "lon": wgsLon + d.lon };
        };
        /**
         * GCJ-02 to WGS-84
         */
        MapUtils.gcj_decrypt = function (gcjLat, gcjLon) {
            if (MapUtils.outOfChina(gcjLat, gcjLon)) {
                return { "lat": gcjLat, "lon": gcjLon };
            }
            var d = MapUtils.delta(gcjLat, gcjLon);
            return { "lat": gcjLat - d.lat, "lon": gcjLon - d.lon };
        };
        /**
         * GCJ-02 to WGS-84 exactly
         */
        MapUtils.gcj_decrypt_exact = function (gcjLat, gcjLon) {
            var initDelta = 0.01;
            var threshold = 0.000000001;
            var dLat = initDelta, dLon = initDelta;
            var mLat = gcjLat - dLat, mLon = gcjLon - dLon;
            var pLat = gcjLat + dLat, pLon = gcjLon + dLon;
            var wgsLat, wgsLon, i = 0;
            while (1) {
                wgsLat = (mLat + pLat) / 2;
                wgsLon = (mLon + pLon) / 2;
                var tmp = MapUtils.gcj_encrypt(wgsLat, wgsLon);
                dLat = tmp.lat - gcjLat;
                dLon = tmp.lon - gcjLon;
                if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold)) {
                    break;
                }
                if (dLat > 0)
                    pLat = wgsLat;
                else
                    mLat = wgsLat;
                if (dLon > 0)
                    pLon = wgsLon;
                else
                    mLon = wgsLon;
                if (++i > 10000)
                    break;
            }
            // console.log(i);  
            return { "lat": wgsLat, "lon": wgsLon };
        };
        /**
         * GCJ-02 to BD-09
         */
        MapUtils.bd_encrypt = function (gcjLat, gcjLon) {
            var x = gcjLon, y = gcjLat;
            var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * MapUtils.X_PI);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * MapUtils.X_PI);
            var bdLon = z * Math.cos(theta) + 0.0065;
            var bdLat = z * Math.sin(theta) + 0.006;
            return { "lat": bdLat, "lon": bdLon };
        };
        /**
         * BD-09 to GCJ-02
         */
        MapUtils.bd_decrypt = function (bdLat, bdLon) {
            var x = bdLon - 0.0065, y = bdLat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * MapUtils.X_PI);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * MapUtils.X_PI);
            var gcjLon = z * Math.cos(theta);
            var gcjLat = z * Math.sin(theta);
            return { "lat": gcjLat, "lon": gcjLon };
        };
        /**
         *  WGS-84 to Web mercator
         * mercatorLat -> y mercatorLon -> x
         */
        MapUtils.mercator_encrypt = function (wgsLat, wgsLon) {
            var x = wgsLon * 20037508.34 / 180.;
            var y = Math.log(Math.tan((90. + wgsLat) * MapUtils.PI / 360.)) / (MapUtils.PI / 180.);
            y = y * 20037508.34 / 180.;
            return { "lat": y, "lon": x };
        };
        MapUtils.lonlat2mercator = function (lat, lon) {
            var mercator = { "lon": 0, "lat": 0 };
            var x = lon * 20037508.34 / 180;
            var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            y = y * 20037508.34 / 180;
            mercator.lon = x;
            mercator.lat = y;
            return mercator;
        };
        MapUtils.mercator2lonlat = function (mercatorLat, mercatorLon) {
            var lonlat = { "lon": 0, "lat": 0 };
            var x = mercatorLon / 20037508.34 * 180.;
            var y = mercatorLat / 20037508.34 * 180.;
            y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180.)) - Math.PI / 2);
            lonlat.lon = x;
            lonlat.lat = y;
            return lonlat;
        };
        /**
         * Web mercator to WGS-84
         * mercatorLat -> y mercatorLon -> x
         */
        MapUtils.mercator_decrypt = function (mercatorLat, mercatorLon) {
            var x = mercatorLon / 20037508.34 * 180.;
            var y = mercatorLat / 20037508.34 * 180.;
            y = 180 / MapUtils.PI * (2 * Math.atan(Math.exp(y * MapUtils.PI / 180.)) - MapUtils.PI / 2);
            return { "lat": y, "lon": x };
        };
        /**
         * 求解两点距离
         */
        MapUtils.distance = function (latA, lonA, latB, lonB) {
            var earthR = 6371000.;
            var x = Math.cos(latA * MapUtils.PI / 180.) * Math.cos(latB * MapUtils.PI / 180.) * Math.cos((lonA - lonB) * MapUtils.PI / 180);
            var y = Math.sin(latA * MapUtils.PI / 180.) * Math.sin(latB * MapUtils.PI / 180.);
            var s = x + y;
            if (s > 1)
                s = 1;
            if (s < -1)
                s = -1;
            var alpha = Math.acos(s);
            var distance = alpha * earthR;
            return distance;
        };
        MapUtils.outOfChina = function (lat, lon) {
            if (lon < 72.004 || lon > 137.8347) {
                return true;
            }
            if (lat < 0.8293 || lat > 55.8271) {
                return true;
            }
            return false;
        };
        MapUtils.transformLat = function (x, y) {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * MapUtils.PI) + 20.0 * Math.sin(2.0 * x * MapUtils.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * MapUtils.PI) + 40.0 * Math.sin(y / 3.0 * MapUtils.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * MapUtils.PI) + 320 * Math.sin(y * MapUtils.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        };
        MapUtils.transformLon = function (x, y) {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * MapUtils.PI) + 20.0 * Math.sin(2.0 * x * MapUtils.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * MapUtils.PI) + 40.0 * Math.sin(x / 3.0 * MapUtils.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * MapUtils.PI) + 300.0 * Math.sin(x / 30.0 * MapUtils.PI)) * 2.0 / 3.0;
            return ret;
        };
        MapUtils.PI = 3.14159265358979324;
        MapUtils.X_PI = 3.14159265358979324 * 3000.0 / 180.0;
        return MapUtils;
    }());
    flagwind.MapUtils = MapUtils;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 表示一个默认的枚举器。
     * @class
     * @version 1.0.0
     */
    var Enumerator = /** @class */ (function () {
        /**
         * 初始化 Enumerator<T> 类的新实例。
         * @constructor
         * @param  {Array<T>} items 要枚举的元素。
         */
        function Enumerator(items) {
            if (!items) {
                throw new flagwind.ArgumentException("items");
            }
            this._index = 0;
            this._current = undefined;
            this._items = items;
        }
        Object.defineProperty(Enumerator.prototype, "current", {
            /**
             * 获取当前遍历的值。
             * @summary 如果已经遍历结束，则返回 undefined。
             * @property
             * @returns T
             */
            get: function () {
                return this._current;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 将枚举数推进到集合的下一个元素。
         * @returns boolean 如果枚举数已成功地推进到下一个元素，则为 true；如果枚举数传递到集合的末尾，则为 false。
         */
        Enumerator.prototype.next = function () {
            var items = this._items;
            if (this._index < items.length) {
                this._current = items[this._index++];
                return true;
            }
            else {
                return false;
            }
        };
        return Enumerator;
    }());
    flagwind.Enumerator = Enumerator;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 定义可设置或检索的键/值对。
     * @class
     * @version 1.0.0
     */
    var KeyValuePair = /** @class */ (function () {
        /**
         * 初始化 KeyValuePair<K, V> 类的新实例。
         * @param  {K} key 每个键/值对中定义的对象。
         * @param  {V} value 与 key 相关联的定义。
         */
        function KeyValuePair(key, value) {
            this._key = key;
            this._value = value;
        }
        Object.defineProperty(KeyValuePair.prototype, "key", {
            /**
             * 获取键/值对中的键。
             * @property
             * @returns K
             */
            get: function () {
                return this._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KeyValuePair.prototype, "value", {
            /**
             * 获取键/值对中的值。
             * @property
             * @returns V
             */
            get: function () {
                return this._value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 使用键和值的字符串表示形式返回 KeyValuePair<K, V> 的字符串表示形式。
         * @override
         * @returns string
         */
        KeyValuePair.prototype.toString = function () {
            return "[" + (this._key || "") + ", " + (this._value || "") + "]";
        };
        return KeyValuePair;
    }());
    flagwind.KeyValuePair = KeyValuePair;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 表示一个用于存储键值对的数据结构。
     * @class
     * @description Map 类似于对象，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。
     * @version 1.0.0
     */
    var Map = /** @class */ (function () {
        function Map() {
            this._keys = []; // 键列表
            this._values = []; // 值列表
        }
        Object.defineProperty(Map.prototype, "size", {
            /**
             * 获取 Map<K, V> 中实际包含的成员总数。
             * @property
             * @returns number
             */
            get: function () {
                return this._keys.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置键名 key 对应的键值为 value，然后返回整个 Map<K, V> 结构。
         * 如果 key 已经有值，则键值会被更新，否则就新生成该键。
         * @param  {K} key 键。
         * @param  {V} value 值。
         * @returns void
         */
        Map.prototype.set = function (key, value) {
            var keys = this._keys, index = keys.indexOf(key);
            if (index === -1) {
                index = keys.length;
                keys[index] = key;
            }
            this._values[index] = value;
            return this;
        };
        /**
         * 读取 key 对应的键值，如果找不到 key，返回 undefined。
         * @param  {K} key 键。
         * @returns V
         */
        Map.prototype.get = function (key) {
            var index = this._keys.indexOf(key);
            return index !== -1 ? this._values[index] : undefined;
        };
        /**
         * 确定 Map<K, V> 是否包含指定的键。
         * @param  {K} key 键。
         * @returns boolean 如果 Map<K, V> 包含具有指定键的成员，则为 true；否则为 false。
         */
        Map.prototype.has = function (key) {
            return this._keys.indexOf(key) !== -1;
        };
        /**
         * 从 Map<K, V> 中删除指定的键对应的项。
         * @param  {K} key 键。
         * @returns boolean  如果成功找到并移除该项，则为 true；否则为 false。
         */
        Map.prototype.delete = function (key) {
            var index = this._keys.indexOf(key);
            if (index !== -1) {
                // 删除键和值
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                return true;
            }
            return false;
        };
        /**
         * 清除所有键和值。
         * @returns void
         */
        Map.prototype.clear = function () {
            this._keys.length = 0;
            this._values.length = 0;
        };
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        Map.prototype.getEnumerator = function () {
            var entries = this.entries();
            return new flagwind.Enumerator(entries);
        };
        /**
         * 对 IEnumerable<T> 进行迭代处理。
         * @param  {Function} callback 每次迭代中执行的回掉函数，当前迭代项将传入该函数。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns void
         */
        Map.prototype.forEach = function (callback, scope) {
            var keys = this._keys, values = this._values;
            for (var i = 0, len = keys.length; i < len; i++) {
                callback.call(scope, new flagwind.KeyValuePair(keys[i], values[i]), this);
            }
        };
        /**
         * 获取包含 Map<K, V> 中的键列表。
         * @returns Array
         */
        Map.prototype.keys = function () {
            return this._keys.concat();
        };
        /**
         * 获取包含 Map<K, V> 中的值列表。
         * @returns Array
         */
        Map.prototype.values = function () {
            return this._values.concat();
        };
        /**
         * 获取包含 Map<K, V> 中的成员列表。
         * @returns Array
         */
        Map.prototype.entries = function () {
            var entries = new Array();
            this.forEach(function (item, source) {
                entries.push(new flagwind.KeyValuePair(item.key, item.value));
            });
            return entries;
        };
        /**
         * 返回 Map<K, V> 的字符串表示形式。
         * @override
         * @returns string
         */
        Map.prototype.toString = function () {
            var obj = Object.create(null);
            this.forEach(function (item, source) {
                obj[item.key] = item.value;
            });
            return JSON.stringify(obj);
        };
        return Map;
    }());
    flagwind.Map = Map;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 表示一个强类型列表。提供用于对列表进行搜索、排序和操作的方法。
     * @class
     * @description Set<T> 接受 null 作为引用类型的有效值，但是不允许有重复的元素。
     * @version 1.0.0
     */
    var Set = /** @class */ (function () {
        /**
         * 初始化 Set<T> 的新实例。
         * @param  {Array<T>} ...values
         */
        function Set() {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i] = arguments[_i];
            }
            this._values = [];
            (_a = this._values).push.apply(_a, values);
            var _a;
        }
        Object.defineProperty(Set.prototype, "size", {
            /**
             * 获取 Set<T> 中实际包含的元素总数。
             * @property
             * @returns number
             */
            get: function () {
                return this._values.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 将元素添加到 Set<T> 的结尾处。
         * @param  {T[]} ...values 要添加到 Set<T> 末尾处的元素。
         * @returns Set
         */
        Set.prototype.add = function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i] = arguments[_i];
            }
            for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
                var value = values_1[_a];
                if (!this.has(value)) {
                    this._values.push(value);
                }
            }
            return this;
        };
        /**
         * 获取指定索引处的元素。
         * @param  {number} index 要获得或设置的元素从零开始的索引。
         * @returns T 指定索引处的元素。
         */
        Set.prototype.get = function (index) {
            return this._values[index];
        };
        /**
         * 设置指定索引处的元素。
         * @param  {number} index 设置的元素从零开始的索引。
         * @param  {T} value 元素值。
         * @returns void
         */
        Set.prototype.set = function (index, value) {
            var values = this._values;
            if (index >= 0 && index < values.length) {
                if (!this.has(value)) {
                    values[index] = value;
                }
            }
        };
        /**
         * 从 Set<T> 中移除特定元素的匹配项。
         * @param  {T} value 要从 Set<T> 中移除的元素。
         * @returns boolean 如果成功移除 value，则为 true；否则为 false。如果在 Set<T> 中没有找到 value，该方法也会返回 false。
         */
        Set.prototype.delete = function (value) {
            var values = this._values, index = values.indexOf(value);
            if (index !== -1) {
                values.splice(index, 1);
                return true;
            }
            return false;
        };
        /**
         * 移除 Set<T> 的指定索引处的元素。
         * @param  {number} index 要移除的元素的从零开始的索引。
         * @returns void
         */
        Set.prototype.deleteAt = function (index) {
            var values = this._values;
            if (index >= 0 && index < values.length) {
                values.splice(index, 1);
            }
        };
        /**
         * 从 Set<T> 中移除所有元素。
         * @returns void
         */
        Set.prototype.clear = function () {
            this._values.length = 0;
        };
        /**
         * 搜索指定的元素，并返回整个 Set<T> 中第一个匹配项的从零开始的索引。
         * @param  {T} value 要在 Set<T> 中定位的元素。对于引用类型，该值可以为 null。
         * @param  {number} index? 从零开始的搜索的起始索引。
         * @returns number 如果在整个 Set<T> 中找到 value 的第一个匹配项，则为该项的从零开始的索引；否则为 -1。
         */
        Set.prototype.indexOf = function (value, index) {
            return this._values.indexOf(value, index);
        };
        /**
         * 确定某元素是否在 Set<T> 中。
         * @param  {T} value 要在 Set<T> 中定位的元素。对于引用类型，该值可以为 null。
         * @returns boolean 如果在 Set<T> 中找到 value，则为 true，否则为 false。
         */
        Set.prototype.has = function (value) {
            return this._values.indexOf(value) !== -1;
        };
        /**
         * 返回一个循环访问集合的枚举器。
         * @returns IEnumerator
         */
        Set.prototype.getEnumerator = function () {
            return new flagwind.Enumerator(this._values);
        };
        Set.prototype.forEach = function () {
            var values = this._values, callback = arguments[0], scope = arguments[1], 
            // tslint:disable-next-line:no-magic-numbers
            fromEnumerable = callback.length === 2; // 标识是否从 IEnumerable 接口调用
            for (var i = 0, len = values.length; i < len; i++) {
                fromEnumerable ? callback.call(scope, values[i], this) : callback.call(scope, values[i], i, this);
            }
        };
        /**
         * 搜索与指定谓词所定义的条件相匹配的元素，并返回 Set<T> 中第一个匹配元素。
         * @param  {Function} callback 定义要搜索的元素的条件。
         * @param  {any} scope? 回掉函数中 this 所引用的对象。
         * @returns T
         */
        Set.prototype.find = function (callback, scope) {
            var values = this._values;
            for (var i = 0, len = values.length; i < len; i++) {
                if (callback.call(scope, values[i], i, this)) {
                    return values[i];
                }
            }
            return undefined;
        };
        /**
         * 使用指定的比较器对整个 Set<T> 中的元素进行排序。
         * @param  {Function} comparer? 比较元素时要使用的比较器函数。
         * @returns void
         */
        Set.prototype.sort = function (comparer) {
            var values = this._values;
            this._values = values.sort(comparer);
        };
        /**
         * 将指定的 ISet<T> 合并到当前 ISet<T> 中。
         * @param  {ISet<T>} second 需要合并的数据源。
         * @returns ISet
         */
        Set.prototype.union = function (source) {
            var values = source.values();
            if (values.length > 0) {
                this.add.apply(this, values);
            }
            return this;
        };
        /**
         * 获取包含 Set<T> 中的值列表。
         * @returns Array
         */
        Set.prototype.values = function () {
            return this._values.concat();
        };
        /**
         * 返回 Set<T> 的字符串表示形式。
         * @override
         * @returns string
         */
        Set.prototype.toString = function () {
            return Array.prototype.toString.call(this._values);
        };
        return Set;
    }());
    flagwind.Set = Set;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 表示在应用程序执行期间发生的错误。
     * @class
     * @version 1.0.0
     */
    var Exception = /** @class */ (function (_super) {
        __extends(Exception, _super);
        function Exception(message) {
            return _super.call(this, message) || this;
        }
        return Exception;
    }(Error));
    flagwind.Exception = Exception;
})(flagwind || (flagwind = {}));
/// <reference path="./Exception" />
var flagwind;
(function (flagwind) {
    /**
     * 当向方法提供的参数之一无效时引发的异常。
     * @class
     * @version 1.0.0
     */
    var ArgumentException = /** @class */ (function (_super) {
        __extends(ArgumentException, _super);
        function ArgumentException(message) {
            return _super.call(this, message) || this;
        }
        return ArgumentException;
    }(flagwind.Exception));
    flagwind.ArgumentException = ArgumentException;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 当方法调用对于对象的当前状态无效时引发的异常。
     * @class
     * @version 1.0.0
     */
    var InvalidOperationException = /** @class */ (function (_super) {
        __extends(InvalidOperationException, _super);
        function InvalidOperationException(message) {
            return _super.call(this, message) || this;
        }
        return InvalidOperationException;
    }(flagwind.Exception));
    flagwind.InvalidOperationException = InvalidOperationException;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 坐标点
     */
    var MinemapPoint = /** @class */ (function () {
        function MinemapPoint(x, y, spatial) {
            this.x = x;
            this.y = y;
            this.spatial = spatial;
        }
        Object.defineProperty(MinemapPoint.prototype, "geometry", {
            get: function () {
                return new MinemapGeometry("Point", [this.x, this.y]);
            },
            set: function (value) {
                this.x = value.coordinates[0];
                this.y = value.coordinates[1];
            },
            enumerable: true,
            configurable: true
        });
        return MinemapPoint;
    }());
    flagwind.MinemapPoint = MinemapPoint;
    /**
     * 几何对象
     */
    var MinemapGeometry = /** @class */ (function () {
        function MinemapGeometry(type, coordinates) {
            this.type = type;
            this.coordinates = coordinates;
        }
        return MinemapGeometry;
    }());
    flagwind.MinemapGeometry = MinemapGeometry;
    /**
     * 空间投影
     */
    var MinemapSpatial = /** @class */ (function () {
        function MinemapSpatial(wkid) {
            this.wkid = wkid;
        }
        return MinemapSpatial;
    }());
    flagwind.MinemapSpatial = MinemapSpatial;
    var MinemapMarker = /** @class */ (function () {
        function MinemapMarker(options) {
            this._kind = "marker";
            /**
             * 是否在地图上
             */
            this._isInsided = false;
            this.isShow = true;
            this.id = options.id;
            this.element = document.createElement("div");
            this.element.id = this.id;
            if (options.symbol && options.symbol.className) {
                this.element.classList = [options.symbol.className];
            }
            this.marker = new minemap.Marker(this.element, { offset: [-25, -25] });
            if (options.point) {
                this._geometry = new MinemapGeometry("Point", [options.point.x, options.point.y]);
                this.marker.setLngLat([options.point.x, options.point.y]);
            }
        }
        Object.defineProperty(MinemapMarker.prototype, "kind", {
            get: function () {
                return this._kind;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapMarker.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        MinemapMarker.prototype.show = function () {
            this.marker.addTo(this.layer.map);
            this.isShow = false;
        };
        MinemapMarker.prototype.hide = function () {
            this.marker.remove();
            this.isShow = false;
        };
        MinemapMarker.prototype.remove = function () {
            if (this._isInsided) {
                this.marker.remove();
                this._isInsided = false;
            }
        };
        MinemapMarker.prototype.delete = function () {
            if (this._isInsided) {
                this.marker.remove();
                this._isInsided = false;
            }
            this.layer.remove(this);
        };
        MinemapMarker.prototype.setSymbol = function (symbol) {
            if (symbol.className) {
                this.element.classList.add(symbol.className);
            }
        };
        Object.defineProperty(MinemapMarker.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            set: function (geometry) {
                this._geometry = geometry;
                this.marker.setLngLat(geometry.coordinates);
            },
            enumerable: true,
            configurable: true
        });
        MinemapMarker.prototype.setGeometry = function (geometry) {
            this._geometry = geometry;
            this.marker.setLngLat(geometry.coordinates);
        };
        MinemapMarker.prototype.addTo = function (map) {
            this._isInsided = true;
            this.marker.addTo(map);
        };
        return MinemapMarker;
    }());
    flagwind.MinemapMarker = MinemapMarker;
    var MinemapGeoJson = /** @class */ (function () {
        function MinemapGeoJson() {
            this._kind = "geojson";
            /**
             * 是否在地图上
             */
            this._isInsided = false;
            this.isShow = true;
        }
        Object.defineProperty(MinemapGeoJson.prototype, "kind", {
            get: function () {
                return this._kind;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapGeoJson.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        MinemapGeoJson.prototype.show = function () {
            if (!this.isShow) {
                this.addLayer(this.layer.map);
                this.isShow = true;
            }
        };
        MinemapGeoJson.prototype.hide = function () {
            this.layer.map.removeLayer(this.id);
            this.isShow = false;
        };
        MinemapGeoJson.prototype.remove = function () {
            this.layer.map.removeLayer(this.id);
        };
        MinemapGeoJson.prototype.delete = function () {
            if (this.isInsided) {
                this.layer.map.removeLayer(this.id);
                this._isInsided = false;
                this.layer.remove(this);
            }
        };
        MinemapGeoJson.prototype.setSymbol = function (symbol) {
            throw new flagwind.Exception("尚未实现");
        };
        MinemapGeoJson.prototype.setGeometry = function (geometry) {
            if (this.data && this.data.geometry) {
                this.data.geometry = geometry;
            }
        };
        MinemapGeoJson.prototype.addTo = function (map) {
            if (!map)
                return;
            map.addSource(this.id + "_source", {
                type: this.kind,
                data: this.data
            });
        };
        MinemapGeoJson.prototype.addLayer = function (map) {
            map.addLayer({
                id: this.id,
                source: this.id + "_source",
                type: this.type,
                paint: this.paint,
                layout: this.layout
            });
        };
        return MinemapGeoJson;
    }());
    flagwind.MinemapGeoJson = MinemapGeoJson;
    var MinemapMarkerLayer = /** @class */ (function () {
        function MinemapMarkerLayer(options) {
            this.options = options;
            this.GRAPHICS_MAP = new flagwind.Map();
            /**
             * 是否在地图上
             */
            this._isInsided = false;
            this.id = options.id;
        }
        Object.defineProperty(MinemapMarkerLayer.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapMarkerLayer.prototype, "graphics", {
            get: function () {
                return new Array(this.GRAPHICS_MAP.values);
            },
            enumerable: true,
            configurable: true
        });
        MinemapMarkerLayer.prototype.show = function () {
            this.GRAPHICS_MAP.forEach(function (g) {
                if (!g.value.isShow) {
                    g.value.show();
                }
            });
        };
        MinemapMarkerLayer.prototype.hide = function () {
            this.GRAPHICS_MAP.forEach(function (g) {
                if (g.value.isShow) {
                    g.value.hide();
                }
            });
        };
        MinemapMarkerLayer.prototype.remove = function (graphic) {
            this.GRAPHICS_MAP.delete(graphic.id);
            if (graphic.isInsided) {
                graphic.delete();
            }
        };
        MinemapMarkerLayer.prototype.clear = function () {
            this.GRAPHICS_MAP.forEach(function (g) { return g.value.remove(); });
            this.GRAPHICS_MAP.clear();
        };
        MinemapMarkerLayer.prototype.add = function (graphic) {
            this.GRAPHICS_MAP.set(graphic.id, graphic);
            graphic.layer = this;
            if (this.map) {
                graphic.addTo(this.map);
            }
        };
        MinemapMarkerLayer.prototype.addToMap = function (map) {
            if (!this.map) {
                this.GRAPHICS_MAP.forEach(function (g) {
                    g.value.addTo(map);
                });
            }
            this.map = map;
            this._isInsided = true;
        };
        MinemapMarkerLayer.prototype.removeFromMap = function (map) {
            this.GRAPHICS_MAP.forEach(function (g) {
                g.value.remove();
            });
            this._isInsided = false;
        };
        return MinemapMarkerLayer;
    }());
    flagwind.MinemapMarkerLayer = MinemapMarkerLayer;
    var MinemapGeoJsonLayer = /** @class */ (function () {
        function MinemapGeoJsonLayer(options) {
            this.GRAPHICS_MAP = new flagwind.Map();
            /**
             * 是否在地图上
             */
            this._isInsided = false;
            this.id = options.id;
        }
        Object.defineProperty(MinemapGeoJsonLayer.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapGeoJsonLayer.prototype, "graphics", {
            get: function () {
                return new Array(this.GRAPHICS_MAP.values);
            },
            enumerable: true,
            configurable: true
        });
        MinemapGeoJsonLayer.prototype.show = function () {
            this.GRAPHICS_MAP.forEach(function (g) {
                if (!g.value.isShow) {
                    g.value.show();
                }
            });
        };
        MinemapGeoJsonLayer.prototype.hide = function () {
            this.GRAPHICS_MAP.forEach(function (g) {
                if (g.value.isShow) {
                    g.value.hide();
                }
            });
        };
        MinemapGeoJsonLayer.prototype.remove = function (graphic) {
            this.GRAPHICS_MAP.delete(graphic.id);
            if (graphic.isInsided) {
                graphic.delete();
            }
        };
        MinemapGeoJsonLayer.prototype.clear = function () {
            this.GRAPHICS_MAP.forEach(function (g) { return g.value.remove(); });
            this.GRAPHICS_MAP.clear();
        };
        MinemapGeoJsonLayer.prototype.add = function (graphic) {
            this.GRAPHICS_MAP.set(graphic.id, graphic);
            if (this.map) {
                graphic.addTo(this.map);
                graphic.addLayer(this.map);
            }
        };
        MinemapGeoJsonLayer.prototype.addToMap = function (map) {
            if (!this.map) {
                this.GRAPHICS_MAP.forEach(function (g) { return g.value.addLayer(map); });
            }
            this.map = map;
            this._isInsided = true;
        };
        MinemapGeoJsonLayer.prototype.removeFromMap = function (map) {
            this.GRAPHICS_MAP.forEach(function (g) { return g.value.delete(); });
            this._isInsided = false;
        };
        return MinemapGeoJsonLayer;
    }());
    flagwind.MinemapGeoJsonLayer = MinemapGeoJsonLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var EVENT_MAP = new flagwind.Map();
    EVENT_MAP.set("onLoad", "load");
    var MinemapService = /** @class */ (function () {
        function MinemapService() {
        }
        //#region 
        MinemapService.prototype.createTiledLayer = function (options) {
            // 该方法可不用实现
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.createBaseLayer = function (flagwindMap) {
            return new Array();
        };
        MinemapService.prototype.createGraphicsLayer = function (options) {
            if (options.kind === "marker") {
                return new flagwind.MinemapMarkerLayer(options);
            }
            if (options.kind === "geojson") {
                return new flagwind.MinemapGeoJsonLayer(options);
            }
            throw new Error("不支持的图层类型");
        };
        MinemapService.prototype.clearLayer = function (layer) {
            if (layer.clear) {
                layer.clear();
            }
        };
        MinemapService.prototype.removeLayer = function (layer, map) {
            layer.removeFromMap(map);
            // throw new Error("Method not implemented.");
        };
        MinemapService.prototype.addLayer = function (layer, map) {
            layer.addToMap(map);
            // throw new Error("Method not implemented.");
        };
        MinemapService.prototype.showLayer = function (layer) {
            layer.show();
        };
        MinemapService.prototype.hideLayer = function (layer) {
            layer.hide();
        };
        //#endregion
        //#region 
        MinemapService.prototype.getGraphicListByLayer = function (layer) {
            var graphics = layer.graphics;
            var result = new Array();
            result.push(graphics);
            return result;
        };
        MinemapService.prototype.removeGraphic = function (graphic, layer) {
            layer.remove(graphic);
        };
        MinemapService.prototype.addGraphic = function (graphic, layer) {
            layer.add(graphic);
        };
        MinemapService.prototype.showGraphic = function (graphic) {
            graphic.show();
        };
        MinemapService.prototype.hideGraphic = function (graphic) {
            graphic.hide();
        };
        MinemapService.prototype.setGeometryByGraphic = function (graphic, geometry) {
            graphic.setGeometry(geometry);
        };
        MinemapService.prototype.setSymbolByGraphic = function (graphic, symbol) {
            graphic.setSymbol(symbol);
        };
        MinemapService.prototype.createMarkerSymbol = function (options) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.getGraphicAttributes = function (graphic) {
            return graphic.attributers;
        };
        //#endregion
        //#region 地图
        MinemapService.prototype.addEventListener = function (target, eventName, callback) {
            var en = EVENT_MAP.get(eventName) || eventName;
            target.on(en, callback);
        };
        MinemapService.prototype.centerAt = function (point, map) {
            map.flyTo({
                center: [
                    point.x,
                    point.y
                ]
            });
        };
        MinemapService.prototype.createPoint = function (options) {
            return new flagwind.MinemapPoint(options.x, options.y, options.spatial);
        };
        MinemapService.prototype.createSpatial = function (wkid) {
            return new flagwind.MinemapSpatial(wkid);
        };
        MinemapService.prototype.getInfoWindow = function (map) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.showInfoWindow = function (evt) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.formPoint = function (point, flagwindMap) {
            var lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.point25To2(lnglat.lon, lnglat.lat);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.gcj_decrypt(lnglat.lat, lnglat.lon);
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                    }
                    else {
                        lnglat = flagwind.MapUtils.mercator2lonlat(lnglat.lat, lnglat.lon);
                    }
                }
                else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
                else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
            }
            // console.log("-->坐标转换之后:" + lnglat.lon + "," + lnglat.lat);
            // 以x,y属性创建点
            return {
                longitude: parseFloat(lnglat.lon.toFixed(8)),
                latitude: parseFloat(lnglat.lat.toFixed(8))
            };
        };
        MinemapService.prototype.toPoint = function (item, flagwindMap) {
            var lnglat = { "latitude": item.latitude || item.lat, "longitude": item.longitude || item.lon };
            if (!flagwind.MapUtils.validDevice(lnglat)) {
                lnglat.longitude = item.x;
                lnglat.latitude = item.y;
            }
            if (flagwindMap.spatial.wkid !== flagwindMap.mapSetting.wkidFromApp) {
                if (flagwindMap.spatial.wkid === 3857 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    if (flagwindMap.mapSetting.is25D) {
                        console.log("原始坐标：" + lnglat.longitude + "," + lnglat.latitude);
                        lnglat = flagwind.MapUtils.gcj_encrypt(lnglat.latitude, lnglat.longitude);
                        console.log("高德坐标：" + lnglat.longitude + "," + lnglat.latitude);
                        lnglat = flagwind.MapUtils.point2To25(lnglat.longitude, lnglat.latitude);
                        console.log("2.5D坐标：" + lnglat.longitude + "," + lnglat.latitude);
                    }
                    else {
                        lnglat = flagwind.MapUtils.lonlat2mercator(lnglat.latitude, lnglat.longitude);
                    }
                }
                else if (flagwindMap.spatial.wkid === 102100 && flagwindMap.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.latitude, lnglat.longitude);
                }
                else if (flagwindMap.spatial.wkid === 4326 && flagwindMap.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.latitude, lnglat.longitude);
                }
            }
            // 以x,y属性创建点
            return new flagwind.MinemapPoint(lnglat.longitude, lnglat.latitude, flagwindMap.spatial);
        };
        MinemapService.prototype.createMap = function (setting, flagwindMap) {
            minemap.domainUrl = "http://" + setting.mapDomain;
            minemap.spriteUrl = "http://" + setting.mapDomain + "/minemapapi/" + setting.mapVersion + "/sprite/sprite";
            minemap.serviceUrl = "http://" + setting.mapDomain + "/service";
            minemap.accessToken = setting.accessToken || "25cc55a69ea7422182d00d6b7c0ffa93";
            minemap.solution = 2365;
            var map = new minemap.Map({
                container: flagwindMap.mapEl,
                style: "http://" + setting.mapDomain + "/service/solu/style/id/2365",
                center: setting.center || [116.46, 39.92],
                zoom: setting.zoom,
                pitch: 60,
                maxZoom: setting.maxZoom || 17,
                minZoom: setting.minZoom || 9 // 地图最小缩放级别限制
            });
            var popup = new minemap.Popup({ closeOnClick: false })
                .addTo(map);
            map.infoWindow = popup;
            return map;
        };
        MinemapService.prototype.createContextMenu = function (options, flagwindMap) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.showTitle = function (graphic, flagwindMap) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.hideTitle = function (flagwindMap) {
            throw new Error("Method not implemented.");
        };
        //#endregion
        //#region 
        MinemapService.prototype.setSegmentByLine = function (flagwindRouteLayer, options, segment) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.setSegmentByPolyLine = function (flagwindRouteLayer, options, segment) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.solveByService = function (flagwindRouteLayer, segment, start, end, waypoints) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.solveByJoinPoint = function (flagwindRouteLayer, segment) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.getTrackLineMarkerGraphic = function (trackline, graphic, angle) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.getStandardStops = function (name, stops) {
            throw new Error("Method not implemented.");
        };
        MinemapService.prototype.showSegmentLine = function (flagwindRouteLayer, segment) {
            throw new Error("Method not implemented.");
        };
        return MinemapService;
    }());
    flagwind.MinemapService = MinemapService;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapSetting = /** @class */ (function () {
        function MinemapSetting() {
            this.mapDomain = "minedata.cn";
            this.mapVersion = "v1.3";
            this.accessToken = "25cc55a69ea7422182d00d6b7c0ffa93";
            this.units = 0.03;
            this.center = [116.46, 39.92];
            this.wkidFromApp = 4326;
            this.is25D = false;
            this.minZoom = 9;
            this.maxZoom = 17;
            this.zoom = 16;
            this.logo = false;
            this.slider = true;
        }
        return MinemapSetting;
    }());
    flagwind.MinemapSetting = MinemapSetting;
})(flagwind || (flagwind = {}));

Object.defineProperty(exports, '__esModule', { value: true });

exports['default'] = flagwind;

})));
