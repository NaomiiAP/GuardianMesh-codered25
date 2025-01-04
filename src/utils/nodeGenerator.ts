import { Node } from '../types/node';

let nodeCounter = 4; // Start after existing mock nodes

export function generateNode(): Node {
  const id = String(nodeCounter++);
  return {
    id,
    status: 'healthy',
    metrics: {
      latency: Math.floor(Math.random() * 50) + 10,
      resourceUsage: Math.random() * 0.3,
      anomalyScore: Math.random() * 0.2,
    },
    lastUpdated: new Date().toISOString(),
  };
}