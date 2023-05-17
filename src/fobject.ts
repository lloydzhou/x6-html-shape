// @ts-nocheck
import { Node, NodeView } from "@antv/x6";
import { getConfig, FOView } from "./utils";
import {
  BaseHTMLShapeView,
  register as _register,
  HTMLShapeConfig
} from "./index";

// export const FOView = "fo-shape-view" as any;
export const FOShapeName = "fo-shape" as any;

export const FOShape = Node.define(getConfig(FOView));

export const register = (config: HTMLShapeConfig) =>
  _register({ inherit: FOShapeName, ...config });

// extends FOShapeView
export class FOShapeView<
  Shape extends Node = typeof FOShape
> extends BaseHTMLShapeView<Shape> {
  ensureComponentContainer() {
    return this.selectors.foContent;
  }
}

NodeView.registry.register(FOView, FOShapeView, true);
Node.registry.register(FOShapeName, FOShape, true);

