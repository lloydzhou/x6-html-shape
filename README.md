# x6-html-shape

html shape for [@antv/x6](https://github.com/antvis/X6)

<a href="https://www.npmjs.com/package/x6-html-shape"><img alt="NPM Package" src="https://img.shields.io/npm/v/x6-html-shape.svg?style=flat-square"></a>
![npm bundle size](https://img.shields.io/bundlephobia/minzip/x6-html-shape?style=flat-square)
![npm](https://img.shields.io/npm/dm/x6-html-shape?style=flat-square)
<a href="/LICENSE"><img src="https://img.shields.io/github/license/lloydzhou/x6-html-shape?style=flat-square" alt="MIT License"></a>

## online demo

[vue codesandbox demo](https://codesandbox.io/s/x6-html-shape-vue-xvvlsh)

[react codesandbox demo](https://codesandbox.io/s/html-shape-for-x6-0y71sv)

![image](https://user-images.githubusercontent.com/1826685/231785511-1363f084-235f-44cd-b88a-0b88e3be09d2.png)

## example

```
import { register } from "x6-html-shape";

register({
  shape: "html-shape-for-react",
  render: (node, graph, container) => {
    const root = createRoot(container);
    root.render(<CustomComponent node={node} />);
    return () => root.unmount();
  },
  width: 100,
  height: 40
});


const graph = new Graph({
  container: this.container,
  background: {
    color: "#F2F7FA"
  }
});

graph.addNode({
  shape: "html-shape-for-react",
  x: 100,
  y: 200,
  label: 'rect', 
})

```

## 事件穿透
1. 由于DOM层级关系，html-shape实现的节点总是在svg上层
2. ~~通过给`x6-html-shape-container`设置`pointer-events: none`屏蔽这一层的交互，使得鼠标事件能穿透到svg内部节点~~ 
3. ~~但是`x6-html-shape-node`内部有一些元素是需要交互的，所以，这里需要开发者自己打开（这里没有默认打开的原因是默认将`x6-html-shape-node`打开之后节点的拖动等交互会受影响）。~~
4. 移除`pointer-events`逻辑，`x6-html-shape-container`变成0像素的div，仅仅用于控制dom层级，至于事件穿透使用`forwardEvent`实现

### 鼠标事件转发
1. 以后看一下这个地方的事件是否需要集中的做一下`转发`操作，让`x6-html-shape-node`的一些事件能传递到`x6-node`内部？

```
export function forwardEvent(eventType, fromElement, toElement) {
  fromElement.addEventListener(eventType, function (event) {
    toElement.dispatchEvent(new event.constructor(event.type, event));
    event.preventDefault();
    event.stopPropagation();
  });
}
```


# react

## react18
```
import createRender from 'x6-html-shape/dist/react'

const render = createRender(Component)

register({
  shape: 'react18-node',
  render,
  width: 100,
  height: 40,
})
```

## react17
```
import createRender from 'x6-html-shape/dist/react17'

const render = createRender(Component)

register({
  shape: 'react17-node',
  render,
  width: 100,
  height: 40,
})
```

## react-portal
```
import { register } from 'x6-html-shape'
import createRender from 'x6-html-shape/dist/portal'
// 1. createRender using Component
 const [render, Provider] = createRender(Component)
2. register node
register({
  shape: 'react-portal-node',
  render,
  width: 100,
  height: 40,
})

// 3.render Provider in react app before call graph.addNode
 <Provider />
// 4. add Node
graph.addNode({
  shape: 'react-portal-node',
  id: 'node1',
  label: 'node1',
  x: 100,
  y: 100,
})
```

# vue

## vue3
```
import createRender from 'x6-html-shape/dist/vue'

const render = createRender(Component)

register({
  shape: 'vue3-node',
  render,
  width: 100,
  height: 40,
})
```

## vue2
```
import createRender from 'x6-html-shape/dist/vue2'

const render = createRender(Component)

register({
  shape: 'vue2-node',
  render,
  width: 100,
  height: 40,
})
```

## vue3-teleport
```
import { register } from 'x6-html-shape'
import createRender from 'x6-html-shape/dist/teleport'
// 1. createRender using Component
 const [render, Provider] = createRender(Component)
2. register node
register({
  shape: 'vue3-teleport-node',
  render,
  width: 100,
  height: 40,
})

// 3.render Provider in react app before call graph.addNode
 <Provider />
// 4. add Node
graph.addNode({
  shape: 'vue3-teleport-node',
  id: 'vue3-teleport-node',
  label: 'vue3 teleport node',
  x: 100,
  y: 100,
})
```
