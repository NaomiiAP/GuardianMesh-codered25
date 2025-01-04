import React from 'react';
import { Node } from '../../types/node';

interface NetworkNodeProps {
  node: Node;
  onClick: (node: Node) => void;
}

export function NetworkNode({ node, onClick }: NetworkNodeProps) {
  const statusColors = {
    healthy: 'bg-node-healthy',
    compromised: 'bg-node-compromised',
    isolated: 'bg-node-isolated',
    restored: 'bg-node-restored',
  };

  return (
    <div
      onClick={() => onClick(node)}
      className={`${statusColors[node.status]} w-10 h-10 rounded-full cursor-pointer 
        flex items-center justify-center text-white font-medium
        ${node.status === 'isolated' ? 'border-2 border-dashed border-gray-400' : ''}`}
    >
      {node.id}
    </div>
  );
}