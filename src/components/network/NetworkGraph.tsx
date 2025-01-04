import React, { useCallback, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Node } from '../../types/node';
import { networkStyles } from './styles';
import { NetworkControls } from './NetworkControls';

interface NetworkGraphProps {
  nodes: Node[];
  onNodeClick: (node: Node) => void;
  onAddNode: () => void;
}

export function NetworkGraph({ nodes, onNodeClick, onAddNode }: NetworkGraphProps) {
  const [cy, setCy] = React.useState<any>(null);

  // Create elements whenever nodes change
  const elements = React.useMemo(() => {
    const nodeElements = nodes.map(node => ({
      data: { 
        id: node.id,
        status: node.status,
        label: `Node ${node.id}`,
        node: node,
      }
    }));

    // Add edges between nodes in a mesh topology
    const edges = nodes.flatMap((node, i) => 
      nodes.slice(i + 1).map(target => ({
        data: {
          id: `${node.id}-${target.id}`,
          source: node.id,
          target: target.id
        }
      }))
    );

    return [...nodeElements, ...edges];
  }, [nodes]);

  // Update layout when elements change
  useEffect(() => {
    if (cy && elements.length > 0) {
      cy.layout({ 
        name: 'circle',
        padding: 50,
        animate: true,
      }).run();
    }
  }, [cy, elements]);

  const handleNodeClick = useCallback((event: any) => {
    const node = event.target.data('node');
    if (node) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleZoomIn = useCallback(() => {
    if (cy) cy.zoom(cy.zoom() * 1.2);
  }, [cy]);

  const handleZoomOut = useCallback(() => {
    if (cy) cy.zoom(cy.zoom() * 0.8);
  }, [cy]);

  const handleFitView = useCallback(() => {
    if (cy) cy.fit();
  }, [cy]);

  const initCytoscape = useCallback((cyInstance: any) => {
    setCy(cyInstance);
    cyInstance.on('tap', 'node', handleNodeClick);
    // Apply layout once the Cytoscape instance is initialized
    if (elements.length > 0) {
      cyInstance.layout({ 
        name: 'circle',
        padding: 50,
        animate: true,
      }).run();
    }
  }, [handleNodeClick, elements]);

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
