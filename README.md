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

