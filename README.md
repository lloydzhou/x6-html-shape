# x6-html-shape

html shape for [@antv/x6](https://github.com/antvis/X6)

## online demo

[codesandbox demo](https://codesandbox.io/s/html-shape-for-x6-0y71sv)

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
2. 通过给`x6-html-shape-container`设置`pointer-events: none`屏蔽这一层的交互，使得鼠标事件能穿透到svg内部节点
3. 但是`x6-html-shape-node`内部有一些元素是需要交互的，所以，这里需要开发者自己打开（这里没有默认打开的原因是默认将`x6-html-shape-node`打开之后节点的拖动等交互会受影响）。

### TODO
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
import createRender from 'x6-html-shape/react'

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
import createRender from 'x6-html-shape/react17'

const render = createRender(Component)

register({
  shape: 'react18-node',
  render,
  width: 100,
  height: 40,
})
```

## react-portal
```
import { register } from 'x6-html-shape'
import createRender from 'x6-html-shape/portal'
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
  id: 'node1',
  label: 'node1',
  x: 100,
  y: 100,
})
```

