import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./Header";
import { NetworkGraph } from "./network/NetworkGraph";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { Node } from "../types/node";
import { mockNodes } from "../utils/mockData";
import { useNotifications } from "../hooks/useNotifications";
import { generateNode, resetNodeCounter } from "../utils/nodeGenerator";
import axios from "axios";

export function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [logOutput, setLogOutput] = useState<string | null>(null);
  const { notifications, addNotification } = useNotifications();

  useEffect(() => {
    resetNodeCounter();
  }, []);

  const handleAddNode = useCallback(() => {
    const newNode = generateNode();
    setNodes((prev) => {
      if (prev.some((node) => node.id === newNode.id)) {
        console.error("Duplicate node ID generated");
        return prev;
      }
      return [...prev, newNode];
    });
    addNotification(
      "Node Added",
      `Node ${newNode.id} has been added to the network`,
      "info"
    );
  }, [addNotification]);

  const handleRename = useCallback((nodeId: string, newName: string) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId ? { ...node, name: newName } : node
    ));
    addNotification("Node Updated", `Node ${nodeId} renamed to ${newName}`, "success");
  }, [addNotification]);

  const handleToggleSimulation = () => {
    setIsRunning(!isRunning);
    addNotification(
      "Simulation Status",
      `Simulation ${!isRunning ? "started" : "paused"}`
    );
  };

  const handleReset = useCallback(() => {
    setNodes(mockNodes);
    setSelectedNode(null);
    resetNodeCounter();
    addNotification("Simulation Reset", "All nodes restored to initial state");
  }, [addNotification]);

  const handleNodeClick = async (node: Node) => {
    setSelectedNode(node);
    try {
      const response = await axios.get(`http://localhost:5000/run-log${node.id}`);
      setLogOutput(response.data.output);
    } catch (error) {
      console.error("Error fetching log output:", error);
      setLogOutput("Error fetching log output");
    }
  };

  useEffect(() => {
    if (selectedNode && !nodes.some((node) => node.id === selectedNode.id)) {
      setSelectedNode(null);
    }
  }, [nodes, selectedNode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <NotificationCenter notifications={notifications} />
      <Header />
      <main className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-4">
        <div className="flex-grow flex items-center justify-center w-2/3 h-[60vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-white">
          <NetworkGraph
            nodes={nodes}
            onNodeClick={handleNodeClick}
            onAddNode={handleAddNode}
            onRename={handleRename}
          />
        </div>

        {selectedNode && (
          <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg overflow-y-auto max-h-[calc(100vh-100px)] text-white">
            <h2 className="text-xl font-bold mb-4">
              {selectedNode.name || `Node ${selectedNode.id}`} Details
            </h2>
            <p>
              <strong>Status:</strong> {selectedNode.status}
            </p>
            <p>
              <strong>Metrics:</strong>
            </p>
            <ul className="list-disc list-inside">
              <li>Anomaly Score: {selectedNode.metrics.anomalyScore}</li>
              <li>Resource Usage: {selectedNode.metrics.resourceUsage}</li>
              <li>Latency: {selectedNode.metrics.latency} ms</li>
            </ul>
            <div className="mt-4">
              <strong>Log Output:</strong>
              <pre className="bg-gray-700 p-2 rounded text-sm overflow-x-auto">
                {logOutput || "No output available"}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}