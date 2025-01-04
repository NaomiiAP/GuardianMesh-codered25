import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { NetworkGraph } from './network/NetworkGraph';
import { ControlPanel } from './control/ControlPanel';
import { NotificationCenter } from './notifications/NotificationCenter';
import { NodeMetricsCard } from './metrics/NodeMetricsCard';
import { SimulationSettings } from '../types/simulation';
import { Node } from '../types/node';
import { mockNodes } from '../utils/mockData';
import { useNotifications } from '../hooks/useNotifications';
import { generateNode } from '../utils/nodeGenerator';

export function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { notifications, addNotification } = useNotifications();
  const [settings, setSettings] = useState<SimulationSettings>({
    nodeThreshold: 0.7,
    recoveryTimeout: 5000,
    faultInjectionRate: 0.3,
  });

  const handleAddNode = useCallback(() => {
    const newNode = generateNode();
    setNodes(prev => [...prev, newNode]);
    addNotification(
      'Node Added',
      `Node ${newNode.id} has been added to the network`,
      'info'
    );
  }, [addNotification]);

  const handleToggleSimulation = () => {
    setIsRunning(!isRunning);
    addNotification(
      'Simulation Status',
      `Simulation ${!isRunning ? 'started' : 'paused'}`,
    );
  };

  const handleReset = useCallback(() => {
    setNodes(mockNodes);
    setSelectedNode(null);
    addNotification('Simulation Reset', 'All nodes restored to initial state');
  }, [addNotification]);

  const handleInjectFault = useCallback(() => {
    if (!selectedNode) {
      addNotification(
        'Error',
        'Please select a node to inject fault',
        'error'
      );
      return;
    }

    setNodes(prev => prev.map(node => 
      node.id === selectedNode.id
        ? {
            ...node,
            status: 'compromised',
            metrics: {
              ...node.metrics,
              anomalyScore: 0.9,
              resourceUsage: 0.8,
              latency: 150,
            },
            lastUpdated: new Date().toISOString(),
          }
        : node
    ));

    addNotification(
      'Fault Injected',
      `Node ${selectedNode.id} has been compromised`,
      'error'
    );
  }, [selectedNode, addNotification]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <NotificationCenter notifications={notifications} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NetworkGraph 
              nodes={nodes}
              onNodeClick={setSelectedNode}
              onAddNode={handleAddNode}
            />
          </div>
          <div className="space-y-6">
            <ControlPanel
              settings={settings}
              onSettingsChange={setSettings}
              isRunning={isRunning}
              onToggleSimulation={handleToggleSimulation}
              onReset={handleReset}
              onInjectFault={handleInjectFault}
              selectedNode={selectedNode}
            />
            {selectedNode && (
              <NodeMetricsCard
                metrics={selectedNode.metrics}
                lastUpdated={selectedNode.lastUpdated}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}