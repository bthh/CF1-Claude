import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CF1EventStream } from './CF1EventStream';
import { EventType } from './types';
import { useAuthStore } from '../../store/authStore';
import { useProposalStore } from '../../store/proposalStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useNotificationStore } from '../../store/notificationStore';

export interface UseEventStreamOptions {
  topics?: string[];
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useEventStream(options: UseEventStreamOptions = {}) {
  const queryClient = useQueryClient();
  const eventStreamRef = useRef<CF1EventStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Store hooks
  const authStore = useAuthStore();
  const proposalStore = useProposalStore();
  const portfolioStore = usePortfolioStore();
  const notificationStore = useNotificationStore();

  useEffect(() => {
    const eventStream = new CF1EventStream({
      url: import.meta.env.VITE_REALTIME_URL || 'ws://localhost:3001',
      auth: {
        token: authStore.token || undefined
      },
      topics: options.topics || [],
      onConnect: () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        options.onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        options.onDisconnect?.();
      },
      onError: (error) => {
        console.error('Event stream error:', error);
        options.onError?.(error);
      },
      onEvent: (event) => {
        handleEvent(event);
      }
    });

    eventStreamRef.current = eventStream;

    // Set up event handlers for different event types
    setupEventHandlers(eventStream);

    // Auto-connect if specified
    if (options.autoConnect !== false && authStore.isAuthenticated) {
      setConnectionStatus('connecting');
      eventStream.connect().catch(console.error);
    }

    // Cleanup
    return () => {
      eventStream.disconnect();
    };
  }, [authStore.token, authStore.isAuthenticated]);

  const handleEvent = (streamEvent: any) => {
    const { event } = streamEvent;

    // Update React Query cache based on event type
    switch (event.type) {
      case EventType.PROPOSAL_CREATED:
      case EventType.PROPOSAL_UPDATED:
        updateProposalCache(event);
        break;

      case EventType.INVESTMENT_MADE:
        updateInvestmentCache(event);
        break;

      case EventType.TOKEN_MINTED:
        updateTokenCache(event);
        break;

      case EventType.VOTE_CAST:
        updateVoteCache(event);
        break;

      case EventType.PRICE_UPDATE:
      case EventType.VOLUME_UPDATE:
        updateMarketCache(event);
        break;
    }

    // Update Zustand stores
    updateStores(event);

    // Show notifications for important events
    showNotification(event);
  };

  const updateProposalCache = (event: any) => {
    const proposalId = event.data.proposalId || event.data.id;
    
    // Invalidate and refetch proposal queries
    queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
    queryClient.invalidateQueries({ queryKey: ['proposals'] });

    // Optimistically update the cache if we have the data
    if (event.data.proposal) {
      queryClient.setQueryData(['proposal', proposalId], event.data.proposal);
    }
  };

  const updateInvestmentCache = (event: any) => {
    const { proposalId, investor, amount } = event.data;

    // Update proposal data
    queryClient.setQueryData(['proposal', proposalId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        current_investment: (old.current_investment || 0) + amount,
        investor_count: (old.investor_count || 0) + 1
      };
    });

