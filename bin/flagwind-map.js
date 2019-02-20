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
    var DataManager = /** @class */ (function () {
        function DataManager() {
            this.rawData = [];
        }
        /**
         * 客户端聚合
         * @param clusterRatio 聚合比率
         * @param maxSingleFlareCount 最大的单个聚合点包含成员数
         * @param areaDisplayMode 是否显示聚合区域
         * @param map 地图对象
         */
        DataManager.prototype.clientSideClustering = function (clusterRatio, // 聚合比率
        maxSingleFlareCount, // 最大的单个聚合点包含成员数
        areaDisplayMode, map) {
            // let itcount = 0;
            console.time("fake-server-side-cluster");
            var webExtent = map.extent;
            // set up a grid system to do the clustering
            // get the total amount of grid spaces based on the height and width of the map (divide it by clusterRatio) - then get the degrees for x and y
            var xCount = Math.round(map.width / clusterRatio);
            var yCount = Math.round(map.height / clusterRatio);
            var xw = (webExtent.xmax - webExtent.xmin) / xCount;
            var yh = (webExtent.ymax - webExtent.ymin) / yCount;
            var gsxmin, gsxmax, gsymin, gsymax;
            var dataLength = this.rawData.length;
            // create an array of clusters that is a grid over the visible extent. Each cluster contains the extent (in web merc) that bounds the grid space for it.
            var clusters = [];
            for (var i = 0; i < xCount; i++) {
                gsxmin = webExtent.xmin + xw * i;
                gsxmax = gsxmin + xw;
                for (var j = 0; j < yCount; j++) {
                    gsymin = webExtent.ymin + yh * j;
                    gsymax = gsymin + yh;
                    var ext = new esri.geometry.Extent({
                        xmin: gsxmin,
                        xmax: gsxmax,
                        ymin: gsymin,
                        ymax: gsymax
                    });
                    ext.setSpatialReference(new esri.SpatialReference({
                        wkid: 4326
                    }));
                    clusters.push({
                        extent: ext,
                        clusterCount: 0,
                        subTypeCounts: [],
                        singles: [],
                        points: []
                    });
                }
            }
            var web, obj;
            for (var i = 0; i < dataLength; i++) {
                obj = this.rawData[i];
                web = esri.geometry.lngLatToXY(obj.x, obj.y);
                if (web[0] < webExtent.xmin ||
                    web[0] > webExtent.xmax ||
                    web[1] < webExtent.ymin ||
                    web[1] > webExtent.ymax) {
                    continue;
                }
                // let foundCluster = false;
                // loop cluster grid to see if it should be added to one
                for (var j = 0, jLen = clusters.length; j < jLen; j++) {
                    var cl = clusters[j];
                    if (web[0] < cl.extent.xmin ||
                        web[0] > cl.extent.xmax ||
                        web[1] < cl.extent.ymin ||
                        web[1] > cl.extent.ymax) {
                        continue; // not here so carry on
                    }
                    // recalc the x and y of the cluster by averaging the points again
                    cl.x =
                        cl.clusterCount > 0
                            ? (obj.x + cl.x * cl.clusterCount) /
                                (cl.clusterCount + 1)
                            : obj.x;
                    cl.y =
                        cl.clusterCount > 0
                            ? (obj.y + cl.y * cl.clusterCount) /
                                (cl.clusterCount + 1)
                            : obj.y;
                    if (areaDisplayMode) {
                        cl.points.push([obj.x, obj.y]);
                    }
                    cl.clusterCount++;
                    var subTypeExists = false;
                    for (var s = 0, sLen = cl.subTypeCounts.length; s < sLen; s++) {
                        if (cl.subTypeCounts[s].name === obj.facilityType) {
                            cl.subTypeCounts[s].count++;
                            subTypeExists = true;
                            break;
                        }
                    }
                    if (!subTypeExists) {
                        cl.subTypeCounts.push({
                            name: obj.facilityType,
                            count: 1
                        });
                    }
                    cl.singles.push(obj);
                }
            }
            var results = [];
            for (var i = 0, len = clusters.length; i < len; i++) {
                if (clusters[i].clusterCount === 1) {
                    results.push(clusters[i].singles[0]);
                }
                else if (clusters[i].clusterCount > 0) {
                    if (clusters[i].singles.length > maxSingleFlareCount) {
                        clusters[i].singles = [];
                    }
                    results.push(clusters[i]);
                }
            }
            console.timeEnd("fake-server-side-cluster");
            return results;
        };
        DataManager.prototype.getData = function () {
            return this.rawData;
        };
        DataManager.prototype.setData = function (data) {
            this.rawData = data;
        };
        return DataManager;
    }());
    flagwind.DataManager = DataManager;
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
/// <reference path="../events/EventProvider.ts" />
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
        FlagwindFeatureLayer.prototype.appendTo = function (map) {
            this.layer.addToMap(map);
        };
        FlagwindFeatureLayer.prototype.removeLayer = function (map) {
            this.layer.removeFromMap(map);
        };
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
         * 获取指定id的地图要素对象
         */
        FlagwindFeatureLayer.prototype.getGraphicById = function (id) {
            var graphics = this.graphics;
            for (var i = 0; i < graphics.length; i++) {
                var attrs = graphics[i].attributes;
                if (attrs.id === id) {
                    return graphics[i];
                }
            }
            return null;
        };
        /**
         * 删除指定id的地图要素对象
         */
        FlagwindFeatureLayer.prototype.removeGraphicById = function (id) {
            var graphic = this.getGraphicById(id);
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
        FlagwindFeatureLayer.prototype.add = function (graphic) {
            this.layer.add(graphic);
        };
        FlagwindFeatureLayer.prototype.remove = function (graphic) {
            this.layer.remove(graphic);
        };
        return FlagwindFeatureLayer;
    }(flagwind.EventProvider));
    flagwind.FlagwindFeatureLayer = FlagwindFeatureLayer;
})(flagwind || (flagwind = {}));
/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";
/* tslint:disable:member-ordering */
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
        onCheckChanged: function (evt) {
            console.log("onCheckChanged");
        },
        onPositionChanged: function (currentPoint, originPoint, item) {
            console.log("onPositionChanged");
        },
        onVisibleChanged: function (isShow) {
            console.log("onVisibleChanged");
        },
        changeStandardModel: function (model) {
            return model;
        },
        getInfoWindowContext: function (mode) {
            return {
                title: "详细信息",
                content: "没有定制详细信息"
            };
        },
        /**
         * 获取图层
         */
        getDataList: function () {
            return new Promise(function (resolve, reject) {
                resolve([]);
            });
        },
        /**
         * 获取最新图层数据状态
         */
        getLastStatus: function () {
            return new Promise(function (resolve, reject) {
                resolve([]);
            });
        },
        showInfoWindowCompleted: null,
        timeout: 3000,
        autoInit: true,
        enableEdit: true,
        selectMode: 0,
        showTooltip: false,
        showInfoWindow: false,
        symbol: null,
        dataType: "point"
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
            _this.layerType = flagwind.LayerType.point; // point polyline polygon
            _this.isLoading = false;
            _this.options = __assign({}, flagwind.BUSINESS_LAYER_OPTIONS, options);
            _this.layer = _this.onCreateGraphicsLayer({ id: _this.id });
            _this.layerType = options.layerType;
            _this.flagwindMap = flagwindMap;
            if (_this.options.autoInit) {
                _this.onInit();
            }
            return _this;
        }
        Object.defineProperty(FlagwindBusinessLayer.prototype, "map", {
            // #region 属性
            /**
             * 地图原生对象
             */
            get: function () {
                return this.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindBusinessLayer.prototype, "spatial", {
            /**
             * 空间坐标系
             */
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        // #endregion
        // #region graphic操作
        /**
         * 根据对象集合构造要素集合（无则新增，有则修改）
         * @param dataList 对象集合
         */
        FlagwindBusinessLayer.prototype.saveGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.saveGraphicByModel(dataList[i]);
            }
        };
        /**
         * 根据对象集合修改要素集合（无则忽略）
         * @param dataList 对象集合
         */
        FlagwindBusinessLayer.prototype.updateGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.updateGraphicByModel(dataList[i]);
            }
        };
        /**
         * 根据对象集合新增要素集合
         * @param dataList 对象集合
         */
        FlagwindBusinessLayer.prototype.addGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                var graphic = this.getGraphicById(dataList[i].id);
                if (graphic) {
                    console.warn("已存在id：" + dataList[i].id + "要素点");
                    continue;
                }
                this.addGraphicByModel(dataList[i]);
            }
        };
        /**
         * 保存要素（有则修改，无则增加）
         * @param item 原始要素模型
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
        /**
         * 创建并增加要素
         */
        FlagwindBusinessLayer.prototype.addGraphicByModel = function (item) {
            var graphic = this.creatGraphicByModel(item);
            if (graphic) {
                this.add(graphic);
            }
        };
        /**
         * 创建要素（未添加至图层中）,请方法在flagwind包下可见
         */
        FlagwindBusinessLayer.prototype.creatGraphicByModel = function (item) {
            item = this.onChangeStandardModel(item);
            if (!this.onValidModel(item)) {
                console.warn("无效的要素：" + item);
                return null;
            }
            // select属性为true表示当前选中，false表示未选中
            if (item.selected === undefined) {
                item.selected = false;
            }
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
            item = __assign({}, graphic.attributes, item);
            this.onUpdateGraphicByModel(item);
        };
        // #endregion
        // #region 状态管理
        /**
         * 清除选择状态
         */
        FlagwindBusinessLayer.prototype.clearSelectStatus = function () {
            var graphics = this.graphics;
            for (var i = 0; i < graphics.length; i++) {
                if (graphics[i].attributes.selected || typeof graphics[i].attributes.selected !== "boolean") {
                    this.setSelectStatus(graphics[i].attributes, false);
                }
            }
            this.options.onCheckChanged({
                target: graphics ? graphics.map(function (v) { return v.attributes; }) : [],
                check: false,
                selectedItems: this.getSelectedGraphics().map(function (g) { return g.attributes; })
            });
        };
        /**
         * 设置选择状态
         * @param dataList 要素模型集合
         * @param refresh 是否刷新（为true是时，把所有的要素还原再设置;否则，之前的状态保留，然后再追加）
         */
        FlagwindBusinessLayer.prototype.setSelectStatusByModels = function (dataList, refresh) {
            if (refresh) {
                this.clearSelectStatus();
            }
            for (var i = 0; i < dataList.length; i++) {
                var model = this.onChangeStandardModel(dataList[i]);
                var graphic = this.getGraphicById(model.id);
                if (graphic) {
                    this.setSelectStatus(graphic.attributes, true);
                }
            }
            this.options.onCheckChanged({
                target: dataList,
                check: true,
                selectedItems: this.getSelectedGraphics().map(function (g) { return g.attributes; })
            });
        };
        /**
         * 获取所有选中的要素
         */
        FlagwindBusinessLayer.prototype.getSelectedGraphics = function () {
            return this.graphics.filter(function (g) { return g.attributes && g.attributes.selected; });
        };
        /**
         * 设置选中状态
         * @param item 要素原型
         * @param selected 是否选中
         */
        FlagwindBusinessLayer.prototype.setSelectStatus = function (item, selected) {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        };
        // #endregion
        // #region 坐标转换
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
        // #endregion
        // #region 常规操作
        /**
         * 在指定id的graphic上打开InfoWindow
         * @param id  grahpic的唯一标识
         * @param context 内容
         * @param options 参数
         */
        FlagwindBusinessLayer.prototype.openInfoWindow = function (id, context, options) {
            var graphic = this.getGraphicById(id);
            if (!graphic) {
                console.warn("该条数据不在图层内！id:", id);
                return;
            }
            if (context) {
                this.flagwindMap.onShowInfoWindow({
                    graphic: graphic,
                    context: context,
                    options: options || {}
                });
            }
            else {
                this.showInfoWindow({ graphic: graphic });
            }
        };
        /**
         * 关闭信息窗口
         */
        FlagwindBusinessLayer.prototype.closeInfoWindow = function () {
            this.flagwindMap.closeInfoWindow();
        };
        /**
         * 定位至指定id的点
         * @param id
         */
        FlagwindBusinessLayer.prototype.gotoCenterById = function (id) {
            var graphic = this.getGraphicById(id);
            if (!graphic) {
                console.trace("-----该条数据不在图层内！id:", id);
                return;
            }
            var pt = this.getPoint(graphic.attributes);
            this.flagwindMap.centerAt(pt.x, pt.y);
        };
        /**
         * 增加到地图上
         */
        FlagwindBusinessLayer.prototype.addToMap = function () {
            this.onAddLayerBefor();
            this.flagwindMap.addFeatureLayer(this);
            this.onAddLayerAfter();
        };
        /**
         * 从地图移除
         */
        FlagwindBusinessLayer.prototype.removeFromMap = function () {
            this.flagwindMap.removeFeatureLayer(this.id);
        };
        /**
         * 显示InfoWindow（在flagwind包下可用，对外不要调用此方法）
         * @param args
         */
        FlagwindBusinessLayer.prototype.showInfoWindow = function (evt) {
            var context = this.onGetInfoWindowContext(evt.graphic.attributes);
            this.flagwindMap.onShowInfoWindow({
                graphic: evt.graphic,
                context: {
                    type: "html",
                    title: context.title,
                    content: context.content
                },
                options: {}
            });
            if (this.options.showInfoWindowCompleted) {
                this.options.showInfoWindowCompleted(evt.graphic.attributes);
            }
        };
        // #endregion
        // #region 数据加载
        /**
         * 加载并显示设备点位
         *
         */
        FlagwindBusinessLayer.prototype.showDataList = function () {
            var _this = this;
            this.isLoading = true;
            this.fireEvent("showDataList", { action: "start" });
            return this.options.getDataList()
                .then(function (dataList) {
                _this.isLoading = false;
                _this.saveGraphicList(dataList);
                _this.fireEvent("showDataList", {
                    action: "end",
                    attributes: dataList
                });
            })
                .catch(function (error) {
                _this.isLoading = false;
                console.log("加载图层数据时发生了错误：", error);
                _this.fireEvent("showDataList", {
                    action: "error",
                    attributes: error
                });
            });
        };
        /**
         * 开启定时器
         */
        FlagwindBusinessLayer.prototype.start = function () {
            var _this = this;
            this.timer = setInterval(function () {
                _this.updateStatus();
            }, this.options.timeout || 20000);
        };
        /**
         * 关闭定时器
         */
        FlagwindBusinessLayer.prototype.stop = function () {
            if (this.timer) {
                clearInterval(this.timer);
            }
        };
        /**
         * 更新设备状态
         */
        FlagwindBusinessLayer.prototype.updateStatus = function () {
            var _this = this;
            this.isLoading = true;
            this.fireEvent("updateStatus", { action: "start" });
            this.options.getLastStatus().then(function (dataList) {
                _this.isLoading = false;
                _this.saveGraphicList(dataList);
                _this.fireEvent("updateStatus", { action: "end", attributes: dataList });
            }).catch(function (error) {
                _this.isLoading = false;
                console.log("加载卡口状态时发生了错误：", error);
                _this.fireEvent("updateStatus", { action: "error", attributes: error });
            });
        };
        // #endregion
        // #region 内部方法
        FlagwindBusinessLayer.prototype.onGetInfoWindowContext = function (item) {
            return this.options.getInfoWindowContext(item);
        };
        FlagwindBusinessLayer.prototype.onInit = function () {
            var _this = this;
            this.addToMap();
            if (this.flagwindMap.loaded) {
                this.onLoad();
            }
            else {
                this.flagwindMap.on("onLoad", function () { return _this.onLoad(); });
            }
        };
        FlagwindBusinessLayer.prototype.onAddLayerBefor = function () {
            // console.log("onAddLayerBefor");
        };
        FlagwindBusinessLayer.prototype.onAddLayerAfter = function () {
            // console.log("onAddLayerAfter");
        };
        FlagwindBusinessLayer.prototype.onLoad = function () {
            try {
                if (!this.layer._map) {
                    this.layer._map = this.flagwindMap.innerMap;
                }
                this.registerEvent();
                this.onMapLoad();
            }
            catch (error) {
                console.error(error);
            }
        };
        FlagwindBusinessLayer.prototype.onMapLoad = function () {
            this.options.onMapLoad();
        };
        FlagwindBusinessLayer.prototype.registerEvent = function () {
            var _this = this;
            this.on("onClick", function (evt) {
                _this.onLayerClick(_this, evt.data);
            });
            // 如果开启鼠标hover开关
            this.on("onMouseOver", function (evt) {
                if (_this.options.showTooltip) {
                    _this.flagwindMap.onShowTooltip(evt.data.graphic);
                }
                _this.fireEvent("onMouseOver", evt.data);
            });
            this.on("onMouseOut", function (evt) {
                if (_this.options.showTooltip) {
                    _this.flagwindMap.onHideTooltip();
                }
                _this.fireEvent("onMouseOut", evt.data);
            });
        };
        FlagwindBusinessLayer.prototype.onLayerClick = function (deviceLayer, evt) {
            if (deviceLayer.options.onLayerClick) {
                deviceLayer.options.onLayerClick(evt);
            }
            if (deviceLayer.options.showInfoWindow) {
                evt.graphic.attributes.eventName = "";
                deviceLayer.showInfoWindow(evt);
            }
            if (deviceLayer.options.selectMode) {
                if (deviceLayer.options.selectMode === flagwind.SelectMode.multiple) {
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
                deviceLayer.options.onCheckChanged({
                    target: [evt.graphic.attributes],
                    check: evt.graphic.attributes.selected,
                    selectedItems: deviceLayer.getSelectedGraphics()
                });
            }
        };
        FlagwindBusinessLayer.prototype.fireEvent = function (eventName, event) {
            this.options.onEvent(eventName, event);
        };
        FlagwindBusinessLayer.prototype.onValidModel = function (item) {
            switch (this.layerType) {
                case flagwind.LayerType.point:
                    return item.id && item.longitude && item.latitude;
                case flagwind.LayerType.polyline:
                    return item.id && item.polyline;
                case flagwind.LayerType.polygon:
                    return item.id && item.polygon;
                default:
                    return item.id && item.longitude && item.latitude;
            }
        };
        /**
         * 变换成标准实体
         *
         * @protected
         * @param {*} item
         * @returns {{ id: String, name: String, longitude: number, latitude: number }}
         * @memberof FlagwindBusinessLayer
         */
        FlagwindBusinessLayer.prototype.onChangeStandardModel = function (item) {
            return this.options.changeStandardModel(item);
        };
        return FlagwindBusinessLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.FlagwindBusinessLayer = FlagwindBusinessLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-business.layer.ts" />;
var flagwind;
(function (flagwind) {
    flagwind.ESRI_CLUSTER_LAYER_OPTIONS = {
        onEvent: function (eventName, evt) {
            switch (eventName) {
                case "onMouseOver":
                    if (evt.graphic.getNode())
                        evt.graphic.getNode().classList.add("marker-scale");
                    break;
                case "onMouseOut":
                    if (evt.graphic.getNode())
                        evt.graphic.getNode().classList.remove("marker-scale");
                    break;
            }
        },
        symbol: {
            width: 32,
            height: 32
        },
        enableCluster: true,
        cluster: {
            font: {
                color: "#FF0000",
                outline: null,
                size: 6
            },
            singleFlareAtCount: 10,
            flareShowMode: "mouse",
            preClustered: false,
            ratio: 75,
            areaDisplay: false,
            levels: {
                xl: {
                    start: 1001,
                    end: Infinity,
                    size: 32,
                    color: { line: [200, 52, 59, 0.8], fill: [250, 65, 74, 0.8] }
                },
                lg: {
                    start: 151,
                    end: 1000,
                    size: 28,
                    color: { line: [41, 163, 41, 0.8], fill: [51, 204, 51, 0.8] }
                },
                md: {
                    start: 20,
                    end: 150,
                    size: 24,
                    color: { line: [82, 163, 204, 0.8], fill: [102, 204, 255, 0.8] }
                },
                sm: {
                    start: 0,
                    end: 19,
                    size: 22,
                    color: { line: [230, 184, 92, 0.8], fill: [255, 204, 102, 0.8] }
                }
            },
            clusteringBegin: function () {
                console.log("clustering begin");
            },
            clusteringComplete: function () {
                console.log("clustering complete");
            }
        },
        layerType: "point"
    };
    /**
     * 点图层
     */
    var EsriClusterLayer = /** @class */ (function (_super) {
        __extends(EsriClusterLayer, _super);
        function EsriClusterLayer(flagwindMap, id, options) {
            var _this = _super.call(this, flagwindMap, id, __assign({}, flagwind.ESRI_CLUSTER_LAYER_OPTIONS, options)) || this;
            if (_this.options.enableCluster) {
                _this.dataManager = new flagwind.DataManager();
            }
            return _this;
        }
        EsriClusterLayer.prototype.onCreateGraphicsLayer = function (args) {
            var _this = this;
            var layer;
            if (this.enableCluster) {
                layer = this.createClusterLayer(this.options.cluster);
            }
            else {
                layer = new esri.layers.GraphicsLayer(args);
            }
            layer.on("mouse-over", function (evt) {
                return _this.dispatchEvent("onMouseOver", evt);
            });
            layer.on("mouse-out", function (evt) {
                return _this.dispatchEvent("onMouseOut", evt);
            });
            layer.on("mouse-up", function (evt) {
                return _this.dispatchEvent("onMouseUp", evt);
            });
            layer.on("mouse-down", function (evt) {
                return _this.dispatchEvent("onMouseDown", evt);
            });
            layer.on("click", function (evt) { return _this.dispatchEvent("onClick", evt); });
            layer.on("dbl-click", function (evt) {
                return _this.dispatchEvent("onDblClick", evt);
            });
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map) {
                try {
                    if (!this._map) {
                        this._map = map;
                    }
                    map.removeLayer(this);
                }
                catch (error) {
                    console.warn(error);
                }
            };
            return layer;
        };
        EsriClusterLayer.prototype.createClusterLayer = function (options) {
            // init the layer, more options are available and explained in the cluster layer constructor
            var layer = new esri.layers.ClusterLayer(__assign({ id: this.id, spatialReference: this.flagwindMap.spatial, xPropertyName: "longitude", yPropertyName: "latitude", subTypeFlareProperty: "kind", singleFlareTooltipProperty: "" }, options));
            // set up a class breaks renderer to render different symbols based on the cluster count. Use the required clusterCount property to break on.
            var defaultSym = new esri.symbol.SimpleMarkerSymbol().setSize(6).setColor(options.font.color).setOutline(options.font.outline);
            var renderer = new esri.renderer.ClassBreaksRenderer(defaultSym, "clusterCount");
            var xlSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.xl.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.xl.color.line), 1), new dojo.Color(options.levels.xl.color.fill));
            var lgSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.lg.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.lg.color.line), 1), new dojo.Color(options.levels.lg.color.fill));
            var mdSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.md.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.md.color.line), 1), new dojo.Color(options.levels.md.color.fill));
            var smSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, options.levels.sm.size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.sm.color.line), 1), new dojo.Color(options.levels.sm.color.fill));
            renderer.addBreak(options.levels.sm.start, options.levels.sm.end, smSymbol);
            renderer.addBreak(options.levels.md.start, options.levels.md.end, mdSymbol);
            renderer.addBreak(options.levels.lg.start, options.levels.lg.end, lgSymbol);
            renderer.addBreak(options.levels.xl.start, options.levels.xl.end, xlSymbol);
            if (options.areaDisplay) {
                // if area display mode is set. Create a renderer to display cluster areas. Use SimpleFillSymbols as the areas are polygons
                var defaultAreaSym = new esri.symbol.SimpleFillSymbol().setStyle(esri.symbol.SimpleFillSymbol.STYLE_SOLID).setColor(new dojo.Color([0, 0, 0, 0.2])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.3]), 1));
                var areaRenderer = new esri.renderer.ClassBreaksRenderer(defaultAreaSym, "clusterCount");
                var xlAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.xl.color.line), 1), new dojo.Color(options.levels.xl.color.fill));
                var lgAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.lg.color.line), 1), new dojo.Color(options.levels.lg.color.fill));
                var mdAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.md.color.line), 1), new dojo.Color(options.levels.md.color.fill));
                var smAreaSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(options.levels.sm.color.line), 1), new dojo.Color(options.levels.sm.color.fill));
                areaRenderer.addBreak(options.levels.sm.start, options.levels.sm.end, smAreaSymbol);
                areaRenderer.addBreak(options.levels.md.start, options.levels.md.end, mdAreaSymbol);
                areaRenderer.addBreak(options.levels.lg.start, options.levels.lg.end, lgAreaSymbol);
                areaRenderer.addBreak(options.levels.xl.start, options.levels.xl.end, xlAreaSymbol);
                // use the custom overload of setRenderer to include the renderer for areas.
                layer.setRenderer(renderer, areaRenderer);
            }
            else {
                layer.setRenderer(renderer); // use standard setRenderer.
            }
            // 初始化数据仓库
            layer.allData = [];
            // 创建graphic仓库
            layer._graphics = [];
            return layer;
        };
        EsriClusterLayer.prototype.addClusters = function () {
            var datas = this.graphics.map(function (g) { return g.attributes; });
            this.layer.clear();
            this.dataManager.setData(datas);
            if (this.options.cluster.preClustered) {
                this.getPreClusteredGraphics();
            }
            else {
                var list = this.dataManager.getData();
                this.layer.addData(list);
            }
        };
        EsriClusterLayer.prototype.getPreClusteredGraphics = function () {
            var clusterOptions = this.options;
            var maxSingleFlareCount = clusterOptions.displaySingleFlaresAtCount;
            var clusterRatio = clusterOptions.ratio;
            var clusteredData = this.dataManager.clientSideClustering(clusterRatio, maxSingleFlareCount, clusterOptions.areaDisplay, this.flagwindMap.map);
            this.layer.addPreClusteredData(clusteredData);
        };
        EsriClusterLayer.prototype.getImageUrl = function (item) {
            var imageUrl = this.options.symbol.imageUrl;
            if (typeof imageUrl === "string" && imageUrl) {
                var key = "imageUrl" + (item.status || "") + (item.selected ? "checked" : "");
                var statusImageUrl = this.options[key] || this.options.symbol[key] || imageUrl;
                var suffixIndex = statusImageUrl.lastIndexOf(".");
                var path = statusImageUrl.substring(0, suffixIndex);
                var suffix = statusImageUrl.substring(suffixIndex + 1);
                if (item.selected) {
                    return path + "_checked." + suffix;
                }
                else {
                    return path + "." + suffix;
                }
            }
            else {
                var status_1 = item.status;
                if (status_1 === undefined || status_1 === null) {
                    status_1 = "";
                }
                var key = "image" + status_1 + (item.selected ? "checked" : "");
                return (this.options[key] ||
                    this.options.symbol[key] ||
                    this.options.image);
            }
        };
        Object.defineProperty(EsriClusterLayer.prototype, "enableCluster", {
            get: function () {
                return (this.options.enableCluster);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EsriClusterLayer.prototype, "singles", {
            get: function () {
                return this.layer.singles || [];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EsriClusterLayer.prototype, "clusters", {
            get: function () {
                return this.layer.clusters || [];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EsriClusterLayer.prototype, "graphics", {
            get: function () {
                if (this.enableCluster) {
                    return this.layer._graphics;
                }
                else {
                    return this.layer.graphics;
                }
            },
            enumerable: true,
            configurable: true
        });
        EsriClusterLayer.prototype.saveGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.saveGraphicByModel(dataList[i]);
            }
            if (this.enableCluster) {
                this.addClusters();
            }
        };
        EsriClusterLayer.prototype.addGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.addGraphicByModel(dataList[i]);
            }
            if (this.enableCluster) {
                this.addClusters();
            }
        };
        /**
         * 根据对象集合修改要素集合（无则忽略）
         * @param dataList 对象集合
         */
        EsriClusterLayer.prototype.updateGraphicList = function (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                this.updateGraphicByModel(dataList[i]);
            }
            if (this.enableCluster) {
                this.addClusters();
            }
        };
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        EsriClusterLayer.prototype.onCreatGraphicByModel = function (item) {
            var iconUrl = this.getImageUrl(item);
            var pt = this.getPoint(item);
            var width = this.options.symbol.width;
            var height = this.options.symbol.height;
            var markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            var attr = __assign({}, item, { __type: this.layerType });
            var graphic = new esri.Graphic(pt, markerSymbol, attr);
            return graphic;
        };
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        EsriClusterLayer.prototype.onUpdateGraphicByModel = function (item) {
            var iconUrl = this.getImageUrl(item);
            var pt = this.getPoint(item);
            var width = this.options.symbol.width;
            var height = this.options.symbol.height;
            var markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            var graphic = this.getGraphicById(item.id);
            var originPoint = graphic.geometry;
            graphic.setGeometry(pt);
            graphic.setSymbol(markerSymbol);
            graphic.attributes = __assign({}, graphic.attributes, item, { __type: this.layerType });
            graphic.draw(); // 重绘
            if (!flagwind.MapUtils.isEqualPoint(pt, originPoint)) {
                this.options.onPositionChanged(pt, originPoint, graphic.attributes);
            }
        };
        EsriClusterLayer.prototype.add = function (graphic) {
            if (this.enableCluster) {
                this.layer._graphics.push(graphic);
            }
            else {
                this.layer.add(graphic);
            }
        };
        EsriClusterLayer.prototype.remove = function (graphic) {
            if (this.enableCluster) {
                var index = this.layer._graphics.indexOf(graphic);
                if (index >= 0) {
                    this.layer._graphics.splice(index, 1);
                }
            }
            else {
                this.layer.remove(graphic);
            }
        };
        return EsriClusterLayer;
    }(flagwind.FlagwindBusinessLayer));
    flagwind.EsriClusterLayer = EsriClusterLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../events/EventProvider.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 支持的地图类型
     */
    var MapType;
    (function (MapType) {
        MapType["arcgis"] = "arcgis";
        MapType["minemap"] = "minemap";
    })(MapType = flagwind.MapType || (flagwind.MapType = {}));
    /**
     * 地图参数
     */
    flagwind.MAP_OPTIONS = {
        // 地图加载完回调
        onMapLoad: function () {
            console.log("onMapLoad");
        },
        onZoomStart: function (level) {
            console.log("onZoomStart");
        },
        onZoom: function (level) {
            console.log("onMapZoom");
        },
        // zoom 结束回调
        onZoomEnd: function (level) {
            console.log("onZoomEnd");
        },
        // 地图单击回调
        onMapClick: function (evt) {
            console.log("onMapClick");
        },
        /**
         *
         * @param lat
         * @param lon
         */
        formPoint: function (lat, lon) {
            return {
                lat: lat,
                lon: lon
            };
        },
        toPoint: function (lat, lon) {
            return {
                lat: lat,
                lon: lon
            };
        }
    };
    var FlagwindMap = /** @class */ (function (_super) {
        __extends(FlagwindMap, _super);
        function FlagwindMap(mapSetting, mapElement, options) {
            var _this = _super.call(this) || this;
            _this.mapSetting = mapSetting;
            _this.mapElement = mapElement;
            _this.featureLayers = [];
            _this.baseLayers = [];
            _this.loaded = false;
            _this.options = __assign({}, flagwind.MAP_OPTIONS, options);
            return _this;
        }
        // #region 坐标转换
        /**
         * 坐标点转换成对象
         * @param point 点
         */
        FlagwindMap.prototype.onFormPoint = function (point) {
            var lnglat = { lat: point.y, lon: point.x };
            if (point.latitude && point.longitude) {
                lnglat.lon = point.longitude;
                lnglat.lat = point.latitude;
            }
            if (this.spatial.wkid !== this.mapSetting.wkidFromApp) {
                if (this.spatial.wkid === 3857 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator2lonlat(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 102100 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_decrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3889) {
                    lnglat = flagwind.MapUtils.gcj_decrypt_exact(lnglat.lat, lnglat.lon);
                }
                else {
                    lnglat = this.options.formPoint(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return { longitude: parseFloat(lnglat.lon.toFixed(8)), latitude: parseFloat(lnglat.lat.toFixed(8)) };
        };
        /**
         * 对象转换成点
         * @param item 要素原型
         */
        FlagwindMap.prototype.onToPoint = function (item) {
            var lnglat = { lat: item.latitude || item.lat, lon: item.longitude || item.lon };
            if (!this.validGeometryModel(item)) {
                lnglat.lon = item.x || lnglat.lon;
                lnglat.lat = item.y || lnglat.lat;
            }
            if (this.spatial.wkid !== this.mapSetting.wkidFromApp) {
                if (this.spatial.wkid === 102100 && this.mapSetting.wkidFromApp === 4326) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3857) {
                    lnglat = flagwind.MapUtils.mercator_encrypt(lnglat.lat, lnglat.lon);
                }
                else if (this.spatial.wkid === 4326 && this.mapSetting.wkidFromApp === 3589) {
                    lnglat = flagwind.MapUtils.gcj_decrypt_exact(lnglat.lat, lnglat.lon);
                }
                else {
                    lnglat = this.options.toPoint(lnglat.lat, lnglat.lon);
                }
            }
            // 以x,y属性创建点
            return this.onCreatePoint({
                x: lnglat.lon,
                y: lnglat.lat,
                spatial: this.spatial
            });
        };
        FlagwindMap.prototype.validGeometryModel = function (item) {
            return flagwind.MapUtils.validGeometryModel(item);
        };
        // #endregion
        // #region 事件监听与移除
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
        Object.defineProperty(FlagwindMap.prototype, "map", {
            // #endregion
            // #region 地图常规操作
            get: function () {
                return this.innerMap;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 关闭信息窗口
         */
        FlagwindMap.prototype.closeInfoWindow = function () {
            this.onCloseInfoWindow();
        };
        FlagwindMap.prototype.centerAt = function () {
            var args = arguments, pt;
            switch (args.length) {
                case 0:
                    if (this.mapSetting.center && this.mapSetting.center.length === 2) {
                        pt = this.getPoint({
                            x: this.mapSetting.center[0],
                            y: this.mapSetting.center[1]
                        });
                    }
                    break;
                case 1:
                    pt = this.onCreatePoint({
                        x: args[0],
                        y: args[1],
                        spatial: this.spatial
                    });
                    break;
                case 2:
                    pt = this.onCreatePoint({
                        x: args[0],
                        y: args[1],
                        spatial: this.spatial
                    });
                    break;
            }
            if (pt) {
                return this.onCenterAt(pt);
            }
            else {
                return new Promise(function (resolve, reject) {
                    resolve();
                });
            }
        };
        /**
         * 放大或缩小到指挥zoom级别
         * @param zoom
         */
        FlagwindMap.prototype.setZoom = function (zoom) {
            return this.onZoom(zoom);
        };
        /**
         * 创建几何点
         */
        FlagwindMap.prototype.getPoint = function (item) {
            return this.onToPoint(item);
        };
        // #endregion
        // #region 底图
        /**
         * 根据id查找底图
         * @param id 底图id
         */
        FlagwindMap.prototype.getBaseLayerById = function (id) {
            var layers = this.baseLayers.filter(function (g) { return g.id === id; });
            return layers && layers.length > 0 ? layers[0] : null;
        };
        /**
         * 显示所有底图
         */
        FlagwindMap.prototype.showBaseLayers = function () {
            if (this.baseLayers) {
                this.baseLayers.forEach(function (g) { return g.show(); });
            }
        };
        /**
         * 隐藏所有底图
         */
        FlagwindMap.prototype.hideBaseLayers = function () {
            if (this.baseLayers) {
                this.baseLayers.forEach(function (g) { return g.hide(); });
            }
        };
        /**
         * 显示指定id的底图
         * @param id
         */
        FlagwindMap.prototype.showBaseLayer = function (id) {
            var layer = this.getBaseLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        };
        /**
         * 隐藏指定id的底图
         * @param id
         */
        FlagwindMap.prototype.hideBaseLayer = function (id) {
            var layer = this.getBaseLayerById(id);
            if (layer) {
                layer.hide();
                return true;
            }
            return false;
        };
        /**
         * 销毁对象
         */
        FlagwindMap.prototype.destroy = function () {
            this.onDestroy();
        };
        // #endregion
        // #region 功能图层
        /**
         * 获取指定id的功能图层
         * @param id
         */
        FlagwindMap.prototype.getFeatureLayerById = function (id) {
            var layers = this.featureLayers.filter(function (g) { return g.id === id; });
            return layers != null && layers.length > 0 ? layers[0] : null;
        };
        /**
         * 增加功能图层
         * @param featureLayer
         */
        FlagwindMap.prototype.addFeatureLayer = function (featureLayer) {
            if (this.getFeatureLayerById(featureLayer.id)) {
                throw Error("图层" + featureLayer.id + "已存在");
            }
            this.featureLayers.push(featureLayer);
            featureLayer.appendTo(this.innerMap);
        };
        /**
         * 移除指定id的功能图层
         * @param id 图层id
         */
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
        /**
         * 显示指定id的功能图层
         * @param id
         */
        FlagwindMap.prototype.showFeatureLayer = function (id) {
            var layer = this.getFeatureLayerById(id);
            if (layer) {
                layer.show();
                return true;
            }
            return false;
        };
        /**
         * 隐藏指定id的功能图层
         * @param id
         */
        FlagwindMap.prototype.hideFeatureLayer = function (id) {
            var layer = this.getFeatureLayerById(id);
            if (layer) {
                layer.hide();
                return true;
            }
            return false;
        };
        // #endregion
        // #region 初始化动作
        FlagwindMap.prototype.onInit = function () {
            var _this = this;
            this.onCreateMap();
            this.onCreateBaseLayers();
            this.on("onLoad", function () {
                try {
                    _this.loaded = true;
                    _this.centerAt();
                    _this.onMapLoad();
                }
                catch (ex) {
                    console.error(ex);
                }
            });
            var eventNames = Object.keys(this.options).filter(function (e) { return e.indexOf("on") >= 0; });
            var _loop_1 = function (eventName) {
                if (eventName === "onMapClick")
                    return "continue";
                if (eventName === "onMapLoad")
                    return "continue";
                if (this_1.options[eventName]) {
                    this_1.on(eventName, function (evt) {
                        _this.options[eventName](evt.data);
                    });
                }
            };
            var this_1 = this;
            for (var _i = 0, eventNames_1 = eventNames; _i < eventNames_1.length; _i++) {
                var eventName = eventNames_1[_i];
                _loop_1(eventName);
            }
            this.on("onClick", function (evt) {
                _this.options.onMapClick(evt);
            });
        };
        /**
         * 地图加载回调
         */
        FlagwindMap.prototype.onMapLoad = function () {
            if (this.options.onMapLoad) {
                this.options.onMapLoad();
            }
        };
        return FlagwindMap;
    }(flagwind.EventProvider));
    flagwind.FlagwindMap = FlagwindMap;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.map.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 对ArcGIS右键菜单实现
     */
    var EsriContextMenu = /** @class */ (function () {
        function EsriContextMenu(flagwindMap) {
            this.flagwindMap = flagwindMap;
            this.enabled = false;
        }
        EsriContextMenu.prototype.startup = function (eventArgs) {
            var _this = this;
            var menus = eventArgs.menus;
            this.menu = new dijit.Menu({
                onOpen: function (box) {
                    _this.point = _this.getMapPointFromMenuPosition(box, _this.flagwindMap.innerMap);
                }
            });
            for (var i = 0; i < menus.length; i++) {
                this.menu.addChild(new dijit.MenuItem({
                    label: menus[i],
                    onClick: function (evt) {
                        eventArgs.onClick(this.label);
                    }
                }));
            }
            this.menu.startup();
        };
        EsriContextMenu.prototype.enable = function () {
            if (this.enabled) {
                console.warn("已经开启快捷菜单");
                return;
            }
            this.enabled = true;
            this.menu.bindDomNode(this.flagwindMap.innerMap.container);
        };
        EsriContextMenu.prototype.disable = function () {
            this.enabled = false;
            this.menu.unBindDomNode(this.flagwindMap.innerMap.container);
        };
        /**
         * 获取菜单单击的坐标信息
         */
        EsriContextMenu.prototype.getMapPointFromMenuPosition = function (box, map) {
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
        return EsriContextMenu;
    }());
    flagwind.EsriContextMenu = EsriContextMenu;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-feature.layer.ts" />
var flagwind;
(function (flagwind) {
    var EsriEditLayer = /** @class */ (function (_super) {
        __extends(EsriEditLayer, _super);
        function EsriEditLayer(businessLayer, options) {
            var _this = _super.call(this, "edit_" + businessLayer.id, "编辑图层") || this;
            _this.graphic = null;
            _this.originInfo = {};
            _this.options = __assign({}, flagwind.EDIT_LAYER_OPTIONS, options);
            _this.layer = _this.onCreateGraphicsLayer({ id: _this.id });
            _this.businessLayer = businessLayer;
            var funGetInfoWindowContext = _this.businessLayer.options.getInfoWindowContext;
            _this.businessLayer.options.getInfoWindowContext = function (model) {
                var context = funGetInfoWindowContext(model);
                context.content += "<a key='" + model.id + "' id='edit_point_" + model.id + "' class='fm-btn edit-point'>更新坐标</a>";
                return context;
            };
            _this.businessLayer.options.showInfoWindowCompleted = function (model) {
                dojo.connect(dojo.byId("edit_point_" + model.id), "onclick", function (evt) {
                    var key = evt.target.attributes["key"].value;
                    _this.activateEdit(key);
                });
            };
            _this.flagwindMap = businessLayer.flagwindMap;
            _this.editObj = new esri.toolbars.Edit(_this.flagwindMap.innerMap); // 编辑对象,在编辑图层进行操作
            _this.flagwindMap.addFeatureLayer(_this);
            if (_this.flagwindMap.innerMap.loaded) {
                _this.onLoad();
            }
            else {
                _this.flagwindMap.innerMap.on("load", function () { _this.onLoad(); });
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
            this.graphic = editGraphic;
            this.originInfo = editGraphic.attributes;
            this.showInfoWindow();
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
            this.businessLayer.showInfoWindow({
                graphic: graphic
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
            layer.removeFromMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        EsriEditLayer.prototype.onChanged = function (options, isSave) {
            return this.options.onEditInfo(options, isSave);
        };
        EsriEditLayer.prototype.showInfoWindow = function () {
            var _this = this;
            var title = this.businessLayer.title;
            this.map.infoWindow.setTitle(title);
            var content = "";
            content = "<div><span class='opertate-tooltip'>操作提示：请拖动图标至目标位置，点击 \"完成\" 会提示保存修改，点击\"取消\"将取消修改！</span></div><br/>";
            content += "<a><span id='resetOrdinate'  class='btn btn-primary btn-transparent outline mt5 deleteOrdinate' " + "key=" + this.graphic.attributes.id + ">取消</span></a>";
            content += "<a><span id='applyOrdinate'  class='btn btn-primary btn-transparent outline mt5 deleteOrdinate' " + "key=" + this.graphic.attributes.id + ">完成</span></a>";
            this.map.infoWindow.setContent(content);
            var pt = this.graphic.geometry;
            this.map.infoWindow.show(pt);
            dojo.connect(dojo.byId("resetOrdinate"), "onclick", function (evt) {
                var key = evt.target.attributes["key"].value;
                _this.cancelEdit(key);
            });
            dojo.connect(dojo.byId("applyOrdinate"), "onclick", function (evt) {
                var key = evt.target.attributes["key"].value;
                _this.confirm(key);
            });
        };
        EsriEditLayer.prototype.confirm = function (key) {
            var _this = this;
            this.options.confirm({
                title: "确定要进行更改吗？",
                content: "初始坐标值（经度）:" + this.originInfo.longitude +
                    ",（纬度）:" + this.originInfo.latitude +
                    "\r当前坐标值（经度）:" + this.graphic.geometry.x.toFixed(8) +
                    ",（纬度）:" + this.graphic.geometry.y.toFixed(8),
                onOk: function () {
                    var pt = _this.graphic.geometry;
                    var lonlat = _this.businessLayer.formPoint(pt);
                    var changeInfo = __assign({}, _this.graphic.attributes, lonlat);
                    // 异步更新，请求成功才更新位置，否则不处理，
                    _this.options.onEditInfo({
                        id: key,
                        latitude: changeInfo.latitude,
                        longitude: changeInfo.longitude
                    }, true).then(function (res) {
                        _this.businessLayer.removeGraphicById(changeInfo.id);
                        _this.businessLayer.addGraphicList([changeInfo]);
                    });
                },
                onCancel: function () {
                    _this.options.onEditInfo({
                        id: key,
                        latitude: _this.originInfo.latitude,
                        longitude: _this.originInfo.longitude
                    }, false);
                }
            });
            this.graphic.attributes.eventName = "stop";
            this.clear();
            this.hide();
            this.map.infoWindow.hide();
            this.businessLayer.show();
        };
        EsriEditLayer.prototype.registerEvent = function () {
            var _this = this;
            dojo.connect(this.layer, "onClick", function (evt) {
                _this.graphic = evt.graphic;
                _this.onLayerClick(_this, evt);
            });
            console.log("编辑对象：" + this.editObj);
            dojo.on(this.editObj, "graphic-first-move", function (ev) {
                console.log("要素移动---------graphic-first-move");
                _this.flagwindMap.innerMap.infoWindow.hide();
            });
            dojo.on(this.editObj, "graphic-click", function (evt) {
                _this.showInfoWindow();
            });
            dojo.on(this.editObj, "graphic-move-stop", function (evt) {
                _this.showInfoWindow();
            });
        };
        EsriEditLayer.prototype.onLayerClick = function (editLayer, evt) {
            if (editLayer.businessLayer.options.onLayerClick) {
                editLayer.businessLayer.options.onLayerClick(evt);
            }
            if (editLayer.businessLayer.options.showInfoWindow) {
                editLayer.businessLayer.showInfoWindow(evt);
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
            this.layer.removeFromMap(map);
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
            layer.removeFromMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        return EsriGroupLayer;
    }(flagwind.FlagwindGroupLayer));
    flagwind.EsriGroupLayer = EsriGroupLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var EsriHeatmapLayer = /** @class */ (function () {
        function EsriHeatmapLayer(flagwindMap, id, options) {
            this.flagwindMap = flagwindMap;
            this.isShow = true;
            this.id = id || "heatmapLayer";
            this.options = __assign({}, flagwind.HEATMAP_LAYER_OPTIONS, options);
            this.map = flagwindMap.map;
            this.dataMap = new flagwind.Map();
            this.heatLayer = this.createHeatLayer();
            this.appendTo(this.map);
        }
        EsriHeatmapLayer.prototype.createHeatLayer = function () {
            var featureCollection = {
                featureSet: null,
                layerDefinition: {
                    geometryType: "esriGeometryPoint",
                    fields: [
                        {
                            name: "count",
                            type: "esriFieldTypeDouble",
                            alias: "count"
                        }
                    ]
                }
            };
            var options = { id: this.id, opacity: 0.7 };
            var layer = new esri.layers.FeatureLayer(featureCollection, options);
            this.heatmapRenderer = new esri.renderer.HeatmapRenderer(__assign({
                field: "count",
                blurRadius: this.options.blurRadius || 12,
                colorStops: this.options.colorStops || [
                    { ratio: 0, color: "rgb(255, 219, 0, 0)" },
                    { ratio: 0.6, color: "rgb(250, 146, 0)" },
                    { ratio: 0.85, color: "rgb(250, 73, 0)" },
                    { ratio: 0.95, color: "rgba(250, 0, 0)" }
                ]
            }, this.options));
            layer.setRenderer(this.heatmapRenderer);
            return layer;
        };
        EsriHeatmapLayer.prototype.appendTo = function (map) {
            map.addLayer(this.heatLayer);
        };
        EsriHeatmapLayer.prototype.removeLayer = function (map) {
            map.removeLayer(this.heatLayer);
        };
        EsriHeatmapLayer.prototype.resize = function () {
            this.map.innerMap.resize();
        };
        EsriHeatmapLayer.prototype.clear = function () {
            this.dataMap.clear();
            this.heatLayer.clear();
        };
        EsriHeatmapLayer.prototype.show = function () {
            this.isShow = true;
            this.heatLayer.show();
        };
        EsriHeatmapLayer.prototype.hide = function () {
            this.isShow = false;
            this.heatLayer.hide();
        };
        EsriHeatmapLayer.prototype.setMaxPixelIntensity = function (value) {
            this.heatmapRenderer.setMaxPixelIntensity(value);
        };
        EsriHeatmapLayer.prototype.showDataList = function (data) {
            var _this = this;
            var dataList = this.onChangeStandardModel(data);
            if (dataList.length === 0) {
                console.log("未传入热点数据");
                return;
            }
            this.setMaxPixelIntensity(dataList.reduce(function (max, item) { return (max = Math.max(item.count, max)); }, 1));
            dataList.forEach(function (g) {
                var pt = _this.flagwindMap.getPoint(g); // new esri.geometry.Point(g.x, g.y, this.map.spatial);
                var symbol = new esri.symbol.SimpleMarkerSymbol();
                var graphic = new esri.Graphic(pt, symbol, g);
                _this.heatLayer.add(graphic);
            });
        };
        EsriHeatmapLayer.prototype.onChangeStandardModel = function (data) {
            var _this = this;
            data.forEach(function (g) {
                var node = _this.options.changeStandardModel(g);
                if (node) {
                    var key = node.longitude + ":" + node.latitude;
                    var value = _this.dataMap.get(key);
                    if (value !== undefined) {
                        value.members.push(g);
                        value.count = value.count + (node.count || 1);
                    }
                    else {
                        value = {
                            longitude: node.longitude,
                            latitude: node.latitude,
                            members: [g],
                            count: (node.count || 1)
                        };
                        _this.dataMap.set(key, value);
                    }
                }
            });
            return this.dataMap.values();
        };
        return EsriHeatmapLayer;
    }());
    flagwind.EsriHeatmapLayer = EsriHeatmapLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var EsriLocationLayer = /** @class */ (function (_super) {
        __extends(EsriLocationLayer, _super);
        function EsriLocationLayer(flagwindMap, options) {
            var _this = _super.call(this, options.id, options.title) || this;
            _this.flagwindMap = flagwindMap;
            _this.options = options;
            _this.options = __assign({}, flagwind.LOCATION_LAYER_OPTIONS, _this.options);
            _this.layer = _this.onCreateGraphicsLayer({ id: _this.id });
            _this.flagwindMap.addFeatureLayer(_this);
            _this.registerEvent();
            return _this;
        }
        EsriLocationLayer.prototype.registerEvent = function () {
            var _this = this;
            this.flagwindMap.on("onClick", function (args) {
                _this.point = args.data.mapPoint;
                _this.locate();
            }, this);
        };
        EsriLocationLayer.prototype.onCreateGraphicsLayer = function (options) {
            var _this = this;
            var layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", function (evt) { return _this.dispatchEvent("onMouseOver", evt); });
            layer.on("mouse-out", function (evt) { return _this.dispatchEvent("onMouseOut", evt); });
            layer.on("mouse-up", function (evt) { return _this.dispatchEvent("onMouseUp", evt); });
            layer.on("mouse-down", function (evt) { return _this.dispatchEvent("onMouseDown", evt); });
            layer.on("click", function (evt) { return _this.dispatchEvent("onClick", evt); });
            layer.on("dbl-click", function (evt) { return _this.dispatchEvent("onDblClick", evt); });
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        EsriLocationLayer.prototype.locate = function () {
            this.clear();
            var marker = this.createGraphic(this.point);
            this.layer.add(marker);
            this.options.onMapClick({ point: this.point });
        };
        EsriLocationLayer.prototype.getFillSymbol = function (width, color) {
            color = color || [38, 101, 196];
            width = width || 2;
            var polygonColor = [60, 137, 253, 0.6];
            var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color(polygonColor), width), new esri.Color(polygonColor));
            return polygonSymbol;
        };
        EsriLocationLayer.prototype.createSymbol = function (path, color) {
            var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            markerSymbol.setPath(path);
            markerSymbol.setSize(40);
            markerSymbol.setColor(new dojo.Color(color));
            markerSymbol.setOutline(null);
            return markerSymbol;
        };
        EsriLocationLayer.prototype.createGraphic = function (pt) {
            var iconPath = "M511.999488 299.209616m-112.814392 0a110.245 110.245 0 1 0 225.628784 0 110.245 110.245 0 1 0-225.628784 0ZM47.208697 523.662621A0 11.396 0 1 1 47.208697 524.685927ZM511.949346 7.981788c-173.610036 0-314.358641 140.748604-314.358641 314.358641s314.358641 523.932774 314.358641 523.932774 314.358641-350.322737 314.358641-523.932774S685.558359 7.981788 511.949346 7.981788L511.949346 7.981788zM511.949346 453.323623c-86.805018 0-157.177785-70.371744-157.177785-157.176762 0-86.830601 70.372767-157.182902 157.177785-157.182902 86.825484 0 157.201322 70.352301 157.201322 157.182902C669.150668 382.952902 598.774831 453.323623 511.949346 453.323623L511.949346 453.323623zM511.949346 453.323623M583.236949 788.686646l-19.674085 34.075073c201.221908 3.617387 357.506347 30.455639 357.506347 63.026452 0 35.039028-180.857091 63.442938-403.955238 63.442938-309.208341 0-403.962401-28.404933-403.962401-63.442938 0-32.067346 151.486156-58.57507 348.201423-62.841234l-19.780509-34.259268c-214.366276 7.369851-378.251833 47.647183-378.251833 96.232738 0 53.81465 105.338117 97.443309 449.084065 97.443309 248.02077 0 449.082018-43.62559 449.082018-97.443309C961.487759 836.332806 797.602202 796.055474 583.236949 788.686646z";
            var initColor = "#13227a";
            var graphic = new esri.Graphic(pt, this.createSymbol(iconPath, initColor));
            return graphic;
        };
        return EsriLocationLayer;
    }(flagwind.FlagwindFeatureLayer));
    flagwind.EsriLocationLayer = EsriLocationLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.map.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 对ArcGIS地图封装
     */
    var EsriMap = /** @class */ (function (_super) {
        __extends(EsriMap, _super);
        function EsriMap(mapSetting, mapElement, options) {
            var _this = _super.call(this, mapSetting, mapElement, __assign({
                onMapClick: function (evt) {
                    console.log("onMapClick:" + evt.data.mapPoint.x + "," + evt.data.mapPoint.y);
                }
            }, options)) || this;
            _this.mapSetting = mapSetting;
            _this.onInit();
            return _this;
        }
        EsriMap.prototype.onAddEventListener = function (eventName, callBack) {
            dojo.on(this.map, eventName, callBack);
        };
        EsriMap.prototype.onCenterAt = function (point) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.map.centerAt(point).then(function () {
                    resolve();
                });
            });
        };
        EsriMap.prototype.onCreatePoint = function (options) {
            return new esri.geometry.Point(options.x, options.y, options.spatial || this.spatial);
        };
        EsriMap.prototype.onCreateMap = function () {
            var _this = this;
            this.spatial = new esri.SpatialReference({
                wkid: this.mapSetting.wkid || 4326
            });
            var setting = this.mapSetting;
            var mapArguments = {
                wkid: setting.wkid,
                center: setting.center,
                logo: setting.logo,
                slider: setting.slider,
                sliderPosition: setting.sliderPosition
            };
            if (setting.zoom !== undefined) {
                mapArguments.zoom = setting.zoom;
            }
            if (setting.minZoom !== undefined) {
                mapArguments.minZoom = setting.minZoom;
            }
            if (setting.maxZoom !== undefined) {
                mapArguments.maxZoom = setting.maxZoom;
            }
            if (setting.basemap && setting.basemap !== "none") {
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
            // 地图对象
            var map = new esri.Map(this.mapElement, mapArguments);
            map.infoWindow.anchor = "top";
            this.innerMap = map;
            this.tooltipElement = document.createElement("div");
            this.tooltipElement.classList.add("flagwind-map-tooltip");
            this.innerMap.root.appendChild(this.tooltipElement);
            // #region click event
            map.on("load", function (args) {
                _this.dispatchEvent("onLoad", args);
            });
            map.on("click", function (args) {
                _this.dispatchEvent("onClick", args);
            });
            map.on("dbl-click", function (args) {
                _this.dispatchEvent("onDbClick", args);
            });
            // #endregion
            // #region mouse event
            map.on("mouse-out", function (args) {
                _this.dispatchEvent("onMouseOut", args);
            });
            map.on("mouse-over", function (args) {
                _this.dispatchEvent("onMouseOver", args);
            });
            map.on("mouse-move", function (args) {
                _this.dispatchEvent("onMouseMove", args);
            });
            map.on("mouse-wheel", function (args) {
                _this.dispatchEvent("onMouseWheel", args);
            });
            // #endregion
            // #region zoom event
            map.on("zoom", function (args) {
                _this.dispatchEvent("onZoom", args);
            });
            map.on("zoom-start", function (args) {
                _this.dispatchEvent("onZoomStart", args);
            });
            map.on("zoom-end", function (args) {
                _this.dispatchEvent("onZoomEnd", args);
            });
            // #endregion
            // #region pan event
            map.on("pan", function (args) {
                _this.dispatchEvent("onPan", args);
            });
            map.on("pan-start", function (args) {
                _this.dispatchEvent("onPanStart", args);
            });
            map.on("pan-end", function (args) {
                _this.dispatchEvent("onPanEnd", args);
            });
            // #endregion
            // #region update event
            map.on("update-start", function (args) {
                _this.dispatchEvent("onUpdateStart", args);
            });
            map.on("update-end", function (args) {
                _this.dispatchEvent("onUpdateEnd", args);
            });
            // #endregion
            map.on("extent-change", function (args) {
                // console.trace("------extentChange", args);
                _this.dispatchEvent("onExtentChange", args);
            });
            map.on("resize", function (args) {
                _this.dispatchEvent("onResize", args);
            });
        };
        EsriMap.prototype.onShowInfoWindow = function (evt) {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.hide();
            }
            if (!evt.context) {
                throw new Error("未设置context,无法显示窗口");
            }
            var pt = this.getPoint(evt.graphic.attributes);
            this.innerMap.infoWindow.setTitle(evt.context.title);
            this.innerMap.infoWindow.setContent(evt.context.content);
            if (!evt.options) {
                this.innerMap.infoWindow.show(pt);
                return;
            }
            if (evt.options.width && evt.options.height) {
                this.innerMap.infoWindow.resize(evt.options.width, evt.options.height);
            }
            if (evt.options.offset) {
                var location_1 = this.innerMap.toScreen(pt);
                location_1.x += evt.options.offset.x;
                location_1.y += evt.options.offset.y;
                this.innerMap.infoWindow.show(location_1);
            }
            else {
                this.innerMap.infoWindow.show(pt);
            }
        };
        EsriMap.prototype.onCloseInfoWindow = function () {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.hide();
            }
        };
        EsriMap.prototype.onCreateBaseLayers = function () {
            var _this = this;
            var baseLayers = new Array();
            if (this.mapSetting.baseUrl) {
                var layer = new flagwind.EsriTiledLayer("base_arcgis_tiled", this.mapSetting.baseUrl, this.spatial, "瓦片图层");
                baseLayers.push(layer);
            }
            if (this.mapSetting.tiledUrls) {
                this.mapSetting.tiledUrls.forEach(function (l) {
                    if (!l.url)
                        return;
                    var layer = new flagwind.EsriTiledLayer(l.id, l.url, _this.spatial, l.title);
                    baseLayers.push(layer);
                });
            }
            this.baseLayers = baseLayers;
            this.baseLayers.forEach(function (g) {
                g.appendTo(_this.innerMap);
            });
            return baseLayers;
        };
        EsriMap.prototype.toScreen = function () {
            var args = arguments, pt;
            switch (args.length) {
                case 1:
                    pt = this.onToPoint(args[0]);
                    break;
                case 2:
                    pt = this.onCreatePoint({
                        x: args[0],
                        y: args[1],
                        spatial: this.spatial
                    });
                    break;
            }
            if (pt) {
                return this.innerMap.toScreen(pt);
            }
            else {
                return null;
            }
        };
        EsriMap.prototype.onZoom = function (zoom) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.map.setZoom(zoom).then(function () {
                    resolve();
                });
            });
        };
        EsriMap.prototype.onShowTooltip = function (graphic) {
            var info = graphic.attributes;
            var pt = new esri.geometry.Point(info.longitude, info.latitude, this.spatial);
            var screenpt = this.innerMap.toScreen(pt);
            var title = info.name;
            this.tooltipElement.innerHTML = "<div>" + title + "</div>";
            this.tooltipElement.style.left = (screenpt.x + 15) + "px";
            this.tooltipElement.style.top = (screenpt.y + 15) + "px";
            this.tooltipElement.style.display = "block";
        };
        EsriMap.prototype.onHideTooltip = function () {
            this.tooltipElement.style.display = "none";
        };
        EsriMap.prototype.onDestroy = function () {
            try {
                if (this.tooltipElement) {
                    this.tooltipElement.remove();
                    this.tooltipElement = null;
                }
                if (this.featureLayers) {
                    this.featureLayers.forEach(function (l) {
                        l.clear();
                    });
                    this.featureLayers = [];
                }
                if (this.baseLayers) {
                    this.baseLayers = [];
                }
                if (this.innerMap && this.innerMap.destroy) {
                    this.innerMap.destroy();
                    this.innerMap = null;
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        return EsriMap;
    }(flagwind.FlagwindMap));
    flagwind.EsriMap = EsriMap;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-business.layer.ts" />;
var flagwind;
(function (flagwind) {
    flagwind.ESRI_POINT_LAYER_OPTIONS = {
        getImageUrl: null,
        onEvent: function (eventName, evt) {
            switch (eventName) {
                case "onMouseOver":
                    if (evt.graphic.getNode())
                        evt.graphic.getNode().classList.add("marker-scale");
                    break;
                case "onMouseOut":
                    if (evt.graphic.getNode())
                        evt.graphic.getNode().classList.remove("marker-scale");
                    break;
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
    var EsriPointLayer = /** @class */ (function (_super) {
        __extends(EsriPointLayer, _super);
        function EsriPointLayer(flagwindMap, id, options) {
            return _super.call(this, flagwindMap, id, __assign({}, flagwind.ESRI_POINT_LAYER_OPTIONS, options)) || this;
        }
        EsriPointLayer.prototype.onCreateGraphicsLayer = function (options) {
            var _this = this;
            var layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", function (evt) {
                return _this.dispatchEvent("onMouseOver", evt);
            });
            layer.on("mouse-out", function (evt) {
                return _this.dispatchEvent("onMouseOut", evt);
            });
            layer.on("mouse-up", function (evt) {
                return _this.dispatchEvent("onMouseUp", evt);
            });
            layer.on("mouse-down", function (evt) {
                return _this.dispatchEvent("onMouseDown", evt);
            });
            layer.on("click", function (evt) { return _this.dispatchEvent("onClick", evt); });
            layer.on("dbl-click", function (evt) {
                return _this.dispatchEvent("onDblClick", evt);
            });
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map) {
                try {
                    if (!this._map) {
                        this._map = map;
                    }
                    map.removeLayer(this);
                }
                catch (error) {
                    console.warn(error);
                }
            };
            return layer;
            // return new EsriGraphicsLayer(options);
        };
        EsriPointLayer.prototype.getImageUrl = function (item) {
            if (this.options.getImageUrl) {
                return this.options.getImageUrl(item);
            }
            var imageUrl = this.options.symbol.imageUrl;
            if (typeof imageUrl === "string" && imageUrl) {
                var key = "imageUrl" + (item.status || "") + (item.selected ? "checked" : "");
                var statusImageUrl = this.options[key] || this.options.symbol[key] || imageUrl;
                var suffixIndex = statusImageUrl.lastIndexOf(".");
                var path = statusImageUrl.substring(0, suffixIndex);
                var suffix = statusImageUrl.substring(suffixIndex + 1);
                if (item.selected) {
                    return path + "_checked." + suffix;
                }
                else {
                    return path + "." + suffix;
                }
            }
            else {
                var status_2 = item.status;
                if (status_2 === undefined || status_2 === null) {
                    status_2 = "";
                }
                var key = "image" + status_2 + (item.selected ? "checked" : "");
                return (this.options[key] ||
                    this.options.symbol[key] ||
                    this.options.image);
            }
        };
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        EsriPointLayer.prototype.onCreatGraphicByModel = function (item) {
            var iconUrl = this.getImageUrl(item);
            var pt = this.getPoint(item);
            var width = this.options.symbol.width;
            var height = this.options.symbol.height;
            var markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            var attr = __assign({}, item, { __type: this.layerType });
            var graphic = new esri.Graphic(pt, markerSymbol, attr);
            return graphic;
        };
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        EsriPointLayer.prototype.onUpdateGraphicByModel = function (item) {
            var iconUrl = this.getImageUrl(item);
            var pt = this.getPoint(item);
            var width = this.options.symbol.width;
            var height = this.options.symbol.height;
            var markerSymbol = new esri.symbol.PictureMarkerSymbol(iconUrl, width, height);
            var graphic = this.getGraphicById(item.id);
            var originPoint = graphic.geometry;
            graphic.setGeometry(pt);
            graphic.setSymbol(markerSymbol);
            graphic.attributes = __assign({}, graphic.attributes, item, { __type: this.layerType });
            graphic.draw(); // 重绘
            if (!flagwind.MapUtils.isEqualPoint(pt, originPoint)) {
                this.options.onPositionChanged(pt, originPoint, graphic.attributes);
            }
        };
        return EsriPointLayer;
    }(flagwind.FlagwindBusinessLayer));
    flagwind.EsriPointLayer = EsriPointLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-business.layer.ts" />;
var flagwind;
(function (flagwind) {
    flagwind.ESRI_POLYGON_LAYER_OPTIONS = {
        onEvent: function (eventName, evt) {
            if (eventName === "onMouseOver") {
                evt.graphic.symbol.setColor([247, 247, 247, 0.05]);
                evt.graphic.draw();
            }
            else if (eventName === "onMouseOut") {
                evt.graphic.symbol.setColor([0, 49, 0, 0.45]);
                evt.graphic.draw();
            }
        },
        symbol: {
            lineWidth: 3,
            lineColor: [255, 255, 255, 0.6],
            fillColor: [0, 49, 0, 0.45],
            lineType: "STYLE_DASH",
            fillType: "STYLE_SOLID"
        },
        layerType: "polygon"
    };
    /**
     * 面图层
     */
    var EsriPolygonLayer = /** @class */ (function (_super) {
        __extends(EsriPolygonLayer, _super);
        function EsriPolygonLayer(flagwindMap, id, options) {
            return _super.call(this, flagwindMap, id, __assign({}, flagwind.ESRI_POLYGON_LAYER_OPTIONS, options)) || this;
        }
        EsriPolygonLayer.prototype.onCreateGraphicsLayer = function (options) {
            var _this = this;
            var layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", function (evt) { return _this.dispatchEvent("onMouseOver", evt); });
            layer.on("mouse-out", function (evt) { return _this.dispatchEvent("onMouseOut", evt); });
            layer.on("mouse-up", function (evt) { return _this.dispatchEvent("onMouseUp", evt); });
            layer.on("mouse-down", function (evt) { return _this.dispatchEvent("onMouseDown", evt); });
            layer.on("click", function (evt) { return _this.dispatchEvent("onClick", evt); });
            layer.on("dbl-click", function (evt) { return _this.dispatchEvent("onDblClick", evt); });
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        EsriPolygonLayer.prototype.onCreatGraphicByModel = function (item) {
            var polygon = this.getPolygon(item.polygon);
            var fillSymbol = this.getFillSymbol(this.options.symbol);
            var attr = __assign({}, item, { __type: "polygon" });
            var graphic = new esri.Graphic(polygon, fillSymbol, attr);
            return graphic;
        };
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        EsriPolygonLayer.prototype.onUpdateGraphicByModel = function (item) {
            var polygon = this.getPolygon(item.polygon);
            var fillSymbol = this.getFillSymbol(this.options.symbol);
            var graphic = this.getGraphicById(item.id);
            graphic.setGeometry(polygon);
            graphic.setSymbol(fillSymbol);
            graphic.attributes = __assign({}, graphic.attributes, item, { __type: "polygon" });
            graphic.draw(); // 重绘
        };
        EsriPolygonLayer.prototype.getPolygon = function (strLine) {
            if (!strLine)
                return null;
            var polygon = new esri.geometry.Polygon(this.spatial);
            var xys = strLine.split(";");
            var points = [];
            for (var i = 0; i < xys.length; i++) {
                if ((!xys[i]) || xys[i].length <= 0)
                    continue;
                var xy = xys[i].split(",");
                var p = this.getPoint({
                    x: parseFloat(xy[0]),
                    y: parseFloat(xy[1])
                });
                points.push([p.x, p.y]);
            }
            polygon.addRing(points);
            return polygon;
        };
        EsriPolygonLayer.prototype.getFillSymbol = function (symbol) {
            return new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol[symbol.fillType], new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol[symbol.lineType], new esri.Color(symbol.lineColor), symbol.lineWidth), new esri.Color(symbol.fillColor));
        };
        return EsriPolygonLayer;
    }(flagwind.FlagwindBusinessLayer));
    flagwind.EsriPolygonLayer = EsriPolygonLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-business.layer.ts" />;
var flagwind;
(function (flagwind) {
    flagwind.ESRI_POLYLINE_LAYER_OPTIONS = {
        symbol: {
            lineWidth: 4,
            lineColor: [255, 0, 0],
            lineType: "STYLE_DASH",
            lineMiterLimit: 2
        },
        layerType: "polyline"
    };
    /**
     * 线图层
     */
    var EsriPolylineLayer = /** @class */ (function (_super) {
        __extends(EsriPolylineLayer, _super);
        function EsriPolylineLayer(flagwindMap, id, options) {
            var _this = _super.call(this, flagwindMap, id, __assign({}, flagwind.ESRI_POLYLINE_LAYER_OPTIONS, options)) || this;
            _this.onInit();
            return _this;
        }
        EsriPolylineLayer.prototype.onCreateGraphicsLayer = function (options) {
            var _this = this;
            var layer = new esri.layers.GraphicsLayer(options);
            layer.on("mouse-over", function (evt) { return _this.dispatchEvent("onMouseOver", evt); });
            layer.on("mouse-out", function (evt) { return _this.dispatchEvent("onMouseOut", evt); });
            layer.on("mouse-up", function (evt) { return _this.dispatchEvent("onMouseUp", evt); });
            layer.on("mouse-down", function (evt) { return _this.dispatchEvent("onMouseDown", evt); });
            layer.on("click", function (evt) { return _this.dispatchEvent("onClick", evt); });
            layer.on("dbl-click", function (evt) { return _this.dispatchEvent("onDblClick", evt); });
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        EsriPolylineLayer.prototype.onCreatGraphicByModel = function (item) {
            var polyline = this.getPolyline(item.polyline);
            var lineSymbol = this.getLineSymbol(this.options.symbol);
            var attr = __assign({}, item, { __type: "polyline" });
            var graphic = new esri.Graphic(polyline, lineSymbol, attr);
            return graphic;
        };
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        EsriPolylineLayer.prototype.onUpdateGraphicByModel = function (item) {
            var polyline = this.getPolyline(item.polyline);
            var lineSymbol = this.getLineSymbol(this.options.symbol);
            var graphic = this.getGraphicById(item.id);
            graphic.setGeometry(polyline);
            graphic.setSymbol(lineSymbol);
            graphic.attributes = __assign({}, graphic.attributes, item, { __type: "polyline" });
            graphic.draw(); // 重绘
        };
        EsriPolylineLayer.prototype.setSelectStatus = function (item, selected) {
            item.selected = selected;
            this.onUpdateGraphicByModel(item);
        };
        EsriPolylineLayer.prototype.getLineSymbol = function (symbol) {
            return new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol[symbol.lineType], new esri.Color(symbol.lineColor), symbol.lineWidth, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_MITER, symbol.lineMiterLimit);
        };
        /**
         * 把点集字符串转换成线要素
         * @param strLine 坐标点字符串"x1,y1;x2,y2;x3,y3"
         */
        EsriPolylineLayer.prototype.getPolyline = function (strLine) {
            if (!strLine)
                return null;
            var line = new esri.geometry.Polyline(this.spatial);
            var xys = strLine.split(";");
            for (var i = 1; i < xys.length; i++) {
                if ((!xys[i]) || xys[i].length <= 0)
                    continue;
                var startXy = xys[i - 1].split(",");
                var endXy = xys[i].split(",");
                var start = this.getPoint({
                    x: parseFloat(startXy[0]),
                    y: parseFloat(startXy[1])
                });
                var end = this.getPoint({
                    x: parseFloat(endXy[0]),
                    y: parseFloat(endXy[1])
                });
                line.addPath([[start.x, start.y], [end.x, end.y]]);
            }
            return line;
        };
        return EsriPolylineLayer;
    }(flagwind.FlagwindBusinessLayer));
    flagwind.EsriPolylineLayer = EsriPolylineLayer;
})(flagwind || (flagwind = {}));
/// <reference path="./flagwind-group.layer.ts" />
var flagwind;
(function (flagwind) {
    flagwind.ROUTE_LAYER_OPTIONS = {
        // 路由方式（Line:连线，NA:网络路径分析）
        routeType: "Line",
        // 路由服务地址(当routeType为NA时设置)
        routeUrl: "http://120.202.26.98:6080/arcgis/rest/services/Features/NAServer/Route",
        // 行驶速度
        speed: 100,
        minSpeedRatio: 0.25,
        maxSpeedRatio: 4,
        // 轨迹播放图层显示层级
        trackLevel: 2,
        autoCenterAt: true,
        getImageUrl: null,
        getImageAngle: null,
        onMessageEvent: function (name, message) {
            console.log(name + " " + message);
        },
        onCreateSegmentCompleteEvent: function (segment) {
            console.log("onCreateSegmentCompleteEvent");
        },
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
        // 是否自动显示路段
        autoShowSegmentLine: true,
        symbol: {
            imageUrl: "",
            height: null,
            width: null
        }
    };
    var FlagwindRouteLayer = /** @class */ (function () {
        function FlagwindRouteLayer(flagwindMap, layerName, options) {
            var _this = this;
            this.flagwindMap = flagwindMap;
            this.layerName = layerName;
            this.options = options;
            this.isShow = true;
            this.trackLines = [];
            this.options = __assign({}, flagwind.ROUTE_LAYER_OPTIONS, options);
            this.moveLineLayer = this.onCreateLineLayer(layerName + "LineLayer");
            // 移动小车
            this.moveMarkLayer = this.onCreateMovingLayer(layerName + "MarkerLayer");
            this.onAddLayerBefor();
            this.moveLineLayer.appendTo(this.flagwindMap.innerMap);
            this.moveMarkLayer.appendTo(this.flagwindMap.innerMap);
            this.onAddLayerAfter();
            // 当地图已经加载时直接执行_onLoad方法
            if (this.flagwindMap.loaded) {
                this.onLoad();
            }
            else {
                this.flagwindMap.on("load", function () { return _this.onLoad(); }, this);
            }
        }
        Object.defineProperty(FlagwindRouteLayer.prototype, "spatial", {
            get: function () {
                return this.flagwindMap.spatial;
            },
            enumerable: true,
            configurable: true
        });
        // #endregion
        // #region 接口实现
        /**
         * 显示图层
         */
        FlagwindRouteLayer.prototype.show = function () {
            if (this.moveMarkLayer) { // 移动小车 
                this.moveMarkLayer.show();
            }
            if (this.moveLineLayer != null) {
                this.moveLineLayer.show();
            }
        };
        /**
         * 隐藏图层
         */
        FlagwindRouteLayer.prototype.hide = function () {
            if (this.moveMarkLayer) { // 移动小车 {
                this.moveMarkLayer.hide();
            }
            if (this.moveLineLayer) {
                this.moveLineLayer.hide();
            }
        };
        /**
         * 清除所有
         */
        FlagwindRouteLayer.prototype.clearAll = function () {
            this.checkMapSetting();
            this.stopAll();
            if (this.moveMarkLayer) {
                this.moveMarkLayer.clear();
            }
            if (this.moveLineLayer) {
                this.moveLineLayer.clear();
            }
            this.trackLines = [];
        };
        /**
         * 清除指定的线路名的路径和移动要素
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.clear = function (name) {
            if (name) {
                var trackline = this.getTrackLine(name);
                if (trackline == null) {
                    console.warn("无效的路径：" + name);
                    return;
                }
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
                this.stopAll();
                if (this.moveMarkLayer) {
                    this.moveMarkLayer.clear();
                }
                if (this.moveLineLayer) {
                    this.moveLineLayer.clear();
                }
                this.trackLines = [];
            }
        };
        /**
         * 清除指定的线路名的线路
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.clearLine = function (name) {
            if (!name) {
                console.error("没有指定清除的线路名称");
                return;
            }
            this.moveLineLayer.removeGraphicByName(name);
        };
        // #endregion
        // #region 播放线路
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
         * @param name 线路名
         * @param segment 路段
         * @param lineOptions 线路参数
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
         * @param name 线路名
         */
        FlagwindRouteLayer.prototype.getNextSegmentIndex = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.nextSegmentIndex;
            return 0;
        };
        /**
         * 获取线路的下一路段
         * @param name 线路名称
         * @param index 路段索引
         */
        FlagwindRouteLayer.prototype.getNextSegment = function (name, index) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.getNextSegment(index);
            return undefined;
        };
        /**
         * 获取线路中的最后一路段
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.getLastSegment = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.lastSegment;
            return undefined;
        };
        /**
         * 获取监控最近播放完成的路段线路
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.getActiveCompletedSegment = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline)
                return trackline.activeCompletedSegment;
            return undefined;
        };
        /**
         * 判断线路是否在运行
         * @param name 线路名称
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
        // #endregion
        // #region 播放控制
        /**
         * 停止指定线路移动要素播放
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.stop = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline != null) {
                trackline.stop();
            }
            else {
                console.warn("无效的路径：" + name);
            }
        };
        /**
         * 停止所有线路移动要素播放
         */
        FlagwindRouteLayer.prototype.stopAll = function () {
            var _this = this;
            if (this.trackLines) {
                this.trackLines.forEach(function (line) {
                    _this.stop(line.name);
                });
            }
            else {
                console.warn("没有路径信息");
            }
        };
        /**
         * 启动线路播放（起点为上次播放的终点）
         */
        FlagwindRouteLayer.prototype.move = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                trackline.move();
            }
            else {
                console.warn("无效的路径：" + name);
            }
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
            else {
                console.warn("无效的路径：" + name);
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
            else {
                console.warn("无效的路径：" + name);
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
            else {
                console.warn("无效的路径：" + name);
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
            else {
                console.warn("无效的路径：" + name);
            }
        };
        /**
         * 加速
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.speedUp = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                return trackline.speedUp();
            }
            else {
                console.warn("无效的路径：" + name);
                return "当前路线为空！";
            }
        };
        /**
         * 减速
         * @param name 线路名称
         */
        FlagwindRouteLayer.prototype.speedDown = function (name) {
            var trackline = this.getTrackLine(name);
            if (trackline) {
                return trackline.speedDown();
            }
            else {
                console.warn("无效的路径：" + name);
                return "当前路线为空！";
            }
        };
        // #endregion
        // #region 路径求解
        /**
         * 求解最短路径（与solveLine不同，它求解的是一个路段，该路段起点为stops[0],终点为stops[stops.length-1]
         *
         * @param {any} name  线路名称
         * @param {any} stops 经过的站点
         * @param {any} options 可选参数
         */
        FlagwindRouteLayer.prototype.solveSegment = function (name, stops, options) {
            var _this = this;
            options = __assign({}, flagwind.TRACKLINE_OPTIONS, options);
            this.checkMapSetting();
            var stopList = [];
            stops.forEach(function (g) {
                g = _this.changeStandardModel(g);
                if (_this.validGeometryModel(g)) {
                    stopList.push(g);
                }
            });
            if (stopList.length < 1) {
                throw Error("依靠点不能少于2");
            }
            this.activedTrackLineName = name;
            var segment = this.getLastSegment(name);
            var startLineIndex = segment ? segment.index + 1 : 0;
            if ((startLineIndex + stopList.length) < 2) {
                throw Error("停靠点不能少于2");
            }
            var stopGraphics = this.onGetStandardStops(name, stopList);
            if (segment) {
                var isEqual = this.onEqualGraphic(segment.endGraphic, stopGraphics[0]);
                var isNA = this.options.routeType === "NA";
                // 若是网络分析服务且新增的路段与前一路段没有对接上，则增加一个路段用于连接他们
                if (isNA && !isEqual) {
                    this.post(startLineIndex, name, segment.endGraphic, stopGraphics[0], options);
                    startLineIndex += 1;
                }
            }
            if (stopGraphics.length >= 2) {
                var start = stopGraphics.splice(0, 1)[0]; // 从数组中取出第一个
                var end = stopGraphics.splice(stopGraphics.length - 1, 1)[0]; // 从数组中取出最后一个
                var waypoints = stopGraphics; //
                this.post(startLineIndex, name, start, end, options, waypoints);
            }
        };
        /**
         * 求解最短路径(根据stops数量设置多个多个路段，相连的两点组成一个路段)
         *
         * @param {any} name  线路名称
         * @param {any} stops 经过的站点
         * @param {any} options 可选参数
         */
        FlagwindRouteLayer.prototype.solveLine = function (name, stops, options) {
            var _this = this;
            var trackLineOptions = __assign({}, flagwind.TRACKLINE_OPTIONS, options);
            this.checkMapSetting();
            var stopList = [];
            stops.forEach(function (g) {
                g = _this.changeStandardModel(g);
                if (_this.validGeometryModel(g)) {
                    stopList.push(g);
                }
            });
            if (stopList.length < 1) {
                throw Error("停靠点不能少于2");
            }
            this.activedTrackLineName = name;
            var segment = this.getLastSegment(name);
            var startLineIndex = segment ? segment.index + 1 : 0;
            if ((startLineIndex + stopList.length) < 2) {
                throw Error("停靠点不能少于2");
            }
            var stopGraphics = this.onGetStandardStops(name, stopList);
            if (segment) {
                var isEqual = this.onEqualGraphic(segment.endGraphic, stopGraphics[0]);
                var isNA = this.options.routeType === "NA";
                // 若是网络分析服务且新增的路段与前一路段没有对接上，则增加一个路段用于连接他们
                if (isNA && !isEqual) {
                    this.post(startLineIndex, name, segment.endGraphic, stopGraphics[0], trackLineOptions);
                    startLineIndex += 1;
                }
            }
            for (var i = 0; i < stopGraphics.length - 1; i++) {
                var start = stopGraphics[i];
                var end = stopGraphics[i + 1];
                this.post(startLineIndex + i, name, start, end, trackLineOptions);
            }
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
                flagwindRoute.onShowSegmentLineEvent(flagwindRoute, segment, trackSegmentOptions);
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
            this.addTrackSegment(name, segment, trackSegmentOptions);
            if (this.options.routeType === "NA") {
                this.onSolveByService(segment, start, end, waypoints);
            }
            else {
                this.onSolveByJoinPoint(segment);
                this.onCreateSegmentComplete(segment);
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
            this.onCreateSegmentComplete(segment);
        };
        /**
         * 路由分析失败回调
         */
        FlagwindRouteLayer.prototype.errorHandler = function (err, segment) {
            console.log("路由分析异常" + err);
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
            this.onCreateSegmentComplete(segment);
        };
        /**
         * 线段创建完成事件回调
         * @param {*} segment
         */
        FlagwindRouteLayer.prototype.onCreateSegmentComplete = function (segment) {
            this.options.onCreateSegmentCompleteEvent(segment);
        };
        /**
         *
         * 显示路段事件
         *
         * @protected
         * @memberof flagwindRoute
         */
        FlagwindRouteLayer.prototype.onShowSegmentLineEvent = function (flagwindRoute, segment, trackSegmentOptions) {
            // 是否自动显示轨迹
            if (trackSegmentOptions.autoShowSegmentLine) {
                flagwindRoute.onShowSegmentLine(segment);
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
                flagwindRoute.onCreateMoveMark(trackline, graphic, angle);
            }
            if (flagwindRoute.options.autoCenterAt) {
                flagwindRoute.flagwindMap.centerAt(graphic.geometry.x, graphic.geometry.y);
            }
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
                flagwindRoute.onUpdateMoveGraphic(trackline, point, angle);
                flagwindRoute.options.onMoveEvent(segment.name, segment.index, xy, angle);
            }
        };
        // #endregion
        // #region 私有方法
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
        /**
         * 检测地图设置，防止图层未加载到地图上
         */
        FlagwindRouteLayer.prototype.checkMapSetting = function () {
            // if (this.moveMarkLayer._map == null) {
            //     this.moveMarkLayer = this.flagwindMap.innerMap.getLayer(this.moveMarkLayer.id);
            // }
        };
        /**
         * 标准化停靠点模型
         * @param item 原始模型
         */
        FlagwindRouteLayer.prototype.changeStandardModel = function (item) {
            if (this.options.changeStandardModel) {
                return this.options.changeStandardModel(item);
            }
            else {
                return item;
            }
        };
        /**
         * 验证停靠点模型
         * @param item 原始模型
         */
        FlagwindRouteLayer.prototype.validGeometryModel = function (item) {
            return flagwind.MapUtils.validGeometryModel(item);
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
        function EsriRouteLayer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.trackLines = [];
            return _this;
        }
        EsriRouteLayer.prototype.onSetSegmentByLine = function (options, segment) {
            segment.polyline = options.polyline;
            segment.length = options.length;
            if (segment.polyline.paths && segment.polyline.paths.length > 0) {
                // 每公里抽取的点数
                var numsOfKilometer = segment.options.numsOfKilometer ? segment.options.numsOfKilometer : 100;
                segment.line = flagwind.MapUtils.vacuate(segment.polyline.paths, segment.length, numsOfKilometer);
            }
            else {
                segment.line = [];
            }
        };
        EsriRouteLayer.prototype.onSetSegmentByPoint = function (options, segment) {
            var points = options.points;
            var numsOfKilometer = segment.options.numsOfKilometer ? segment.options.numsOfKilometer : 100;
            var polyline = new esri.geometry.Polyline(this.flagwindMap.spatial);
            for (var i = 0; i < points.length - 1; i++) {
                var start = points[i], end = points[i + 1];
                var tmppolyline = new esri.geometry.Polyline(this.flagwindMap.spatial).addPath([start, end]);
                var length_1 = esri.geometry.geodesicLengths([tmppolyline], esri.Units.KILOMETERS)[0];
                var tmppoints = flagwind.MapUtils.extractPoints(start, end, length_1 * numsOfKilometer);
                polyline.addPath(tmppoints);
            }
            segment.length = esri.geometry.geodesicLengths([polyline], esri.Units.KILOMETERS)[0];
            segment.polyline = polyline;
            segment.line = flagwind.MapUtils.vacuate(segment.polyline.paths, segment.length, numsOfKilometer);
        };
        EsriRouteLayer.prototype.onShowSegmentLine = function (segment) {
            var playedLineSymbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new esri.Color([48, 254, 62, 0.8]), 4, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_MITER, 2); // 38, 101, 196, 0.8
            segment.lineGraphic = new esri.Graphic(segment.polyline, playedLineSymbol, {
                __type: "segment",
                __index: segment.index,
                __line: segment.name
            });
            this.moveLineLayer.addGraphic(segment.name, segment.lineGraphic);
        };
        EsriRouteLayer.prototype.onCreateMoveMark = function (trackline, graphic, angle) {
            var markerUrl = this.getImageUrl(trackline, angle);
            var markerHeight = trackline.options.symbol.height || this.options.symbol.height;
            var markerWidth = trackline.options.symbol.width || this.options.symbol.width;
            if (!markerUrl) {
                console.warn("轨迹移动要素图片未定义");
            }
            var symbol = new esri.symbol.PictureMarkerSymbol(markerUrl, markerHeight, markerWidth);
            var marker = new esri.Graphic(graphic.geometry, symbol, { __type: "point", __line: trackline.name });
            trackline.markerGraphic = marker;
            this.moveMarkLayer.addGraphic(trackline.name, marker);
        };
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        EsriRouteLayer.prototype.onUpdateMoveGraphic = function (trackline, point, angle) {
            if (trackline === undefined)
                return;
            var symbol = trackline.markerGraphic.symbol;
            var imageUrl = this.getImageUrl(trackline, angle);
            symbol.setUrl(imageUrl);
            var imageAngle = this.getImageAngle(trackline, angle);
            if (imageAngle !== null) {
                symbol.setAngle(imageAngle);
            }
            trackline.markerGraphic.setSymbol(symbol);
            trackline.markerGraphic.setGeometry(point);
            trackline.markerGraphic.draw(); // 重绘
        };
        EsriRouteLayer.prototype.getImageUrl = function (trackline, angle) {
            if (this.options.getImageUrl) {
                return this.options.getImageUrl(trackline, angle);
            }
            if (trackline.options.getImageUrl) {
                return trackline.options.getImageUrl(trackline, angle);
            }
            var sx = 1;
            if (angle < 45 || angle >= 315)
                sx = 3; // 向东走
            if (angle >= 45 && angle < 135)
                sx = 4; // 向北走
            if (angle >= 135 && angle < 225)
                sx = 2; // 向西走
            if (angle >= 225 && angle < 315)
                sx = 1; // 向南走
            if (trackline.step === null) {
                trackline.step = -1;
            }
            if (trackline.direction !== sx) {
                trackline.step = 0;
            }
            else {
                trackline.step = (trackline.step + 1) % 4;
            }
            trackline.direction = sx;
            var name = "" + trackline.direction + (trackline.step + 1);
            return trackline.options.symbol["imageUrl" + name];
        };
        EsriRouteLayer.prototype.getImageAngle = function (trackline, angle) {
            if (this.options.getImageAngle) {
                return this.options.getImageAngle(trackline, angle);
            }
            if (trackline.options.getImageAngle) {
                return trackline.options.getImageAngle(trackline, angle);
            }
            return angle;
        };
        EsriRouteLayer.prototype.onCreateLineLayer = function (id) {
            return new flagwind.EsriGroupLayer({ id: id });
        };
        EsriRouteLayer.prototype.onCreateMovingLayer = function (id) {
            return new flagwind.EsriGroupLayer({ id: id });
        };
        EsriRouteLayer.prototype.onEqualGraphic = function (originGraphic, targetGraphic) {
            return flagwind.MapUtils.isEqualPoint(originGraphic.geometry, targetGraphic.geometry);
        };
        EsriRouteLayer.prototype.onGetStandardStops = function (name, stops) {
            var stopGraphics = [];
            var stopSymbol = new esri.symbol.SimpleMarkerSymbol()
                .setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS)
                .setSize(15)
                .outline.setWidth(3);
            for (var i = 0; i < stops.length; i++) {
                if (stops[i] instanceof Array) {
                    stopGraphics.push(new esri.Graphic(new esri.geometry.Point(stops[i][0], stops[i][1]), stopSymbol, { __type: "stop", __line: name }));
                }
                else if ((stops[i].declaredClass || "").indexOf("Point") > 0) {
                    stopGraphics.push(new esri.Graphic(stops[i], stopSymbol, { __type: "stop", __line: name }));
                }
                else if ((stops[i].declaredClass || "").indexOf("Graphic") > 0) {
                    stopGraphics.push(new esri.Graphic(stops[i].geometry, stopSymbol, {
                        __type: "stop",
                        __model: stops[i].attributes,
                        __line: name
                    }));
                }
                else {
                    stopGraphics.push(new esri.Graphic(this.flagwindMap.getPoint(stops[i]), stopSymbol, {
                        __type: "stop",
                        __model: stops[i],
                        __line: name
                    }));
                }
            }
            return stopGraphics;
        };
        EsriRouteLayer.prototype.onSolveByService = function (segment, start, end, waypoints) {
            if (!this.options.routeUrl) {
                console.error("routeUrl地址为空！");
                return;
            }
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
                console.warn("轨迹路由服务请求异常：", err);
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
            return new esri.SpatialReference({
                wkid: this.flagwindMap.spatial.wkid
            });
        };
        EsriRouteLayer.prototype.cloneStopGraphic = function (graphic) {
            return new esri.Graphic(graphic.geometry, graphic.symbol, {
                __type: graphic.attributes.__type,
                __model: graphic.attributes.__model,
                __line: graphic.attributes.__line
            });
        };
        return EsriRouteLayer;
    }(flagwind.FlagwindRouteLayer));
    flagwind.EsriRouteLayer = EsriRouteLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../events/EventProvider.ts" />
var flagwind;
(function (flagwind) {
    flagwind.SELECT_BOX_OPTIONS_ESRI = {
        id: "select-box",
        selectMode: 2,
        onDrawStart: function () {
            // console.log("onDrawStart");
        },
        onDrawEnd: function () {
            // console.log("onDrawEnd");
        },
        onCheckChanged: function (checkItems, layer) {
            // console.log("onCheckChanged");
        }
    };
    /**
     * 地图选择组件
     */
    var EsriSelectBox = /** @class */ (function (_super) {
        __extends(EsriSelectBox, _super);
        function EsriSelectBox(flagwindMap, options) {
            var _this = _super.call(this, null) || this;
            _this.flagwindMap = flagwindMap;
            _this.isActive = false;
            _this.layers = [];
            options = __assign({}, flagwind.SELECT_BOX_OPTIONS_ESRI, options);
            _this.options = options;
            _this.id = options.id || "select-box";
            _this.flagwindMap.featureLayers.forEach(function (layer) {
                if (layer instanceof flagwind.FlagwindBusinessLayer) {
                    _this.addLayer(layer);
                }
            });
            _this.draw = new esri.toolbars.Draw(flagwindMap.map, {
                drawTime: 75,
                showTooltips: true,
                tolerance: 8,
                tooltipOffset: 15
            });
            _this.draw.on("draw-complete", function (evt) {
                _this.onCreateRecord(_this, evt);
            });
            return _this;
        }
        EsriSelectBox.prototype.onCreateRecord = function (me, e) {
            var _this = this;
            var polygon = e.geometry;
            me.layers.forEach(function (layer) {
                var checkGrahpics = [];
                layer.graphics.forEach(function (g) {
                    if (polygon.contains(g.geometry)) {
                        console.log(g);
                        checkGrahpics.push(g);
                    }
                });
                var checkItems = checkGrahpics.map(function (g) { return g.attributes; });
                layer.setSelectStatusByModels(checkItems, false);
                _this.options.onCheckChanged(checkItems, layer);
            });
            me.clear();
        };
        EsriSelectBox.prototype.getLayerById = function (id) {
            var layers = this.layers.filter(function (layer) { return layer.id === id; });
            return layers.length > 0 ? layers[0] : null;
        };
        EsriSelectBox.prototype.addLayer = function (layer) {
            layer.options.selectMode = this.options.selectMode;
            layer.options.showInfoWindow = false;
            this.layers.push(layer);
        };
        EsriSelectBox.prototype.removeLayer = function (layer) {
            layer.options.selectMode = flagwind.SelectMode.none;
            var index = this.layers.indexOf(layer);
            if (index >= 0) {
                this.layers.splice(index, 1);
            }
        };
        EsriSelectBox.prototype.show = function () {
            this.element.style.display = "black";
        };
        EsriSelectBox.prototype.hide = function () {
            this.element.style.display = "none";
        };
        EsriSelectBox.prototype.deleteSelectBar = function () {
            if (this.element)
                this.element.remove();
        };
        EsriSelectBox.prototype.showSelectBar = function () {
            if (this.element) {
                console.log("绘制控件已经创建，不可重复创建！");
                this.element.style.display = "block";
                return;
            }
            var me = this;
            var mapEle = this.flagwindMap.innerMap.root;
            this.element = document.createElement("div");
            this.element.classList.add("fm-select-box");
            this.element.setAttribute("id", this.id);
            this.element.innerHTML =
                "<div class=\"fm-btn circle\" title=\"\u753B\u5706\" data-operate=\"circle\"><i class=\"icon iconfont icon-circle\"></i></div>\n                <div class=\"fm-btn rectangle\" title=\"\u753B\u77E9\u5F62\" data-operate=\"rectangle\"><i class=\"icon iconfont icon-rectangle\"></i></div>\n                <div class=\"fm-btn polygon\" title=\"\u753B\u591A\u8FB9\u5F62\" data-operate=\"polygon\"><i class=\"icon iconfont icon-polygon\"></i></div>";
            mapEle.appendChild(this.element);
            var operateBtns = document.querySelectorAll("#" + this.element.id + " .fm-btn");
            for (var i = 0; i < operateBtns.length; i++) {
                operateBtns[i].onclick = function () {
                    me.active(this.dataset.operate);
                };
            }
        };
        EsriSelectBox.prototype.clear = function () {
            if (this.draw) {
                this.isActive = false;
                this.draw.deactivate();
                this.flagwindMap.map.enableMapNavigation();
                this.mode = "trash";
                this.options.onDrawEnd();
            }
        };
        EsriSelectBox.prototype.active = function (mode) {
            if (this.draw && mode) {
                this.isActive = true;
                var tool = mode.toUpperCase().replace(/ /g, "_");
                this.flagwindMap.map.disableMapNavigation();
                this.draw.activate(esri.toolbars.Draw[tool]);
                this.mode = mode;
                this.options.onDrawStart();
            }
        };
        EsriSelectBox.prototype.destroy = function () {
            this.clear();
            this.deleteSelectBar();
        };
        return EsriSelectBox;
    }(flagwind.EventProvider));
    flagwind.EsriSelectBox = EsriSelectBox;
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
        function FlagwindTiledLayer(id, url, spatial, title) {
            this.id = id;
            this.url = url;
            this.spatial = spatial;
            this.title = title;
            this.isShow = true;
            if (url) {
                this.layer = this.onCreateTiledLayer({
                    url: url,
                    id: id,
                    title: title,
                    spatial: spatial
                });
            }
        }
        FlagwindTiledLayer.prototype.appendTo = function (map) {
            if (this.layer) {
                this.layer.addToMap(map);
            }
        };
        FlagwindTiledLayer.prototype.removeLayer = function (map) {
            if (this.layer) {
                this.layer.removeFromMap(map);
            }
        };
        FlagwindTiledLayer.prototype.show = function () {
            this.isShow = true;
            if (this.layer) {
                this.layer.show();
            }
        };
        FlagwindTiledLayer.prototype.hide = function () {
            this.isShow = false;
            if (this.layer) {
                this.layer.hide();
            }
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
            var layer = new esri.layers.ArcGISTiledMapServiceLayer(args.url, { id: args.id });
            layer.addToMap = function (map) {
                map.addLayer(this);
            };
            layer.removeFromMap = function (map) {
                map.removeLayer(this);
            };
            return layer;
        };
        return EsriTiledLayer;
    }(flagwind.FlagwindTiledLayer));
    flagwind.EsriTiledLayer = EsriTiledLayer;
})(flagwind || (flagwind = {}));
/// <reference path="./flagwind-group.layer.ts" />
var flagwind;
(function (flagwind) {
    flagwind.TRACK_LAYER_OPTIONS = {
        // 路径求解方式
        solveMode: "Line",
        // 行驶速度
        speed: 100,
        onStationChanged: function (index, model) {
            console.log("onStationChanged index:" + index);
        },
        onMessageEvent: function (name, message) {
            console.log("onMessageEvent");
        },
        onMoveEvent: function (lineName, segmentIndex, xy, angle) {
            console.log("onMoveEvent");
        },
        onLineEndEvent: function (lineName, segmentIndex, trackLine) {
            console.log("onLineEndEvent");
        }
    };
    var FlagwindTrackLayer = /** @class */ (function () {
        function FlagwindTrackLayer(businessLayer, routeLayer, options) {
            var _this = this;
            this.businessLayer = businessLayer;
            this.routeLayer = routeLayer;
            this.options = options;
            this.isShow = true;
            this.options = __assign({}, flagwind.TRACK_LAYER_OPTIONS, options);
            this.businessLayer.removeFromMap();
            this.businessLayer.addToMap();
            this.id = this.options.id || "flagwind_track_layer";
            if (this.id) {
                this.activedTrackLineName = this.id + "_track";
            }
            /**
             * 当轨迹上的移动物体进出卡口点事件回调
             */
            routeLayer.options.onStationEvent = function (name, index, graphic, isStartPoint, trackline) {
                if (index === 0 && isStartPoint) {
                    _this.businessLayer.saveGraphicList([graphic.attributes.__model]);
                    _this.options.onStationChanged(index, graphic.attributes.__model);
                }
                if (!isStartPoint) { // 出站
                    _this.businessLayer.saveGraphicList([graphic.attributes.__model]);
                    _this.options.onStationChanged(index + 1, graphic.attributes.__model);
                }
            };
            routeLayer.options.onMoveEvent = function (lineName, segmentIndex, xy, angle) {
                _this.options.onMessageEvent("info", "正在播放");
                _this.options.onMoveEvent(lineName, segmentIndex, xy, angle);
            };
            routeLayer.options.onLineEndEvent = function (lineName, segmentIndex, trackLine) {
                _this.options.onMessageEvent("success", "播放结束");
                _this.options.onLineEndEvent(lineName, segmentIndex, trackLine);
            };
            routeLayer.options.onMovingClick = function (evt) {
                if (_this.trackLine.isRunning) {
                    _this.stop();
                }
                else {
                    _this.continue();
                }
            };
        }
        Object.defineProperty(FlagwindTrackLayer.prototype, "toolBoxId", {
            // #region 属性
            get: function () {
                return this.id + "_toolbox";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindTrackLayer.prototype, "flagwindMap", {
            get: function () {
                return this.businessLayer.flagwindMap;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindTrackLayer.prototype, "isRunning", {
            /**
             * 移动要素是否正在跑
             */
            get: function () {
                if (!this.trackLine)
                    return false;
                return this.trackLine.isRunning;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindTrackLayer.prototype, "isCompleted", {
            /**
             * 移动要素是否跑完
             */
            get: function () {
                if (!this.trackLine)
                    return false;
                return this.trackLine.isCompleted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindTrackLayer.prototype, "isMovingGraphicHide", {
            /**
             * 移动要素是否隐藏
             */
            get: function () {
                if (!this.trackLine)
                    return false;
                return this.trackLine.isMovingGraphicHide;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FlagwindTrackLayer.prototype, "trackLine", {
            get: function () {
                if (this.activedTrackLineName) {
                    return this.routeLayer.getTrackLine(this.activedTrackLineName);
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        // #endregion
        // #region TrackToolBox
        /**
         * 删除播放控件
         */
        FlagwindTrackLayer.prototype.deleteTrackToolBox = function () {
            if (this._trackToolBox)
                this._trackToolBox.parentNode.removeChild(this._trackToolBox);
            this._trackToolBox = null;
            this._playButton = null;
            this._pauseButton = null;
            this._speedUpButton = null;
            this._speedDownButton = null;
            this._clearButton = null;
            this._toolBoxText = null;
        };
        /**
         * 显示播放控件
         */
        FlagwindTrackLayer.prototype.showTrackToolBox = function () {
            var _this = this;
            if (document.getElementById(this.toolBoxId)) {
                console.log("TrackToolBox已经创建，不可重复创建！");
                document.getElementById(this.toolBoxId).style.display = "block";
                return;
            }
            this._trackToolBox = document.createElement("div");
            this._trackToolBox.setAttribute("id", this.toolBoxId);
            this._trackToolBox.classList.add("fm-track-box");
            this._trackToolBox.innerHTML =
                "<div class=\"fm-btn-group\">\n                    <div class=\"fm-btn route-btn continue\" title=\"\u64AD\u653E\" data-operate=\"continue\"><i class=\"icon iconfont icon-play\"></i></div>\n                    <div class=\"fm-btn route-btn pause\" title=\"\u6682\u505C\" data-operate=\"pause\" style=\"display:none;\"><i class=\"icon iconfont icon-pause\"></i></div>\n                    <div class=\"fm-btn route-btn down\" title=\"\u51CF\u901F\" data-operate=\"down\"><i class=\"icon iconfont icon-speed-down\"></i></div>\n                    <div class=\"fm-btn route-btn up\" title=\"\u52A0\u901F\" data-operate=\"up\"><i class=\"icon iconfont icon-speed-up\"></i></div>\n                    <div class=\"fm-btn route-btn clear\" title=\"\u6E05\u9664\u8F68\u8FF9\" data-operate=\"clear\"><i class=\"icon iconfont icon-clear\"></i></div>\n                </div>\n                <div class=\"route-text\"></div>";
            this.flagwindMap.innerMap.container.appendChild(this._trackToolBox);
            this._playButton = document.querySelector("#" + this.toolBoxId + " .continue");
            this._pauseButton = document.querySelector("#" + this.toolBoxId + " .pause");
            this._speedUpButton = document.querySelector("#" + this.toolBoxId + " .up");
            this._speedDownButton = document.querySelector("#" + this.toolBoxId + " .down");
            this._clearButton = document.querySelector("#" + this.toolBoxId + " .clear");
            this._toolBoxText = document.querySelector("#" + this.toolBoxId + " .route-text");
            this._playButton.onclick = function () {
                _this.continue();
            };
            this._pauseButton.onclick = function () {
                _this.pause();
            };
            this._speedUpButton.onclick = function () {
                _this.speedUp();
            };
            this._speedDownButton.onclick = function () {
                _this.speedDown();
            };
            this._clearButton.onclick = function () {
                _this.clear();
            };
        };
        // #endregion
        // #region 公共方法
        /**
         * 显示轨迹线路（不播放）
         * @param stopList 停靠点原型数据集合
         * @param trackLineName 线路名称
         * @param options 轨迹构建参数
         */
        FlagwindTrackLayer.prototype.showTrack = function (stopList, trackLineName, options) {
            if (trackLineName) {
                this.activedTrackLineName = trackLineName;
            }
            else {
                trackLineName = this.activedTrackLineName;
            }
            if (!this.isShow) {
                this.show();
            }
            var trackOptions = __assign({}, this.options, options);
            if (trackOptions.solveMode === "Segment") {
                this.routeLayer.solveSegment(trackLineName, stopList, trackOptions);
            }
            else {
                this.routeLayer.solveLine(trackLineName, stopList, trackOptions);
            }
        };
        /**
         * 启动线路播放（起点为线路的始点）
         * @param stopList 停靠点原型数据集合
         * @param trackLineName 线路名称
         * @param options 轨迹构建参数
         */
        FlagwindTrackLayer.prototype.startTrack = function (stopList, trackLineName, options) {
            if (trackLineName) {
                this.activedTrackLineName = trackLineName;
            }
            else {
                trackLineName = this.activedTrackLineName;
            }
            this.routeLayer.stop(this.activedTrackLineName);
            this.clear();
            if (stopList == null || stopList.length === 0) {
                this.options.onMessageEvent("warning", "没有轨迹数据");
                console.warn("没有轨迹数据！");
                return;
            }
            this.showTrack(stopList, trackLineName, options);
            // 启动线路播放（起点为线路的始点）
            this.start();
            // this.routeLayer.start(this.activedTrackLineName);
        };
        /**
         * 启动线路播放（起点为上次播放的终点）
         * @param stopList 停靠点原型数据集合
         * @param trackLineName 线路名称
         */
        FlagwindTrackLayer.prototype.moveTrack = function (stopList, trackLineName) {
            if (name) {
                this.activedTrackLineName = trackLineName;
            }
            else {
                trackLineName = this.activedTrackLineName;
            }
            this.showTrack(stopList, trackLineName);
            this.move();
        };
        /**
         * 显示所有
         */
        FlagwindTrackLayer.prototype.clearAll = function () {
            this.clear();
        };
        /**
         * 清除要素
         */
        FlagwindTrackLayer.prototype.clear = function () {
            this.routeLayer.clearAll();
            this.businessLayer.clear();
            if (this._toolBoxText) {
                this._toolBoxText.innerHTML = "";
            }
        };
        /**
         * 显示图层
         */
        FlagwindTrackLayer.prototype.show = function () {
            this.isShow = true;
            this.routeLayer.show();
            this.businessLayer.show();
        };
        /**
         * 隐藏图层
         */
        FlagwindTrackLayer.prototype.hide = function () {
            this.isShow = false;
            this.routeLayer.hide();
            this.businessLayer.hide();
        };
        /**
         * 继续上次播放
         */
        FlagwindTrackLayer.prototype.move = function () {
            this.options.onMessageEvent("info", "播放");
            this.options.onMessageEvent("start", "播放");
            this.routeLayer.move(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "block";
                this._toolBoxText.innerHTML = "当前状态：正在播放";
            }
        };
        /**
         * 重新播放
         */
        FlagwindTrackLayer.prototype.start = function () {
            this.options.onMessageEvent("info", "播放");
            this.options.onMessageEvent("start", "播放");
            this.routeLayer.start(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "block";
                this._toolBoxText.innerHTML = "当前状态：正在播放";
            }
        };
        /**
         * 停止
         */
        FlagwindTrackLayer.prototype.stop = function () {
            this.options.onMessageEvent("info", "已停止");
            this.options.onMessageEvent("stop", "已停止");
            this.routeLayer.stop(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "block";
                this._pauseButton.style.display = "none";
                this._toolBoxText.innerHTML = "已停止";
            }
        };
        /**
         * 暂停
         */
        FlagwindTrackLayer.prototype.pause = function () {
            this.options.onMessageEvent("info", "已暂停");
            this.options.onMessageEvent("pause", "已暂停");
            this.routeLayer.pause(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "block";
                this._pauseButton.style.display = "none";
                this._toolBoxText.innerHTML = "当前状态：已暂停";
            }
        };
        /**
         * 继续
         */
        FlagwindTrackLayer.prototype.continue = function () {
            this.options.onMessageEvent("continue", "继续");
            this.routeLayer.continue(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._playButton.style.display = "none";
                this._pauseButton.style.display = "block";
                this._toolBoxText.innerHTML = "当前状态：正在播放";
            }
        };
        FlagwindTrackLayer.prototype.up = function () {
            return this.speedUp();
        };
        FlagwindTrackLayer.prototype.down = function () {
            return this.speedDown();
        };
        /**
         * 加速
         */
        FlagwindTrackLayer.prototype.speedUp = function () {
            this.options.onMessageEvent("speedUp", "加速");
            var msg = this.routeLayer.speedUp(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._toolBoxText.innerHTML = msg;
            }
            return msg;
        };
        /**
         * 减速
         */
        FlagwindTrackLayer.prototype.speedDown = function () {
            this.options.onMessageEvent("speedDown", "减速");
            var msg = this.routeLayer.speedDown(this.activedTrackLineName);
            if (this._trackToolBox) {
                this._toolBoxText.innerHTML = msg;
            }
            return msg;
        };
        /**
         * 调速
         */
        FlagwindTrackLayer.prototype.changeSpeed = function (speed) {
            this.routeLayer.changeSpeed(this.activedTrackLineName, speed);
        };
        /**
         * 切换线路
         * @param name 线路名称
         */
        FlagwindTrackLayer.prototype.changeTrackLine = function (name) {
            this.activedTrackLineName = name;
        };
        return FlagwindTrackLayer;
    }());
    flagwind.FlagwindTrackLayer = FlagwindTrackLayer;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-track.layer.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 车辆路由服务
     */
    var EsriTrackLayer = /** @class */ (function (_super) {
        __extends(EsriTrackLayer, _super);
        function EsriTrackLayer(businessLayer, options) {
            var _this = _super.call(this, businessLayer, new flagwind.EsriRouteLayer(businessLayer.flagwindMap, businessLayer.id + "_track", options.route || options), options) || this;
            _this.businessLayer = businessLayer;
            return _this;
        }
        return EsriTrackLayer;
    }(flagwind.FlagwindTrackLayer));
    flagwind.EsriTrackLayer = EsriTrackLayer;
})(flagwind || (flagwind = {}));
/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";
var flagwind;
(function (flagwind) {
    flagwind.DRAW_LAYER_OPTIONS = {
        onDrawCompleteEvent: function (geometry) {
            // console.log(eventName);
        }
    };
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.draw.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 绘制图层
     */
    var EsriDraw = /** @class */ (function () {
        function EsriDraw(flagwindMap, options) {
            var _this = this;
            this.options = {
                drawTime: 75,
                showTooltips: true,
                tolerance: 8,
                tooltipOffset: 15,
                onEvent: function (eventName, evt) {
                    // console.log(eventName);
                }
            };
            this.flagwindMap = flagwindMap;
            this.options = __assign({}, flagwind.DRAW_LAYER_OPTIONS, this.options, options);
            this.draw = new esri.toolbars.Draw(flagwindMap.map, this.options);
            this.draw.on("draw-complete", function (evt) {
                return _this.onDrawComplete(evt);
            });
        }
        EsriDraw.prototype.activate = function (mode, options) {
            if (this.draw && options) {
                this.setSymbol(mode, options);
            }
            if (this.draw && mode) {
                var tool = mode.toUpperCase().replace(/ /g, "_");
                this.draw.activate(esri.toolbars.Draw[tool]);
            }
        };
        EsriDraw.prototype.finish = function () {
            if (this.draw) {
                this.draw.deactivate();
            }
        };
        EsriDraw.prototype.setSymbol = function (mode, options) {
            this.symbolSetting = __assign({}, options);
            switch (mode) {
                case "POLYLINE":
                    this.draw.setLineSymbol(this.lineSymbol);
                    break;
                case "POLYGON":
                    this.draw.setFillSymbol(this.fillSymbol);
                    break;
                case "FREEHAND_POLYGON":
                    this.draw.setFillSymbol(this.fillSymbol);
                    break;
            }
        };
        EsriDraw.prototype.onDrawComplete = function (evt) {
            this.finish();
            this.options.onEvent("draw-complete", evt.geometry);
            this.options.onDrawCompleteEvent(evt.geometry);
        };
        Object.defineProperty(EsriDraw.prototype, "lineSymbol", {
            get: function () {
                var lineColor = this.symbolSetting.lineColor || [255, 0, 0];
                var lineWidth = this.symbolSetting.lineWidth || 4;
                var lineType = this.symbolSetting.lineType || "STYLE_DASH";
                var lineMiterLimit = this.symbolSetting.lineMiterLimit || 2;
                var lineSymbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol[lineType], new esri.Color(lineColor), lineWidth, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_MITER, lineMiterLimit);
                return lineSymbol;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EsriDraw.prototype, "fillSymbol", {
            get: function () {
                var lineColor = this.symbolSetting.lineColor || [151, 249, 0, 0.8];
                var lineWidth = this.symbolSetting.lineWidth || 3;
                var lineType = this.symbolSetting.lineType || "STYLE_DOT";
                var fillType = this.symbolSetting.fillType || "STYLE_SOLID";
                var fillColor = this.symbolSetting.fillColor || [255, 49, 0, 0.45];
                var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol[fillType], new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol[lineType], new esri.Color(lineColor), lineWidth), new esri.Color(fillColor));
                return polygonSymbol;
            },
            enumerable: true,
            configurable: true
        });
        return EsriDraw;
    }());
    flagwind.EsriDraw = EsriDraw;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var EsriSetting = /** @class */ (function () {
        function EsriSetting() {
            this.units = 0.03;
            this.center = [116.46, 39.92];
            this.wkidFromApp = 4326;
            this.logo = false;
            this.slider = true;
            this.sliderPosition = "bottom-left";
        }
        return EsriSetting;
    }());
    flagwind.EsriSetting = EsriSetting;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.EDIT_LAYER_OPTIONS = {
        confirm: function (context) {
            if (window.confirm(context.content)) {
                context.onOk();
            }
            else {
                context.onCancel();
            }
        },
        onEditInfo: function (model, isSave) {
            return new Promise(function (resolve, reject) {
                resolve(true);
            });
            // console.log("onEditInfo");
        }
    };
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    flagwind.HEATMAP_LAYER_OPTIONS = {
        changeStandardModel: function (data) {
            return {
                longitude: data.longitude || data.x,
                latitude: data.latitude || data.y
            };
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
/// <reference path="./flagwind-feature.layer.ts" />import { resolve } from "dns";
var flagwind;
(function (flagwind) {
    flagwind.TRACKSEGMENT_OPTIONS = {
        speed: 100,
        maxSpeed: 800,
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
    var SelectMode;
    (function (SelectMode) {
        SelectMode[SelectMode["none"] = 0] = "none";
        SelectMode[SelectMode["single"] = 1] = "single";
        SelectMode[SelectMode["multiple"] = 2] = "multiple";
    })(SelectMode = flagwind.SelectMode || (flagwind.SelectMode = {}));
    var LayerType;
    (function (LayerType) {
        LayerType["point"] = "point";
        LayerType["polyline"] = "polyline";
        LayerType["polygon"] = "polygon";
    })(LayerType = flagwind.LayerType || (flagwind.LayerType = {}));
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
            /**
             * 移动要素在该路段点集合的位置
             */
            this.position = -1;
            /**
             * 是否播放完成
             */
            this.isCompleted = false;
            /**
             * 是否正在运行
             */
            this.isRunning = false;
            /**
             * 定时器时间（ms）
             */
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
         * @param polyline 几何拆线
         * @param length 线的长度
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
         * @param points 几何点集
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
        /**
         * 变换速度
         * @param speed 速度值
         */
        TrackSegment.prototype.changeSpeed = function (speed) {
            if (speed === void 0) { speed = null; }
            if (this.options.numsOfKilometer === 0 || this.line.length === 0) {
                this.speed = 10000000;
                this.time = 1;
            }
            else {
                this.speed = speed || this.options.speed;
                this.time =
                    ((this.length || 0) * 3600) /
                        ((this.speed || 100) * 15 * this.line.length);
            }
            // 若正在跑，则暂停，改变速度后再执行
            if (this.timer) {
                this.pause();
                this.start();
            }
        };
        /**
         * 播放移动要素（起点为上次终点）
         */
        TrackSegment.prototype.move = function () {
            this.position = this.position + 1;
            var angle = 0;
            if (this.position === 0) {
                if (this.line.length > 1) {
                    angle =
                        flagwind.MapUtils.getAngle(this.startGraphic.geometry, {
                            x: this.line[0][0],
                            y: this.line[0][1]
                        }) || 0;
                }
                this.options.onMoveStartEvent(this, this.startGraphic, angle);
                this.options.onMoveEvent(this, [
                    this.startGraphic.geometry.x,
                    this.startGraphic.geometry.y
                ], angle);
                return;
            }
            if (this.position >= this.line.length) {
                if (this.line.length > 1) {
                    angle =
                        flagwind.MapUtils.getAngle({
                            x: this.line[this.line.length - 1][0],
                            y: this.line[this.line.length - 1][1]
                        }, this.endGraphic.geometry) || 0;
                }
                this.isCompleted = true;
                this.stop();
                this.options.onMoveEvent(this, [this.endGraphic.geometry.x, this.endGraphic.geometry.y], angle);
                this.options.onMoveEndEvent(this, this.endGraphic, angle);
                return;
            }
            angle = flagwind.MapUtils.getAngle({
                x: this.line[this.position - 1][0],
                y: this.line[this.position - 1][1]
            }, {
                x: this.line[this.position][0],
                y: this.line[this.position][1]
            });
            var xx = parseFloat(this.line[this.position - 1][0]).toFixed(5);
            var yy = parseFloat(this.line[this.position - 1][1]).toFixed(5);
            this.options.onMoveEvent(this, [xx, yy], angle);
        };
        /**
         * 播放移动要素（起点为路段的始点）
         */
        TrackSegment.prototype.start = function () {
            var _this = this;
            this.isRunning = true;
            this.timer = window.setInterval(function () {
                if (!_this.line) {
                    console.log("线路" +
                        _this.name +
                        "的第" +
                        (_this.index + 1) +
                        "路段等待设置");
                }
                else {
                    _this.move();
                }
            }, this.time);
            return true;
        };
        Object.defineProperty(TrackSegment.prototype, "isPaused", {
            /**
             * 当定时器为空，且运行状态为true时表示是暂停
             */
            get: function () {
                return !this.timer && this.isRunning;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 暂停
         */
        TrackSegment.prototype.pause = function () {
            window.clearInterval(this.timer);
            this.timer = null;
        };
        /**
         * 停止
         */
        TrackSegment.prototype.stop = function () {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = null;
            this.isRunning = false;
            this.position = -1;
        };
        /**
         * 重置
         */
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
            /**
             * 路段集合
             */
            this.segments = [];
            /**
             * 移动要素是否隐藏
             */
            this.isMovingGraphicHide = false;
            this.options = __assign({}, flagwind.TRACKSEGMENT_OPTIONS, options);
        }
        Object.defineProperty(TrackLine.prototype, "activeCompletedSegment", {
            // #region 属性
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
                    if (!segment || rl.index > segment.index) {
                        segment = rl;
                    }
                }
                return segment;
            },
            enumerable: true,
            configurable: true
        });
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
        // #endregion
        // #region 方法
        /**
         * 隐藏移动要素
         *
         * @memberof TrackLine
         */
        TrackLine.prototype.hideMovingGraphic = function () {
            this.isMovingGraphicHide = true;
            this.markerGraphic.hide();
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
            }
        };
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
         * 增速
         */
        TrackLine.prototype.speedUp = function () {
            if (!this.speed)
                this.speed = this.options.speed;
            if (this.speed < this.options.maxSpeed) {
                this.speed = Math.max(this.speed * 2, this.options.speed);
                this.changeSpeed(this.speed);
            }
            return "\u5F53\u524D\u72B6\u6001\uFF1A" + this.speed / this.options.speed + "\u500D\u64AD\u653E";
        };
        /**
         * 减速
         */
        TrackLine.prototype.speedDown = function () {
            if (!this.speed)
                this.speed = this.options.speed;
            this.speed = Math.max(this.speed / 2, this.options.speed);
            this.changeSpeed(this.speed);
            return "\u5F53\u524D\u72B6\u6001\uFF1A" + this.speed / this.options.speed + "\u500D\u64AD\u653E";
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
        /**
         * 重置
         */
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
                if (segemtn.isRunning && !segemtn.timer) {
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
        /**
         * 获取线路的下一路段
         * @param index 路段索引
         */
        TrackLine.prototype.getNextSegment = function (index) {
            if (this.segments.length === 0)
                return null;
            return this.getSegment(index + 1);
        };
        /**
         * 获取线路的指定索引路段
         */
        TrackLine.prototype.getSegment = function (index) {
            var line = null;
            if (this.segments.length === 0)
                return null;
            for (var i = 0; i < this.segments.length; i++) {
                var rl = this.segments[i];
                if (rl.name === this.name && rl.index === index) {
                    line = rl;
                }
            }
            return line;
        };
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
        // public static getLength(tmppolyline: any, units: any) {
        //     let length = esri.geometry.geodesicLengths([tmppolyline], units)[0];
        //     return MapSetting.units * length;
        // }
        /**
         * 把一个直线，切成多个点
         * @param start 始点
         * @param end 终点
         * @param n 点数
         */
        MapUtils.extractPoints = function (start, end, n) {
            var resList = [];
            if (n === 0) {
                resList.push({
                    x: start.x,
                    y: start.y
                });
                resList.push({
                    x: end.x,
                    y: end.y
                });
                return resList;
            }
            var xDiff = (end.x - start.x) / n;
            var yDiff = (end.y - start.y) / n;
            for (var j = 0; j < n; j++) {
                resList.push({
                    x: start.x + j * xDiff,
                    y: start.y + j * yDiff
                });
            }
            resList.push({
                x: end.x,
                y: end.y
            });
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
            // 第四象限
            else if (x > 0 && y < 0) {
                return 360 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            // 第二象限
            else if (x < 0 && y >= 0) {
                return 180 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            // 第三象限
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
            // return item.longitude && item.latitude && item.latitude > -90 && item.latitude < 90;
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
/// <reference path="../events/EventProvider.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 线
     */
    var MinemapCircleGraphic = /** @class */ (function (_super) {
        __extends(MinemapCircleGraphic, _super);
        function MinemapCircleGraphic(options) {
            var _this = _super.call(this, null) || this;
            _this.kind = "circle";
            _this.id = options.id;
            _this.attributes = options.attributes;
            _this.symbol = options.symbol;
            _this.circle = new minemap.Polyline(options.path, _this.symbol);
            _this._geometry = new flagwind.MinemapCircle();
            _this._geometry.center = options.center;
            _this._geometry.radius = options.radius;
            return _this;
        }
        Object.defineProperty(MinemapCircleGraphic.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        MinemapCircleGraphic.prototype.show = function () {
            if (!this.layer) {
                throw new flagwind.Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.circle.addTo(this.layer.map);
            this.isShow = false;
        };
        MinemapCircleGraphic.prototype.hide = function () {
            this.circle.remove();
            this.isShow = false;
        };
        MinemapCircleGraphic.prototype.remove = function () {
            if (this._isInsided) {
                this.circle.remove();
                this._isInsided = false;
            }
        };
        MinemapCircleGraphic.prototype.delete = function () {
            if (this._isInsided) {
                this.circle.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        };
        MinemapCircleGraphic.prototype.setSymbol = function (symbol) {
            this.symbol = symbol;
            if (this.symbol && this.symbol.strokeColor) {
                this.circle.setStrokeColor(this.symbol.strokeColor);
            }
            if (this.symbol && this.symbol.fillOpacity) {
                this.circle.setFillOpacity(this.symbol.fillOpacity);
            }
            if (this.symbol && this.symbol.strokeOpacity) {
                this.circle.setStrokeOpacity(this.symbol.strokeOpacity);
            }
            if (this.symbol && this.symbol.strokeDashArray) {
                this.circle.setStrokeDashArray(this.symbol.strokeDashArray);
            }
            if (this.symbol && this.symbol.ay) {
                this.circle.ay(this.symbol.ay);
            }
        };
        MinemapCircleGraphic.prototype.setGeometry = function (geometry) {
            this._geometry = geometry;
            this.circle.setCenter(geometry.center);
            this.circle.setRadius(geometry.radius);
        };
        Object.defineProperty(MinemapCircleGraphic.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            enumerable: true,
            configurable: true
        });
        MinemapCircleGraphic.prototype.addTo = function (map) {
            this._isInsided = true;
            this.circle.addTo(map);
        };
        MinemapCircleGraphic.prototype.setAngle = function (angle) {
            throw new flagwind.Exception("未实现setAngle方法");
        };
        return MinemapCircleGraphic;
    }(flagwind.EventProvider));
    flagwind.MinemapCircleGraphic = MinemapCircleGraphic;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind.map.ts" />
var flagwind;
(function (flagwind) {
    /**
     * 对Minemap地图封装
     */
    var MinemapContextMenu = /** @class */ (function () {
        function MinemapContextMenu(flagwindMap) {
            this.flagwindMap = flagwindMap;
            this.enabled = false;
        }
        MinemapContextMenu.prototype.startup = function (eventArgs) {
            throw new Error("未实现");
        };
        MinemapContextMenu.prototype.enable = function () {
            throw new Error("未实现");
        };
        MinemapContextMenu.prototype.disable = function () {
            throw new Error("未实现");
        };
        return MinemapContextMenu;
    }());
    flagwind.MinemapContextMenu = MinemapContextMenu;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 编辑要素图层
     */
    var MinemapEditLayer = /** @class */ (function () {
        function MinemapEditLayer(businessLayer, options) {
            this.businessLayer = businessLayer;
            this.draggingFlag = false;
            this.cursorOverPointFlag = false;
            this.isShow = true;
            this.options = __assign({ EDIT_LAYER_OPTIONS: flagwind.EDIT_LAYER_OPTIONS }, options);
        }
        Object.defineProperty(MinemapEditLayer.prototype, "map", {
            get: function () {
                return this.businessLayer.flagwindMap.map;
            },
            enumerable: true,
            configurable: true
        });
        MinemapEditLayer.prototype.appendTo = function (map) {
            this.graphic.addTo(map);
        };
        MinemapEditLayer.prototype.removeLayer = function (map) {
            this.graphic.remove();
        };
        MinemapEditLayer.prototype.show = function () {
            this.graphic.show();
            this.isShow = true;
        };
        MinemapEditLayer.prototype.hide = function () {
            this.graphic.show();
            this.isShow = false;
        };
        MinemapEditLayer.prototype.registerEvent = function (graphic) {
            var _this = this;
            graphic.on("onMouseOver", function (args) {
                // console.log("test--->onMouseOver");
                _this.cursorOverPointFlag = true;
                // me.map.dragPan.disable();
            });
            graphic.on("onMouseOut", function (args) {
                // console.log("test--->onMouseOut");
                _this.cursorOverPointFlag = false;
                _this.map.dragPan.enable();
            });
            graphic.on("onMouseDown", function (args) {
                if (!_this.cursorOverPointFlag)
                    return;
                _this.draggingFlag = true;
                console.log("test--->onMouseDown");
                window._editLayer = _this;
                console.log("test--->map.on.mousemove");
                _this.map.on("mousemove", _this.mouseMovePoint);
                _this.map.dragPan.disable();
            });
            graphic.on("onMouseUp", function (args) {
                console.log("test--->onMouseUp");
                if (!_this.draggingFlag)
                    return;
                _this.draggingFlag = false;
                console.log("test--->map.off.mousemove");
                _this.map.off("mousemove", _this.mouseMovePoint);
                window._editLayer = null;
                _this.updatePoint();
            });
        };
        MinemapEditLayer.prototype.updatePoint = function () {
            var isOK = confirm("确定要更新坐标为x:" + this.graphic.geometry.x + ",y:" + this.graphic.geometry.y);
            if (!isOK) {
                this.cancelEdit(this.graphic.attributes.id);
                return;
            }
            var graphic = this.businessLayer.getGraphicById(this.graphic.attributes.id);
            graphic.setGeometry(new flagwind.MinemapPoint(this.graphic.geometry.x, this.graphic.geometry.y, graphic.geometry.spatial));
            var lnglat = this.businessLayer.flagwindMap.onFormPoint(this.graphic.geometry);
            this.onChanged({
                key: this.graphic.attributes.id,
                longitude: lnglat.longitude,
                latitude: lnglat.latitude
            }, isOK);
        };
        MinemapEditLayer.prototype.mouseMovePoint = function (e) {
            var editLayer = window._editLayer;
            if (!editLayer) {
                return;
            }
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
            this.graphic.remove();
            this.map.off("mousemove", this.mouseMovePoint);
            this.businessLayer.show();
            this.map.dragPan.enable();
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
/// <reference path="../events/EventProvider.ts" />
var flagwind;
(function (flagwind) {
    var MinemapGraphicsLayer = /** @class */ (function (_super) {
        __extends(MinemapGraphicsLayer, _super);
        function MinemapGraphicsLayer(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.GRAPHICS_MAP = new flagwind.Map();
            /**
             * 是否在地图上
             */
            _this._isInsided = false;
            _this.isShow = true;
            _this.id = options.id;
            return _this;
        }
        Object.defineProperty(MinemapGraphicsLayer.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapGraphicsLayer.prototype, "graphics", {
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
        MinemapGraphicsLayer.prototype.on = function (type, listener, scope, once) {
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
        MinemapGraphicsLayer.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        MinemapGraphicsLayer.prototype.show = function () {
            this.GRAPHICS_MAP.forEach(function (g) {
                if (!g.value.isShow) {
                    g.value.show();
                }
            });
            this.isShow = true;
        };
        MinemapGraphicsLayer.prototype.hide = function () {
            this.GRAPHICS_MAP.forEach(function (g) {
                if (g.value.isShow) {
                    g.value.hide();
                }
            });
            this.isShow = true;
        };
        MinemapGraphicsLayer.prototype.remove = function (graphic) {
            this.GRAPHICS_MAP.delete(graphic.attributes.id);
            if (graphic.isInsided) {
                graphic.delete();
            }
        };
        MinemapGraphicsLayer.prototype.clear = function () {
            this.GRAPHICS_MAP.forEach(function (g) { return g.value.remove(); });
            this.GRAPHICS_MAP.clear();
        };
        MinemapGraphicsLayer.prototype.add = function (graphic) {
            this.GRAPHICS_MAP.set(graphic.attributes.id, graphic);
            graphic.layer = this;
            if (this.map) {
                graphic.addTo(this.map);
            }
        };
        MinemapGraphicsLayer.prototype.appendTo = function (map) {
            return this.addToMap(map);
        };
        MinemapGraphicsLayer.prototype.removeLayer = function (map) {
            return this.removeFromMap(map);
        };
        MinemapGraphicsLayer.prototype.addToMap = function (map) {
            if (!this.map) {
                this.GRAPHICS_MAP.forEach(function (g) {
                    g.value.addTo(map);
                });
            }
            this.map = map;
            this.isShow = true;
            this._isInsided = true;
        };
        MinemapGraphicsLayer.prototype.removeFromMap = function (map) {
            this.GRAPHICS_MAP.forEach(function (g) {
                g.value.remove();
            });
            this._isInsided = false;
        };
        return MinemapGraphicsLayer;
    }(flagwind.EventProvider));
    flagwind.MinemapGraphicsLayer = MinemapGraphicsLayer;
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
            return new flagwind.MinemapGraphicsLayer(options);
        };
        return MinemapGroupLayer;
    }(flagwind.FlagwindGroupLayer));
    flagwind.MinemapGroupLayer = MinemapGroupLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapHeatmapLayer = /** @class */ (function () {
        function MinemapHeatmapLayer(flagwindMap, options) {
            this.flagwindMap = flagwindMap;
            this.isShow = false;
            this.options = __assign({}, flagwind.HEATMAP_LAYER_OPTIONS, options);
            this.dataMap = new flagwind.Map();
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
        Object.defineProperty(MinemapHeatmapLayer.prototype, "echartslayer", {
            get: function () {
                if (this._echartslayer == null) {
                    this._echartslayer = minemap.Template.create({ map: this.flagwindMap.map, type: "heatmap" });
                }
                return this._echartslayer;
            },
            enumerable: true,
            configurable: true
        });
        MinemapHeatmapLayer.prototype.appendTo = function (map) {
            throw new Error("Method not implemented.");
        };
        MinemapHeatmapLayer.prototype.removeLayer = function (map) {
            throw new Error("Method not implemented.");
        };
        MinemapHeatmapLayer.prototype.resize = function () {
            this.echartslayer.resize();
        };
        MinemapHeatmapLayer.prototype.clear = function () {
            this.dataMap.clear();
            this.chartOptions.series[0].data = [];
            this.echartslayer.chart.setOption(this.chartOptions);
        };
        MinemapHeatmapLayer.prototype.show = function () {
            this.isShow = true;
            this.echartslayer._container.style.display = "";
        };
        MinemapHeatmapLayer.prototype.hide = function () {
            this.isShow = false;
            this.echartslayer._container.style.display = "none";
        };
        MinemapHeatmapLayer.prototype.showDataList = function (data) {
            this.chartOptions.series[0].data = this.onChangeStandardModel(data);
            this.echartslayer.chart.setOption(this.chartOptions);
        };
        MinemapHeatmapLayer.prototype.onChangeStandardModel = function (data) {
            var _this = this;
            data.forEach(function (g) {
                var node = _this.options.changeStandardModel(g);
                if (node) {
                    var key = node.longitude + ":" + node.latitude;
                    var value = _this.dataMap.get(key);
                    if (value !== undefined) {
                        value.members.push(g);
                        value.count = value.count + (node.count || 1);
                    }
                    else {
                        value = {
                            longitude: node.longitude,
                            latitude: node.latitude,
                            members: [g],
                            count: (node.count || 1)
                        };
                        _this.dataMap.set(key, value);
                    }
                }
            });
            return this.dataMap.values();
        };
        return MinemapHeatmapLayer;
    }());
    flagwind.MinemapHeatmapLayer = MinemapHeatmapLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 文本
     */
    var MinemapLabelGraphic = /** @class */ (function (_super) {
        __extends(MinemapLabelGraphic, _super);
        function MinemapLabelGraphic(options) {
            var _this = _super.call(this, null) || this;
            _this.kind = "label";
            _this.id = options.id;
            _this.attributes = options.attributes;
            _this.symbol = options.symbol;
            if (options.point) {
                _this._geometry = new flagwind.MinemapPoint(options.point.x, options.point.y);
            }
            if (options.geometry) {
                _this._geometry = options.geometry;
            }
            _this.label = new minemap.Symbol([_this._geometry.x, _this._geometry.y], options.symbol);
            return _this;
        }
        Object.defineProperty(MinemapLabelGraphic.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapLabelGraphic.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            set: function (geometry) {
                this._geometry = geometry;
                this.label.setPoint([geometry.x, geometry.y]);
            },
            enumerable: true,
            configurable: true
        });
        MinemapLabelGraphic.prototype.show = function () {
            if (!this.layer) {
                throw new flagwind.Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.label.addTo(this.layer.map);
            this.isShow = false;
        };
        MinemapLabelGraphic.prototype.hide = function () {
            this.label.remove();
            this.isShow = false;
        };
        MinemapLabelGraphic.prototype.remove = function () {
            if (this._isInsided) {
                this.label.remove();
                this._isInsided = false;
            }
        };
        MinemapLabelGraphic.prototype.delete = function () {
            if (this._isInsided) {
                this.label.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        };
        MinemapLabelGraphic.prototype.setSymbol = function (symbol) {
            this.symbol = symbol;
            if (this.symbol && this.symbol.textColor) {
                this.label.setTextColor(this.symbol.textColor);
            }
            if (this.symbol && this.symbol.textOffset) {
                this.label.setTextOffset(this.symbol.textOffset);
            }
            if (this.symbol && this.symbol.text) {
                this.label.setText(this.symbol.text);
            }
            if (this.symbol && this.symbol.icon) {
                this.label.setIcon(this.symbol.icon);
            }
            if (this.symbol && this.symbol.symbolSize) {
                this.label.setSymbolSize(this.symbol.symbolSize);
            }
            if (this.symbol && this.symbol.opacity) {
                this.label.setOpacity(this.symbol.opacity);
            }
        };
        MinemapLabelGraphic.prototype.setGeometry = function (geometry) {
            this._geometry = geometry;
            this.label.setPoint([geometry.x, geometry.y]);
        };
        MinemapLabelGraphic.prototype.addTo = function (map) {
            this._isInsided = true;
            this.label.addTo(map);
        };
        MinemapLabelGraphic.prototype.setAngle = function (angle) {
            throw new flagwind.Exception("未实现setAngle方法");
        };
        return MinemapLabelGraphic;
    }(flagwind.EventProvider));
    flagwind.MinemapLabelGraphic = MinemapLabelGraphic;
})(flagwind || (flagwind = {}));
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
        /**
         * 判断点是否在圆里面
         * @param point 点
         */
        MinemapPolygon.prototype.inside = function (point) {
            var x = point[0], y = point[1];
            var vs = this.rings[0];
            var inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var xi = vs[i][0], yi = vs[i][1];
                var xj = vs[j][0], yj = vs[j][1];
                var intersect = ((yi > y) !== (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
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
     * 圆
     */
    var MinemapCircle = /** @class */ (function (_super) {
        __extends(MinemapCircle, _super);
        function MinemapCircle(spatial) {
            if (spatial === void 0) { spatial = null; }
            var _this = _super.call(this, "Circle", spatial) || this;
            _this.center = [];
            return _this;
        }
        MinemapCircle.prototype.toJson = function () {
            return {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": this.attributes || {
                        radius: this.radius
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": this.center
                    }
                }
            };
        };
        /**
         * 判断点是否在圆里面
         * @param point 点
         */
        MinemapCircle.prototype.inside = function (point) {
            var from = new MinemapPoint(this.center[0], this.center[1]);
            var to = new MinemapPoint(point[0], point[1]);
            var units = "meters";
            var distance = turf.distance(from.toJson(), to.toJson(), units);
            return distance <= this.radius;
            // let offsetX = point[0] - this.center[0];
            // let offsetY = point[1] - this.center[1];
            // let offsetR = (1 / 2) * Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            // let x = Math.sin(offsetX / offsetR) * this.radius;
            // let y = Math.sin(offsetY / offsetR) * this.radius;
            // if (offsetX * (x - point[0]) < 0) return false;
            // if (offsetY * (y - point[1]) < 0) return false;
            // return true;
        };
        return MinemapCircle;
    }(MinemapGeometry));
    flagwind.MinemapCircle = MinemapCircle;
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
})(flagwind || (flagwind = {}));
/// <reference path="./minemap.model.ts" />
/// <reference path="./minemap-graphics.layer.ts" />
var flagwind;
(function (flagwind) {
    var MinemapLocationLayer = /** @class */ (function (_super) {
        __extends(MinemapLocationLayer, _super);
        function MinemapLocationLayer(flagwindMap, options) {
            var _this = _super.call(this, options) || this;
            _this.flagwindMap = flagwindMap;
            _this.options = __assign({}, flagwind.LOCATION_LAYER_OPTIONS, _this.options);
            _this.appendTo(flagwindMap.map);
            _this.registerEvent();
            return _this;
        }
        MinemapLocationLayer.prototype.registerEvent = function () {
            var _this = this;
            this.flagwindMap.on("onClick", function (args) {
                _this.point = new flagwind.MinemapPoint(args.data.lngLat.lng, args.data.lngLat.lat);
                _this.locate();
            }, this);
        };
        MinemapLocationLayer.prototype.locate = function () {
            this.clear();
            var marker = new flagwind.MinemapPointGraphic({
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
    }(flagwind.MinemapGraphicsLayer));
    flagwind.MinemapLocationLayer = MinemapLocationLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapMap = /** @class */ (function (_super) {
        __extends(MinemapMap, _super);
        function MinemapMap(mapSetting, mapElement, options) {
            var _this = _super.call(this, mapSetting, mapElement, options) || this;
            _this.mapSetting = mapSetting;
            _this.onInit();
            return _this;
        }
        MinemapMap.prototype.toScreen = function () {
            var args = arguments, pt;
            switch (args.length) {
                case 1:
                    pt = this.onToPoint(args[0]);
                    break;
                case 2:
                    pt = this.onCreatePoint({
                        x: args[0],
                        y: args[1],
                        spatial: this.spatial
                    });
                    break;
            }
            if (pt) {
                return this.innerMap.project([pt.x, pt.y]);
            }
            else {
                return null;
            }
        };
        MinemapMap.prototype.onZoom = function (zoom) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.innerMap.flyTo({ zoom: zoom });
                resolve();
            });
        };
        /**
         * 中心定位
         * @param point 坐标点
         */
        MinemapMap.prototype.onCenterAt = function (point) {
            var _this = this;
            return new Promise(function (resolve) {
                _this.innerMap.flyTo({ center: [point.x, point.y] });
                resolve();
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
            var _this = this;
            minemap.domainUrl = "http://" + this.mapSetting.mapDomain;
            minemap.spriteUrl = "http://" + this.mapSetting.mapDomain + "/minemapapi/" + this.mapSetting.mapVersion + "/sprite/sprite";
            minemap.serviceUrl = "http://" + this.mapSetting.mapDomain + "/service";
            minemap.accessToken = this.mapSetting.accessToken || "25cc55a69ea7422182d00d6b7c0ffa93";
            minemap.solution = this.mapSetting.wkid || 2365;
            var map = new minemap.Map({
                container: this.mapElement,
                style: "http://" + this.mapSetting.mapDomain + "/service/solu/style/id/" + minemap.solution,
                center: this.mapSetting.center || [116.46, 39.92],
                zoom: this.mapSetting.zoom,
                pitch: 0,
                maxZoom: this.mapSetting.maxZoom || 17,
                minZoom: this.mapSetting.minZoom || 9 // 地图最小缩放级别限制
            });
            this.spatial = new flagwind.MinemapSpatial(minemap.solution);
            var popup = new minemap.Popup({ closeOnClick: false, closeButton: true, offset: [0, -14] }); // 创建全局信息框
            map.infoWindow = popup;
            popup.addTo(map);
            this.tooltipElement = document.createElement("div");
            this.tooltipElement.id = "flagwind-map-tooltip";
            this.tooltipElement.classList.add("flagwind-map-tooltip");
            map._container.appendChild(this.tooltipElement);
            this.innerMap = map;
            map.on("load", function (args) {
                _this.dispatchEvent("onLoad", args);
            });
            // #region click event
            map.on("click", function (args) {
                _this.dispatchEvent("onClick", args);
            });
            map.on("dbclick", function (args) {
                _this.dispatchEvent("onDbClick", args);
            });
            // #endregion
            // #region
            map.on("zoomstart", function (args) {
                _this.dispatchEvent("onZoomStart", args);
            });
            map.on("zoomend", function (args) {
                _this.dispatchEvent("onZoomEnd", args);
            });
            // #endregion
            // #region mouse event
            map.on("mouseout", function (args) {
                _this.dispatchEvent("onMouseOut", args);
            });
            map.on("mousedown", function (args) {
                _this.dispatchEvent("onMouseDown", args);
            });
            map.on("mousemove", function (args) {
                _this.dispatchEvent("onMouseMove", args);
            });
            map.on("mouseup", function (args) {
                _this.dispatchEvent("onMouseUp", args);
            });
            // #endregion
            // #region move event
            map.on("movestart", function (args) {
                args = _this.toMouseMoveEventArgs(args);
                _this.dispatchEvent("onPanStart", args);
            });
            map.on("move", function (args) {
                args = _this.toMouseMoveEventArgs(args);
                _this.dispatchEvent("onPan", args);
            });
            map.on("moveend", function (args) {
                args = _this.toMouseMoveEventArgs(args);
                _this.dispatchEvent("onPanEnd", args);
            });
            // #endregionn
            return map;
        };
        MinemapMap.prototype.onShowInfoWindow = function (evt) {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.remove();
            }
            if (evt.options) {
                var options = evt.options;
                // 存在原始设置参数则创建新信息窗口
                var params = {};
                if (typeof options.closeButton === "boolean") {
                    params["closeButton"] = options.closeButton;
                }
                if (typeof options.closeOnClick === "boolean") {
                    params["closeOnClick"] = options.closeOnClick;
                }
                if (options.offset) {
                    params["offset"] = options.offset;
                }
                params = __assign({ closeOnClick: false, closeButton: true, offset: [0, -14] }, params);
                this.innerMap.infoWindow = new minemap.Popup(params);
            }
            else {
                this.innerMap.infoWindow = new minemap.Popup({ closeOnClick: false, closeButton: true, offset: [0, -14] });
            }
            this.innerMap.infoWindow.addTo(this.innerMap);
            if (evt.context) {
                switch (evt.context.type) {
                    case "dom":
                        this.innerMap.infoWindow.setDOMContent(document.getElementById(evt.context.content) || "");
                        break; // 不推荐使用该方法，每次调用会删掉以前dom节点
                    case "html":
                        this.innerMap.infoWindow.setHTML("<h4 class='info-window-title'>" + evt.context.title + "</h4><div class='info-window-content'>" + evt.context.content + "</div>");
                        break;
                    case "text":
                        this.innerMap.infoWindow.setText(evt.context.content || "");
                        break;
                    default:
                        this.innerMap.infoWindow.setHTML("<h4 class='info-window-title'>" + evt.context.title + "</h4><div class='info-window-content'>" + evt.context.content + "</div>");
                        break;
                }
            }
            this.innerMap.infoWindow.setLngLat([evt.graphic.geometry.x, evt.graphic.geometry.y]);
            var popup = document.querySelector(".minemap-map .minemap-popup");
            if (popup) {
                popup.style.height = popup.offsetHeight;
            }
        };
        MinemapMap.prototype.onCloseInfoWindow = function () {
            if (this.innerMap.infoWindow) {
                this.innerMap.infoWindow.remove();
            }
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
        MinemapMap.prototype.onHideTooltip = function () {
            this.tooltipElement.style.display = "none";
        };
        MinemapMap.prototype.onDestroy = function () {
            try {
                if (this.tooltipElement) {
                    this.tooltipElement.remove();
                    this.tooltipElement = null;
                }
                if (this.featureLayers) {
                    this.featureLayers.forEach(function (l) {
                        l.clear();
                    });
                    this.featureLayers = [];
                }
                if (this.baseLayers) {
                    this.baseLayers = [];
                }
                if (this.innerMap && this.innerMap.destroy) {
                    this.innerMap.destroy();
                    this.innerMap = null;
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        MinemapMap.prototype.toMouseMoveEventArgs = function (args) {
            if (args && args.data && args.data.originalEvent) {
                args.data.delta = args.data.originalEvent;
            }
            return args;
        };
        return MinemapMap;
    }(flagwind.FlagwindMap));
    flagwind.MinemapMap = MinemapMap;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapPointGraphic = /** @class */ (function (_super) {
        __extends(MinemapPointGraphic, _super);
        function MinemapPointGraphic(options) {
            var _this = _super.call(this) || this;
            _this._kind = "point";
            /**
             * 是否在地图上
             */
            _this._isInsided = false;
            _this.isShow = true;
            _this.id = options.id;
            _this.symbol = options.symbol ? options.symbol : {};
            _this.attributes = options.attributes ? options.attributes : {};
            _this.icon = options.icon;
            if ((!_this.icon) && _this.symbol.imageUrl) {
                _this.icon = new minemap.Icon({ imageUrl: _this.symbol.imageUrl, imageSize: _this.symbol.imageSize, imgOffset: _this.symbol.imgOffset });
            }
            _this.marker = new minemap.Marker(_this.icon, { /* offset: [-10, -14] */});
            _this.element = _this.marker.getElement();
            if (options.point) {
                _this.geometry = new flagwind.MinemapPoint(options.point.x, options.point.y, options.point.spatial);
            }
            if (options.geometry) {
                _this.geometry = options.geometry;
            }
            if (options && options.className) {
                _this.addClass(options.className);
                _this.symbol.className = "";
            }
            if (options.symbol && options.symbol.className) {
                _this.addClass(options.symbol.className);
                _this.symbol.className = "";
            }
            return _this;
        }
        MinemapPointGraphic.prototype.addClass = function (className) {
            this.symbol.className = className;
            if (className === " " || className === null || className === undefined) {
                return;
            }
            var classList = className.split(" ");
            for (var i = 0; i < classList.length; i++) {
                this.marker.getElement().classList.add(classList[i]);
            }
        };
        MinemapPointGraphic.prototype.removeClass = function (className) {
            if (className === " " || className === null || className === undefined) {
                return;
            }
            var classList = className.split(" ");
            for (var i = 0; i < classList.length; i++) {
                this.marker.getElement().classList.remove(classList[i]);
            }
        };
        /**
         * 复制节点
         * @param id 元素ID
         */
        MinemapPointGraphic.prototype.clone = function (id) {
            var m = new MinemapPointGraphic({
                id: id,
                symbol: this.symbol,
                attributes: this.attributes,
                point: this.geometry
            });
            return m;
        };
        Object.defineProperty(MinemapPointGraphic.prototype, "kind", {
            get: function () {
                return this._kind;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MinemapPointGraphic.prototype, "isInsided", {
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
        MinemapPointGraphic.prototype.on = function (type, listener, scope, once) {
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
        MinemapPointGraphic.prototype.off = function (type, listener, scope) {
            if (scope === void 0) { scope = this; }
            this.removeListener(type, listener, scope);
        };
        MinemapPointGraphic.prototype.show = function () {
            if (!this.layer) {
                throw new flagwind.Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            // this.marker.addTo(this.layer.map);
            this.addTo(this.layer.map);
            this.isShow = true;
        };
        MinemapPointGraphic.prototype.hide = function () {
            this.marker.remove();
            this.isShow = false;
        };
        MinemapPointGraphic.prototype.remove = function () {
            if (this._isInsided) {
                this.marker.remove();
                this._isInsided = false;
            }
        };
        MinemapPointGraphic.prototype.delete = function () {
            if (this._isInsided) {
                this.marker.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        };
        MinemapPointGraphic.prototype.setAngle = function (angle) {
            this.marker.getElement().style.transform = "rotate(" + angle + "deg)";
            this.marker.getElement().style["-ms-transform"] = "rotate(" + angle + "deg)";
            this.marker.getElement().style["-moz-transform"] = "rotate(" + angle + "deg)";
            this.marker.getElement().style["-webkit-transform"] = "rotate(" + angle + "deg)";
            this.marker.getElement().style["-o-transform"] = "rotate(" + angle + "deg)";
            var routeCar = this.marker.getElement().querySelector(".graphic-moving .minemap-icon");
            if (routeCar) {
                routeCar.style.transform = "rotate(" + angle + "deg)";
            }
        };
        MinemapPointGraphic.prototype.setSymbol = function (symbol) {
            if (symbol.className) {
                // 先删除之前的样式
                if (this.symbol && this.symbol.className) {
                    this.removeClass(this.symbol.className);
                }
                this.addClass(symbol.className);
            }
            if (symbol.icon) {
                this.marker.setIcon(symbol.icon);
            }
            if (symbol.imageUrl) {
                this.icon.setImageUrl(symbol.imageUrl);
            }
            if (symbol.title) {
                this.marker.setTitle(symbol.title);
            }
            if (symbol.titleFontSize) {
                this.marker.setTitleFontSize(symbol.titleFontSize);
            }
            if (symbol.titleColor) {
                this.marker.setTitleColor(symbol.titleColor);
            }
            if (symbol.titleColor) {
                this.marker.setTitleColor(symbol.titleColor);
            }
            if (symbol.titlePosition) {
                this.marker.setTitlePosition(symbol.titlePosition);
            }
            this.symbol = __assign({}, this.symbol, symbol);
        };
        MinemapPointGraphic.prototype.draw = function () {
            console.log("draw");
        };
        Object.defineProperty(MinemapPointGraphic.prototype, "geometry", {
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
        MinemapPointGraphic.prototype.setGeometry = function (value) {
            if (value instanceof flagwind.MinemapPoint) {
                this.geometry = value;
            }
            else {
                throw new Error("不匹配类型");
            }
        };
        MinemapPointGraphic.prototype.addTo = function (map) {
            var _this = this;
            this._isInsided = true;
            this.marker.addTo(map);
            this.marker.on("mouseover", function (args) {
                console.log("fire marker onMouseOver");
                _this.fireEvent("onMouseOver", {
                    graphic: _this,
                    mapPoint: _this.geometry,
                    orgion: args
                });
            });
            this.marker.on("mouseout", function (args) {
                console.log("fire marker onMouseOut");
                _this.fireEvent("onMouseOut", {
                    graphic: _this,
                    mapPoint: _this.geometry,
                    orgion: args
                });
            });
            this.marker.on("mouseup", function (args) {
                console.log("fire marker onMouseUp");
                _this.fireEvent("onMouseUp", {
                    graphic: _this,
                    mapPoint: _this.geometry,
                    orgion: args
                });
            });
            this.marker.on("mousedown", function (args) {
                console.log("fire marker onMouseDown");
                _this.fireEvent("onMouseDown", {
                    graphic: _this,
                    mapPoint: _this.geometry,
                    orgion: args
                });
            });
            this.marker.on("dblclick", function (args) {
                console.log("fire marker onClick");
                _this.fireEvent("onDblClick", {
                    graphic: _this,
                    mapPoint: _this.geometry,
                    orgion: args
                });
            });
            this.marker.on("click", function (args) {
                console.log("fire marker onClick");
                _this.fireEvent("onClick", {
                    graphic: _this,
                    mapPoint: _this.geometry,
                    orgion: args
                });
            });
        };
        MinemapPointGraphic.prototype.fireEvent = function (type, data) {
            this.dispatchEvent(type, data);
            if (this.layer) {
                this.layer.dispatchEvent(type, data);
            }
        };
        return MinemapPointGraphic;
    }(flagwind.EventProvider));
    flagwind.MinemapPointGraphic = MinemapPointGraphic;
})(flagwind || (flagwind = {}));
/// <reference path="../base/flagwind-business.layer.ts" />
var flagwind;
(function (flagwind) {
    flagwind.MINEMAP_POINT_LAYER_OPTIONS = {
        getImageUrl: null,
        layerType: "point"
    };
    /**
     * 点图层
     */
    var MinemapPointLayer = /** @class */ (function (_super) {
        __extends(MinemapPointLayer, _super);
        function MinemapPointLayer(flagwindMap, id, options) {
            return _super.call(this, flagwindMap, id, __assign({ autoInit: true }, options, flagwind.MINEMAP_POINT_LAYER_OPTIONS)) || this;
        }
        MinemapPointLayer.prototype.onCreateGraphicsLayer = function (options) {
            var _this = this;
            var layer = new flagwind.MinemapGraphicsLayer(options);
            // 当点击地图要素对象时，会触发要素图层对应的事件
            layer.on("onClick", function (evt) { return _this.dispatchEvent("onClick", evt.data); });
            layer.on("onDblClick", function (evt) { return _this.dispatchEvent("onDblClick", evt.data); });
            layer.on("onMouseDown", function (evt) { return _this.dispatchEvent("onMouseDown", evt.data); });
            layer.on("onMouseUp", function (evt) { return _this.dispatchEvent("onMouseUp", evt.data); });
            layer.on("onMouseOut", function (evt) { return _this.dispatchEvent("onMouseOut", evt.data); });
            layer.on("onMouseOver", function (evt) { return _this.dispatchEvent("onMouseOver", evt.data); });
            return layer;
        };
        MinemapPointLayer.prototype.getImageUrl = function (item) {
            if (this.options.getImageUrl) {
                return this.options.getImageUrl(item);
            }
            var imageUrl = this.options.symbol.imageUrl;
            if (typeof imageUrl === "string" && imageUrl) {
                var key = "imageUrl" + (item.status || "") + (item.selected ? "checked" : "");
                var statusImageUrl = this.options[key] || this.options.symbol[key] || imageUrl;
                var suffixIndex = statusImageUrl.lastIndexOf(".");
                var path = statusImageUrl.substring(0, suffixIndex);
                var suffix = statusImageUrl.substring(suffixIndex + 1);
                if (item.selected) {
                    return path + "_checked." + suffix;
                }
                else {
                    return path + "." + suffix;
                }
            }
            else {
                var status_3 = item.status;
                if (status_3 === undefined || status_3 === null) {
                    status_3 = "";
                }
                var key = "image" + status_3 + (item.selected ? "checked" : "");
                return (this.options[key] ||
                    this.options.symbol[key] ||
                    this.options.image);
            }
        };
        MinemapPointLayer.prototype.getClassName = function (item) {
            if (item.selected == null) {
                return "";
            }
            if (item.selected) {
                return "checked";
            }
            else {
                return "unchecked";
            }
        };
        /**
         * 创建要素方法
         * @param item 实体信息
         */
        MinemapPointLayer.prototype.onCreatGraphicByModel = function (item) {
            var className = this.options.symbol.className || "graphic-point";
            var imageUrl = this.options.symbol.imageUrl || this.options.imageUrl;
            var attr = __assign({}, item, { __type: this.layerType });
            return new flagwind.MinemapPointGraphic({
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
        };
        /**
         * 更新要素方法
         * @param item 实体信息
         */
        MinemapPointLayer.prototype.onUpdateGraphicByModel = function (item) {
            var graphic = this.getGraphicById(item.id);
            if (graphic) {
                var originPoint = graphic.geometry;
                var currentPoint = new flagwind.MinemapPoint(item.longitude, item.latitude);
                graphic.geometry = currentPoint;
                var attr = __assign({}, graphic.attributes, item, { __type: this.layerType });
                this.setGraphicStatus(attr);
                if (!flagwind.MapUtils.isEqualPoint(currentPoint, originPoint)) {
                    this.options.onPositionChanged(currentPoint, originPoint, graphic.attributes);
                }
            }
            else {
                console.warn("待修改的要素不存在");
            }
        };
        MinemapPointLayer.prototype.setGraphicStatus = function (item) {
            var graphic = this.getGraphicById(item.id);
            graphic.setSymbol({
                className: this.getClassName(item),
                imageUrl: this.getImageUrl(item)
            });
        };
        return MinemapPointLayer;
    }(flagwind.FlagwindBusinessLayer));
    flagwind.MinemapPointLayer = MinemapPointLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 面
     */
    var MinemapPolygonGraphic = /** @class */ (function (_super) {
        __extends(MinemapPolygonGraphic, _super);
        function MinemapPolygonGraphic(options) {
            var _this = _super.call(this, null) || this;
            _this.attributes = {};
            _this.kind = "polygon";
            _this.id = options.id;
            _this.attributes = __assign({}, _this.attributes, options.attributes);
            _this.symbol = options.symbol;
            _this.polygon = new minemap.Polygon(options.path, _this.symbol);
            _this._geometry = new flagwind.MinemapPolygon();
            _this._geometry.addRing(options.path);
            return _this;
        }
        Object.defineProperty(MinemapPolygonGraphic.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        MinemapPolygonGraphic.prototype.show = function () {
            if (!this.layer) {
                throw new flagwind.Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.polygon.addTo(this.layer.map);
            this.isShow = false;
        };
        MinemapPolygonGraphic.prototype.hide = function () {
            this.polygon.remove();
            this.isShow = false;
        };
        MinemapPolygonGraphic.prototype.remove = function () {
            if (this._isInsided) {
                this.polygon.remove();
                this._isInsided = false;
            }
        };
        MinemapPolygonGraphic.prototype.delete = function () {
            if (this._isInsided) {
                this.polygon.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        };
        MinemapPolygonGraphic.prototype.setSymbol = function (symbol) {
            this.symbol = symbol;
            if (this.symbol && this.symbol.strokeColor) {
                this.polygon.setStrokeColor(this.symbol.strokeColor);
            }
            if (this.symbol && this.symbol.fillOpacity) {
                this.polygon.setFillOpacity(this.symbol.fillOpacity);
            }
            if (this.symbol && this.symbol.strokeOpacity) {
                this.polygon.setStrokeOpacity(this.symbol.strokeOpacity);
            }
            if (this.symbol && this.symbol.strokeDashArray) {
                this.polygon.setStrokeDashArray(this.symbol.strokeDashArray);
            }
            if (this.symbol && this.symbol.ay) {
                this.polygon.ay(this.symbol.ay);
            }
        };
        MinemapPolygonGraphic.prototype.setGeometry = function (geometry) {
            this._geometry = geometry;
            if (geometry.rings.length > 0) {
                this.polygon.setPath(geometry.rings[0]);
            }
            else {
                this.polygon.setPath([]);
            }
        };
        Object.defineProperty(MinemapPolygonGraphic.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            enumerable: true,
            configurable: true
        });
        MinemapPolygonGraphic.prototype.addTo = function (map) {
            this._isInsided = true;
            this.polygon.addTo(map);
        };
        MinemapPolygonGraphic.prototype.setAngle = function (angle) {
            throw new flagwind.Exception("未实现setAngle方法");
        };
        return MinemapPolygonGraphic;
    }(flagwind.EventProvider));
    flagwind.MinemapPolygonGraphic = MinemapPolygonGraphic;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 线
     */
    var MinemapPolylineGraphic = /** @class */ (function (_super) {
        __extends(MinemapPolylineGraphic, _super);
        function MinemapPolylineGraphic(layer, options) {
            var _this = _super.call(this, null) || this;
            _this.attributes = {};
            _this.kind = "polyline";
            _this.layer = layer;
            _this.id = options.id;
            _this.attributes = __assign({}, _this.attributes, options.attributes);
            _this.symbol = options.symbol;
            if (options.geometry) {
                _this._geometry = options.geometry;
            }
            else {
                _this._geometry = new flagwind.MinemapPolyline();
            }
            var path = _this._geometry.path;
            if (options.path) {
                path = options.path;
            }
            _this.polyline = new minemap.Polyline(path, _this.symbol);
            _this._geometry.path = path;
            return _this;
        }
        Object.defineProperty(MinemapPolylineGraphic.prototype, "isInsided", {
            get: function () {
                return this._isInsided;
            },
            enumerable: true,
            configurable: true
        });
        MinemapPolylineGraphic.prototype.show = function () {
            if (!this.layer) {
                throw new flagwind.Exception("该要素没有添加到图层上，若想显示该要素请调用addToMap方法");
            }
            this.polyline.addTo(this.layer.map);
            this.isShow = false;
        };
        MinemapPolylineGraphic.prototype.hide = function () {
            this.polyline.remove();
            this.isShow = false;
        };
        MinemapPolylineGraphic.prototype.remove = function () {
            if (this._isInsided) {
                this.polyline.remove();
                this._isInsided = false;
            }
        };
        MinemapPolylineGraphic.prototype.delete = function () {
            if (this._isInsided) {
                this.polyline.remove();
                this._isInsided = false;
            }
            if (this.layer) {
                this.layer.remove(this);
            }
        };
        MinemapPolylineGraphic.prototype.setSymbol = function (symbol) {
            this.symbol = symbol;
            if (this.symbol && this.symbol.strokeColor) {
                this.polyline.setStrokeColor(this.symbol.strokeColor);
            }
            if (this.symbol && this.symbol.opacity) {
                this.polyline.setOpacity(this.symbol.opacity);
            }
            if (this.symbol && this.symbol.strokeDashArray) {
                this.polyline.setStrokeDashArray(this.symbol.strokeDashArray);
            }
        };
        MinemapPolylineGraphic.prototype.setGeometry = function (geometry) {
            this._geometry = geometry;
            this.polyline.setPath(geometry.path);
        };
        Object.defineProperty(MinemapPolylineGraphic.prototype, "geometry", {
            get: function () {
                return this._geometry;
            },
            enumerable: true,
            configurable: true
        });
        MinemapPolylineGraphic.prototype.addTo = function (map) {
            this._isInsided = true;
            this.polyline.addTo(map);
        };
        MinemapPolylineGraphic.prototype.setAngle = function (angle) {
            throw new flagwind.Exception("未实现setAngle方法");
        };
        return MinemapPolylineGraphic;
    }(flagwind.EventProvider));
    flagwind.MinemapPolylineGraphic = MinemapPolylineGraphic;
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
                id: id
            });
        };
        MinemapRouteLayer.prototype.onCreateLineLayer = function (id) {
            return new flagwind.MinemapGroupLayer({
                id: id
            });
        };
        MinemapRouteLayer.prototype.onEqualGraphic = function (originGraphic, targetGraphic) {
            if (originGraphic == null || targetGraphic == null)
                return false;
            return originGraphic.geometry.x !== targetGraphic.geometry.x
                || originGraphic.geometry.y !== targetGraphic.geometry.y;
        };
        MinemapRouteLayer.prototype.onShowSegmentLine = function (segment) {
            var lineGraphic = new flagwind.MinemapPolylineGraphic(this.moveLineLayer.layer, {
                id: segment.name + "_" + segment.index,
                geometry: segment.polyline,
                attributes: {
                    id: segment.name + "_" + segment.index
                },
                symbol: { strokeDashArray: [1, 1] }
            });
            segment.lineGraphic = lineGraphic;
            this.moveLineLayer.addGraphic(segment.name, lineGraphic);
        };
        MinemapRouteLayer.prototype.onGetStandardStops = function (name, stops) {
            var list = [];
            if (stops == null || stops.length === 0)
                return list;
            stops.forEach(function (g) {
                if (g instanceof flagwind.MinemapPointGraphic) {
                    g.attributes.__type = "stop";
                    g.attributes.__line = name;
                    list.push(g);
                }
                else {
                    throw new Error("未知的停靠点定义.");
                }
            });
            return list;
        };
        /**
         * 由路由服务来路径规划
         * @param segment 路段
         * @param start 开始结点
         * @param end 结束结点
         * @param waypoints  经过点
         */
        MinemapRouteLayer.prototype.onSolveByService = function (segment, start, end, waypoints) {
            var _this = this;
            var startXY = segment.startGraphic.geometry.x + "," + segment.startGraphic.geometry.y;
            var endXY = segment.endGraphic.geometry.x + "," + segment.endGraphic.geometry.y;
            var wayXY = null;
            if (waypoints) {
                // wayXY = waypoints.map(g => `${ g.geometry.x },${ g.geometry.y }`).join(",");
                wayXY = waypoints.join(",");
            }
            minemap.service.queryRouteDrivingResult3(startXY, endXY, wayXY, 2, "", function (error, results) {
                if (error) {
                    _this.errorHandler(error, segment);
                }
                else {
                    if (results.errcode === 0 && results.data) {
                        var routeResult = new flagwind.RouteResult(results);
                        _this.solveComplete({
                            polyline: routeResult.getLine(_this.spatial),
                            length: routeResult.data.rows[0].distance
                        }, segment);
                    }
                    else {
                        _this.errorHandler(results.errmsg, segment);
                    }
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
        MinemapRouteLayer.prototype.onCreateMoveMark = function (trackline, graphic, angle) {
            var markerUrl = this.getImageUrl(trackline, angle);
            var marker = new flagwind.MinemapPointGraphic({
                id: trackline.name,
                symbol: {
                    imageUrl: markerUrl,
                    className: "graphic-moving"
                },
                point: graphic.geometry,
                attributes: graphic.attributes
            });
            trackline.markerGraphic = marker;
            this.moveMarkLayer.addGraphic(trackline.name, marker);
            // document.querySelector(".minemap-icon").classList.add("route-car");
        };
        /**
         * 每次位置移动线路上的要素样式变换操作
         */
        MinemapRouteLayer.prototype.onUpdateMoveGraphic = function (trackline, point, angle) {
            if (trackline === undefined)
                return;
            var imageUrl = this.getImageUrl(trackline, angle);
            var imageAngle = this.getImageAngle(trackline, angle);
            trackline.markerGraphic.setSymbol({
                imageUrl: imageUrl,
                className: "graphic-moving"
            });
            if (imageAngle !== null) {
                trackline.markerGraphic.setAngle(imageAngle);
            }
            trackline.markerGraphic.setGeometry(point);
        };
        MinemapRouteLayer.prototype.getImageUrl = function (trackline, angle) {
            if (this.options.getImageUrl) {
                return this.options.getImageUrl(trackline, angle);
            }
            if (trackline.options.getImageUrl) {
                return trackline.options.getImageUrl(trackline, angle);
            }
            var sx = 1;
            if (angle < 45 || angle >= 315)
                sx = 3; // 向东走
            if (angle >= 45 && angle < 135)
                sx = 4; // 向北走
            if (angle >= 135 && angle < 225)
                sx = 2; // 向西走
            if (angle >= 225 && angle < 315)
                sx = 1; // 向南走
            if (trackline.step === null) {
                trackline.step = -1;
            }
            if (trackline.direction !== sx) {
                trackline.step = 0;
            }
            else {
                trackline.step = (trackline.step + 1) % 4;
            }
            trackline.direction = sx;
            var name = "" + trackline.direction + (trackline.step + 1);
            return trackline.options.symbol["imageUrl" + name];
        };
        MinemapRouteLayer.prototype.getImageAngle = function (trackline, angle) {
            if (this.options.getImageAngle) {
                return this.options.getImageAngle(trackline, angle);
            }
            if (trackline.options.getImageAngle) {
                return trackline.options.getImageAngle(trackline, angle);
            }
            return 360 - angle;
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
    flagwind.SELECT_BOX_OPTIONS = {
        id: "select-box",
        selectMode: 2,
        onDrawStart: function () {
            // console.log("onCheckChanged");
        },
        onDrawEnd: function () {
            // console.log("onCheckChanged");
        },
        onCheckChanged: function (checkItems, layer) {
            // console.log("onCheckChanged");
        }
    };
    /**
     * 线
     */
    var MinemapSelectBox = /** @class */ (function (_super) {
        __extends(MinemapSelectBox, _super);
        function MinemapSelectBox(flagwindMap, options) {
            var _this = _super.call(this, null) || this;
            _this.flagwindMap = flagwindMap;
            _this.isActive = false;
            _this.layers = [];
            options = __assign({}, flagwind.SELECT_BOX_OPTIONS, options);
            _this.options = options;
            _this.id = options.id;
            _this.edit = new minemap.edit.init(flagwindMap.map, {
                boxSelect: true,
                touchEnabled: false,
                displayControlsDefault: true,
                showButtons: false
            });
            _this.flagwindMap.map.on("edit.record.create", function (evt) {
                _this.onCreateRecord(_this, evt);
            });
            return _this;
        }
        MinemapSelectBox.prototype.onCreateRecord = function (me, e) {
            var _this = this;
            var polygon = new flagwind.MinemapPolygon(null);
            polygon.addRing(e.record.features[0].geometry.coordinates[0]);
            me.layers.forEach(function (layer) {
                var checkGrahpics = [];
                layer.graphics.forEach(function (g) {
                    if (polygon.inside([g.geometry.x, g.geometry.y])) {
                        console.log(g);
                        checkGrahpics.push(g);
                    }
                });
                var checkItems = checkGrahpics.map(function (g) { return g.attributes; });
                layer.setSelectStatusByModels(checkItems, false);
                _this.options.onCheckChanged(checkItems, layer);
            });
            me.clear();
        };
        MinemapSelectBox.prototype.getLayerById = function (id) {
            var layers = this.layers.filter(function (layer) { return layer.id === id; });
            return layers.length > 0 ? layers[0] : null;
        };
        MinemapSelectBox.prototype.addLayer = function (layer) {
            layer.options.selectMode = this.options.selectMode;
            layer.options.showInfoWindow = false;
            this.layers.push(layer);
        };
        MinemapSelectBox.prototype.removeLayer = function (layer) {
            layer.options.selectMode = flagwind.SelectMode.none;
            var index = this.layers.indexOf(layer);
            if (index >= 0) {
                this.layers.splice(index, 1);
            }
        };
        MinemapSelectBox.prototype.deleteSelectBar = function () {
            if (this.element)
                this.element.remove();
        };
        MinemapSelectBox.prototype.show = function () {
            this.element.style.display = "block";
        };
        MinemapSelectBox.prototype.hide = function () {
            this.element.style.display = "none";
        };
        MinemapSelectBox.prototype.showSelectBar = function () {
            if (this.element) {
                console.log("绘制控件已经创建，不可重复创建！");
                this.show();
                return;
            }
            var mapEle = this.flagwindMap.map._container;
            this.element = document.createElement("div");
            this.element.setAttribute("id", this.id);
            this.element.classList.add("fm-select-box");
            this.element.innerHTML =
                "<div class=\"fm-btn circle\" title=\"\u753B\u5706\" data-operate=\"circle\"><i class=\"icon iconfont icon-circle\"></i></div>\n                <div class=\"fm-btn rectangle\" title=\"\u753B\u77E9\u5F62\" data-operate=\"rectangle\"><i class=\"icon iconfont icon-rectangle\"></i></div>\n                <div class=\"fm-btn polygon\" title=\"\u753B\u591A\u8FB9\u5F62\" data-operate=\"polygon\"><i class=\"icon iconfont icon-polygon\"></i></div>";
            mapEle.appendChild(this.element);
            var operateBtns = document.querySelectorAll("#" + this.id + " .fm-btn");
            var me = this;
            for (var i = 0; i < operateBtns.length; i++) {
                operateBtns[i].onclick = function () {
                    me.active(this.dataset.operate);
                };
            }
        };
        MinemapSelectBox.prototype.clear = function () {
            if (this.edit) {
                this.edit.onBtnCtrlActive("trash");
                this.mode = "trash";
                this.isActive = true;
                this.options.onDrawEnd();
            }
        };
        MinemapSelectBox.prototype.active = function (mode) {
            if (this.edit && mode) {
                this.edit.onBtnCtrlActive(mode);
                this.mode = mode;
                this.isActive = true;
                this.options.onDrawStart();
            }
        };
        MinemapSelectBox.prototype.destroy = function () {
            this.clear();
            this.deleteSelectBar();
        };
        return MinemapSelectBox;
    }(flagwind.EventProvider));
    flagwind.MinemapSelectBox = MinemapSelectBox;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    var MinemapTrackLayer = /** @class */ (function (_super) {
        __extends(MinemapTrackLayer, _super);
        function MinemapTrackLayer(businessLayer, options) {
            var _this = _super.call(this, businessLayer, new flagwind.MinemapRouteLayer(businessLayer.flagwindMap, businessLayer.id + "_track", options), options) || this;
            _this.businessLayer = businessLayer;
            return _this;
        }
        return MinemapTrackLayer;
    }(flagwind.FlagwindTrackLayer));
    flagwind.MinemapTrackLayer = MinemapTrackLayer;
})(flagwind || (flagwind = {}));
var flagwind;
(function (flagwind) {
    /**
     * 即将废弃
     */
    var MinemapVehicleRouteLayer = /** @class */ (function (_super) {
        __extends(MinemapVehicleRouteLayer, _super);
        function MinemapVehicleRouteLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MinemapVehicleRouteLayer.prototype.showTrack = function (trackLineName, stopList, options) {
            var trackOptions = __assign({ solveMode: "Line" }, options);
            var stops = this.getStopsGraphicList(stopList);
            if (trackOptions.solveMode === "Segment") {
                this.solveSegment(trackLineName, stops, trackOptions);
            }
            else {
                this.solveLine(trackLineName, stops, trackOptions);
            }
        };
        MinemapVehicleRouteLayer.prototype.getStopsGraphicList = function (stopList) {
            var _this = this;
            var dataList = [];
            stopList.forEach(function (g) {
                g = _this.changeStandardModel(g);
                if (_this.validGeometryModel(g)) {
                    dataList.push(new flagwind.MinemapPointGraphic({
                        id: g.id,
                        symbol: _this.options.stopSymbol,
                        point: _this.toStopPoint(g),
                        attributes: g
                    }));
                }
            });
            return dataList;
        };
        MinemapVehicleRouteLayer.prototype.toStopPoint = function (item) {
            var lnglat = { "lat": item.latitude, "lon": item.longitude };
            if (!this.validGeometryModel(item)) {
                lnglat.lon = item.x;
                lnglat.lat = item.y;
            }
            // 以x,y属性创建点
            return this.flagwindMap.onToPoint(item);
        };
        return MinemapVehicleRouteLayer;
    }(flagwind.MinemapRouteLayer));
    flagwind.MinemapVehicleRouteLayer = MinemapVehicleRouteLayer;
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
            this.minZoom = 9;
            this.maxZoom = 17;
            this.zoom = 16;
            this.logo = false;
            this.slider = true;
            this.sliderPosition = "bottom-left";
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
                if (start && end) {
                    length += MinemapUtils.getLength(start, end);
                }
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
