// @ts-nocheck
import { Graph, Node, Cell, View, NodeView, ObjectExt, Dom } from "@antv/x6";
import { css, forwardEvent } from "./utils";

export interface HTMLShapeProperties extends Node.Properties {}

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

export class HTMLShape<
  Properties extends HTMLShapeProperties = HTMLShapeProperties
> extends Node<Properties> {}

function getMarkup(primer = "rect") {
  return [
    {
      tagName: primer,
      selector: "body"
    },
    {
      tagName: "text",
      selector: "label"
    }
  ];
}

Node.config({
  view: "html-shape-view",
  markup: getMarkup("rect"),
  attrs: {
    body: {
      // fill: "none",
      // 这里很奇怪，none的时候不能触发节点移动，改成transparent可以触发
      fill: "transparent",
      stroke: "none",
      refWidth: "100%",
      refHeight: "100%"
    },
    label: {
      fontSize: 14,
      fill: "#333",
      refX: "50%",
      refY: "50%",
      textAnchor: "middle",
      textVerticalAnchor: "middle"
    }
  },
  propHooks(metadata: Properties) {
    if (metadata.markup == null) {
      const primer = metadata.primer;
      if (primer && primer !== "rect") {
        metadata.markup = getMarkup(primer);
        let attrs = {};
        if (primer === "circle") {
          attrs = {
            refCx: "50%",
            refCy: "50%",
            refR: "50%"
          };
        } else if (primer === "ellipse") {
          attrs = {
            refCx: "50%",
            refCy: "50%",
            refRx: "50%",
            refRy: "50%"
          };
        }
        metadata.attrs = ObjectExt.merge(
          {},
          {
            body: {
              refWidth: null,
              refHeight: null,
              ...attrs
            }
          },
          metadata.attrs || {}
        );
      }
    }
    return metadata;
  }
});

const shapeMaps: Record<string, RenderType> = {};

export function register(config: HTMLShapeConfig) {
  const { shape, render, inherit, ...others } = config;
  if (!shape) {
    throw new Error("should specify shape in config");
  }
  shapeMaps[shape] = render;
  Graph.registerNode(
    shape,
    {
      inherit: inherit || "html-shape",
      ...others
    },
    true
  );
}

export const action = "html" as any;

export class HTMLShapeView extends NodeView<HTMLShape> {
  mounted: any;
  componentContainer: HTMLElement | undefined;
  onTranslate: any;

  confirmUpdate(flag: number) {
    const ret = super.confirmUpdate(flag);
    return this.handleAction(ret, action, () => {
      if (!this.mounted) {
        const render = shapeMaps[this.cell.shape];
        if (render) {
          const container = this.ensureComponentContainer();
          this.mounted = render(this.cell, this.graph, container) || true;
          this.onTranslate = this.updateTransform.bind(this)
          this.graph.on('translate', this.onTranslate)
          this.graph.on('scale', this.onTranslate)
        }
      }
    });
  }

  unmount() {
    if (typeof this.mounted === "function") {
      this.mounted();
    }
    if (this.componentContainer) {
      this.componentContainer.remove();
    }
    this.graph.off('translate', this.onTranslate)
    this.graph.off('scale', this.onTranslate)
    return this;
  }

  ensureComponentContainer() {
    if (!this.graph.htmlContainer) {
      const htmlContainer = this.graph.htmlContainer = View.createElement("div", false);
      Dom.css(htmlContainer, {
        position: "absolute",
        width: 0,
        height: 0,
        "touch-action": "none",
        "user-select": "none",
        // ensure the node under selection and transform tool.
        "z-index": 0,
      });
      htmlContainer.classList.add('x6-html-shape-container')
      this.graph.container.append(htmlContainer);
    }
    if (!this.componentContainer) {
      const container = this.componentContainer = View.createElement("div", false);
      container.classList.add('x6-html-shape-node')
      // forward events
      const events = "click,dblclick,contextmenu,mousedown,mousemove,mouseup,mouseover,mouseout,mouseenter,mouseleave,mousewheel".split(",");
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
    const scale = this.graph.transform.getZoom()
    const cursor = getComputedStyle(this.container).cursor;
    const zIndex = this.cell.getZIndex()
    const isSelected = this.graph.isSelected(this.cell)
    Dom.css(container, {
      cursor,
      height: height + "px",
      width: width + "px",
      top: y + height * scale / 2 + "px",
      left: x + width * scale / 2 + "px",
      position: "absolute",
      // set to front when select node.
      "z-index": isSelected ? 1e9 : zIndex,
      "transform-origin": "center",
      transform: `translate(-50%, -50%) rotate(${this.cell.getAngle()}deg) scale(${scale})`
    });
  }
}

HTMLShapeView.config({
  bootstrap: [action],
  actions: {
    component: action
  }
});

NodeView.registry.register("html-shape-view", HTMLShapeView, true);
Node.registry.register("html-shape", HTMLShape, true);
