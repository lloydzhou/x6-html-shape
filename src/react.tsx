import React from 'react'
import { createRoot } from 'react-dom/client'

export default function createRender(Component) {
  return function render(node, graph, container) {
    const root = createRoot(container)
    root.render(<Component node={node} graph={graph} />)
    return () => root.unmount()
  }
}

