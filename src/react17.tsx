import React from 'react'
import ReactDOM from 'react-dom';

export default function createRender(Component) {
  return function render(node, graph, container) {
    ReactDOM.render(<Component node={node} graph={graph} />, container)
    return () => ReactDOM.unmountComponentAtNode(container)
  }
}



