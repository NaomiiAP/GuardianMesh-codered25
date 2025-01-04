export type NodeStatus = 'healthy' | 'compromised' | 'isolated' | 'restored';

export interface NodeMetrics {
  latency: number;
  resourceUsage: number;
  anomalyScore: number;
}

export interface Node {
  id: string;
  status: NodeStatus;
  metrics: NodeMetrics;
  lastUpdated: string;
}