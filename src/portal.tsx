import React, { useMemo, useReducer } from "react";
import { createPortal } from "react-dom";

/**
 * import { register } from 'x6-html-shape'
 * import createRender from 'x6-html-shape/portal'
 *
 * 1. createRender using Component
 * const [render, Provider] = createRender(Component)
 *
 * 2. register node
 * register({
 *   shape: 'react-portal-node',
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
 *   id: 'node1',
 *   label: 'node1',
 *   x: 100,
 *   y: 100,
 * })
 */

export default function createRender(Component) {
  let dispatch: React.Dispatch<any> = (data: any) => {
    console.warn('please mount the Provider to react app.')
  };

  function render(node, graph, container) {
    const id = `${graph.view.cid}:${node.id}`;
    const portal = createPortal(
      <Component node={node} graph={graph} />,
      container
    );
    dispatch({ id, portal });
    return () => dispatch({ id });
  }

  function Provider() {
    const [nodes, mutate] = useReducer((nodes, action) => {
      return { ...nodes, [action.id]: action.portal };
    }, {});
    dispatch = mutate;
    // @ts-ignore
    return useMemo(() => Object.values(nodes).filter((i) => i), [nodes]);
  }

  return [render, Provider];
}
