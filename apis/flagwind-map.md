# Flagwind Map

## 背景

    地理信息建设是一个基础工程，投资成本高且专业性强。各个行业对地理信息的应用也越来越普遍，我们在建设平台往往需要对接不同厂商的地图服务与数据，对于非GIS人员针对不同的地图厂商api开发我们应用是非常疼痛的，往是一种api还没玩转，就要对接另一种api。FlagwindMap主要是对我们平常应用场景制定一套通用的api,屏蔽不同api对我们业务的影响，同时降低开发人员在对GIS开发门槛。

## 一、类型设计图

## 二、Api说明

### 2.1 FlagwindMap

#### 1、MapSetting

```typescript
    export interface IMapSetting {
        wkid: number;               // 地图服务使用的空间投影
        extent: Array<number>;
        units: number;              // 用于地图距离求解单位控件参数
        center: Array<number>;      // 中心坐标
        wkidFromApp: number;        // 业务数据中使用的空间投影
                                    // （允许业务中使用的投影与地图的不一样，程序会自动转换）
        minZoom: number;
        maxZoom: number;
        zoom: number;
        logo: boolean;              // 是否显示logo
        slider: boolean;            // 是否显示放大缩小按钮
        sliderPosition: string;     // 绽放按钮的位置
    }
```

#### 2、Options

- 回调

    | 名称   | 参数 |必填    |描述  |
    | ------ | ----- |----- |--- |--- |
    | onMapLoad | 无 |否|   地图加载完调用   |
    | onMapZoomEnd | level: number 当前地图等级 | 否 | 地图放大缩小完成后触发   |
    | onMapClick | evt: EventArgs  |   否|地图单击触发   |

- 示例

    > 见构造函数示例

#### 3、构造函数

##### 定义：

```typescript
 constructor(public mapSetting: IMapSetting,public mapElement: any,options: any)
```

| 参数名   | 类型   | 描述  |
| ------ | ----- | --- |--- |
| mapSetting | IMapSetting |  地图基础设备   |
| mapElement | string   | 地图承现Dom元素ID    |
| options   | MAP_OPTIONS    | 用于事件挂载和功能属性开关   |

##### 示例：

```typescript
let map = FlagwindMap(setting,'mapDiv',
    {
        onMapLoad() {
            console.log("地图加载完调用");
        }
    }
);
```

#### 4、类属性

| 属性名   | 类型   | 描述  |示例  |
| ------ | ----- | --- |--- |
| map | any | 不同地图api原始地图对象  |
| options   |  any  | 构造函数传入对象    |
| loaded   | boolean    | 地图是否加载完成   |
| baseLayers   | FlagwindTiledLayer[]  | 地图底图图层   |
| featureLayers   | FlagwindFeatureLayer[]  | 地图功能图层，点、线、面   |

#### 5、方法

- 公共方法
> 如下提供了地图相关的常规操作，对于有些场景需要使用对应地图api特定方法的情况，可以继承特定地图FlagwindMap（如EsriMap），定义特定方法供应用层调用，或使用原生map对象来调用。

| 名称   | 返回类型   | 描述  |
| ------ | ----- | --- |--- |
| centerAt(x: number, y: number) | Promise< void > | 定义中心点     |
| setZoom(zoom: number) | Promise< void > | 放大或缩小到指挥zoom级别     |
| showBaseLayers()   | void   | 显示所有底图图层    |
| hideBaseLayers()   | void    | 隐藏所有底图图层   |
| getBaseLayerById(id: string)   | FlagwindTiledLayer    | 获取底图图层   |
| showBaseLayer(id: string)   | boolean   | 显示指定id的底图图层    |
| hideBaseLayer(id: string)   | boolean    | 隐藏指定id的底图图层   |
| getFeatureLayerById(id: string)   | FlagwindFeatureLayer    | 获取功能图层   |
| addFeatureLayer(deviceLayer: FlagwindFeatureLayer)   | void   | 增加功能图层    |
| removeFeatureLayer(id: string)   | boolean    | 移除功能图层   |
| showFeatureLayer(id: string)   | boolean    | 显示功能图层   |
| hideFeatureLayer(id: string)   | boolean    | 显示功能图层   |

- 虚拟方法

> 因各个地图api对如下表格中定义的方法实现不一样，所以需要不同地图api分别实现

| 名称   | 返回类型   | 描述  |
| ------ | ----- | --- |--- |
| onCenterAt(point: any) | Promise< void > | 中心定位     |
| onZoom(zoom: number) | Promise< void > | 放大或缩小到指挥zoom级别     |
| onCreatePoint(item: any) | { x: number; y: number; spatial: any }   | 显示所有底图图层    |
| onCreateMap() | void    | 创建地图对象   |
| onShowInfoWindow(evt: { context: { type: string; title: any; content: any }; options: any })   | void    | 创建底图   |
| onCloseInfoWindow()   | void   | 显示要素tooltip信息    |
| onShowTooltip(graphic: any)  | boolean    | 隐藏指定id的底图图层   |
| onHideTooltip(graphic: any)  | FlagwindFeatureLayer    | 隐藏要素tooltip信息   |
| onCreateContextMenu(options: { contextMenu: Array < any >; contextMenuClickEvent: any })  | void   | 创建地图右键快捷菜单   |

### 2.2 FlagwindBusinessLayer

#### 1、Options

- 回调

| 名称   | 参数 |必填    |描述  |
| ------ | ----- |----- |--- |--- |
| onLayerClick(evt: any)  | 无 |否|   地图加载完调用   |
| onMapLoad: () | level: number 当前地图等级 | 否 | 地图放大缩小完成后触发   |
| onEvent: (eventName: string, evt: any) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: any[]; check: boolean; selectedItems: any[] }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |
| onCheckChanged: (evt: { target: Array<any>; check: boolean; selectedItems: Array<any> }) | evt: EventArgs  |   否|地图单击触发   |

### 2.3 FlagwindHeatmapLayer

### 2.4 FlagwindLocationLayer

### 2.5 FlagwindRouteLayer

### 2.6 FlagwindGroupLayer

### 2.7 FlagwindTrackLayer

### 2.8 FlagwindEditLayer
