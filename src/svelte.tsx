import { Graph, Cell } from "@antv/x6";
import type { SvelteComponentTyped } from "svelte"

export default function createRender(Component: SvelteComponentTyped) {
  return function render(node: Cell, graph: Graph, container: HTMLElement) {
    const component = new Component({
      target: container,
      props: {
        node,
        graph,
      }
    })
    return () => component.$destroy()
  }
}

