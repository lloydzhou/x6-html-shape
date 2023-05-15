// @ts-nocheck
import {
  Graph,
  Node,
  Cell,
  View,
  NodeView,
  Markup,
  ObjectExt,
  Dom
} from "@antv/x6";
import { forwardEvent } from "./utils";
import {
  register as registerfo,
  getConfig,
  HTMLShapeConfig,
  FOShape,
  FOShapeView
} from "./fobject";

export const HTMLView = "html-shape-view" as any;
export const HTMLShapeName = "html-shape" as any;

export const HTMLShape = Node.define(getConfig(HTMLView));

// register html shape render on top of svg.
export const register = (config: HTMLShapeConfig) =>
  registerfo({ inherit: HTMLShapeName, ...config });

// extends FOShapeView
export class HTMLShapeView<
  Shape extends Node = typeof HTMLShape
> extends FOShapeView<Shape> {
  onTranslate: any;

  onMounted() {
    this.onTranslate = this.updateTransform.bind(this);
    this.graph.on("translate", this.onTranslate);
    this.graph.on("scale", this.onTranslate);
    this.graph.on("node:change:position", this.onTranslate);
  }
  onUnMount() {
    this.graph.off("translate", this.onTranslate);
    this.graph.off("scale", this.onTranslate);
    this.graph.off("node:change:position", this.onTranslate);
  }

  ensureComponentContainer() {
    if (!this.graph.htmlContainer) {
      const htmlContainer = (this.graph.htmlContainer = View.createElement(
        "div",
        false
      ));
      Dom.css(htmlContainer, {
        position: "absolute",
        width: 0,
        height: 0,
        "touch-action": "none",
        "user-select": "none",
        // ensure the node under selection and transform tool.
        "z-index": 0
      });
      htmlContainer.classList.add("x6-html-shape-container");
      this.graph.container.append(htmlContainer);
    }
    if (!this.componentContainer) {
      const container = (this.componentContainer = View.createElement(
        "div",
        false
      ));
      container.classList.add("x6-html-shape-node");
      // forward events
      const events = "click,dblclick,contextmenu,mousedown,mousemove,mouseup,mouseover,mouseout,mouseenter,mouseleave,mousewheel".split(
        ","
      );
      events.forEach((eventType) =>
        forwardEvent(eventType, container, this.container)
      );
      this.graph.htmlContainer.append(container);
    }
    return this.componentContainer;
  }

  updateTransform(e: any) {
    super.updateTransform();
    const container = this.ensureComponentContainer();
    const { x, y } = this.graph.localToGraph(this.cell.getPosition());
    const { width, height } = this.cell.getSize();
    const scale = this.graph.transform.getZoom();
    const cursor = getComputedStyle(this.container).cursor;
    const zIndex = this.cell.getZIndex();
    // TODO set to front when drag node
    const isSelected = this.graph.isSelected(this.cell);
    Dom.css(container, {
      cursor,
      height: height + "px",
      width: width + "px",
      top: y + (height * scale) / 2 + "px",
      left: x + (width * scale) / 2 + "px",
      position: "absolute",
      // set to front when select node.
      "z-index": isSelected ? 1e9 : zIndex,
      "transform-origin": "center",
      transform: `translate(-50%, -50%) rotate(${this.cell.getAngle()}deg) scale(${scale})`
    });
  }
}

NodeView.registry.register(HTMLView, HTMLShapeView, true);
Node.registry.register(HTMLShapeName, HTMLShape, true);

