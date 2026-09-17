import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal
} from 'react-native';
import {
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Building,
  Utensils,
  Zap,
  BookOpen,
  Info,
  X
} from 'lucide-react-native';
import { usePactHaptics } from '../hooks/usePactHaptics';
import { useTheme } from '../hooks/useTheme';
import { usePlaceRecommendationsStore, type PlaceCategoryFilter } from '../store/usePlaceRecommendationsStore.ts';
import { fetchDestinationStory, type DestinationStoryResult } from '../lib/ai/aiAdvisorClient.ts';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';

interface ExplorePlaceSectionProps {
  destination: string;
}

export const ExplorePlaceSection: React.FC<ExplorePlaceSectionProps> = ({ destination }) => {
  const haptics = usePactHaptics();
  const { theme, isDarkMode } = useTheme();
  const fontHeader = fontDisplay;

  const {
    recommendations,
    loading,
    expanded,
    categoryFilter,
    loadRecommendations,
    toggleExpanded,
    setCategoryFilter
  } = usePlaceRecommendationsStore();

  const key = destination.trim().toLowerCase();
  const isExpanded = expanded[key] || false;
  const isLoading = loading[key] || false;
  const data = recommendations[key];
  const currentFilter = categoryFilter[key] || 'all';

  // Storyteller modal state
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyData, setStoryData] = useState<DestinationStoryResult | null>(null);

  const handleToggle = () => {
    haptics.tap();
    toggleExpanded(destination);
    if (!isExpanded && !data) {
      loadRecommendations(destination);
    }
  };

  const handleOpenStory = async () => {
    haptics.action();
    setStoryModalVisible(true);
    if (!storyData || storyData.destination.toLowerCase() !== key) {
      setStoryLoading(true);
      try {
        const story = await fetchDestinationStory(destination);
        setStoryData(story);
      } catch (err) {
        console.error('Failed to load destination story:', err);
      } finally {
        setStoryLoading(false);
      }
    }
  };

  const filteredPlaces = (data?.places || []).filter((p) => {
    if (currentFilter === 'all') return true;
    return p.category === currentFilter;
  });

  return (
    <View style={[styles.container, { borderColor: isDarkMode ? 'rgba(61, 224, 160, 0.2)' : 'rgba(0,0,0,0.1)' }]}>
      {/* Expand/Collapse Header Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleToggle}
        style={[styles.headerBtn, { backgroundColor: isDarkMode ? '#12141F' : '#F4F3F0' }]}
        accessibilityLabel={'Explore ' + destination}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Compass size={14} color="#3DE0A0" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: fontUIBold }]}>
              Explore {destination}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary, fontFamily: fontUI }]}>
              Real hotels, restaurants & Gemini narration
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {data?.cached && (
            <View style={styles.cachedPill}>
              <Zap size={9} color="#D4AF37" fill="#D4AF37" />
              <Text style={[styles.cachedText, { fontFamily: fontUIBold }]}>Cached</Text>
            </View>
          )}
          {isExpanded ? (
            <ChevronUp size={16} color="#8B8D98" />
          ) : (
            <ChevronDown size={16} color="#8B8D98" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Content View */}
      {isExpanded && (
        <View style={[styles.expandedContent, { backgroundColor: isDarkMode ? '#0B0D14' : '#FFFFFF' }]}>
          {isLoading && !data ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3DE0A0" />
              <Text style={[styles.loadingText, { color: theme.textSecondary, fontFamily: fontUI }]}>
                Querying Google Places & generating narration...
              </Text>
            </View>
          ) : data ? (
            <>
              {/* Gemini Travel Narration Card */}
              {data.aiSummary ? (
                <View style={[styles.narrationCard, { borderColor: 'rgba(61, 224, 160, 0.25)' }]}>
                  <View style={styles.narrationHeader}>
                    <View style={styles.geminiBadge}>
                      <Sparkles size={11} color="#3DE0A0" />
                      <Text style={[styles.geminiBadgeText, { fontFamily: fontUIBold }]}>
                        Gemini Travel Narration
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => loadRecommendations(destination, true)}
                      style={styles.refreshIconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Refresh places"
                    >
                      <RefreshCw size={12} color="#8B8D98" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.narrationText, { color: theme.textPrimary, fontFamily: fontUI }]}>
                    {data.aiSummary}
                  </Text>

                  {/* Step 4: "Tell me about this place" AI Storyteller trigger */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenStory}
                    style={[styles.storyBtn, { backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.3)' }]}
                    accessibilityLabel={"Tell me about " + destination}
                  >
                    <BookOpen size={13} color="#D4AF37" />
                    <Text style={[styles.storyBtnText, { fontFamily: fontUIBold }]}>
                      Tell me about {destination}
                    </Text>
                    <Sparkles size={11} color="#D4AF37" />
                  </TouchableOpacity>

                  {/* Safety Tip Callout */}
                  {data.safetyNote && (
                    <View style={styles.safetyRow}>
                      <ShieldCheck size={12} color="#3DE0A0" style={{ marginTop: 1, marginRight: 5 }} />
                      <Text style={[styles.safetyText, { color: theme.textSecondary, fontFamily: fontUI }]}>
                        <Text style={{ fontFamily: fontUIBold, color: '#3DE0A0' }}>Group Safety Tip: </Text>
                        {data.safetyNote}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}

              {/* Filter Pills */}
              <View style={styles.filterRow}>
                {(['all', 'stay', 'dining'] as PlaceCategoryFilter[]).map((filter) => {
                  const active = currentFilter === filter;
                  let label = 'All Places';
                  let Icon = Compass;
                  if (filter === 'stay') {
                    label = 'Stays & Villas';
                    Icon = Building;
                  } else if (filter === 'dining') {
                    label = 'Restaurants';
                    Icon = Utensils;
                  }

                  return (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => {
                        haptics.tap();
                        setCategoryFilter(destination, filter);
                      }}
                      style={[
                        styles.filterChip,
                        active
                          ? { backgroundColor: '#3DE0A0', borderColor: '#3DE0A0' }
                          : { backgroundColor: isDarkMode ? '#13151E' : '#EAE8E4', borderColor: isDarkMode ? '#222636' : '#DAD6CF' }
                      ]}
                    >
                      <Icon size={11} color={active ? '#090A0F' : theme.textSecondary} style={{ marginRight: 4 }} />
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? '#090A0F' : theme.textSecondary, fontFamily: fontUIBold }
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Places List */}
              <View style={styles.placesList}>
                {filteredPlaces.map((place) => (
                  <View
                    key={place.id}
                    style={[
                      styles.placeCard,
                      { backgroundColor: isDarkMode ? '#13151E' : '#F9F8F6', borderColor: isDarkMode ? '#222636' : '#E5E2DC' }
                    ]}
                  >
                    <View style={styles.placeHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.placeName, { color: theme.textPrimary, fontFamily: fontUIBold }]}>
                          {place.name}
                        </Text>
                        <View style={styles.placeMetaRow}>
                          <View style={styles.ratingBadge}>
                            <Star size={10} color="#D4AF37" fill="#D4AF37" />
                            <Text style={[styles.ratingText, { fontFamily: fontUIBold }]}>
                              {place.rating.toFixed(1)}
                            </Text>
                            <Text style={[styles.reviewsCount, { color: theme.textSecondary, fontFamily: fontUI }]}>
                              ({place.userRatingsTotal})
                            </Text>
                          </View>
                          {place.priceLevel ? (
                            <Text style={[styles.priceLevelText, { color: '#3DE0A0', fontFamily: fontUIBold }]}>
                              •  {place.priceLevel}
                            </Text>
                          ) : null}
                          <View style={[styles.categoryTag, { backgroundColor: isDarkMode ? '#1F2233' : '#E8E6E1' }]}>
                            <Text style={[styles.categoryTagText, { color: theme.textSecondary, fontFamily: fontUIBold }]}>
                              {place.category === 'stay' ? 'Stay' : place.category === 'dining' ? 'Dining' : 'Activity'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Step 5: Review-Derived Practical Note ("Good to know") */}
                    {place.reviewNote ? (
                      <View style={[styles.reviewNoteBox, { backgroundColor: isDarkMode ? '#181B26' : '#F2EFEB', borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.35)' }]}>
                        <Info size={11} color="#D4AF37" style={{ marginTop: 2, marginRight: 5 }} />
                        <Text style={[styles.reviewNoteText, { color: theme.textSecondary, fontFamily: fontUI }]}>
                          <Text style={{ fontFamily: fontUIBold, color: '#D4AF37' }}>Good to know: </Text>
                          {place.reviewNote}
                        </Text>
                      </View>
                    ) : null}

                    {/* Address Line */}
                    <View style={styles.addressRow}>
                      <MapPin size={10} color="#8B8D98" style={{ marginTop: 1, marginRight: 4 }} />
                      <Text style={[styles.addressText, { color: theme.textSecondary, fontFamily: fontUI }]} numberOfLines={1}>
                        {place.address}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>
      )}

      {/* Step 4: AI Storyteller Modal Dialog */}
      <Modal
        visible={storyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.storyModalCard, { backgroundColor: isDarkMode ? '#12141F' : '#FFFFFF', borderColor: isDarkMode ? '#2A2E42' : '#E0DDD7' }]}>
            {/* Modal Header */}
            <View style={styles.storyModalHeader}>
              <View style={styles.storyHeaderBadge}>
                <BookOpen size={14} color="#D4AF37" />
                <Text style={[styles.storyHeaderTitle, { color: theme.textPrimary, fontFamily: fontHeader }]}>
                  About {destination}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  haptics.tap();
                  setStoryModalVisible(false);
                }}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#8B8D98" />
              </TouchableOpacity>
            </View>

            {storyLoading ? (
              <View style={styles.storyLoadingBox}>
                <ActivityIndicator size="small" color="#D4AF37" />
                <Text style={[styles.storyLoadingText, { color: theme.textSecondary, fontFamily: fontUI }]}>
                  Unfolding the story of {destination}...
                </Text>
              </View>
            ) : storyData ? (
              <View style={styles.storyContentScroll}>
                {/* Main Story Narrative */}
                <Text style={[styles.storyNarrativeText, { color: theme.textPrimary, fontFamily: fontUI }]}>
                  {storyData.story}
                </Text>

                {/* Cultural Tip */}
                {storyData.culturalTip && (
                  <View style={[styles.storyAnchorBox, { backgroundColor: isDarkMode ? '#181C2B' : '#F5F3EF', borderColor: 'rgba(61, 224, 160, 0.25)' }]}>
                    <View style={styles.storyAnchorHeader}>
                      <ShieldCheck size={12} color="#3DE0A0" />
                      <Text style={[styles.storyAnchorTitle, { color: '#3DE0A0', fontFamily: fontUIBold }]}>
                        Group Cultural Tip
                      </Text>
                    </View>
                    <Text style={[styles.storyAnchorBody, { color: theme.textSecondary, fontFamily: fontUI }]}>
                      {storyData.culturalTip}
                    </Text>
                  </View>
                )}

                {/* Historical Anchor */}
                {storyData.historicalContext && (
                  <View style={[styles.storyAnchorBox, { backgroundColor: isDarkMode ? '#1C1914' : '#FAF6EE', borderColor: 'rgba(212, 175, 55, 0.25)' }]}>
                    <View style={styles.storyAnchorHeader}>
                      <Sparkles size={12} color="#D4AF37" />
                      <Text style={[styles.storyAnchorTitle, { color: '#D4AF37', fontFamily: fontUIBold }]}>
                        Historical Anchor
                      </Text>
                    </View>
                    <Text style={[styles.storyAnchorBody, { color: theme.textSecondary, fontFamily: fontUI }]}>
                      {storyData.historicalContext}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => setStoryModalVisible(false)}
              style={[styles.storyCloseBtn, { backgroundColor: '#3DE0A0' }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.storyCloseBtnText, { fontFamily: fontUIBold }]}>
                Back to Circle Hub
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
    borderRadius: 8,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 10.5,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cachedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  cachedText: {
    fontSize: 9.5,
    color: '#D4AF37',
  },
  expandedContent: {
    padding: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 11.5,
  },
  narrationCard: {
    backgroundColor: 'rgba(61, 224, 160, 0.04)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  narrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  geminiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  geminiBadgeText: {
    fontSize: 11,
    color: '#3DE0A0',
  },
  refreshIconBtn: {
    padding: 2,
  },
  narrationText: {
    fontSize: 11.5,
    lineHeight: 16.5,
    letterSpacing: -0.1,
  },
  storyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  storyBtnText: {
    fontSize: 11,
    color: '#D4AF37',
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  safetyText: {
    fontSize: 10.5,
    lineHeight: 14.5,
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 10.5,
  },
  placesList: {
    gap: 8,
  },
  placeCard: {
    borderRadius: 7,
    borderWidth: 1,
    padding: 9,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  placeName: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  placeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
  },
  ratingText: {
    fontSize: 10.5,
    color: '#D4AF37',
  },
  reviewsCount: {
    fontSize: 9.5,
  },
  priceLevelText: {
    fontSize: 10.5,
  },
  categoryTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 9,
  },
  reviewNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 6,
  },
  reviewNoteText: {
    fontSize: 10,
    lineHeight: 13.5,
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  addressText: {
    fontSize: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  storyModalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  storyHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storyHeaderTitle: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  storyLoadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  storyLoadingText: {
    fontSize: 12,
  },
  storyContentScroll: {
    marginVertical: 12,
    gap: 10,
  },
  storyNarrativeText: {
    fontSize: 12.5,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  storyAnchorBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  storyAnchorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  storyAnchorTitle: {
    fontSize: 11,
  },
  storyAnchorBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  storyCloseBtn: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  storyCloseBtnText: {
    fontSize: 12.5,
    color: '#090A0F',
  },
});
