import React, { useState } from "react";
import { NetworkGraph } from "./NetworkGraph"; // Adjust the import path if necessary
import { Node } from '/types/node';
// Adjust the import path if necessary

const ParentComponent = () => {
  // Manage the nodes state, including the icon, name, and status
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, name: "Node 1", icon: 0, status: "healthy" },
    { id: 2, name: "Node 2", icon: 1, status: "compromised" },
    { id: 3, name: "Node 3", icon: 2, status: "isolated" },
    { id: 4, name: "Node 4", icon: 0, status: "restored" }
  ]);

  // Function to handle when a node is clicked
  const handleNodeClick = (node: Node) => {
    console.log("Node clicked:", node);
  };

  // Function to add a new node (implement your logic here as needed)
  const handleAddNode = () => {
    const newNode: Node = {
      id: nodes.length + 1,
      name: `Node ${nodes.length + 1}`,
      icon: 0,
      status: "healthy"
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  // Function to rename a node
  const handleRename = (nodeId: string, newName: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id.toString() === nodeId ? { ...node, name: newName } : node
      )
    );
  };

  // Function to change a node's icon
  const onChangeIcon = (nodeId: string, newIcon: number) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id.toString() === nodeId ? { ...node, icon: newIcon } : node
      )
    );
  };

  return (
    <div>
      <NetworkGraph
        nodes={nodes} // Pass the nodes to the child component
        onNodeClick={handleNodeClick} // Pass the node click handler
        onAddNode={handleAddNode} // Pass the add node handler
        onRename={handleRename} // Pass the rename handler
        onChangeIcon={onChangeIcon} // Pass the change icon handler
      />
    </div>
  );
};

export default ParentComponent;