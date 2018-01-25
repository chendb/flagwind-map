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
     * 表示一个事件项。
     * @internal
     * @class
     * @version 1.0.0
     */
    var EventEntry = /** @class */ (function () {
        /**
         * 初始化事件项的新实例。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 侦听函数。
         * @param  {any} scope 侦听函数中的 this 对象。
         * @param  {boolean} scope 是否为仅回掉一次。
         */
        function EventEntry(type, listener, scope, once) {
            this.type = type;
            this.listener = listener;
            this.scope = scope;
            this.once = once;
        }
        return EventEntry;
    }());
    /**
     * 事件提供程序类。
     * @description 用于添加或删除事件侦听器的方法，检查是否已注册特定类型的事件侦听器，并调度事件。
     * @class
     * @version 1.0.0
     */
    var EventProvider = /** @class */ (function () {
        /**
         * 初始化事件提供程序的新实例。
         * @param  {any} source? 事件源实例。
         */
        function EventProvider(source) {
            // 保存事件源对象
            this._source = source || this;
            // 初始化事件字典
            this._events = new flagwind.Map();
        }
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        EventProvider.prototype.addListener = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            if (!type || !listener) {
                throw new flagwind.ArgumentException();
            }
            var entries = this._events.get(type);
            if (!entries) {
                entries = new Array();
                this._events.set(type, entries);
            }
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                // 防止添加重复的侦听函数
                if (entry.listener === listener && entry.scope === scope) {
                    return;
                }
            }
            entries.push(new EventEntry(type, listener, scope, once));
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        EventProvider.prototype.removeListener = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            if (!type || !listener) {
                throw new flagwind.ArgumentException();
            }
            var entries = this._events.get(type);
            if (!entries) {
                return;
            }
            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                if (entry.listener === listener && entry.scope === scope) {
                    entries.splice(i, 1);
                    break;
                }
            }
            // 如果事件项为空，则需要释放资源
            if (entries.length === 0) {
                this._events.delete(type);
            }
        };
        /**
         * 检查是否为特定事件类型注册了侦听器。
         * @param  {string} type 事件类型。
         * @returns boolean 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
         */
        EventProvider.prototype.hasListener = function (type) {
            var entries = this._events.get(type);
            return !!entries && entries.length > 0;
        };
        EventProvider.prototype.dispatchEvent = function () {
            var params = arguments, args;
            switch (params.length) {
                // 重载匹配: 
                // dispatchEvent(args: EventArgs): void;
                // dispatchEvent(type: string): void;
                case 1:
                    {
                        if (params[0] instanceof flagwind.EventArgs) {
                            // 参数匹配: args: EventArgs
                            args = params[0];
                        }
                        else if (flagwind.Type.isString(params[0])) {
                            // 参数匹配: type: string
                            args = new flagwind.EventArgs(params[0]);
                        }
                        break;
                    }
                // 重载匹配:
                // dispatchEvent(type: string, data: any): void;
                case 2:
                    {
                        // 参数匹配: type: string, data: any
                        args = new flagwind.EventArgs(params[0], params[1]);
                        break;
                    }
            }
            // 设置事件源
            args.source = this._source;
            // 根据事件类型获取所有事件项
            var entries = this._events.get(args.type);
            if (!entries || entries.length === 0) {
                return;
            }
            // 临时数组用于保存只回掉一次的事件项
            var onces = new Array();
            for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                var entry = entries_2[_i];
                entry.listener.call(entry.scope, args);
                if (entry.once) {
                    onces.push(entry);
                }
            }
            // 清除所有只回调一次的事件项
            while (onces.length) {
                var entry = onces.pop();
                this.removeListener(entry.type, entry.listener, entry.scope);
            }
        };
        return EventProvider;
    }());
    flagwind.EventProvider = EventProvider;
})(flagwind || (flagwind = {}));
/// <reference path="../events/EventProvider" />
var flagwind;
(function (flagwind) {
    /**
     * 功能图层包装类
     *
     * @export
     * @class FlagwindFeatureLayer
     */
    var FlagwindFeatureLayer = /** @class */ (function (_super) {
        __extends(FlagwindFeatureLayer, _super);
        function FlagwindFeatureLayer(id, title) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.title = title;
            _this.isShow = true;
            _this.id = id;
            _this.layer = _this.onCreateGraphicsLayer({ id: id });
            return _this;
        }
        Object.defineProperty(FlagwindFeatureLayer.prototype, "graphics", {
            get: function () {
                return this.layer.graphics;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindFeatureLayer.prototype, "items", {
            get: function () {
                return this.graphics.map(function (g) { return g.attributes; });
            },
            enumerable: true,
            configurable: true
        });
        FlagwindFeatureLayer.prototype.appendTo = function (map) {
            this.layer.addToMap(map);
        };
        FlagwindFeatureLayer.prototype.removeLayer = function (map) {
            this.layer.removeFormMap(map);
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
            this.layer.clear();
        };
        FlagwindFeatureLayer.prototype.show = function () {
            this.isShow = true;
            this.layer.show();
        };
        FlagwindFeatureLayer.prototype.hide = function () {
            this.isShow = false;
            this.layer.hide();
        };
        /**
         * 获取资源要素点
         */
        FlagwindFeatureLayer.prototype.getGraphicById = function (key) {
            var graphics = this.graphics;
            for (var i = 0; i < graphics.length; i++) {
                var attrs = graphics[i].attributes;
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
                this.layer.remove(graphic);
            }
        };
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        FlagwindFeatureLayer.prototype.on = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            this.addListener(type, listener, scope, once);
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        FlagwindFeatureLayer.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        return FlagwindFeatureLayer;
    }(flagwind.EventProvider));
    flagwind.FlagwindFeatureLayer = FlagwindFeatureLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-feature.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriEditLayer = /** @class */ (function (_super) {
        __extends(EsriEditLayer, _super);
        function EsriEditLayer(businessLayer, options) {
            var _this = this;
            options = __assign({}, flagwind.EDIT_LAYER_OPTIONS, options);
            _this = _super.call(this, "edit_" + businessLayer.id, "编辑图层") || this;
            _this.businessLayer = businessLayer;
            _this.flagwindMap = businessLayer.flagwindMap;
            _this.options = options;
            _this.editObj = new esri.toolbars.Edit(_this.flagwindMap.innerMap); // 编辑对象,在编辑图层进行操作
            _this.flagwindMap.addFeatureLayer(_this);
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
            var graphic = this.businessLayer.getGraphicById(key);
            if (!graphic) {
                console.log("无效的代码：" + key);
                return;
            }
            this.businessLayer.hide();
            this.show();
            var editGraphic = this.businessLayer.creatGraphicByModel(graphic.attributes);
            this.layer.add(editGraphic);
            editGraphic.attributes.eventName = "start";
            var tool = esri.toolbars.Edit.MOVE;
            // map.disableDoubleClickZoom();//禁掉鼠标双击事件
            this.editObj.activate(tool, editGraphic, null); // 激活编辑工具
            this.businessLayer.onShowInfoWindow({
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
            this.businessLayer.show();
            var graphic = this.businessLayer.getGraphicById(key);
            graphic.attributes.eventName = "delete";
            this.businessLayer.onShowInfoWindow({
                graphic: graphic
            });
        };
        EsriEditLayer.prototype.registerModifyEvent = function (modifySeletor) {
            var me = this;
            dojo.connect(dojo.byId(modifySeletor), "onclick", function (evt) {
                var key = evt.target.attributes["key"].value;
                me.activateEdit(key);
            });
        };
        EsriEditLayer.prototype.registerDeleteEvent = function (deleteSeletor) {
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
        EsriEditLayer.prototype.onCreateGraphicsLayer = function (args) {
            var layer = new esri.layers.GraphicsLayer(args);
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
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
                        var lonlat = _editLayer.businessLayer.formPoint(pt);
                        var changeInfo = __assign({}, ev.graphic.attributes, lonlat);
                        // 异步更新，请求成功才更新位置，否则不处理，
                        _editLayer.onChanged({
                            id: key,
                            latitude: changeInfo.latitude,
                            longitude: changeInfo.longitude
                        }, true).then(function (success) {
                            if (success) {
                                _editLayer.businessLayer.removeGraphicById(changeInfo.id);
                                _editLayer.businessLayer.addGraphicByModel(changeInfo);
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
                _editLayer.businessLayer.show();
            });
        };
        EsriEditLayer.prototype.onLayerClick = function (editLayer, evt) {
            if (editLayer.businessLayer.options.onLayerClick) {
                editLayer.businessLayer.options.onLayerClick(evt);
            }
            if (editLayer.businessLayer.options.showInfoWindow) {
                editLayer.businessLayer.onShowInfoWindow(evt);
            }
        };
        return EsriEditLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.EsriEditLayer = EsriEditLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 分组图层(用于需要多个要素叠加效果情况)
     *
     * @export
     * @class FlagwindGroupLayer
     */
    var FlagwindGroupLayer = /** @class */ (function (_super) {
        __extends(FlagwindGroupLayer, _super);
        function FlagwindGroupLayer(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.isShow = true;
            _this.layer = _this.onCreateGraphicsLayer(options);
            return _this;
        }
        Object.defineProperty(FlagwindGroupLayer.prototype, "graphics", {
            get: function () {
                return this.layer.graphics;
            },
            enumerable: true,
            configurable: true
        });
        FlagwindGroupLayer.prototype.appendTo = function (map) {
            this.layer.addToMap(map);
        };
        FlagwindGroupLayer.prototype.removeLayer = function (map) {
            this.layer.removeFormMap(map);
        };
        FlagwindGroupLayer.prototype.clear = function () {
            this.layer.clear();
        };
        FlagwindGroupLayer.prototype.show = function () {
            this.isShow = true;
            this.layer.show();
        };
        FlagwindGroupLayer.prototype.hide = function () {
            this.isShow = false;
            this.layer.hide();
        };
        FlagwindGroupLayer.prototype.setGeometry = function (name, geometry) {
            this.getGraphicByName(name).forEach(function (g) {
                g.setGeometry(geometry);
            });
        };
        FlagwindGroupLayer.prototype.setSymbol = function (name, symbol) {
            this.getGraphicByName(name).forEach(function (g) {
                g.setSymbol(symbol);
            });
        };
        FlagwindGroupLayer.prototype.showGraphic = function (name) {
            this.getGraphicByName(name).forEach(function (g) {
                g.show();
            });
        };
        FlagwindGroupLayer.prototype.hideGraphic = function (name) {
            this.getGraphicByName(name).forEach(function (g) {
                g.hide();
            });
        };
        FlagwindGroupLayer.prototype.addGraphic = function (name) {
            var _this = this;
            var graphics = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                graphics[_i - 1] = arguments[_i];
            }
            if (graphics === undefined)
                return;
            graphics.forEach(function (g, index) {
                if (g) {
                    var item = g.attributes;
                    item.__master = index === 0;
                    item.__name = name;
                    _this.layer.add(g);
                }
            });
        };
        FlagwindGroupLayer.prototype.getMasterGraphicByName = function (name) {
            this.graphics.forEach(function (element) {
                var item = element.attributes;
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
                var attrs = this.graphics[i].attributes;
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
                graphics.forEach(function (g) {
                    _this.layer.remove(g);
                });
            }
        };
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        FlagwindGroupLayer.prototype.on = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            this.addListener(type, listener, scope, once);
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        FlagwindGroupLayer.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        return FlagwindGroupLayer;
    }(flagwind.EventProvider));
    flagwind.FlagwindGroupLayer = FlagwindGroupLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-group.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriGroupLayer = /** @class */ (function (_super) {
        __extends(EsriGroupLayer, _super);
        function EsriGroupLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EsriGroupLayer.prototype.onCreateGraphicsLayer = function (args) {
            var layer = new esri.layers.GraphicsLayer(args);
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        return EsriGroupLayer;
    }(flagwind.FlagwindGroupLayer));
    flagwind.EsriGroupLayer = EsriGroupLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../events/EventProvider" />
var flagwind;
(function (flagwind) {
    // tslint:disable-next-line:variable-name
    flagwind.MAP_OPTIONS = {
        onMapLoad: function () {
            console.log("onMapLoad");
        },
        onMapZoomEnd: function (level) {
            console.log("onMapZoomEnd");
        },
        onMapClick: function (evt) {
            console.log("onMapClick");
        },
        onCreateContextMenu: function (args) {
            console.log("onCreateContextMenu");
        }
    };
    var FlagwindMap = /** @class */ (function (_super) {
        __extends(FlagwindMap, _super);
        function FlagwindMap(mapSetting, mapEl, options) {
            var _this = _super.call(this) || this;
            _this.mapSetting = mapSetting;
            _this.mapEl = mapEl;
            _this.featureLayers = [];
            _this.baseLayers = [];
            _this.loaded = false;
            _this.options = __assign({}, flagwind.MAP_OPTIONS, options);
            return _this;
        }
        FlagwindMap.prototype.onInit = function () {
            this.onCreateMap();
            this.onCreateBaseLayers();
            var me = this;
            me.on("onLoad", function () {
                try {
                    me.loaded = true;
                    me.goToCenter();
                    me.onMapLoad();
                }
                catch (ex) {
                    console.error(ex);
                }
            });
            me.on("onZoomEnd", function (evt) {
                me.onMapZoomEnd(evt.data);
            });
        };
        FlagwindMap.prototype.onFormPoint = function (point) {
            var lnglat = { "lat": point.y, "lon": point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (this.spatial.wkid !== this.mapSetting.wkidFromApp) {
                if (this.spatial.wkid === 3857 && this.mapSetting.wkidFromApp === 4326) {
                    if (this.mapSetting.is25D) {
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
                else if (this.spatial.wkid === 102100 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return {
                longitude: parseFloat(lnglat.lon.toFixed(8)),
                latitude: parseFloat(lnglat.lat.toFixed(8))
            };
        };
        FlagwindMap.prototype.onToPoint = function (item) {
            var lnglat = { "lat": item.latitude || item.lat, "lon": item.longitude || item.lon };
            if (!flagwind.MapUtils.validGeometryModel(item)) {
                lnglat.lon = item.x || lnglat.lon;
                lnglat.lat = item.y || lnglat.lat;
            }
            // console.log("-->坐标转换之前:" + lnglat.lon + "," + lnglat.lat);
            if (this.spatial.wkid !== this.mapSetting.wkidFromApp) {
                if (this.spatial.wkid === 3857 && this.mapSetting.wkidFromApp === 4326) {
                    if (this.mapSetting.is25D) {
                        console.log("原始坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.gcj_encrypt(lnglat.lat, lnglat.lon);
                        console.log("高德坐标：" + lnglat.lon + "," + lnglat.lat);
                        lnglat = flagwind.MapUtils.point2To25(lnglat.lon, lnglat.lat);
                        console.log("2.5D坐标：" + lnglat.lon + "," + lnglat.lat);
                    }
                    else {
                        lnglat = flagwind.MapUtils.lonlat2mercator(lnglat.lat, lnglat.lon);
                    }
                }
                else if (this.spatial.wkid === 102100 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return this.onCreatePoint({
                x: lnglat.lon, y: lnglat.lat, spatial: this.spatial
            });
        };
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        FlagwindMap.prototype.on = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            this.addListener(type, listener, scope, once);
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        FlagwindMap.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        FlagwindMap.prototype.goToCenter = function () {
            if (this.mapSetting.center && this.mapSetting.center.length === 2) {
                var pt = this.getPoint({
                    x: this.mapSetting.center[0],
                    y: this.mapSetting.center[1]
                });
                this.onCenterAt(pt);
            }
        };
        FlagwindMap.prototype.getBaseLayerById = function (id) {
            var layers = this.baseLayers.filter(function (g) { return g.id === id; });
            if (layers && layers.length > 0) {
                return layers[0];
            }
            return null;
        };
        /**
         * 中心定位
         */
        FlagwindMap.prototype.centerAt = function (x, y) {
            var pt = this.onCreatePoint({
                x: x,
                y: y,
                spatial: this.spatial
            });
            this.onCenterAt(pt);
        };
        /**
         * 创建点要素
         */
        FlagwindMap.prototype.getPoint = function (item) {
            return this.onToPoint(item);
        };
        FlagwindMap.prototype.addFeatureLayer = function (deviceLayer) {
            if (this.getFeatureLayerById(deviceLayer.id)) {
                throw Error("图层" + deviceLayer.id + "已存在");
            }
            this.featureLayers.push(deviceLayer);
            deviceLayer.appendTo(this.innerMap);
        };
        FlagwindMap.prototype.openInfoWindow = function (option) {
            this.onShowInfoWindow(option);
        };
        FlagwindMap.prototype.onMapLoad = function () {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }
            var me = this;
            this.on("click", function (evt) {
                me.options.onMapClick(evt.data);
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
            get: function () {
                return this.innerMap;
            },
            enumerable: true,
            configurable: true
        });
        FlagwindMap.prototype.onMapZoomEnd = function (evt) {
            this.options.onMapZoomEnd(evt.level);
        };
        return FlagwindMap;
    }(flagwind.EventProvider));
    flagwind.FlagwindMap = FlagwindMap;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.map.ts" />
var flagwind;
(function (flagwind) {
    var EsriMap = /** @class */ (function (_super) {
        __extends(EsriMap, _super);
        function EsriMap(mapSetting, mapEl, options) {
            var _this = _super.call(this, mapSetting, mapEl, options) || this;
            _this.mapSetting = mapSetting;
            _this.mapEl = mapEl;
            _this.onInit();
            return _this;
        }
        EsriMap.prototype.onAddEventListener = function (eventName, callBack) {
            dojo.on(this.map, eventName, callBack);
        };
        EsriMap.prototype.onCenterAt = function (point) {
            this.map.centerAt(point).then(function () {
                console.log("centerAt:" + point.x + "," + point.y);
            });
        };
        EsriMap.prototype.onCreatePoint = function (options) {
            return new esri.geometry.Point(options.x, options.y, options.spatial || this.spatial);
        };
        EsriMap.prototype.onCreateMap = function () {
            this.spatial = new esri.SpatialReference({
                wkid: this.mapSetting.wkid || 4326
            });
            var setting = this.mapSetting;
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
                var minXY = this.getPoint({
                    x: setting.extent[0],
                    y: setting.extent[1]
                });
                var maxXY = this.getPoint({
                    x: setting.extent[2],
                    y: setting.extent[3]
                });
                var tileExtent = new esri.geometry.Extent(minXY.x, minXY.y, maxXY.x, maxXY.y, this.spatial);
                mapArguments.extent = tileExtent;
            }
            if (setting.webTiledUrl) {
                mapArguments.lods = this.getTileInfo().lods;
            }
            // 地图对象
            var map = new esri.Map(this.mapEl, mapArguments);
            map.infoWindow.anchor = "top";
            var div = this.tooltipElement = document.createElement("div");
            div.classList.add("flagwind-map-tooltip");
            this.innerMap.root.parentElement.appendChild(div);
            var me = this;
            // #region click event
            map.on("click", function (args) {
                me.dispatchEvent("onClick", args);
            });
            map.on("dbl-click", function (args) {
                me.dispatchEvent("onDbClick", args);
            });
            // #endregion
            // #region mouse event
            map.on("mouse-out", function (args) {
                me.dispatchEvent("onMouseOut", args);
            });
            map.on("mouse-over", function (args) {
                me.dispatchEvent("onMouseOver", args);
            });
            map.on("mouse-move", function (args) {
                me.dispatchEvent("onMouseMove", args);
            });
            map.on("mouse-wheel", function (args) {
                me.dispatchEvent("onMouseWheel", args);
            });
            // #endregion
            // #region zoom event
            map.on("zoom", function (args) {
                me.dispatchEvent("onZoom", args);
            });
            map.on("zoom-start", function (args) {
                me.dispatchEvent("onZoomStart", args);
            });
            map.on("zoom-end", function (args) {
                me.dispatchEvent("onZoomEnd", args);
            });
            // #endregion
            // #region pan event
            map.on("pan", function (args) {
                me.dispatchEvent("onPan", args);
            });
            map.on("pan-start", function (args) {
                me.dispatchEvent("onPanStart", args);
            });
            map.on("pan-end", function (args) {
                me.dispatchEvent("onPanEnd", args);
            });
            // #endregion
            // #region update event
            map.on("update-start", function (args) {
                me.dispatchEvent("onUpdateStart", args);
            });
            map.on("update-end", function (args) {
                me.dispatchEvent("onUpdateEnd", args);
            });
            // #endregion 
            map.on("extent-change", function (args) {
                me.dispatchEvent("onExtentChange", args);
            });
            map.on("resize", function (args) {
                me.dispatchEvent("onResize", args);
            });
        };
        EsriMap.prototype.onShowInfoWindow = function (options) {
            throw new Error("Method not implemented.");
        };
        EsriMap.prototype.onCreateBaseLayers = function () {
            var _this = this;
            var baseLayers = new Array();
            if (this.mapSetting.baseUrl) {
                var layer = new flagwind.EsriTiledLayer("base_arcgis_tiled", this.mapSetting.baseUrl, "瓦片图层");
                baseLayers.push(layer);
            }
            if (this.mapSetting.webTiledUrl) {
                var tileInfo1 = this.getTileInfo();
                var cycleLayer = new esri.layers.WebTiledLayer(this.mapSetting.webTiledUrl, {
                    tileInfo: tileInfo1
                });
                var layer = new flagwind.EsriTiledLayer("base_arcgis_tiled", null, "瓦片图层");
                layer.layer = cycleLayer;
                baseLayers.push(layer);
            }
            this.baseLayers = baseLayers;
            this.baseLayers.forEach(function (g) { return g.appendTo(_this.innerMap); });
            return baseLayers;
        };
        EsriMap.prototype.onShowTooltip = function (graphic) {
            var info = graphic.attributes;
            var pt = new esri.geometry.Point(info.longitude, info.latitude, this.spatial);
            var screenpt = this.innerMap.toScreen(pt);
            var title = info.name;
            this.tooltipElement.innerHTML = "<div>" + title + "</div>";
            this.tooltipElement.style.left = (screenpt.x + 8) + "px";
            this.tooltipElement.style.top = (screenpt.y + 8) + "px";
            this.tooltipElement.style.display = "block";
        };
        EsriMap.prototype.onHideTooltip = function (graphic) {
            this.tooltipElement.style.display = "none";
        };
        EsriMap.prototype.onCreateContextMenu = function (options) {
            var menus = options.contextMenu;
            var ctxMenu = this.ctxMenuForMap = new dijit.Menu({
                onOpen: function (box) {
                    this.currentLocation = this.getMapPointFromMenuPosition(box, this.innerMap);
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
            ctxMenu.bindDomNode(this.innerMap.container);
        };
        /**
         * tileInfo必须是单例模式，否则地图无法正常显示
         *
         * @returns
         * @memberof FlagwindMap
         */
        EsriMap.prototype.getTileInfo = function () {
            if (this.tileInfo)
                return this.tileInfo;
            // tslint:disable-next-line:align
            var tileInfo = new esri.layers.TileInfo({
                "dpi": 96,
                "spatialReference": this.spatial,
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -2.0037508342787E7,
                    "y": 2.0037508342787E7,
                    "spatialReference": this.spatial
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
            this.tileInfo = tileInfo;
            return tileInfo;
        };
        return EsriMap;
    }(flagwind.FlagwindMap));
    flagwind.EsriMap = EsriMap;
})(flagwind || (flagwind = {}));
/// <reference path="./flagwind-group.layer.ts" />
var flagwind;
(function (flagwind) {
    flagwind.ROUTE_LAYER_OPTIONS = {
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
    flagwind.TRACKLINE_OPTIONS = {
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
            this.options = __assign({}, flagwind.ROUTE_LAYER_OPTIONS, options);
            // this.mapService = flagwindMap.mapService;
            this.moveLineLayer = this.onCreateLineLayer(layerName + "LineLayer");
            // 移动小车
            this.moveMarkLayer = this.onCreateMovingLayer(layerName + "MarkerLayer");
            this.onAddLayerBefor();
            this.moveLineLayer.appendTo(this.flagwindMap.innerMap);
            this.moveMarkLayer.appendTo(this.flagwindMap.innerMap);
            this.onAddLayerAfter();
            var me = this;
            // 当地图已经加载时直接执行_onLoad方法
            if (this.flagwindMap.loaded) {
                me.onLoad();
            }
            else {
                this.flagwindMap.on("load", function () {
                    me.onLoad();
                }, this);
            }
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
            if (name) {
                var trackline = this.getTrackLine(name);
                if (trackline == null)
                    return;
                trackline.stop();
                this.moveMarkLayer.removeGraphicByName(name);
                this.moveLineLayer.removeGraphicByName(name);
                trackline.markerGraphic = null;
                var index = this.trackLines.indexOf(trackline);
                if (index >= 0) {
                    this.trackLines.splice(index, 1);
                }
            }
            else {
                this.moveMarkLayer.clear();
                this.moveLineLayer.clear();
                this.trackLines = [];
            }
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
            options = __assign({}, flagwind.TRACKLINE_OPTIONS, options);
            this.checkMapSetting();
            if (stops.length < 1) {
                throw Error("站点不能少于2");
            }
            var stopGraphics = this.onGetStandardStops(name, stops);
            var segment = this.getLastSegment(name);
            var startLineIndex = segment ? segment.index + 1 : 0;
            if (segment) {
                var isEqual = this.onEqualGraphic(segment.endGraphic, stopGraphics[0]);
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
            var trackSegmentOptions = lineOptions;
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
                this.onSolveByService(segment, start, end, waypoints);
            }
            else {
                this.onSolveByJoinPoint(segment);
            }
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
            segment.setMultPoints(points);
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
         *
         * 显示路段事件
         *
         * @protected
         * @memberof flagwindRoute
         */
        FlagwindRouteLayer.prototype.onShowSegmentLineEvent = function (flagwindRoute, segment, lineOptions) {
            // 是否自动显示轨迹
            // if (lineOptions.autoShowSegmentLine) {
            flagwindRoute.onShowSegmentLine(segment);
            // }
            // if (lineOptions.onShowSegmentLineEvent) {
            //     lineOptions.onShowSegmentLineEvent(segment);
            // }
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
                flagwindRoute.onCreateMoveMark(trackline, graphic, angle);
            }
            flagwindRoute.flagwindMap.centerAt(graphic.geometry.x, graphic.geometry.y);
            if (!segment.lineGraphic) {
                flagwindRoute.onShowSegmentLine(segment);
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
            var point = this.flagwindMap.onCreatePoint({
                x: parseFloat(xy[0]),
                y: parseFloat(xy[1]),
                spatial: flagwindRoute.flagwindMap.spatial
            });
            var trackline = flagwindRoute.getTrackLine(segment.name);
            if (trackline) {
                flagwindRoute.onChangeMovingGraphicSymbol(trackline, point, angle);
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
            this.moveMarkLayer.on("onClick", function (evt) {
                if (me.options.onMovingClick) {
                    me.options.onMovingClick(evt);
                }
            }, this);
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
            _this.trackLines = [];
            return _this;
        }
        EsriRouteLayer.prototype.onSetSegmentByLine = function (options, segment) {
            throw new Error("Method not implemented.");
        };
        EsriRouteLayer.prototype.onSetSegmentByPoint = function (options, segment) {
            throw new Error("Method not implemented.");
        };
        EsriRouteLayer.prototype.onShowSegmentLine = function (segment) {
            var playedLineSymbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([38, 101, 196, 0.8]), 4, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_MITER, 2);
            segment.lineGraphic = this.getStandardGraphic(new esri.Graphic(segment.polyline, playedLineSymbol, {
                type: "segment",
                index: segment.index,
                line: segment.name
            }));
            this.moveLineLayer.addGraphic(segment.name, [segment.lineGraphic]);
        };
        EsriRouteLayer.prototype.onCreateMoveMark = function (trackline, graphic, angle) {
            var markerUrl = trackline.options.markerUrl;
            var markerHeight = trackline.options.markerHeight || 48;
            var markerWidth = trackline.options.markerWidth || 48;
            var symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
            return this.getStandardGraphic(new esri.Graphic(graphic.geometry, symbol, { type: "marker", line: trackline.name }));
            // return this.mapService.getTrackLineMarkerGraphic(trackline, graphic, angle);
        };
        EsriRouteLayer.prototype.onCreateLineLayer = function (id) {
            return new flagwind.EsriGroupLayer(id);
        };
        EsriRouteLayer.prototype.onCreateMovingLayer = function (id) {
            return new flagwind.EsriGroupLayer(id);
        };
        EsriRouteLayer.prototype.onEqualGraphic = function (originGraphic, targetGraphic) {
            return flagwind.MapUtils.isEqualPoint(originGraphic.geometry, targetGraphic.geometry);
        };
        EsriRouteLayer.prototype.onGetStandardStops = function (name, stops) {
            var stopGraphics = [];
            var stopSymbol = new esri.symbol.SimpleMarkerSymbol()
                .setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS)
                .setSize(15).outline.setWidth(3);
            for (var i = 0; i < stops.length; i++) {
                if (stops[i] instanceof Array) {
                    stopGraphics.push(this.getStandardGraphic(new esri.Graphic(new esri.geometry.Point(stops[i][0], stops[i][1]), stopSymbol, { type: "stop", line: name })));
                }
                else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                    stopGraphics.push(this.getStandardGraphic(new esri.Graphic(stops[i], stopSymbol, { type: "stop", line: name })));
                }
                else {
                    stopGraphics.push(this.getStandardGraphic(new esri.Graphic(stops[i].geometry, stopSymbol, { type: "stop", model: stops[i].attributes, line: name })));
                }
            }
            return stopGraphics;
        };
        EsriRouteLayer.prototype.onSolveByService = function (segment, start, end, waypoints) {
            var routeTask = new esri.tasks.RouteTask(this.options.routeUrl);
            var routeParams = new esri.tasks.RouteParameters();
            routeParams.stops = new esri.tasks.FeatureSet();
            routeParams.returnRoutes = true;
            routeParams.returnDirections = true;
            routeParams.directionsLengthUnits = esri.Units.MILES;
            routeParams.outSpatialReference = this.getSpatialReferenceFormNA();
            var flagwindRoute = this;
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
        EsriRouteLayer.prototype.onSolveByJoinPoint = function (segment) {
            var points = [];
            points.push(segment.startGraphic.geometry);
            if (segment.waypoints) {
                for (var i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }
            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setMultPoints(points);
        };
        EsriRouteLayer.prototype.onAddEventListener = function (groupLayer, eventName, callBack) {
            groupLayer.layer.on(eventName, callBack);
        };
        EsriRouteLayer.prototype.getSpatialReferenceFormNA = function () {
            return new esri.SpatialReference({ wkid: this.flagwindMap.spatial.wkid });
        };
        EsriRouteLayer.prototype.getStandardGraphic = function (graphic) {
            graphic.show = function () {
                console.log("graphic 的显示方法没有实现");
            };
            graphic.hide = function () {
                console.log("graphic 的隐藏方法没有实现");
            };
            return graphic;
        };
        EsriRouteLayer.prototype.cloneStopGraphic = function (graphic) {
            return this.getStandardGraphic(new esri.Graphic(graphic.geometry, graphic.symbol, {
                type: graphic.attributes.type,
                line: graphic.attributes.line
            }));
        };
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        EsriRouteLayer.prototype.onChangeMovingGraphicSymbol = function (trackline, point, angle) {
            if (trackline === undefined)
                return;
            var symbol = trackline.markerGraphic.symbol;
            symbol.setAngle(360 - angle);
            trackline.markerGraphic.setSymbol(symbol);
            trackline.markerGraphic.setGeometry(point);
            trackline.markerGraphic.draw(); // 重绘
        };
        return EsriRouteLayer;
    }(flagwind.FlagwindRouteLayer));
    flagwind.EsriRouteLayer = EsriRouteLayer;
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
        function FlagwindTiledLayer(id, url, title) {
            this.id = id;
            this.url = url;
            this.title = title;
            this.isShow = true;
            if (url) {
                this.layer = this.onCreateTiledLayer({
                    url: url,
                    id: id,
                    title: title
                });
            }
        }
        FlagwindTiledLayer.prototype.appendTo = function (map) {
            if (this.layer) {
                this.layer.addToMap(map);
            }
        };
        FlagwindTiledLayer.prototype.removeLayer = function (map) {
            this.layer.removeFormMap(map);
        };
        FlagwindTiledLayer.prototype.show = function () {
            this.isShow = true;
            this.layer.show();
        };
        FlagwindTiledLayer.prototype.hide = function () {
            this.isShow = false;
            this.layer.hide();
        };
        return FlagwindTiledLayer;
    }());
    flagwind.FlagwindTiledLayer = FlagwindTiledLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-tiled.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriTiledLayer = /** @class */ (function (_super) {
        __extends(EsriTiledLayer, _super);
        function EsriTiledLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EsriTiledLayer.prototype.onCreateTiledLayer = function (args) {
            var layer = new esri.layers.GraphicsLayer(args);
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFormMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        return EsriTiledLayer;
    }(flagwind.FlagwindTiledLayer));
    flagwind.EsriTiledLayer = EsriTiledLayer;
})(flagwind || (flagwind = {}));
/// <reference path="./flagwind-feature.layer.ts" />
var flagwind;
(function (flagwind) {
    flagwind.BUSINESS_LAYER_OPTIONS = {
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
    /**
     * 业务图层
     */
    var FlagwindBusinessLayer = /** @class */ (function (_super) {
        __extends(FlagwindBusinessLayer, _super);
        function FlagwindBusinessLayer(flagwindMap, id, options) {
            var _this = _super.call(this, id, options.title || "设备图层") || this;
            _this.flagwindMap = flagwindMap;
            _this.id = id;
            _this.options = options;
            options = __assign({}, flagwind.BUSINESS_LAYER_OPTIONS, options);
            _this.flagwindMap = flagwindMap;
            _this.options = options;
            return _this;
        }
        FlagwindBusinessLayer.prototype.onInit = function () {
            this.onAddLayerBefor();
            this.flagwindMap.addFeatureLayer(this);
            this.onAddLayerAfter();
            if (this.flagwindMap.loaded) {
                this.onLoad();
            }
            else {
                var me_2 = this;
                this.flagwindMap.on("load", function () {
                    me_2.onLoad();
                });
            }
        };
        // public abstract onAddEventListener(eventName: string, callback: Function): void;
        FlagwindBusinessLayer.prototype.onAddLayerBefor = function () {
            console.log("onAddLayerBefor");
        };
        FlagwindBusinessLayer.prototype.onAddLayerAfter = function () {
            console.log("onAddLayerAfter");
        };
        Object.defineProperty(FlagwindBusinessLayer.prototype, "map", {
            get: function () {
                return this.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindBusinessLayer.prototype, "spatial", {
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        FlagwindBusinessLayer.prototype.gotoCenterById = function (key) {
            var graphic = this.getGraphicById(key);
            var pt = this.getPoint(graphic.attributes);
            this.map.centerAt(pt).then(function () {
                console.log(pt);
            });
        };
        FlagwindBusinessLayer.prototype.saveGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.saveGraphicByModel(dataList[i]);
            }
        };
        FlagwindBusinessLayer.prototype.updateGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.updateGraphicByModel(dataList[i]);
            }
        };
        // 设置选择状态
        FlagwindBusinessLayer.prototype.setSelectStatusByModels = function (dataList) {
            this.clearSelectStatus();
            for (var i = 0; i < dataList.length; i++) {
                var model = this.onChangeStandardModel(dataList[i]);
                var graphic = this.getGraphicById(model.id);
                if (graphic) {
                    this.setSelectStatus(graphic, true);
                }
            }
        };
        /**
         * 保存要素（如果存在，则修改，否则添加）
         */
        FlagwindBusinessLayer.prototype.saveGraphicByModel = function (item) {
            item = this.onChangeStandardModel(item);
            if (!item || !item.id)
                return;
            var graphic = this.getGraphicById(item.id);
            if (graphic) {
                return this.updateGraphicByModel(item, graphic);
            }
            else {
                return this.addGraphicByModel(item);
            }
        };
        FlagwindBusinessLayer.prototype.addGraphicByModel = function (item) {
            var graphic = this.creatGraphicByModel(item);
            this.layer.add(graphic);
        };
        FlagwindBusinessLayer.prototype.creatGraphicByModel = function (item) {
            item = this.onChangeStandardModel(item);
            if (!this.onValidModel(item)) {
                return null;
            }
            item.select = false; // select属性为true表示当前选中，false表示未选中
            var graphic = this.onCreatGraphicByModel(item);
            return graphic;
        };
        /**
         * 修改要素
         */
        FlagwindBusinessLayer.prototype.updateGraphicByModel = function (item, graphic) {
            if (graphic === void 0) { graphic = null; }
            item = this.onChangeStandardModel(item);
            if (!this.onValidModel(item)) {
                return;
            }
            if (!graphic) {
                graphic = this.getGraphicById(item.id);
            }
            if (graphic == null) {
                return;
            }
            var pt = this.getPoint(item);
            this.onUpdateGraphicByModel(item);
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
        FlagwindBusinessLayer.prototype.clearSelectStatus = function () {
            var graphics = this.layer.graphics;
            for (var i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected) {
                    this.setSelectStatus(graphics[i], false);
                }
            }
        };
        FlagwindBusinessLayer.prototype.getSelectedGraphics = function () {
            return this.layer.graphics.filter(function (g) { return g.attributes && g.attributes.selected; });
        };
        /**
         * 创建点要素（把业务数据的坐标转换成地图上的点）
         */
        FlagwindBusinessLayer.prototype.getPoint = function (item) {
            return this.flagwindMap.getPoint(item);
        };
        /**
         * 把地图上的点转换成业务的坐标
         * @param {*} point
         */
        FlagwindBusinessLayer.prototype.formPoint = function (point) {
            return this.flagwindMap.onFormPoint(point);
        };
        FlagwindBusinessLayer.prototype.onLoad = function () {
            if (!this.layer._map) {
                this.layer._map = this.flagwindMap.innerMap;
            }
            this.registerEvent();
            this.onMapLoad();
        };
        FlagwindBusinessLayer.prototype.onMapLoad = function () {
            this.options.onMapLoad();
        };
        FlagwindBusinessLayer.prototype.registerEvent = function () {
            var _deviceLayer = this;
            this.on("onCliick", function (evt) {
                _deviceLayer.onLayerClick(_deviceLayer, evt.data);
            });
            if (this.options.showTooltipOnHover) {
                this.on("onMouseOver", function (evt) {
                    _deviceLayer.flagwindMap.onShowTooltip(evt.data.graphic);
                });
                this.on("onMouseOut", function (evt) {
                    _deviceLayer.flagwindMap.onHideTooltip(evt.data.graphic);
                });
            }
        };
        FlagwindBusinessLayer.prototype.onLayerClick = function (deviceLayer, evt) {
            if (deviceLayer.options.onLayerClick) {
                deviceLayer.options.onLayerClick(evt);
            }
            if (deviceLayer.options.showInfoWindow) {
                evt.graphic.attributes.eventName = "";
                deviceLayer.onShowInfoWindow(evt);
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
                deviceLayer.options.onCheck({
                    target: [evt.graphic.attributes],
                    check: evt.graphic.attributes.selected,
                    selectGraphics: deviceLayer.getSelectedGraphics()
                });
            }
        };
        FlagwindBusinessLayer.prototype.fireEvent = function (eventName, event) {
            this.options.onEvent(eventName, event);
        };
        FlagwindBusinessLayer.prototype.setSelectStatus = function (item, selected) {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        };
        FlagwindBusinessLayer.prototype.onValidModel = function (item) {
            return item.longitude && item.latitude;
        };
        return FlagwindBusinessLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.FlagwindBusinessLayer = FlagwindBusinessLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.EDIT_LAYER_OPTIONS = {
        onEditInfo: function (key, lon, lat, isSave) {
            console.log("onEditInfo");
        }
    };
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.LOCATION_LAYER_OPTIONS = {
        onMapClick: function (evt) {
            console.log("onMapClick");
        }
    };
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.TRACKSEGMENT_OPTIONS = {
        speed: 100,
        numsOfKilometer: 50,
        autoShowLine: false,
        onShowSegmentLineEvent: function (segment) {
            console.log("onShowSegmentLineEvent");
        },
        onMoveStartEvent: function (target, startGraphic, angle) {
            console.log("onMoveStartEvent");
        },
        onMoveEndEvent: function (target, endGraphic, angle) {
            console.log("onMoveEndEvent");
        },
        onMoveEvent: function (target, point, angle) {
            console.log("onMoveEvent");
        }
    };
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
            this.options = __assign({}, flagwind.TRACKSEGMENT_OPTIONS, options);
        }
        /**
         * 设置拆线
         */
        TrackSegment.prototype.setPolyLine = function (polyline, length) {
            this.flagwindRouteLayer.onSetSegmentByLine({
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
        TrackSegment.prototype.setMultPoints = function (points) {
            this.flagwindRouteLayer.onSetSegmentByPoint({
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
        }
        /**
         * 隐藏移动要素
         *
         * @memberof TrackLine
         */
        TrackLine.prototype.hideMovingGraphic = function () {
            this.isMovingGraphicHide = true;
            this.markerGraphic.hide();
            // this.flagwindMap.onHideGraphic(this.markerGraphic);
        };
        /**
         * 显示移动要素
         *
         * @memberof TrackLine
         */
        TrackLine.prototype.showMovingGraphic = function () {
            if (this.isMovingGraphicHide) {
                this.isMovingGraphicHide = false;
                this.markerGraphic.show();
                // this.flagwindMap.onShowGraphic(this.markerGraphic);
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
    var MapUtils = /** @class */ (function () {
        function MapUtils() {
        }
        /**
         * 增密
         * @param start 始点
         * @param end 终点
         * @param n 增加的点数
         */
        MapUtils.density = function (start, end, n) {
            var resList = [];
            if (n === 0) {
                resList.push(start);
                resList.push(end);
                return resList;
            }
            var xDiff = (end.x - start.x) / n;
            var yDiff = (end.y - start.y) / n;
            for (var j = 0; j < n; j++) {
                resList.push(new flagwind.MinemapPoint(start.x + j * xDiff, start.y + j * yDiff));
            }
            resList.push({ x: end.x, y: end.y });
            return resList;
        };
        /**
         * 线段抽稀操作
         * @param paths  多线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        MapUtils.vacuate = function (paths, length, numsOfKilometer) {
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
        MapUtils.validGeometryModel = function (item) {
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
            return this._keys;
        };
        /**
         * 获取包含 Map<K, V> 中的值列表。
         * @returns Array
         */
        Map.prototype.values = function () {
            return this._values;
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
        Map.of = function () {
            var kvs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                kvs[_i] = arguments[_i];
            }
            if (kvs == null) {
                return null;
            }
            var map = new Map();
            kvs.forEach(function (g) {
                if (g instanceof Array) {
                    var a = g;
                    map.set(a[0], a[1]);
                }
                else {
                    throw new flagwind.Exception("参数不正确");
                }
            });
            return map;
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
     * EventArgs 类作为创建事件参数的基类，当发生事件时，EventArgs 实例将作为参数传递给事件侦听器。
     * @class
     * @version 1.0.0
     */
    var EventArgs = /** @class */ (function () {
        /**
         * 初始化 EventArgs 类的新实例。
         * @constructor
         * @param  {string} type 事件类型。
         * @param  {any?} data 可选数据。
         */
        function EventArgs(type, data) {
            if (!type) {
                throw new flagwind.ArgumentException();
            }
            this._type = type;
            this._data = data;
        }
        Object.defineProperty(EventArgs.prototype, "type", {
            /**
             * 获取一个字符串值，表示事件的类型。
             * @property
             * @returns string
             */
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventArgs.prototype, "source", {
            /**
             * 获取或设置事件源对象。
             * @property
             * @returns any
             */
            get: function () {
                return this._source;
            },
            set: function (value) {
                if (!value) {
                    throw new flagwind.ArgumentException();
                }
                this._source = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventArgs.prototype, "data", {
            /**
             * 获取或设置与事件关联的可选数据。
             * @property
             * @returns any
             */
            get: function () {
                return this._data;
            },
            set: function (value) {
                this._data = value;
            },
            enumerable: true,
            configurable: true
        });
        return EventArgs;
    }());
    flagwind.EventArgs = EventArgs;
})(flagwind || (flagwind = {}));
/// <reference path="./EventArgs" />
var flagwind;
(function (flagwind) {
    /**
     * 为可取消的事件提供数据。
     * @class
     * @version 1.0.0
     */
    var CancelEventArgs = /** @class */ (function (_super) {
        __extends(CancelEventArgs, _super);
        function CancelEventArgs() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._cancel = false;
            return _this;
        }
        Object.defineProperty(CancelEventArgs.prototype, "cancel", {
            /**
             * 获取或设置指示是否应取消事件。
             * @property
             * @returns boolean
             */
            get: function () {
                return this._cancel;
            },
            set: function (value) {
                this._cancel = value;
            },
            enumerable: true,
            configurable: true
        });
        return CancelEventArgs;
    }(flagwind.EventArgs));
    flagwind.CancelEventArgs = CancelEventArgs;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 提供关于事件提供程序的功能。
     * @class
     * @version 1.0.0
     */
    var EventProviderFactory = /** @class */ (function () {
        /**
         * 初始化事件提供程序工厂的新实例。
         * @constructor
         */
        function EventProviderFactory() {
            this._providers = new flagwind.Map();
        }
        Object.defineProperty(EventProviderFactory.prototype, "providers", {
            /**
             * 获取所有事件提供程序。
             * @property
             * @returns IMap<any, IEventProvider>
             */
            get: function () {
                return this._providers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventProviderFactory, "instance", {
            /**
             * 获取事件提供程序工厂的单实例。
             * @static
             * @property
             * @returns EventProviderFactory
             */
            get: function () {
                if (!this._instance) {
                    this._instance = new EventProviderFactory();
                }
                return this._instance;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取指定事件源的事件提供程序。
         * @param  {any} source IEventProvider 所抛出事件对象的源对象。
         * @returns IEventProdiver 返回指定名称的事件提供程序。
         */
        EventProviderFactory.prototype.getProvider = function (source) {
            if (!source) {
                throw new flagwind.ArgumentException();
            }
            var provider = this._providers.get(source);
            if (!provider) {
                provider = this.createProvider(source);
                this._providers.set(source, provider);
            }
            return provider;
        };
        /**
         * 根据指定事件源创建一个事件提供程序。
         * @virtual
         * @param  {any} source IEventProvider 所抛出事件对象的源对象。
         * @returns IEventProvider 事件提供程序实例。
         */
        EventProviderFactory.prototype.createProvider = function (source) {
            return new flagwind.EventProvider(source);
        };
        return EventProviderFactory;
    }());
    flagwind.EventProviderFactory = EventProviderFactory;
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
     * 编辑要素图层
     */
    var MinemapEditLayer = /** @class */ (function () {
        function MinemapEditLayer(businessLayer) {
            this.businessLayer = businessLayer;
            this.draggingFlag = false;
            this.cursorOverPointFlag = false;
        }
        Object.defineProperty(MinemapEditLayer.prototype, "map", {
            get: function () {
                return this.businessLayer.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        MinemapEditLayer.prototype.registerEvent = function (graphic) {
            var me = this;
            graphic.on("onMouseOver", function (args) {
                console.log("test--->onMouseOver");
                me.cursorOverPointFlag = true;
                me.map.dragPan.disable();
            });
            graphic.on("onMouseOut", function (args) {
                console.log("test--->onMouseOut");
                me.cursorOverPointFlag = false;
                me.map.dragPan.enable();
            });
            graphic.on("onMouseDown", function (args) {
                if (!me.cursorOverPointFlag)
                    return;
                me.draggingFlag = true;
                console.log("test--->onMouseDown");
                window._editLayer = me;
                console.log("test--->map.on.mousemove");
                me.map.on("mousemove", me.mouseMovePoint);
            });
            graphic.on("onMouseUp", function (args) {
                console.log("test--->onMouseUp");
                if (!me.draggingFlag)
                    return;
                me.draggingFlag = false;
                console.log("test--->map.off.mousemove");
                me.map.off("mousemove", me.mouseMovePoint);
                window._editLayer = null;
                me.updatePoint(me);
            });
        };
        MinemapEditLayer.prototype.updatePoint = function (editLayer) {
            var isOK = confirm("确定要更新坐标为x:" + editLayer.graphic.geometry.x + ",y:" + editLayer.graphic.geometry.x);
            if (!isOK) {
                this.cancelEdit(this.graphic.attributes.id);
                return;
            }
            editLayer.onChanged({
                key: editLayer.graphic.attributes.id,
                longitude: editLayer.graphic.geometry.x,
                latitude: editLayer.graphic.geometry.y
            }, isOK);
        };
        MinemapEditLayer.prototype.mouseMovePoint = function (e) {
            var editLayer = window._editLayer;
            console.log("test-->status  over:" + editLayer.cursorOverPointFlag + ".drag:" + editLayer.draggingFlag);
            if (!editLayer.draggingFlag)
                return;
            console.log("test-->update  x:" + e.lngLat.lng + ".y:" + e.lngLat.lat);
            var point = new flagwind.MinemapPoint(e.lngLat.lng, e.lngLat.lat);
            editLayer.graphic.geometry = point;
        };
        MinemapEditLayer.prototype.activateEdit = function (key) {
            var g = this.businessLayer.getGraphicById(key);
            if (g) {
                this.graphic = g.clone(g.id + "_copy");
            }
            this.businessLayer.hide();
            this.graphic.addTo(this.map);
            this.registerEvent(this.graphic);
        };
        MinemapEditLayer.prototype.cancelEdit = function (key) {
            var graphic = this.graphic;
            graphic.remove();
            this.map.off("mousemove", this.mouseMovePoint);
            this.businessLayer.show();
            this.cursorOverPointFlag = false;
            this.draggingFlag = false;
        };
        MinemapEditLayer.prototype.onChanged = function (options, isSave) {
            return new Promise(function (resolve, reject) {
                resolve(true);
            });
        };
        return MinemapEditLayer;
    }());
    flagwind.MinemapEditLayer = MinemapEditLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapGroupLayer = /** @class */ (function (_super) {
        __extends(MinemapGroupLayer, _super);
        function MinemapGroupLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MinemapGroupLayer.prototype.addListener = function (type, listener, scope, once) {
            this.layer.addListener(type, listener, scope, once);
        };
        MinemapGroupLayer.prototype.removeListener = function (type, listener, scope) {
            this.layer.removeListener(type, listener, scope);
        };
        MinemapGroupLayer.prototype.hasListener = function (type) {
            return this.layer.hasListener(type);
        };
        MinemapGroupLayer.prototype.dispatchEvent = function (type, data) {
            return this.layer.dispatchEvent(type, data);
        };
        MinemapGroupLayer.prototype.onCreateGraphicsLayer = function (options) {
            if (options.kind === "marker") {
                return new flagwind.MinemapMarkerLayer(options);
            }
            if (options.kind === "geojson") {
                return new flagwind.MinemapGeoJsonLayer(options);
            }
            console.log("未指定图层类型");
            return null;
        };
        return MinemapGroupLayer;
    }(flagwind.FlagwindGroupLayer));
    flagwind.MinemapGroupLayer = MinemapGroupLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapHotmapLayer = /** @class */ (function () {
        function MinemapHotmapLayer(flagwindMap, options) {
            this.flagwindMap = flagwindMap;
            this.isShow = false;
            this.options = options;
            this.chartOptions = {
                GLMap: {
                    roam: true
                },
                coordinateSystem: "GLMap",
                title: {
                    text: options.title || "热力图展示",
                    subtext: "",
                    left: "center",
                    textStyle: {
                        color: "#fff"
                    }
                },
                tooltip: {
                    trigger: "item"
                },
                visualMap: {
                    show: false,
                    top: "top",
                    min: 0,
                    max: 10,
                    seriesIndex: 0,
                    calculable: true,
                    inRange: {
                        color: ["blue", "blue", "green", "yellow", "red"]
                    }
                },
                series: [{
                        type: "heatmap",
                        data: [],
                        coordinateSystem: "GLMap",
                        pointSize: 8,
                        blurSize: 12
                    }]
            };
        }
        Object.defineProperty(MinemapHotmapLayer.prototype, "echartslayer", {
            get: function () {
                if (this._echartslayer == null) {
                    this._echartslayer = minemap.Template.create({ map: this.flagwindMap.map, type: "heatmap" });
                }
                return this._echartslayer;
            },
            enumerable: true,
            configurable: true
        });
        MinemapHotmapLayer.prototype.resize = function () {
            this.echartslayer.resize();
        };
        MinemapHotmapLayer.prototype.clear = function () {
            this.chartOptions.series[0].data = [];
            this.echartslayer.chart.setOption(this.chartOptions);
        };
        MinemapHotmapLayer.prototype.show = function () {
            this.isShow = true;
            this.echartslayer._container.style.display = "";
        };
        MinemapHotmapLayer.prototype.hide = function () {
            this.isShow = false;
            this.echartslayer._container.style.display = "none";
        };
        MinemapHotmapLayer.prototype.showDataList = function (data) {
            var list = [];
            data.forEach(function (g) {
                if (g instanceof Array) {
                    list.push(g);
                }
                else {
                    list.push([g.x, g.y, g.count]);
                }
            });
            this.chartOptions.series[0].data = data;
            this.echartslayer.chart.setOption(this.chartOptions);
        };
        return MinemapHotmapLayer;
    }());
    flagwind.MinemapHotmapLayer = MinemapHotmapLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../events/EventProvider" />
var flagwind;
(function (flagwind) {
    /**
     * 几何对象
     */
    var MinemapGeometry = /** @class */ (function () {
        function MinemapGeometry(type, spatial) {
            this.type = type;
            this.spatial = spatial;
        }
        return MinemapGeometry;
    }());
    flagwind.MinemapGeometry = MinemapGeometry;
    /**
     * 线
     */
    var MinemapPolyline = /** @class */ (function (_super) {
        __extends(MinemapPolyline, _super);
        function MinemapPolyline(spatial) {
            if (spatial === void 0) { spatial = null; }
            var _this = _super.call(this, "Polyline", spatial) || this;
            _this.path = [];
            return _this;
        }
        MinemapPolyline.prototype.getPoint = function (pointIndex) {
            return this.path[pointIndex];
        };
        MinemapPolyline.prototype.insertPoint = function (pointIndex, point) {
            this.path.splice(pointIndex, 0, point);
        };
        MinemapPolyline.prototype.removePoint = function (pointIndex) {
            this.path.splice(pointIndex, 1);
        };
        MinemapPolyline.prototype.toJson = function () {
            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": this.path
                    }
                }
            };
        };
        return MinemapPolyline;
    }(MinemapGeometry));
    flagwind.MinemapPolyline = MinemapPolyline;
    /**
     * 面
     */
    var MinemapPolygon = /** @class */ (function (_super) {
        __extends(MinemapPolygon, _super);
        function MinemapPolygon(spatial) {
            if (spatial === void 0) { spatial = null; }
            var _this = _super.call(this, "Line", spatial) || this;
            _this.rings = [];
            return _this;
        }
        MinemapPolygon.prototype.addRing = function (path) {
            this.rings.push(path);
        };
        MinemapPolygon.prototype.removeRing = function (ringIndex) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings = this.rings.splice(ringIndex, 1);
        };
        MinemapPolygon.prototype.getPoint = function (ringIndex, pointIndex) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            return this.rings[ringIndex][pointIndex];
        };
        MinemapPolygon.prototype.insertPoint = function (ringIndex, pointIndex, point) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings[ringIndex].splice(pointIndex, 0, point);
        };
        MinemapPolygon.prototype.removePoint = function (ringIndex, pointIndex) {
            if (ringIndex > this.rings.length) {
                throw new Error("数组越界");
            }
            this.rings[ringIndex].splice(pointIndex, 1);
        };
        MinemapPolygon.prototype.toJson = function () {
            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": this.rings
                    }
                }
            };
        };
        return MinemapPolygon;
    }(MinemapGeometry));
    flagwind.MinemapPolygon = MinemapPolygon;
    /**
     * 坐标点
     */
    var MinemapPoint = /** @class */ (function (_super) {
        __extends(MinemapPoint, _super);
        function MinemapPoint(x, y, spatial) {
            if (spatial === void 0) { spatial = null; }
            var _this = _super.call(this, "Point", spatial) || this;
            _this.x = x;
            _this.y = y;
            _this.spatial = spatial;
            return _this;
        }
        MinemapPoint.prototype.toJson = function () {
            return {
                "type": "Feature",
                "properties": this.attributes || {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [this.x, this.y]
                }
            };
        };
        return MinemapPoint;
    }(MinemapGeometry));
    flagwind.MinemapPoint = MinemapPoint;
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
    var MinemapMarker = /** @class */ (function (_super) {
        __extends(MinemapMarker, _super);
        function MinemapMarker(options) {
            var _this = _super.call(this) || this;
            _this._kind = "marker";
            /**
             * 是否在地图上
             */
            _this._isInsided = false;
            _this.isShow = true;
            _this.EVENTS_MAP = new flagwind.Map();
            _this.id = options.id;
            _this.element = document.createElement("div");
            _this.element.id = _this.id;
            _this.symbol = options.symbol;
            _this.attributes = options.attributes;
            if (options.symbol && options.symbol.className) {
                _this.element.classList = [options.symbol.className];
            }
            _this.marker = new minemap.Marker(_this.element, { offset: [-25, -25] });
            if (options.point) {
                _this.geometry = new MinemapPoint(options.point.x, options.point.y);
            }
            if (options.geometry) {
                _this.geometry = options.geometry;
            }
            var me = _this;
            _this.element.onmouseover = function (args) {
                console.log("fire marker onMouseOver");
                me.fireEvent("onMouseOver", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            _this.element.onmouseout = function (args) {
                console.log("fire marker onMouseOut");
                me.fireEvent("onMouseOut", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            _this.element.onmousedown = function (args) {
                console.log("fire marker onMouseDown");
                me.fireEvent("onMouseDown", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            _this.element.onmouseup = function (args) {
                console.log("fire marker onMouseUp");
                me.fireEvent("onMouseUp", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            _this.element.onclick = function (args) {
                console.log("fire marker onClick");
                me.fireEvent("onClick", {
                    graphic: me,
                    mapPoint: me.geometry,
                    orgion: args
                });
            };
            return _this;
        }
        /**
         * 复制节点
         * @param id 元素ID
         */
        MinemapMarker.prototype.clone = function (id) {
            var m = new MinemapMarker({
                id: id,
                symbol: this.symbol,
                attributes: this.attributes,
                point: this.geometry
            });
            return m;
        };
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
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        MinemapMarker.prototype.on = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            this.addListener(type, listener, scope, once);
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        MinemapMarker.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        // public onCallBack(eventName: string, arg: any) {
        //     let call = this.EVENTS_MAP.get(eventName);
        //     if (call) {
        //         call(arg);
        //     }
        //     if (!this.layer) { return; }
        //     let callback = this.layer.getCallBack(eventName);
        //     if (callback) {
        //         callback(arg);
        //     }
        // }
        MinemapMarker.prototype.show = function () {
            if (!this.layer) {
                throw new flagwind.Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
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
            if (this.layer) {
                this.layer.remove(this);
            }
        };
        MinemapMarker.prototype.setAngle = function (angle) {
            this.element.style.transform = "rotate(" + angle + "deg)";
            this.element.style["-ms-transform"] = "rotate(" + angle + "deg)";
            this.element.style["-moz-transform"] = "rotate(" + angle + "deg)";
            this.element.style["-webkit-transform"] = "rotate(" + angle + "deg)";
            this.element.style["-o-transform"] = "rotate(" + angle + "deg)";
        };
        MinemapMarker.prototype.setSymbol = function (symbol) {
            if (this.symbol && this.symbol.className) {
                this.element.classList.remove(this.symbol.className);
            }
            if (symbol.className) {
                this.element.classList.push(symbol.className);
            }
        };
        MinemapMarker.prototype.draw = function () {
            console.log("draw");
        };
        Object.defineProperty(MinemapMarker.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            set: function (geometry) {
                this._geometry = geometry;
                this.marker.setLngLat([geometry.x, geometry.y]);
            },
            enumerable: true,
            configurable: true
        });
        MinemapMarker.prototype.setGeometry = function (value) {
            if (value instanceof MinemapPoint) {
                this.geometry = value;
            }
            else {
                throw new Error("不匹配类型");
            }
        };
        MinemapMarker.prototype.addTo = function (map) {
            this._isInsided = true;
            this.marker.addTo(map);
        };
        MinemapMarker.prototype.fireEvent = function (type, data) {
            this.dispatchEvent(type, data);
            if (this.layer) {
                this.layer.dispatchEvent(type, data);
            }
        };
        return MinemapMarker;
    }(flagwind.EventProvider));
    flagwind.MinemapMarker = MinemapMarker;
    var MinemapGeoJson = /** @class */ (function () {
        function MinemapGeoJson(layer, options) {
            this.layer = layer;
            this._kind = "geojson";
            /**
             * 是否在地图上
             */
            this._isInsided = false;
            this.isShow = true;
            this.attributes = {};
            if (options && options.id) {
                this.id = options.id;
            }
            if (options && options.type) {
                this.type = options.type;
            }
            if (options && options.paint) {
                this.paint = options.paint;
            }
            if (options && options.layout) {
                this.layout = options.layout;
            }
            if (options && options.attributes) {
                this.attributes = options.attributes;
            }
            if (options && options.geometry) {
                if (options.geometry instanceof MinemapGeometry) {
                    this.geometry = options.geometry;
                }
                else {
                    throw new flagwind.Exception("geometry 类型不正确");
                }
            }
            if (options && options.symbol) {
                if (options.symbol.layout) {
                    this.layout = options.symbol.layout;
                }
                if (options.symbol.paint) {
                    this.layout = options.symbol.paint;
                }
            }
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
            if (symbol && symbol.paint) {
                this.paint = symbol.paint;
            }
            if (symbol && symbol.layout) {
                this.layout = symbol.layout;
            }
        };
        Object.defineProperty(MinemapGeoJson.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            set: function (value) {
                this._geometry = value;
            },
            enumerable: true,
            configurable: true
        });
        MinemapGeoJson.prototype.setGeometry = function (value) {
            if (value instanceof MinemapGeoJson) {
                this.geometry = value;
            }
        };
        MinemapGeoJson.prototype.addTo = function (map) {
            if (!map)
                return;
            if (!this.id) {
                throw new flagwind.Exception("没有指定id，无法添加");
            }
            if (!this.geometry) {
                throw new flagwind.Exception("没有指定geometry，无法添加");
            }
            var json = this.geometry.toJson();
            console.log(json);
            map.addSource(this.id + "_source", json);
        };
        MinemapGeoJson.prototype.addLayer = function (map) {
            var layerJson = {
                id: this.id,
                source: this.id + "_source",
                type: this.type,
                paint: this.paint,
                layout: this.layout
            };
            map.addLayer(layerJson);
        };
        return MinemapGeoJson;
    }());
    flagwind.MinemapGeoJson = MinemapGeoJson;
    var MinemapMarkerLayer = /** @class */ (function (_super) {
        __extends(MinemapMarkerLayer, _super);
        function MinemapMarkerLayer(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.GRAPHICS_MAP = new flagwind.Map();
            // private EVENTS_MAP: Map<string, Function> = new Map<string, Function>();
            /**
             * 是否在地图上
             */
            _this._isInsided = false;
            _this.id = options.id;
            return _this;
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
                if (this.GRAPHICS_MAP.size === 0) {
                    return new Array();
                }
                else {
                    return this.GRAPHICS_MAP.values();
                }
            },
            enumerable: true,
            configurable: true
        });
        // public getCallBack(eventName: string): Function {
        //     return this.EVENTS_MAP.get(eventName);
        // }
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        MinemapMarkerLayer.prototype.on = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            this.addListener(type, listener, scope, once);
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        MinemapMarkerLayer.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        // public on(eventName: string, callBack: Function) {
        //     this.EVENTS_MAP.set(eventName, callBack);
        // }
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
    }(flagwind.EventProvider));
    flagwind.MinemapMarkerLayer = MinemapMarkerLayer;
    var MinemapGeoJsonLayer = /** @class */ (function (_super) {
        __extends(MinemapGeoJsonLayer, _super);
        function MinemapGeoJsonLayer(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.GRAPHICS_MAP = new flagwind.Map();
            /**
             * 是否在地图上
             */
            _this._isInsided = false;
            _this.id = options.id;
            return _this;
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
                return this.GRAPHICS_MAP.values();
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
        /**
         * 为指定的事件类型注册一个侦听器，以使侦听器能够接收事件通知。
         * @summary 如果不再需要某个事件侦听器，可调用 removeListener() 删除它，否则会产生内存问题。
         * 由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
         * @param  {string} type 事件类型。
         * @param  {Function} 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @param  {boolean} once? 是否添加仅回调一次的事件侦听器，如果此参数设为 true 则在第一次回调时就自动移除监听。
         * @returns void
         */
        MinemapGeoJsonLayer.prototype.on = function (type, listener, scope, once) {
            if (scope === void 0) { scope = this; }
            if (once === void 0) { once = false; }
            this.addListener(type, listener, scope, once);
        };
        /**
         * 移除侦听器。如果没有注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         * @param  {string} type 事件类型。
         * @param  {Function} listener 处理事件的侦听器函数。
         * @param  {any} scope? 侦听函数绑定的 this 对象。
         * @returns void
         */
        MinemapGeoJsonLayer.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        return MinemapGeoJsonLayer;
    }(flagwind.EventProvider));
    flagwind.MinemapGeoJsonLayer = MinemapGeoJsonLayer;
})(flagwind || (flagwind = {}));
/// <reference path="./minemap.model.ts" />
var flagwind;
(function (flagwind) {
    var MinemapLocationLayer = /** @class */ (function (_super) {
        __extends(MinemapLocationLayer, _super);
        function MinemapLocationLayer(flagwindMap, options) {
            var _this = _super.call(this, options) || this;
            _this.flagwindMap = flagwindMap;
            _this.options = __assign({}, flagwind.LOCATION_LAYER_OPTIONS, _this.options);
            _this.addToMap(flagwindMap.map);
            _this.registerEvent();
            return _this;
        }
        MinemapLocationLayer.prototype.registerEvent = function () {
            var me = this;
            this.flagwindMap.on("onClick", function (args) {
                me.point = new flagwind.MinemapPoint(args.data.lngLat.lng, args.data.lngLat.lat);
                me.locate();
            }, this);
        };
        MinemapLocationLayer.prototype.locate = function () {
            this.clear();
            var marker = new flagwind.MinemapMarker({
                id: "flagwind_map_location",
                type: "Point",
                geometry: this.point,
                symbol: {
                    className: "flagwind-map-location"
                }
            });
            marker.element.innerHTML = "<div class='breathing'><div class='pulse'></div></div>";
            this.add(marker);
            this.options.onMapClick({ point: this.point });
        };
        return MinemapLocationLayer;
    }(flagwind.MinemapMarkerLayer));
    flagwind.MinemapLocationLayer = MinemapLocationLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    // const MINEMAP_MAP_EVENTS_MAP: Map<string, string> = Map.of(["onLoad", "load"]);
    // MINEMAP_MAP_EVENTS_MAP.set("onLoad", "load");
    var MinemapMap = /** @class */ (function (_super) {
        __extends(MinemapMap, _super);
        function MinemapMap(mapSetting, mapEl, options) {
            var _this = _super.call(this, mapSetting, mapEl, options) || this;
            _this.mapSetting = mapSetting;
            _this.mapEl = mapEl;
            _this.onInit();
            return _this;
        }
        // /**
        //  * 事件监听
        //  * @param eventName 事件名称
        //  * @param callBack 回调
        //  */
        // public onAddEventListener(eventName: string, callBack: Function): void {
        //     let en = MINEMAP_MAP_EVENTS_MAP.get(eventName) || eventName;
        //     this.innerMap.on(en, callBack);
        // }
        /**
         * 中心定位
         * @param point 坐标点
         */
        MinemapMap.prototype.onCenterAt = function (point) {
            this.innerMap.flyTo({
                center: [
                    point.x,
                    point.y
                ]
            });
        };
        /**
         * 创建点
         * @param options 点属性
         */
        MinemapMap.prototype.onCreatePoint = function (options) {
            return new flagwind.MinemapPoint(options.x, options.y, options.spatial || this.spatial);
        };
        /**
         * 创建地图对象
         */
        MinemapMap.prototype.onCreateMap = function () {
            minemap.domainUrl = "http://" + this.mapSetting.mapDomain;
            minemap.spriteUrl = "http://" + this.mapSetting.mapDomain + "/minemapapi/" + this.mapSetting.mapVersion + "/sprite/sprite";
            minemap.serviceUrl = "http://" + this.mapSetting.mapDomain + "/service";
            minemap.accessToken = this.mapSetting.accessToken || "25cc55a69ea7422182d00d6b7c0ffa93";
            minemap.solution = this.mapSetting.wkid || 2365;
            var map = new minemap.Map({
                container: this.mapEl,
                style: "http://" + this.mapSetting.mapDomain + "/service/solu/style/id/" + minemap.solution,
                center: this.mapSetting.center || [116.46, 39.92],
                zoom: this.mapSetting.zoom,
                pitch: 60,
                maxZoom: this.mapSetting.maxZoom || 17,
                minZoom: this.mapSetting.minZoom || 9 // 地图最小缩放级别限制
            });
            this.spatial = new flagwind.MinemapSpatial(minemap.solution);
            var popup = new minemap.Popup({ closeOnClick: true, closeButton: true, offset: [0, -35] }); // 创建全局信息框
            map.infoWindow = popup;
            var div = this.tooltipElement = document.createElement("div");
            div.id = "flagwind-map-tooltip";
            div.classList.add("flagwind-map-tooltip");
            map._container.appendChild(div);
            this.innerMap = map;
            var me = this;
            map.on("load", function (args) {
                me.dispatchEvent("onLoad", args);
            });
            // #region click event
            map.on("click", function (args) {
                me.dispatchEvent("onClick", args);
            });
            map.on("dbclick", function (args) {
                me.dispatchEvent("onDbClick", args);
            });
            // #endregion
            // #region mouse event
            map.on("mouseout", function (args) {
                me.dispatchEvent("onMouseOut", args);
            });
            map.on("mousedown", function (args) {
                me.dispatchEvent("onMouseDown", args);
            });
            map.on("mousemove", function (args) {
                me.dispatchEvent("onMouseMove", args);
            });
            map.on("mouseup", function (args) {
                me.dispatchEvent("onMouseUp", args);
            });
            // #endregion
            // #region move event
            map.on("movestart", function (args) {
                me.dispatchEvent("onMoveStart", args);
            });
            map.on("move", function (args) {
                me.dispatchEvent("onMove", args);
            });
            map.on("moveend", function (args) {
                me.dispatchEvent("onMoveEnd", args);
            });
            // #endregion
            return map;
        };
        MinemapMap.prototype.onShowInfoWindow = function (options) {
            // 存在原始参数则创建新信息窗口
            if (typeof options.closeButton === "boolean" || typeof options.closeOnClick === "boolean" || options.offset) {
                var params = {};
                if (typeof options.closeButton === "boolean")
                    params["closeButton"] = options.closeButton;
                if (typeof options.closeOnClick === "boolean")
                    params["closeOnClick"] = options.closeOnClick;
                if (options.offset)
                    params["offset"] = options.offset;
                this.innerMap.infoWindow.remove();
                this.innerMap.infoWindow = new minemap.Popup(params);
            }
            switch (options.type) {
                case "dom":
                    this.innerMap.infoWindow.setDOMContent(options.content || "");
                    break;
                case "html":
                    this.innerMap.infoWindow.setHTML(options.content || "");
                    break;
                case "text":
                    this.innerMap.infoWindow.setText(options.content || "");
                    break;
                default:
                    this.innerMap.infoWindow.setHTML(options.content || "");
                    break;
            }
            this.innerMap.infoWindow.setLngLat([options.point.x, options.point.y]).addTo(this.innerMap);
        };
        /**
         * 创建底图
         */
        MinemapMap.prototype.onCreateBaseLayers = function () {
            var baseLayers = new Array();
            this.baseLayers = baseLayers;
            return baseLayers;
        };
        MinemapMap.prototype.onShowTooltip = function (graphic) {
            var info = graphic.attributes;
            var pt = graphic.geometry;
            var screenpt = this.innerMap.project([pt.x, pt.y]);
            var title = info.name;
            this.tooltipElement.innerHTML = "<div>" + title + "</div>";
            this.tooltipElement.style.left = (screenpt.x + 8) + "px";
            this.tooltipElement.style.top = (screenpt.y + 8) + "px";
            this.tooltipElement.style.display = "block";
        };
        MinemapMap.prototype.onHideTooltip = function (graphic) {
            this.tooltipElement.style.display = "none";
        };
        MinemapMap.prototype.onCreateContextMenu = function (args) {
            if (this.options.onCreateContextMenu) {
                this.options.onCreateContextMenu(args);
            }
        };
        return MinemapMap;
    }(flagwind.FlagwindMap));
    flagwind.MinemapMap = MinemapMap;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-business.layer.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 点图层
     */
    var MinemapPointLayer = /** @class */ (function (_super) {
        __extends(MinemapPointLayer, _super);
        function MinemapPointLayer(businessService, flagwindMap, id, options) {
            var _this = _super.call(this, flagwindMap, id, options) || this;
            _this.businessService = businessService;
            _this.isLoading = false; // 设备是否正在加载
            _this.onInit();
            return _this;
        }
        MinemapPointLayer.prototype.onCreateGraphicsLayer = function (options) {
            if (options.kind === "marker") {
                return new flagwind.MinemapMarkerLayer(options);
            }
            if (options.kind === "geojson") {
                return new flagwind.MinemapGeoJsonLayer(options);
            }
            console.warn("未指定图层类型");
            return new flagwind.MinemapMarkerLayer(options);
        };
        MinemapPointLayer.prototype.onShowInfoWindow = function (evt) {
            var context = this.businessService.getInfoWindowContext(evt.graphic.attributes);
            var infoWindow = this.flagwindMap.innerMap.infoWindow;
            infoWindow.setText("<h4 class='info-window-title'>" + context.title + "</h4" + context.content);
            infoWindow.setLngLat([evt.graphic.geometry.x, evt.graphic.geometry.y]);
        };
        // /**
        //  * 图层事件处理
        //  * @param eventName 事件名称
        //  * @param callback 回调
        //  */
        // public onAddEventListener(eventName: string, callback: Function): void {
        //     this.layer.on(eventName, callback);
        // }
        /**
         * 把实体转换成标准的要素属性信息
         * @param item 实体信息
         */
        MinemapPointLayer.prototype.onChangeStandardModel = function (item) {
            return this.businessService.changeStandardModel(item);
        };
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        MinemapPointLayer.prototype.onCreatGraphicByModel = function (item) {
            return new flagwind.MinemapMarker({
                id: item.id,
                symbol: {
                    className: this.options.dataType || "graphic-tollgate"
                },
                point: {
                    y: item.latitude,
                    x: item.longitude
                },
                attributes: item
            });
        };
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        MinemapPointLayer.prototype.onUpdateGraphicByModel = function (item) {
            this.removeGraphicById(item.id);
            // let minemapMarker = <MinemapMarker>this.onCreatGraphicByModel(item);
            this.addGraphicByModel(item);
            // (<MinemapMarkerLayer>this.layer).add(minemapMarker);
            // throw new Error("Method not implemented.");
        };
        MinemapPointLayer.prototype.openInfoWindow = function (id, context) {
            var graphic = this.getGraphicById(id);
            if (context) {
                var infoWindow = this.flagwindMap.innerMap.infoWindow;
                infoWindow.setText("<h4 class='info-window-title'>" + context.title + "</h4" + context.content);
                infoWindow.setLngLat([graphic.geometry.x, graphic.geometry.y]);
            }
            else {
                this.onShowInfoWindow({
                    graphic: graphic
                });
            }
        };
        /**
         * 加载并显示设备点位
         *
         * @memberof TollgateLayer
         */
        MinemapPointLayer.prototype.showDataList = function () {
            var me = this;
            me.isLoading = true;
            me.fireEvent("showDataList", { action: "start" });
            this.businessService.getDataList().then(function (dataList) {
                me.isLoading = false;
                me.saveGraphicList(dataList);
                me.fireEvent("showDataList", { action: "end", attributes: dataList });
            }).catch(function (error) {
                me.isLoading = false;
                console.log("加载卡口数据时发生了错误：", error);
                me.fireEvent("showDataList", { action: "error", attributes: error });
            });
        };
        /**
         * 开启定时器
         */
        MinemapPointLayer.prototype.start = function () {
            var me = this;
            this.timer = setInterval(function () {
                me.updateStatus();
            }, this.options.timeout || 20000);
        };
        /**
         * 关闭定时器
         */
        MinemapPointLayer.prototype.stop = function () {
            if (this.timer) {
                clearInterval(this.timer);
            }
        };
        /**
         * 更新设备状态
         */
        MinemapPointLayer.prototype.updateStatus = function () {
            var me = this;
            me.isLoading = true;
            me.fireEvent("updateStatus", { action: "start" });
            this.businessService.getLastStatus().then(function (dataList) {
                me.isLoading = false;
                me.saveGraphicList(dataList);
                me.fireEvent("updateStatus", { action: "end", attributes: dataList });
            }).catch(function (error) {
                me.isLoading = false;
                console.log("加载卡口状态时发生了错误：", error);
                me.fireEvent("updateStatus", { action: "error", attributes: error });
            });
        };
        return MinemapPointLayer;
    }(flagwind.FlagwindBusinessLayer));
    flagwind.MinemapPointLayer = MinemapPointLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapRouteLayer = /** @class */ (function (_super) {
        __extends(MinemapRouteLayer, _super);
        function MinemapRouteLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MinemapRouteLayer.prototype.onSetSegmentByLine = function (options, segment) {
            segment.polyline = options.polyline;
            segment.length = options.length;
            if (segment.polyline.path && segment.polyline.path.length > 0) {
                // 每公里抽取的点数
                var numsOfKilometer = segment.options.numsOfKilometer;
                segment.line = flagwind.MapUtils.vacuate([segment.polyline.path], segment.length, numsOfKilometer);
            }
        };
        MinemapRouteLayer.prototype.onSetSegmentByPoint = function (options, segment) {
            var points = options.points;
            var length = options.length || flagwind.MinemapUtils.distance(points);
            var numsOfKilometer = segment.options.numsOfKilometer;
            var polyline = new flagwind.MinemapPolyline();
            var line = [];
            for (var i = 0; i < points.length - 1; i++) {
                var start = points[i], end = points[i + 1];
                var tmppoints = flagwind.MapUtils.density(start, end, length * numsOfKilometer);
                tmppoints.forEach(function (g) {
                    line.push([g.x, g.y]);
                });
            }
            polyline.path = line;
            segment.length = length;
            segment.polyline = polyline;
            segment.line = flagwind.MapUtils.vacuate([segment.polyline.path], segment.length, numsOfKilometer);
        };
        MinemapRouteLayer.prototype.onCreateMovingLayer = function (id) {
            return new flagwind.MinemapGroupLayer({
                id: id,
                kind: "marker"
            });
        };
        MinemapRouteLayer.prototype.onCreateLineLayer = function (id) {
            return new flagwind.MinemapGroupLayer({
                id: id,
                kind: "geojson"
            });
        };
        MinemapRouteLayer.prototype.onEqualGraphic = function (originGraphic, targetGraphic) {
            if (originGraphic == null || targetGraphic == null)
                return false;
            return originGraphic.geometry.x !== targetGraphic.geometry.x
                || originGraphic.geometry.y !== targetGraphic.geometry.y;
        };
        MinemapRouteLayer.prototype.onShowSegmentLine = function (segment) {
            var lineGraphic = new flagwind.MinemapGeoJson(this.moveLineLayer.layer, {
                id: segment.name + "_" + segment.index,
                type: "line",
                geometry: segment.polyline,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#ff0000",
                    "line-width": 6
                }
            });
            segment.lineGraphic = lineGraphic;
            this.moveLineLayer.addGraphic(segment.name, lineGraphic);
        };
        MinemapRouteLayer.prototype.onGetStandardStops = function (name, stops) {
            var list = [];
            if (stops == null || stops.length === 0)
                return list;
            stops.forEach(function (g) {
                if (g instanceof flagwind.MinemapMarker) {
                    g.attributes.__type = "stop";
                    g.attributes.__line = name;
                    list.push(g);
                }
                else {
                    throw new Error("未知的停靠点定义.");
                }
            });
            return stops;
        };
        /**
         * 由路由服务来路径规划
         * @param segment 路段
         * @param start 开始结点
         * @param end 结束结点
         * @param waypoints  经过点
         */
        MinemapRouteLayer.prototype.onSolveByService = function (segment, start, end, waypoints) {
            var startXY = segment.startGraphic.geometry.x + "," + segment.startGraphic.geometry.y;
            var endXY = segment.endGraphic.geometry.x + "," + segment.endGraphic.geometry.y;
            var wayXY = null;
            if (waypoints) {
                wayXY = waypoints.join(",");
            }
            var me = this;
            minemap.service.queryRouteDrivingResult2(startXY, endXY, wayXY, 1, 16, 1, 0, 0, function (error, results) {
                if (error) {
                    me.errorHandler(error, segment);
                }
                else {
                    var routeResult = new flagwind.RouteResult(results);
                    me.solveComplete({
                        polyline: routeResult.getLine(me.spatial),
                        length: routeResult.data.rows[0].distance
                    }, segment);
                }
            });
        };
        /**
         * 由点点连线进行路径规划
         * @param segment 路段
         */
        MinemapRouteLayer.prototype.onSolveByJoinPoint = function (segment) {
            var points = [];
            points.push(segment.startGraphic.geometry);
            if (segment.waypoints) {
                for (var i = 0; i < segment.waypoints.length; i++) {
                    points.push(segment.waypoints[i].geometry);
                }
            }
            points.push(segment.endGraphic.geometry);
            // 当路由分析出错时，两点之间的最短路径以直线代替
            segment.setMultPoints(points);
        };
        // public onAddEventListener(moveMarkLayer: FlagwindGroupLayer, eventName: string, callBack: Function): void {
        //     moveMarkLayer.layer.on(eventName, callBack);
        // }
        MinemapRouteLayer.prototype.onCreateMoveMark = function (trackline, graphic, angle) {
            var marker = new flagwind.MinemapMarker({
                id: trackline.name,
                symbol: {
                    className: "graphic-car"
                },
                point: graphic.geometry,
                attributes: graphic.attributes
            });
            trackline.markerGraphic = marker;
            this.moveMarkLayer.addGraphic(trackline.name, marker);
        };
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        MinemapRouteLayer.prototype.onChangeMovingGraphicSymbol = function (trackline, point, angle) {
            if (trackline === undefined)
                return;
            trackline.markerGraphic.setAngle(360 - angle);
            trackline.markerGraphic.setGeometry(point);
        };
        return MinemapRouteLayer;
    }(flagwind.FlagwindRouteLayer));
    flagwind.MinemapRouteLayer = MinemapRouteLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 思维图新路由结果定义
     */
    var RouteResult = /** @class */ (function () {
        function RouteResult(result) {
            var _this = this;
            console.log(result);
            this.success = (result.errcode ? false : true);
            this.message = result.message;
            if (result.data) {
                this.data = { error: null, rows: null };
                if (result.data.error) {
                    this.data.error = result.data.error;
                }
                if (result.data.rows) {
                    this.data.rows = [];
                    result.data.rows.forEach(function (row) {
                        _this.data.rows.push(new RouteRow(row));
                    });
                }
            }
        }
        RouteResult.prototype.getLine = function (spatial) {
            var polyline = new flagwind.MinemapPolyline(spatial);
            var line = [];
            if (this.data && this.data.rows) {
                this.data.rows.forEach(function (row) {
                    var points = row.getPoints(spatial);
                    line = line.concat(points.map(function (g) { return [g.x, g.y]; }));
                });
            }
            polyline.path = line;
            return polyline;
        };
        return RouteResult;
    }());
    flagwind.RouteResult = RouteResult;
    var RouteItem = /** @class */ (function () {
        function RouteItem(item) {
            if (item.strguide) {
                this.guide = item.strguide;
            }
            this.streetName = item.streetName;
            if (item.distance) {
                this.distance = parseFloat(item.distance);
            }
            if (item.duration) {
                this.duration = parseFloat(item.duration);
            }
        }
        return RouteItem;
    }());
    flagwind.RouteItem = RouteItem;
    var RouteRow = /** @class */ (function () {
        function RouteRow(result) {
            var _this = this;
            if (result.mapinfo) {
                if (result.mapinfo.center) {
                    var xy = result.mapinfo.center.split(",");
                    this.center = new flagwind.MinemapPoint(parseFloat(xy[0]), parseFloat(xy[1]), null);
                }
                if (result.mapinfo.scale) {
                    this.scale = parseFloat(result.mapinfo.scale);
                }
            }
            if (result.distance) {
                this.distance = parseFloat(result.distance);
            }
            if (result.duration) {
                this.duration = parseFloat(result.duration);
            }
            if (result.routelatlon) {
                this.points = [];
                var xys = result.routelatlon.split(";");
                for (var i = 0; i < xys.length; i++) {
                    if (xys[i]) {
                        var xy = xys[i].split(",");
                        this.points.push([parseFloat(xy[0]), parseFloat(xy[1])]);
                    }
                }
            }
            if (result.routes) {
                this.items = [];
                result.routes.item.forEach(function (item) {
                    _this.items.push(new RouteItem(item));
                });
            }
        }
        RouteRow.prototype.getPoints = function (spatial) {
            var mps = [];
            this.points.forEach(function (g) {
                mps.push(new flagwind.MinemapPoint(g[0], g[1], spatial));
            });
            return mps;
        };
        RouteRow.prototype.getLine = function (spatial) {
            var polyline = new flagwind.MinemapPolyline(spatial);
            var line = [];
            this.points.forEach(function (g) {
                line.push([g[0], g[1]]);
            });
            polyline.path = line;
            return polyline;
        };
        return RouteRow;
    }());
    flagwind.RouteRow = RouteRow;
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
var flagwind;
(function (flagwind) {
    var MinemapUtils = /** @class */ (function () {
        function MinemapUtils() {
        }
        /**
         * 求两点之间的距离
         * @param from 起点
         * @param to 终点
         */
        MinemapUtils.getLength = function (from, to) {
            var units = "kilometers";
            var distance = turf.distance(from.toJson(), to.toJson(), units);
            return distance;
        };
        /**
         * 求多点之间连线的距离
         * @param points 多点集
         * @param count 抽点次数
         */
        MinemapUtils.distance = function (points, count) {
            if (count === void 0) { count = 100; }
            if (count == null) {
                count = points.length;
            }
            var interval = 1;
            if (points.length > count) {
                interval = Math.max(Math.floor(points.length / count), 1);
            }
            var length = 0, i = 0;
            for (i = 0; i <= points.length - interval; i = i + interval) {
                var start = points[i];
                var end = points[i + interval];
                length += MinemapUtils.getLength(start, end);
            }
            if (i < points.length - 1) {
                length += MinemapUtils.getLength(points[i], points[points.length - 1]);
            }
            return length;
        };
        return MinemapUtils;
    }());
    flagwind.MinemapUtils = MinemapUtils;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 提供一些常用类型检测与反射相关的方法。
     * @static
     * @class
     * @version 1.0.0
     */
    var Type = /** @class */ (function () {
        /**
         * 私有构造方法，使类型成为静态类。
         * @private
         */
        function Type() {
        }
        /**
         * 检测一个值是否为数组。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isArray = function (value) {
            return this.getTypeString(value) === "array";
        };
        /**
         * 检测一个值是否为对象。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isObject = function (value) {
            return this.getTypeString(value) === "object";
        };
        /**
         * 检测一个值是否为字符串。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isString = function (value) {
            return typeof value === "string";
        };
        /**
         * 检测一个值是否为日期。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isDate = function (value) {
            return this.getTypeString(value) === "date";
        };
        /**
         * 检测一个值是否为正则表达式。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isRegExp = function (value) {
            return this.getTypeString(value) === "regexp";
        };
        /**
         * 检测一个值是否为函数。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isFunction = function (value) {
            return typeof value === "function";
        };
        /**
         * 检测一个值是否为布尔值。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isBoolean = function (value) {
            return typeof value === "boolean";
        };
        /**
         * 检测一个值是否为数值。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isNumber = function (value) {
            return typeof value === "number";
        };
        /**
         * 检测一个值是否为 null。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isNull = function (value) {
            return value === null;
        };
        /**
         * 检测一个值是否为 undefined。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isUndefined = function (value) {
            return typeof value === "undefined";
        };
        /**
         * 检测一个值是否为 null 或 undefined。
         * @static
         * @param  {any} value
         * @returns boolean
         */
        Type.isEmptyObject = function (value) {
            return Type.isNull(value) || Type.isUndefined(value);
        };
        /**
         * 表示一个字符串值是否为 null 或 undefined 或 空值。
         * @static
         * @param  {string} value 要检测的字符串实例。
         * @returns boolean
         */
        Type.isEmptyString = function (value) {
            return Type.isEmptyObject(value) || value.trim() === "";
        };
        /**
         * 设置指定类型的元数据。
         * @param  {any} type 目标类型。
         * @param  {any} metadata 元数据。
         * @returns void
         */
        Type.setMetadata = function (type, metadata) {
            if (!type || !metadata) {
                throw new Error();
            }
            this._metadatas.set(type, metadata);
        };
        /**
         * 获取指定类型的元数据。
         * @param  {any} type 目标类型。
         * @returns any 元数据。
         */
        Type.getMetadata = function (type) {
            return this._metadatas.get(type) || null;
        };
        /**
         * 返回对象的类型(即构造函数)。
         * @param  {string|any} value 实例或类型路径。
         * @returns Function 如果成功解析则返回类型的构造函数，否则为 undefined。
         */
        Type.getClassType = function (value) {
            if (Type.isNull(value)) {
                return null;
            }
            else if (Type.isUndefined(value)) {
                return undefined;
            }
            else if (Type.isBoolean(value)) {
                return Boolean;
            }
            else if (Type.isNumber(value)) {
                return Number;
            }
            else if (Type.isString(value)) {
                try {
                    // 通过 eval 解析字符串所指向的实际类型
                    // tslint:disable-next-line:no-eval
                    var ctor = eval(value);
                    return Type.isFunction(ctor) ? ctor : String;
                }
                catch (e) {
                    return String;
                }
            }
            else {
                var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
                return prototype.constructor;
            }
        };
        /**
         * 返回 value 参数指定的对象的类名。
         * @param  {any} value 需要取得类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number)和类对象。
         * @returns string 类名称的字符串。
         */
        Type.getClassName = function (value) {
            var className = this.getQualifiedClassName(value).split(".");
            return className[className.length - 1];
        };
        /**
         * 返回 value 参数指定的对象的完全限定类名。
         * @static
         * @param  {any} value 需要取得完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number)和类对象。
         * @returns string 包含完全限定类名称的字符串。
         */
        Type.getQualifiedClassName = function (value) {
            var type = typeof value;
            if (!value || (type !== "object" && !value.prototype)) {
                return type;
            }
            var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            if (prototype.hasOwnProperty("__class__")) {
                return prototype["__class__"];
            }
            var constructorString = prototype.constructor.toString().trim();
            var index = constructorString.indexOf("(");
            // tslint:disable-next-line:no-magic-numbers
            var className = constructorString.substring(9, index);
            Object.defineProperty(prototype, "__class__", {
                value: className,
                enumerable: false,
                writable: true
            });
            return className;
        };
        /**
         * 返回 value 参数指定的对象的基类的类名。
         * @param  {any} value 需要取得父类类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number）和类对象。
         * @returns string 基类名称，或 null（如果不存在基类名称）。
         */
        Type.getSuperclassName = function (value) {
            var className = this.getQualifiedSuperclassName(value).split(".");
            return className[className.length - 1];
        };
        /**
         * 返回 value 参数指定的对象的基类的完全限定类名。
         * @param  {any} value 需要取得父类完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型（如number）和类对象。
         * @returns string 完全限定的基类名称，或 null（如果不存在基类名称）。
         */
        Type.getQualifiedSuperclassName = function (value) {
            if (!value || (typeof value !== "object" && !value.prototype)) {
                return null;
            }
            var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            var superProto = Object.getPrototypeOf(prototype);
            if (!superProto) {
                return null;
            }
            var superClass = this.getQualifiedClassName(superProto.constructor);
            if (!superClass) {
                return null;
            }
            return superClass;
        };
        /**
         * 确定指定类型的实例是否可以分配给当前类型的实例。
         * @param  {Function} parentType 指定基类的类型。
         * @param  {Function} subType 指定的实例类型。
         * @returns boolean
         */
        Type.isAssignableFrom = function (parentType, subType) {
            // 两个参数任意却少一个都不会进行比较
            if (!parentType || !subType) {
                return false;
            }
            // 如果基类等于子类，则直接返回 true
            if (parentType === subType) {
                return true;
            }
            // 如果基类是 Object 则直接返回 true
            if (parentType === Object || parentType === "Object") {
                return true;
            }
            // 获取子类的原型实例
            var subPrototype = subType.prototype;
            // 1.首先，如果原型中有定义"__types__"则直接根据类型名称查找
            // 注意: "__types__" 这个属性是由 TypeScript 引擎在生成代码时加入的
            if (subPrototype.hasOwnProperty("__types__")) {
                // 如果参数 parentType 不是字符串则获取基类的完全限定名称(包含命名空间)
                var parentName = Type.isString(parentType) ? parentType : Type.getQualifiedClassName(parentType);
                // 通过"__types__"去匹配基类名称
                return subPrototype["__types__"].indexOf(parentName) !== -1;
            }
            // 2.其次，如果类型没有定义"__types__"，则根据原型链进行查找
            // 获取子类的直属父类型(即上一级父类)
            var superType = Object.getPrototypeOf(subPrototype).constructor;
            // 如果已经查到顶层还没匹配到，则直接返回 false
            if (superType === Object) {
                return false;
            }
            if (Type.isString(parentType)) {
                // 如果传进来的基类是字符串，则根据上级父类的名称进行匹配
                if (Type.getQualifiedClassName(superType) === parentType) {
                    return true;
                }
            }
            else {
                // 否则根据传递进来的基类与直属父类进行匹配
                if (superType === parentType) {
                    return true;
                }
            }
            // 3.最后，如果当前层没匹配到，则通过递归原型向上一级一级查找
            return Type.isAssignableFrom(parentType, superType);
        };
        /**
         * 获取指定值的类型字符串(小写)。
         * @private
         * @static
         * @param  {any} value
         * @returns string
         */
        Type.getTypeString = function (value) {
            return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
        };
        Type._metadatas = new flagwind.Map();
        return Type;
    }());
    flagwind.Type = Type;
})(flagwind || (flagwind = {}));

Object.defineProperty(exports, '__esModule', { value: true });

exports['default'] = flagwind;

})));
