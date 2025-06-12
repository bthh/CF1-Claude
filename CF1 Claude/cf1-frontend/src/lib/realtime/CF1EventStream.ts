import { io, Socket } from 'socket.io-client';
import { EventType } from './types';

export interface CF1EventStreamConfig {
  url: string;
  auth?: {
    token?: string;
    reconnectToken?: string;
  };
  topics?: string[];
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onEvent?: (event: StreamEvent) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onReconnect?: (attemptNumber: number) => void;
  onError?: (error: Error) => void;
}

export interface StreamEvent {
  topic: string;
  event: {
    id: string;
    type: EventType;
    timestamp: string;
    data: any;
    metadata?: any;
  };
  timestamp: number;
}

export class CF1EventStream {
  private socket: Socket | null = null;
  private config: Required<CF1EventStreamConfig>;
  private subscriptions: Set<string> = new Set();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectToken: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private missedEventQueue: StreamEvent[] = [];
  private isProcessingMissedEvents = false;

  constructor(config: CF1EventStreamConfig) {
    this.config = {
      autoReconnect: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      topics: [],
      onEvent: () => {},
      onConnect: () => {},
      onDisconnect: () => {},
      onReconnect: () => {},
      onError: () => {},
      ...config,
      auth: config.auth || {}
    };

    if (this.config.topics.length > 0) {
      this.config.topics.forEach(topic => this.subscriptions.add(topic));
    }
  }

  /**
   * Connect to the event stream
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // Create socket connection
      this.socket = io(this.config.url, {
        transports: ['websocket', 'polling'],
        auth: {
          token: this.config.auth?.token,
          reconnectToken: this.reconnectToken || this.config.auth?.reconnectToken
        },
        query: {
          version: '1.0.0'
        }
      });

      // Connection handlers
      this.socket.on('connect', () => {
        console.log('Connected to CF1 event stream');
        this.config.onConnect();
        
        // Subscribe to topics
        if (this.subscriptions.size > 0) {
          this.subscribeToTopics(Array.from(this.subscriptions));
        }
        
        resolve();
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('Disconnected from CF1 event stream:', reason);
        this.config.onDisconnect(reason);
        
        if (this.config.autoReconnect && reason !== 'io client disconnect') {
          this.scheduleReconnect();
        }
      });

      this.socket.on('error', (error: any) => {
        console.error('Event stream error:', error);
        this.config.onError(new Error(error));
        reject(error);
      });

      // Event handlers
      this.socket.on('event', (data: StreamEvent) => {
        this.handleEvent(data);
      });

      this.socket.on('snapshot', (data: any) => {
        this.handleSnapshot(data);
      });

      this.socket.on('reconnect-token', (data: { token: string; expiresAt: number }) => {
        this.reconnectToken = data.token;
        // Store in localStorage for page refresh scenarios
        localStorage.setItem('cf1-reconnect-token', data.token);
        localStorage.setItem('cf1-reconnect-expires', data.expiresAt.toString());
      });

      this.socket.on('missed-events', (data: { events: StreamEvent[]; from: number; to: number }) => {
        console.log(`Received ${data.events.length} missed events`);
        this.queueMissedEvents(data.events);
      });

      this.socket.on('connected', (data: any) => {
        console.log('Server acknowledged connection:', data);
      });

      this.socket.on('subscribed', (data: { topics: string[]; timestamp: number }) => {
        console.log('Subscribed to topics:', data.topics);
      });

      this.socket.on('ping', (_data: { timestamp: number }) => {
        this.socket?.emit('pong', { timestamp: Date.now() });
      });
    });
  }

  /**
   * Disconnect from the event stream
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to topics
   */
  subscribe(topics: string | string[]): void {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    
    topicsArray.forEach(topic => this.subscriptions.add(topic));
    
    if (this.socket?.connected) {
      this.subscribeToTopics(topicsArray);
    }
  }

  /**
   * Unsubscribe from topics
   */
  unsubscribe(topics: string | string[]): void {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    
    topicsArray.forEach(topic => this.subscriptions.delete(topic));
    
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', topicsArray);
    }
  }

  /**
   * Add event handler for specific event types
   */
  on(eventType: EventType | string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Remove event handler
   */
  off(eventType: EventType | string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Request state snapshot for a topic
   */
  requestSnapshot(topic: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Snapshot request timeout'));
      }, 5000);

      this.socket.once('snapshot', (data: any) => {
        clearTimeout(timeout);
        if (data.topic === topic) {
          resolve(data.data);
        }
      });

      this.socket.emit('request-snapshot', topic);
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  // Private methods

  private subscribeToTopics(topics: string[]): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', topics);
    }
  }

  private handleEvent(data: StreamEvent): void {
    // Call global handler
    this.config.onEvent(data);

    // Call specific event type handlers
    const handlers = this.eventHandlers.get(data.event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data.event);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }

    // Call wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(data.event);
        } catch (error) {
          console.error('Wildcard handler error:', error);
        }
      });
    }
  }

  private handleSnapshot(data: any): void {
    console.log('Received snapshot:', data);
  }

  private scheduleReconnect(attempt: number = 1): void {
    if (attempt > this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, attempt - 1),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${attempt} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.config.onReconnect(attempt);
      
      // Check for stored reconnect token
      const storedToken = localStorage.getItem('cf1-reconnect-token');
      const storedExpiry = localStorage.getItem('cf1-reconnect-expires');
      
      if (storedToken && storedExpiry && parseInt(storedExpiry) > Date.now()) {
        this.reconnectToken = storedToken;
      }

      this.connect().catch(() => {
        this.scheduleReconnect(attempt + 1);
      });
    }, delay);
  }

  private queueMissedEvents(events: StreamEvent[]): void {
    this.missedEventQueue = this.missedEventQueue.concat(events);
    this.processMissedEvents();
  }

  private async processMissedEvents(): Promise<void> {
    if (this.isProcessingMissedEvents || this.missedEventQueue.length === 0) {
      return;
    }

    this.isProcessingMissedEvents = true;

    // Process events in order with small delay to prevent overwhelming the UI
    while (this.missedEventQueue.length > 0) {
      const event = this.missedEventQueue.shift()!;
      this.handleEvent(event);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessingMissedEvents = false;
  }
}

type EventHandler = (event: any) => void;