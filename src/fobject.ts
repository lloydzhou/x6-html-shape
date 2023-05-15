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

export const FOView = "fo-shape-view" as any;
export const FOShapeName = "fo-shape" as any;

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

function getMarkup(primer = "rect", foContent = true) {
  return [
    {
      tagName: primer,
      selector: "body"
    },
    foContent ? Markup.getForeignObjectMarkup() : null,
    {
      tagName: "text",
      selector: "label"
    }
  ].filter((p: any) => p);
}

export function getConfig(view) {
  return {
    view,
    markup: getMarkup("rect", view === FOView),
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
      },
      fo: {
        refWidth: "100%",
        refHeight: "100%"
      }
    },
    propHooks(metadata: Properties) {
      if (metadata.markup == null) {
        const { primer, view } = metadata;
        if (primer && primer !== "rect") {
          metadata.markup = getMarkup(primer, view === FOView);
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
  };
}

export const FOShape = Node.define(getConfig(FOView));

const shapeMaps: Record<string, RenderType> = {};

// register html shape render on top of svg.
export function register(config: HTMLShapeConfig) {
  const { shape, render, inherit = FOShapeName, ...others } = config;
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

export const action = "html" as any;

export class FOShapeView<Shape extends Node = typeof FOShape> extends NodeView<Shape> {
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
        }
      }
    });
  }
  ensureComponentContainer() {
    return this.selectors.foContent;
  }
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
    return this;
  }
}

FOShapeView.config({
  bootstrap: [action],
  actions: {
    component: action
  }
});

NodeView.registry.register(FOView, FOShapeView, true);
Node.registry.register(FOShapeName, FOShape, true);
