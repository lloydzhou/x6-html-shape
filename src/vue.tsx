import { createApp, h } from 'vue'

export default function createRender(Component) {
  return function render(node, graph, container) {
    const vm = createApp({
      render() {
        return h(Component, { node, graph })
      },
      provide() {
        return {
          getNode: () => node,
          getGraph: () => graph,
        }
      }
    })
    vm.mount(container)
    return () => vm.unmount()
  }
}

