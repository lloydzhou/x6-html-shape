import { h, defineComponent, reactive, Teleport, markRaw, Fragment } from "vue";

/**
 * import { register } from 'x6-html-shape'
 * import createRender from 'x6-html-shape/dist/teleport'
 *
 * 1. createRender using Component
 * const [render, Provider] = createRender(Component)
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
 * 4. add Node
 * graph.addNode({
 *   shape: 'vue-teleport-node',
 *   id: 'node1',
 *   label: 'node1',
 *   x: 100,
 *   y: 100,
 * })
 */

export default function createRender(Component) {

  const items = reactive<{ [key: string]: any }>({})

  function render(node, graph, container) {
    const id = `${graph.view.cid}:${node.id}`;
    items[id] = markRaw(
      defineComponent({
        render: () => h(Teleport, { to: container } as any, [h(Component)]),
        provide: () => ({
          getNode: () => node,
          getGraph: () => graph,
        }),
      }),
    )
    return () => {
      delete items[id];
    }
  }

  function Provider() {
    return defineComponent({
      setup() {
        return () =>
          h(
            Fragment,
            {},
            Object.keys(items).map((id) => h(items[id])),
          )
      },
    })
  }

  return [render, Provider];
}

