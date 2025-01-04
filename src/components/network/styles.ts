import { Stylesheet } from 'cytoscape';

export const networkStyles: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#E5E7EB',
      'label': 'data(label)',
      'color': '#374151',
      'text-valign': 'center',
      'text-halign': 'center',
      'width': 40,
      'height': 40,
      'border-width': 2,
      'border-color': '#E5E7EB',
      'transition-property': 'background-color, border-color',
      'transition-duration': '0.3s'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#E5E7EB',
      'opacity': 0.6,
      'curve-style': 'bezier'
    }
  },
  {
    selector: 'node[status = "healthy"]',
    style: {
      'background-color': '#10B981',
      'border-color': '#059669'
    }
  },
  {
    selector: 'node[status = "compromised"]',
    style: {
      'background-color': '#EF4444',
      'border-color': '#DC2626'
    }
  },
  {
    selector: 'node[status = "isolated"]',
    style: {
      'background-color': '#F59E0B',
      'border-color': '#D97706',
      'border-style': 'dashed'
    }
  },
  {
    selector: 'node[status = "restored"]',
    style: {
      'background-color': '#6366F1',
      'border-color': '#4F46E5'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#3B82F6'
    }
  }
];