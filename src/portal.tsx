import React, { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

/**
 * import { register } from 'x6-html-shape'
 * import createRender from 'x6-html-shape/portal'
 *
 * 1. createRender using Component
 * const [render, Provider] = createRender(Component)
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
 * 4. add Node
 * graph.addNode({
 *   id: 'node1',
 *   label: 'node1',
 *   x: 100,
 *   y: 100,
 * })
 */

export default function createRender(Component) {
  let connect = (id: string, portal: any) => null;
  let disconnect = (id: string) => null;

  function render(node, graph, container) {
    const id = `${graph.view.cid}:${node.id}`;
    const portal = createPortal(
      <Component node={node} graph={graph} />,
      container
    );
    connect(id, portal);
    return () => disconnect(id);
  }

  function Provider() {
    const [nodes, setNodes] = useState({});
    connect = useCallback(
      (id, portal) => {
        setNodes({ ...nodes, [id]: portal });
      },
      [nodes]
    );
    disconnect = useCallback(
      (id) => {
        setNodes({ ...nodes, id: undefined });
      },
      [nodes]
    );
    return useMemo(() => Object.values(nodes).filter((i) => i), [nodes]);
  }

  return [render, Provider];
}

