import { create } from 'zustand';
import {
  type PlaceItem,
  type PlaceRecommendationsResult,
  fetchPlaceRecommendations,
  VERIFIED_REAL_PLACES
} from '../lib/places/placeRecommendationsClient.ts';

export type PlaceCategoryFilter = 'all' | 'stay' | 'dining' | 'activity';

interface PlaceRecommendationsState {
  recommendations: Record<string, PlaceRecommendationsResult>;
  loading: Record<string, boolean>;
  expanded: Record<string, boolean>;
  categoryFilter: Record<string, PlaceCategoryFilter>;
  apiCallCount: Record<string, number>;

  // Actions
  loadRecommendations: (destination: string, forceRefresh?: boolean) => Promise<PlaceRecommendationsResult>;
  toggleExpanded: (destination: string) => void;
  setCategoryFilter: (destination: string, filter: PlaceCategoryFilter) => void;
  getRecommendations: (destination: string) => PlaceRecommendationsResult | null;
}

export const usePlaceRecommendationsStore = create<PlaceRecommendationsState>((set, get) => ({
  recommendations: {},
  loading: {},
  expanded: {},
  categoryFilter: {},
  apiCallCount: {},

  toggleExpanded: (destination: string) => {
    const key = destination.trim().toLowerCase();
    set((state) => ({
      expanded: {
        ...state.expanded,
        [key]: !state.expanded[key]
      }
    }));
  },

  setCategoryFilter: (destination: string, filter: PlaceCategoryFilter) => {
    const key = destination.trim().toLowerCase();
    set((state) => ({
      categoryFilter: {
        ...state.categoryFilter,
        [key]: filter
      }
    }));
  },

  getRecommendations: (destination: string) => {
    if (!destination) return null;
    const key = destination.trim().toLowerCase();
    const result = get().recommendations[key];
    if (result && Array.isArray(result.places)) {
      return result;
    }
    return null;
  },

  loadRecommendations: async (destination: string, forceRefresh = false) => {
    const key = destination.trim().toLowerCase();
    const current = get().recommendations[key];

    // If already in memory and not forced, return cached directly
    if (!forceRefresh && current) {
      return current;
    }

    set((state) => ({
      loading: { ...state.loading, [key]: true },
      apiCallCount: { ...state.apiCallCount, [key]: (state.apiCallCount[key] || 0) + 1 }
    }));

    try {
      const result = await fetchPlaceRecommendations(destination, forceRefresh);
      set((state) => ({
        recommendations: {
          ...state.recommendations,
          [key]: result
        },
        loading: { ...state.loading, [key]: false }
      }));
      return result;
    } catch (err) {
      set((state) => ({
        loading: { ...state.loading, [key]: false }
      }));
      // Fallback object on network error
      const fallbackData = VERIFIED_REAL_PLACES[key] || VERIFIED_REAL_PLACES['goa'];
      const fallbackResult: PlaceRecommendationsResult = {
        destination,
        cached: true,
        aiSummary: fallbackData.aiSummary,
        safetyNote: fallbackData.safetyNote,
        places: fallbackData.places,
        fetchedAt: new Date().toISOString(),
        source: 'pact_verified_market'
      };
      set((state) => ({
        recommendations: {
          ...state.recommendations,
          [key]: fallbackResult
        }
      }));
      return fallbackResult;
    }
  }
}));