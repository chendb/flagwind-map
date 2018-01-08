# esri-map-extends
> esri-map-extends module

## 生成步骤

``` bash
# 安装依赖
npm install

# 运行生产编译
gulp

# npm发布
npm publish
```
## 组件说明
```
该类库封闭了对arcgis二维地图常用操作，便于对gis知识不了解的开发人员实现复杂的地图相关业务逻辑。
```
## 使用示例：
1、构建地图对象
```
    import {EgovaMap,EgovaMapOptions} from 'esri-map-extends';

    let egovaMapOptions = new EgovaMapOptions(....);
    let egovaMap=new EgovaMap("divMap",egovaMapOptions);
```
    
2、定义图层
```
    import {EgovaMap,EgovaMapOptions,EgovaDeviceLayer} from 'esri-map-extends';
    export class VideoLayer extends EgovaDeviceLayer{
        ...........
    }
```
3、实例化图层
```
    let deviceLayerOptions= new EgovaDeviceLayerOptions(....);
    let videoLayer = new VideoLayer(egovaMap,deviceLayerOptions);
```

4、往图层添加数据
```
    videoLayer.showDatas([
        {id:"1",name:"视频点位1",longitude:123.00,latitude:36.00},
        {id:"2",name:"视频点位2",longitude:124.00,latitude:36.00}
    ]);
```

    


