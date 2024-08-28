// @ts-nocheck
import { Graph, Node, Cell, View, NodeView, Dom } from "@antv/x6";
import { forwardEvent, getConfig, clickable, isInputElement } from "./utils";

// == Shape
export const HTMLShapeName = "html-shape" as any;
export const HTMLView = "html-shape-view" as any;
export const HTMLShape = Node.define(getConfig(HTMLView));
// == end Shape

// == types and register
export type RenderType = (
  node: Cell,
  graph: Graph,
  container: HTMLElement
) => () => void;

export type HTMLShapeConfig = Node.Properties & {
  shape: string;
  render: RenderType;
  inherit?: string;
};

const shapeMaps: Record<string, RenderType> = {};
// == end HTMLShapeView

// register html shape render on top of svg.
export function register(config: HTMLShapeConfig) {
  const { shape, render, inherit = HTMLShapeName, ...others } = config;
  if (!shape) {
    throw new Error("should specify shape in config");
  }
  shapeMaps[shape] = render;
  Graph.registerNode(
    shape,
    {
      inherit,
      ...others
    },
    true
  );
}
// == end types and register

// == base view
export const action = "html" as any;

export class BaseHTMLShapeView<Shape extends Node> extends NodeView<Shape> {
  mounted: any;
  componentContainer: HTMLElement | undefined;

  confirmUpdate(flag: number) {
    const ret = super.confirmUpdate(flag);
    return this.handleAction(ret, action, () => {
      if (!this.mounted) {
        const render = shapeMaps[this.cell.shape];
        const container = this.ensureComponentContainer();
        if (render && container) {
          this.mounted = render(this.cell, this.graph, container) || true;
          this.onMounted();
          // 避免处于foreignObject内部元素（或者html元素）触发onMouseDown导致节点被拖拽
          // 拖拽的时候是以onMouseDown启动的
          container.addEventListener("mousedown", this.prevEvent, true);
          container.addEventListener("mouseup", this.prevEvent, true);
        }
      }
    });
  }
  prevEvent(e) {
    if (clickable(e.target) || isInputElement(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  ensureComponentContainer() {}
  onMounted() {}
  onUnMount() {}
  unmount() {
    if (typeof this.mounted === "function") {
      this.mounted();
    }
    if (this.componentContainer) {
      this.componentContainer.remove();
    }
    this.onUnMount();
    super.unmount()
    return this;
  }
}

BaseHTMLShapeView.config({
  bootstrap: [action],
  actions: {
    component: action
  }
});

// == end base view

// == HTMLShapeView

export class HTMLShapeView<
  Shape extends Node = typeof HTMLShape
> extends BaseHTMLShapeView<Shape> {
  onTranslate: any;
  constructor(...args) {
    super(...args)
    this.cell.on('change:visible', ({ cell }) => {
      if (cell.view === HTMLView) {
        const view = this.graph.findViewByCell(cell.id)
        view &&
          Promise.resolve().then(() => {
            // 事件回调可能有多个，保证最后一个执行
            view.componentContainer.style.display = view.container.style.display
          })
      }
    })
  }

  onMounted() {
    if (this.graph.listeners?.hasTransformEvent?.length) {
      return
    }
    this.onTranslate = this.updateHtmlContainerSize.bind(this)
    this.graph.on('translate', this.onTranslate)
    this.graph.on('scale', this.onTranslate)
    this.graph.on('node:change:position', this.onTranslate)
    // 注册一个不存在的事件，用来判断是否有监听过，避免重复监听事件
    this.graph.on('hasTransformEvent', this.onTranslate)
  }

  ensureComponentContainer() {
    if (!this.graph.htmlContainer) {
      const htmlContainer = (this.graph.htmlContainer = View.createElement(
        "div",
        false
      ));
      Dom.css(htmlContainer, {
        position: "absolute",
        width: "100%",
        height: "100%",
        "touch-action": "none",
        "user-select": "none",
        "pointer-events": "none",
        // ensure the node under selection and transform tool.
        'z-index': 0,
        'transform-origin': 'left top',
      });
      htmlContainer.classList.add("x6-html-shape-container");
      this.graph.container.append(htmlContainer);
    }
    if (!this.componentContainer) {
      const container = (this.componentContainer = View.createElement(
        "div",
        false
      ));
      // set default css for componentcontainer
      Dom.css(container, {
        "pointer-events": "auto",
        "touch-action": "none",
        "user-select": "none",
        "transform-origin": "center",
        position: "absolute",
      })
      container.classList.add("x6-html-shape-node");
      // forward events
      const events = "click,dblclick,contextmenu,mousedown,mousemove,mouseup,mouseover,mouseout,mouseenter,mouseleave".split(
        ","
      );
      events.forEach((eventType) =>
        forwardEvent(eventType, container, this.container)
      );
      this.graph.htmlContainer.append(container);
    }
    return this.componentContainer;
  }
  resize(){
    super.resize();
    this.updateContainerStyle()
  }
  updateTransform() {
    super.updateTransform();
    this.updateContainerStyle()
  }
  updateContainerStyle(){
    const container = this.ensureComponentContainer();
    const { x, y } = this.cell.getPosition()
    const { width, height } = this.cell.getSize();
    const cursor = getComputedStyle(this.container).cursor;
    const zIndex = this.cell.getZIndex();
    // TODO set to front when drag node
    const isSelected = this.graph.isSelected && this.graph.isSelected(this.cell);
    Dom.css(container, {
      cursor,
      height: height + "px",
      width: width + "px",
      // set to front when select node.
      "z-index": isSelected ? 1e9 : zIndex,
      transform: `translate(${x}px, ${y}px) rotate(${this.cell.getAngle()}deg)`,
    });
  }
  updateHtmlContainerSize() {
    const { graph } = this
    const scale = graph.transform.getZoom()
    const matrix = graph.transform.getMatrix()
    const { offsetHeight, offsetWidth } = graph.container
    Dom.css(graph.htmlContainer, {
      transform: `matrix(${matrix['a']}, ${matrix['b']}, ${matrix['c']}, ${matrix['d']}, ${matrix['e']}, ${matrix['f']})`,
      width: scale !== 1 ? offsetWidth / scale : '100%',
      height: scale !== 1 ? offsetHeight / scale : '100%',
    })
  }
}
// == end HTMLShapeView

NodeView.registry.register(HTMLView, HTMLShapeView, true);
Node.registry.register(HTMLShapeName, HTMLShape, true);
