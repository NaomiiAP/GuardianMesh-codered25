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
}

export function NetworkGraph({ nodes, onNodeClick, onAddNode }: NetworkGraphProps) {
  const [cy, setCy] = useState<Cytoscape.Core | null>(null);

  // Create elements whenever nodes change
  const elements = React.useMemo(() => {
    if (!nodes?.length) return [];

    const nodeElements = nodes.map(node => ({
      data: { 
        id: node.id.toString(), // Ensure ID is a string
        status: node.status,
        label: `Node ${node.id}`,
        node: node,
      }
    }));

    const edges = nodes.flatMap((node, i) => 
      nodes.slice(i + 1).map(target => ({
        data: {
          id: `${node.id}-${target.id}`,
          source: node.id.toString(), // Ensure source is a string
          target: target.id.toString(), // Ensure target is a string
        }
      }))
    );

    return [...nodeElements, ...edges];
  }, [nodes]);

  // Update layout when elements change
  useEffect(() => {
    if (cy && elements.length > 0) {
      try {
        cy.layout({ 
          name: 'circle',
          padding: 50,
          animate: true,
        }).run();
      } catch (error) {
        console.error('Layout error:', error);
      }
    }
  }, [cy, elements]);

  const handleNodeClick = useCallback((event: Cytoscape.EventObject) => {
    try {
      const node = event.target.data('node');
      if (node) {
        onNodeClick(node);
      }
    } catch (error) {
      console.error('Node click error:', error);
    }
  }, [onNodeClick]);

  const handleZoomIn = useCallback(() => {
    if (cy) {
      const currentZoom = cy.zoom();
      cy.zoom(currentZoom * 1.2);
    }
  }, [cy]);

  const handleZoomOut = useCallback(() => {
    if (cy) {
      const currentZoom = cy.zoom();
      cy.zoom(currentZoom * 0.8);
    }
  }, [cy]);

  const handleFitView = useCallback(() => {
    if (cy) {
      cy.fit();
    }
  }, [cy]);

  const initCytoscape = useCallback((cyInstance: Cytoscape.Core) => {
    if (!cyInstance) return;

    setCy(cyInstance);
    cyInstance.removeListener('tap');  // Remove any existing listeners
    cyInstance.on('tap', 'node', handleNodeClick);

    if (elements.length > 0) {
      try {
        cyInstance.layout({ 
          name: 'circle',
          padding: 50,
          animate: true,
        }).run();
      } catch (error) {
        console.error('Initial layout error:', error);
      }
    }
  }, [handleNodeClick, elements]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (cy) {
        cy.removeListener('tap');
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