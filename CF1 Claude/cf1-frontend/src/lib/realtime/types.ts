export const EventType = {
  // Blockchain Events
  PROPOSAL_CREATED: 'proposal.created',
  PROPOSAL_UPDATED: 'proposal.updated',
  INVESTMENT_MADE: 'investment.made',
  TOKEN_MINTED: 'token.minted',
  LOCKUP_RELEASED: 'lockup.released',
  
  // Market Events
  PRICE_UPDATE: 'market.price',
  VOLUME_UPDATE: 'market.volume',
  LIQUIDITY_CHANGE: 'market.liquidity',
  TRADE_EXECUTED: 'market.trade',
  
  // Governance Events
  VOTE_CAST: 'governance.vote',
  PROPOSAL_EXECUTED: 'governance.executed',
  DELEGATION_CHANGED: 'governance.delegation',
  
  // System Events
  SYSTEM_MAINTENANCE: 'system.maintenance',
  RATE_LIMIT_WARNING: 'system.ratelimit',
  CONNECTION_STATUS: 'system.connection',
  HEALTH_CHECK: 'system.health'
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

export interface Event {
  id: string;
  type: EventType;
  timestamp: string;
  data: any;
  metadata?: EventMetadata;
}

export interface EventMetadata {
  source: string;
  version: string;
  correlationId?: string;
  causationId?: string;
}

export interface StreamEvent {
  topic: string;
  event: Event;
  timestamp: number;
}

// Topic patterns
export const TopicPatterns = {
  // Wildcard patterns
  ALL: '*',
  ALL_PROPOSALS: 'proposal.*',
  ALL_MARKET: 'market.*',
  ALL_GOVERNANCE: 'governance.*',
  
  // Entity-specific patterns
  proposal: (id: string) => `proposal.${id}`,
  asset: (id: string) => `asset.${id}`,
  user: (id: string) => `user.${id}`,
  
  // Event type patterns
  eventType: (type: EventType) => type
};

// Helper to parse event types
export function parseEventType(type: string): {
  category: string;
  action: string;
} {
  const [category, action] = type.split('.');
  return { category, action };
}

// Helper to check if event matches topic pattern
export function matchesTopic(event: Event, pattern: string): boolean {
  if (pattern === '*') return true;
  
  if (pattern.endsWith('.*')) {
    const category = pattern.slice(0, -2);
    return event.type.startsWith(category + '.');
  }
  
  return event.type === pattern;
}