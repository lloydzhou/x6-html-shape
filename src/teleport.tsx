import { h, DefineComponent, defineComponent, reactive, Teleport, markRaw, Fragment } from "vue";

/**
 * import { register } from 'x6-html-shape'
 * import createRender from 'x6-html-shape/dist/teleport'
 *
 * 1. createRender using Component
 * const [render, Provider] = createRender(Component)
 *
 * 2. register node
 * register({
 *   shape: 'vue-teleport-node',
 *   render,
 *   width: 100,
 *   height: 40,
 * })
 *
 * 3.render Provider in react app before call graph.addNode
 * <Provider />
 *
 * 4. add Node
 * graph.addNode({
 *   shape: 'vue-teleport-node',
 *   id: 'node1',
 *   label: 'node1',
 *   x: 100,
 *   y: 100,
 * })
 */

type ComponentType = DefineComponent<{[key: string]: any}, {[key: string]: any}>

export default function createRender(Component) {

  const items = reactive<{ [key: string]: any }>({})

  function render(node, graph, container) {
    const id = `${graph.view.cid}:${node.id}`;
    items[id] = markRaw(
      defineComponent({
        render: () => h(Teleport, { to: container, node, graph } as any, [h(Component)]),
        provide: () => ({
          getNode: () => node,
          getGraph: () => graph,
        }),
      }) as ComponentType,
    )
    return () => {
      delete items[id];
    }
  }

  const Provider = defineComponent({
    setup() {
      return () =>
        h(
          Fragment,
          {},
          Object.keys(items).map((id) => h(items[id])),
        )
    },
  }) as ComponentType

  return [render, Provider];
}

