import React, { useCallback, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import { Node } from '../../types/node';
import { networkStyles } from './styles';
import { NetworkControls } from './NetworkControls';

interface NetworkGraphProps {
  nodes: Node[];
  onNodeClick: (node: Node) => void;
  onAddNode: () => void;
  onRename: (nodeId: string, newName: string) => void;
}

export function NetworkGraph({ nodes, onNodeClick, onAddNode, onRename }: NetworkGraphProps) {
  const [cy, setCy] = useState<Cytoscape.Core | null>(null);

  const elements = React.useMemo(() => {
    if (!nodes?.length) return [];
    const nodeElements = nodes.map(node => ({
      data: {
        id: node.id.toString(),
        status: node.status,
        label: node.name || `Node ${node.id}`,
        node: node,
      }
    }));
    const edges = nodes.flatMap((node, i) =>
      nodes.slice(i + 1).map(target => ({
        data: {
          id: `${node.id}-${target.id}`,
          source: node.id.toString(),
          target: target.id.toString(),
        }
      }))
    );
    return [...nodeElements, ...edges];
  }, [nodes]);

  const handleNodeClick = useCallback((event: Cytoscape.EventObject) => {
    const node = event.target.data('node');
    if (node) onNodeClick(node);
  }, [onNodeClick]);

  const handleContextMenu = useCallback((event: Cytoscape.EventObject) => {
    event.preventDefault();
    const node = event.target.data('node');
    if (node) {
      const newName = prompt('Enter new name:', node.name || `Node ${node.id}`);
      if (newName) onRename(node.id, newName);
    }
  }, [onRename]);

  const handleZoomIn = useCallback(() => {
    if (cy) cy.zoom(cy.zoom() * 1.2);
  }, [cy]);

  const handleZoomOut = useCallback(() => {
    if (cy) cy.zoom(cy.zoom() * 0.8);
  }, [cy]);

  const handleFitView = useCallback(() => {
    if (cy) cy.fit();
  }, [cy]);

  const initCytoscape = useCallback((cyInstance: Cytoscape.Core) => {
    if (!cyInstance) return;
    setCy(cyInstance);
    cyInstance.removeListener('tap');
    cyInstance.removeListener('cxttap');
    cyInstance.on('tap', 'node', handleNodeClick);
    cyInstance.on('cxttap', 'node', handleContextMenu);
    
    if (elements.length > 0) {
      cyInstance.layout({
        name: 'circle',
        padding: 50,
        animate: true,
      }).run();
    }
  }, [handleNodeClick, handleContextMenu, elements]);

  useEffect(() => {
    return () => {
      if (cy) {
        cy.removeListener('tap');
        cy.removeListener('cxttap');
        cy.destroy();
      }
    };
  }, [cy]);

  if (!nodes) {
    return <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center">
      <p>No nodes available</p>
    </div>;
  }

  return (
    <div className="relative w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <NetworkControls
        onAddNode={onAddNode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
      />
      <CytoscapeComponent
        elements={elements}
        stylesheet={networkStyles}
        className="w-full h-full"
        cy={initCytoscape}
      />
    </div>
  );
}