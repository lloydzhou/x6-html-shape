// @ts-nocheck
import { Dom, Markup, Node, ObjectExt } from "@antv/x6";

export const FOView = "fo-shape-view" as any;
export type Primer =
  | "rect"
  | "circle"
  | "path"
  | "ellipse"
  | "polygon"
  | "polyline";
export interface Properties extends Node.Properties {
  primer?: Primer;
}

export function forwardEvent(eventType, fromElement, toElement) {
  fromElement.addEventListener(eventType, function (event) {
    toElement.dispatchEvent(new event.constructor(event.type, event));
    event.preventDefault();
    event.stopPropagation();
  });
}

export function clickable(elem: Element, depth=3): boolean {
  if (!elem || !Dom.isHTMLElement(elem) || depth <= 0) {
    return false;
  }
  if (["a", "button"].includes(Dom.tagName(elem))) {
    return true;
  }
  if (
    elem.getAttribute("role") === "button" ||
    elem.getAttribute("type") === "button"
  ) {
    return true;
  }
  return clickable(elem.parentNode as Element, depth - 1);
}

export function isInputElement(elem: any): boolean {
  const elemTagName = Dom.tagName(elem);
  if (elemTagName === "input") {
    const type = elem.getAttribute("type");
    if (
      type == null ||
      ["text", "password", "number", "email", "search", "tel", "url"].includes(
        type
      )
    ) {
      return true;
    }
  }
  return false;
}

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

export function getConfig(view: any) {
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
