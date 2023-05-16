import Vue from 'vue' 

export default function createRender(Component) {
  return function render(node, graph, container) {
    // @ts-ignore
    const vm = new Vue({
      el: container,
      render(h) {
        return h(Component, { node, graph })
      },
      provide() {
        return {
          getNode: () => node,
          getGraph: () => graph,
        }
      }
    })
    return () => vm.$destroy()
  }
}

