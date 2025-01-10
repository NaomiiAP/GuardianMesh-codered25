import React, { useCallback, useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import { Node } from "../../types/node";
import { networkStyles } from "./styles";
import { NetworkControls } from "./NetworkControls";
import icon1 from '../../assets/icons/icon-1.png';
import icon2 from '../../assets/icons/icon-2.png';
import icon3 from '../../assets/icons/icon-3.png';

const icons = [icon1, icon2, icon3];  // Array of imported icons

interface NetworkGraphProps {
  nodes: Node[];
  onNodeClick: (node: Node) => void;
  onAddNode: () => void;
  onRename: (nodeId: string, newName: string) => void;
  onChangeIcon: (nodeId: string, newIcon: number) => void; // Expecting number for icon index
}

export function NetworkGraph({
  nodes,
  onNodeClick,
  onAddNode,
  onRename,
  onChangeIcon,
}: NetworkGraphProps) {
  const [cy, setCy] = useState<Cytoscape.Core | null>(null);

  const elements = React.useMemo(() => {
    if (!nodes?.length) return [];

    // Define node elements with an icon
    const nodeElements = nodes.map((node) => {
      // Ensure node.icon is a number and falls back to 0 if invalid
      const iconIndex = typeof node.icon === 'number' ? node.icon : 0;

      return {
        data: {
          id: node.id.toString(),
          status: node.status,
          label: node.name || `Node ${node.id}`,
          node: node,
          icon: icons[iconIndex] || icons[0],  // Fallback to the first icon if index is invalid
        },
      };
    });

    // Define edges
    const edges = [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "1", target: "4" },
      { source: "2", target: "3" },
      { source: "3", target: "4" },
      { source: "4", target: "2" },
    ].map(({ source, target }) => ({
      data: {
        id: `${source}-${target}`,
        source: source.toString(),
        target: target.toString(),
      },
    }));

    return [...nodeElements, ...edges];
  }, [nodes]);

  const handleNodeClick = useCallback(
    (event: Cytoscape.EventObject) => {
      const node = event.target.data("node");
      if (node) onNodeClick(node);
    },
    [onNodeClick]
  );

  const handleContextMenu = useCallback(
    (event: Cytoscape.EventObject) => {
      event.preventDefault();
      const node = event.target.data("node");
      if (node) {
        const newName = prompt(
          "Enter new name:",
          node.name || `Node ${node.id}`
        );
        if (newName) onRename(node.id, newName);

        const newIcon = prompt("Enter new icon (0, 1, 2):", node.icon?.toString() || "0");
        const newIconIndex = parseInt(newIcon || "0", 10); // Convert to number
        if (!isNaN(newIconIndex)) onChangeIcon(node.id, newIconIndex); // Update the icon dynamically
      }
    },
    [onRename, onChangeIcon]
  );

  const handleZoomIn = useCallback(() => {
    if (cy) cy.zoom(cy.zoom() * 1.2);
  }, [cy]);

  const handleZoomOut = useCallback(() => {
    if (cy) cy.zoom(cy.zoom() * 0.8);
  }, [cy]);

  const handleFitView = useCallback(() => {
    if (cy) cy.fit();
  }, [cy]);

  const initCytoscape = useCallback(
    (cyInstance: Cytoscape.Core) => {
      if (!cyInstance) return;
      setCy(cyInstance);
      cyInstance.removeListener("tap");
      cyInstance.removeListener("cxttap");
      cyInstance.on("tap", "node", handleNodeClick);
      cyInstance.on("cxttap", "node", handleContextMenu);

      if (elements.length > 0) {
        cyInstance.layout({
          name: "circle", // Circular layout for wheel graph
          padding: 50,
          animate: true,
        }).run();
      }
    },
    [handleNodeClick, handleContextMenu, elements]
  );

  useEffect(() => {
    return () => {
      if (cy) {
        cy.removeListener("tap");
        cy.removeListener("cxttap");
        cy.destroy();
      }
    };
  }, [cy]);

  if (!nodes) {
    return (
      <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center">
        <p>No nodes available</p>
      </div>
    );
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