    // Invalidate portfolio queries for the investor
    queryClient.invalidateQueries({ queryKey: ['portfolio', investor] });
    queryClient.invalidateQueries({ queryKey: ['investments', investor] });
  };

  const updateTokenCache = (event: any) => {
    const { proposalId, tokenAddress } = event.data;

    // Update proposal with token info
    queryClient.setQueryData(['proposal', proposalId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        token_address: tokenAddress,
        status: 'token_minted'
      };
    });
  };

  const updateVoteCache = (event: any) => {
    const { proposalId, voter, vote, weight } = event.data;

    // Update governance proposal
    queryClient.setQueryData(['governance-proposal', proposalId], (old: any) => {
      if (!old) return old;
      const voteUpdate = vote === 'yes' 
        ? { yes_votes: (old.yes_votes || 0) + weight }
        : { no_votes: (old.no_votes || 0) + weight };
      
      return { ...old, ...voteUpdate };
    });

    // Invalidate voter's governance queries
    queryClient.invalidateQueries({ queryKey: ['governance', 'votes', voter] });
  };

  const updateMarketCache = (event: any) => {
    const { assetId, marketData } = event.data;

    // Update market data
    queryClient.setQueryData(['market', assetId], (old: any) => {
      if (!old) return marketData;
      return { ...old, ...marketData };
    });

    // Update asset lists that show market data
    queryClient.invalidateQueries({ queryKey: ['assets'] });
  };

  const updateStores = (event: any) => {
    switch (event.type) {
      case EventType.PROPOSAL_CREATED:
      case EventType.PROPOSAL_UPDATED:
        proposalStore.updateProposal(event.data.proposalId || event.data.id, event.data);
        break;

      case EventType.INVESTMENT_MADE:
        if (event.data.investor === authStore.user?.address) {
          portfolioStore.addTransaction({
            type: 'investment',
            assetId: event.data.proposalId,
            assetName: event.data.proposalName || 'Unknown Asset',
            amount: event.data.amount,
            shares: event.data.shares,
            timestamp: event.timestamp,
            status: 'completed'
          });
        }
        break;

      case EventType.SYSTEM_MAINTENANCE:
      case EventType.RATE_LIMIT_WARNING:
        notificationStore.addNotification({
          type: 'warning',
          title: 'System Alert',
          message: event.data.message
        });
        break;
    }
  };

  const showNotification = (event: any) => {
    // Show notifications for events relevant to the current user
    if (event.data.investor === authStore.user?.address) {
      switch (event.type) {
        case EventType.INVESTMENT_MADE:
          notificationStore.addNotification({
            type: 'success',
            title: 'Investment Confirmed',
            message: `Your investment of ${event.data.amount} has been confirmed`
          });
          break;

        case EventType.TOKEN_MINTED:
          notificationStore.addNotification({
            type: 'success',
            title: 'Tokens Minted',
            message: 'Your investment tokens have been minted successfully'
          });
          break;

        case EventType.LOCKUP_RELEASED:
          notificationStore.addNotification({
            type: 'info',
            title: 'Lockup Released',
            message: 'Your tokens are now unlocked and transferable'
          });
          break;
      }
    }
  };

  const setupEventHandlers = (eventStream: CF1EventStream) => {
    // Proposal events
    eventStream.on(EventType.PROPOSAL_CREATED, (event) => {
      console.log('New proposal created:', event);
    });

    eventStream.on(EventType.INVESTMENT_MADE, (event) => {
      console.log('New investment:', event);
    });

    // Market events
    eventStream.on(EventType.PRICE_UPDATE, (event) => {
      console.log('Price update:', event);
    });

    // System events
    eventStream.on(EventType.RATE_LIMIT_WARNING, (event) => {
      console.warn('Rate limit warning:', event);
    });
  };

  const connect = () => {
    if (eventStreamRef.current && !isConnected) {
      setConnectionStatus('connecting');
      return eventStreamRef.current.connect();
    }
    return Promise.resolve();
  };

  const disconnect = () => {
    if (eventStreamRef.current) {
      eventStreamRef.current.disconnect();
    }
  };

  const subscribe = (topics: string | string[]) => {
    if (eventStreamRef.current) {
      eventStreamRef.current.subscribe(topics);
    }
  };

  const unsubscribe = (topics: string | string[]) => {
    if (eventStreamRef.current) {
      eventStreamRef.current.unsubscribe(topics);
    }
  };

  const requestSnapshot = (topic: string) => {
    if (eventStreamRef.current) {
      return eventStreamRef.current.requestSnapshot(topic);
    }
    return Promise.reject(new Error('Not connected'));
  };

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    requestSnapshot
  };
}