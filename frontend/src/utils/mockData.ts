import { Node } from '../types/node';

export const mockNodes: Node[] = [
  {
    id: '1',
    status: 'healthy',
    metrics: { latency: 10, resourceUsage: 0.3, anomalyScore: 0.1 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    status: 'healthy',
    metrics: { latency: 15, resourceUsage: 0.2, anomalyScore: 0.1 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    status: 'healthy',
    metrics: { latency: 12, resourceUsage: 0.25, anomalyScore: 0.15 },
    lastUpdated: new Date().toISOString(),
  },
];