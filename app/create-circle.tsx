import { getTierForMemberCount, isValidGroupSize, MAX_GROUP_MEMBERS } from '../src/lib/pricing/groupPricing';
import { useTheme } from '../src/hooks/useTheme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  BackHandler,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore, CurrencyCode, CURRENCIES } from '../src/store/useGatherlyStore';
import { useCircleStore, MemberStatus } from '../src/store/useCircleStore';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { ArrowLeft, Plus, Sparkles, Minus, X, CheckCircle2, Award, ChevronRight, Globe } from 'lucide-react-native';
import { getActiveUserName, getActiveUserId } from '../src/lib/user/identity';
import CurrencyCountryPicker, { SUPPORTED_CURRENCIES, CurrencyItem } from '../src/components/CurrencyCountryPicker';

const GROUP_TYPES = ['College Friends', 'Family', 'Best Friends', 'Office'];
const QUICK_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AED'];

export default function PactCreateJoinScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { createGroup, joinGroupByCode, subscriptionPlan, groups, currentUserId, addTripOption, setCurrency } = useGatherlyStore();

  // Mode tab: 'create' | 'join'
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Join State
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Milestone Creation Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Name, Group Type & Size
  const [tripName, setTripName] = useState('');
  const [groupType, setGroupType] = useState<string>('College Friends');
  const [memberCount, setMemberCount] = useState('5');

  // Step 2: Destination Candidates Pool
  const [candidateInput, setCandidateInput] = useState('');
  const [candidates, setCandidates] = useState<string[]>(['Goa', 'Pune', 'Bengaluru']);

  // Step 3: Base Currency & Budget Range
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>('USD');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [budgetMin, setBudgetMin] = useState('300');
  const [budgetMax, setBudgetMax] = useState('1200');

  const activeCurrencyOption = SUPPORTED_CURRENCIES.find((c: CurrencyItem) => c.code === currencyCode) || {
    code: currencyCode,
    name: currencyCode,
    symbol: CURRENCIES[currencyCode]?.symbol || '$',
    flag: '🌐'
  };


  const [createError, setCreateError] = useState('');
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const liveTotal = parseInt(memberCount, 10) || 5;
  const liveTier = getTierForMemberCount(liveTotal);
  const exceedsCapacity = liveTotal > MAX_GROUP_MEMBERS;
  const isDemoUser = !currentUserId || currentUserId.startsWith('user-');
  const needsUpgrade = subscriptionPlan === 'free' && !isDemoUser && liveTotal > 8 && !exceedsCapacity;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const backAction = () => {
      if (activeTab === 'create' && step > 1) {
        setStep((s) => (s - 1) as 1 | 2 | 3);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeTab, step]);

  const handleAddCandidate = () => {
    const clean = candidateInput.trim();
    if (!clean) return;
    if (candidates.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setCandidateInput('');
      return;
    }
    triggerHaptic();
    setCandidates([...candidates, clean]);
    setCandidateInput('');
  };

  const handleRemoveCandidate = (target: string) => {
    triggerHaptic();
    setCandidates(candidates.filter((c) => c !== target));
  };

  const handleJoin = async () => {
    triggerHaptic();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Enter an invite code first');
      return;
    }

    try {
      const res = await joinGroupByCode(clean);
      if (res.success && res.group) {
        setError('');
        router.push(`/circle/${res.group.id}/hub` as any);
      } else {
        if (res.message === 'GROUP_FULL') {
          Alert.alert(
            'Circle Limit Reached',
            'This circle has reached its free limit (8 members). The organizer can upgrade to Pro for up to 24 seats.',
            [
              { text: 'Learn About Pro', onPress: () => router.push('/paywall') },
              { text: 'OK', style: 'cancel' }
            ]
          );
          setError('This circle has reached its free limit (8 members).');
        } else {
          setError('Circle not found. Check the 6-character code.');
        }
      }
    } catch (e: any) {
      if (e?.message === 'GROUP_FULL') {
        Alert.alert(
          'Circle Limit Reached',
          'This circle has reached its free limit (8 members). The organizer can upgrade to Pro for up to 24 seats.',
          [
            { text: 'Learn About Pro', onPress: () => router.push('/paywall') },
            { text: 'OK', style: 'cancel' }
          ]
        );
        setError('This circle has reached its free limit (8 members).');
      } else {
        setError('Circle not found. Check the 6-character code.');
      }
    }
  };

  const handleConfirmCreate = async () => {
    triggerHaptic();
    const name = tripName.trim() || 'Goa Beach Escape 2026';
    const total = parseInt(memberCount, 10) || 5;

    if (total > MAX_GROUP_MEMBERS) {
      const enterpriseMsg = "Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.";
      setCreateError(enterpriseMsg);
      Alert.alert("Enterprise Plan Required", enterpriseMsg);
      return;
    }

    if (!isValidGroupSize(total)) {
      setCreateError(`PACT circles currently support up to ${MAX_GROUP_MEMBERS} members.`);
      return;
    }

    if (subscriptionPlan === 'free' && total > 8) {
      const tierForTotal = getTierForMemberCount(total);
      setCreateError(`The Free tier supports up to 8 members. This trip needs the ${tierForTotal.name} (${tierForTotal.capacityLabel}).`);
      return;
    }
    
    if (subscriptionPlan === 'free' && !isDemoUser && groups.length >= 1) {
      setCreateError('The Free tier includes 1 active trip circle. Upgrade to a group pass to organize more circles.');
      return;
    }

    const bMinNum = parseInt(budgetMin, 10) || 0;
    const bMaxNum = parseInt(budgetMax, 10) || 1200;

    if (bMinNum > bMaxNum) {
      setCreateError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    const activeName = getActiveUserName();
    const activeId = getActiveUserId();

    setCreateError('');
    try {
      setCurrency(currencyCode);

      const newGroup = await createGroup({
        name,
        organizerName: activeName,
        organizerId: activeId,
        totalMembersCount: total,
        currencyCode,
        groupType
      });

      const groupId = newGroup?.id || `group-${Date.now()}`;
      setCreatedGroupId(groupId);

      // Add candidate destinations to circle state
      const candidateListToUse = candidates.length > 0 ? candidates : ['Goa', 'Pune', 'Bengaluru'];
      await Promise.all(
        candidateListToUse.map((cand, idx) =>
          addTripOption({
            id: `opt-${groupId}-${idx + 1}`,
            groupId,
            name: `${cand} Getaway`,
            destinationType: `${groupType} Candidate`,
            dateStart: '2026-10-14',
            dateEnd: '2026-10-19',
            budgetPerPerson: Math.round(bMaxNum * (idx === 0 ? 0.9 : idx === 1 ? 0.75 : 1.1)),
            tags: [groupType.toLowerCase().replace(/\s+/g, '-'), 'candidate'],
            description: `Organizer proposed candidate option for ${cand}.`
          })
        )
      );

      // Award celebratory micro-badge modal
      setShowCelebrationModal(true);
    } catch (err: any) {
      console.error('Failed to create circle:', err);
      setCreateError(err?.message || 'Failed to create circle. Please try again.');
    }
  };

  const handleFinishAndNavigate = () => {
    setShowCelebrationModal(false);
    const targetId = createdGroupId || 'circle-college-reunion-2026';
    router.push(`/circle/${targetId}/hub` as any);
  };

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.backgroundDeep, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 0 }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.phoneFrame, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header Navigation */}
          <View style={styles.navHeader}>
            <TouchableOpacity
              onPress={() => {
                if (step > 1 && activeTab === 'create') {
                  setStep((s) => (s - 1) as 1 | 2 | 3);
                } else if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/home');
                }
              }}
              activeOpacity={0.7}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={18} color="#8B8D98" />
            </TouchableOpacity>
            <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
              {activeTab === 'create' ? `Milestone ${step} of 3` : 'Join Circle'}
            </Text>
          </View>

          {/* Mode Tabs: Create vs Join */}
          <View style={[styles.tabToggleRow, { backgroundColor: theme.surfaceSubtle }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic();
                setActiveTab('create');
              }}
              style={[
                styles.tabToggleBtn,
                activeTab === 'create' && { backgroundColor: theme.surface, borderBottomWidth: 2, borderBottomColor: '#FF5A5F' }
              ]}
            >
              <Text style={[styles.tabToggleText, activeTab === 'create' ? { color: '#FF5A5F', fontWeight: '700' } : { color: theme.textSecondary }]}>
                Create New Trip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic();
                setActiveTab('join');
              }}
              style={[
                styles.tabToggleBtn,
                activeTab === 'join' && { backgroundColor: theme.surface, borderBottomWidth: 2, borderBottomColor: '#3DE0A0' }
              ]}
            >
              <Text style={[styles.tabToggleText, activeTab === 'join' ? { color: '#3DE0A0', fontWeight: '700' } : { color: theme.textSecondary }]}>
                Join With Code
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'create' ? (
            <>
              {/* Step Progress Bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }]} />
              </View>

              {/* Step Title Header */}
              <View style={styles.stepHeader}>
                <Text style={[styles.mainTitle, { color: theme.textPrimary }]}>
                  {step === 1 && 'Trip Name & Group Type'}
                  {step === 2 && 'Destination Candidates Pool'}
                  {step === 3 && 'Base Currency & Budget'}
                </Text>
                <Text style={[styles.mainSubtitle, { color: theme.textSecondary }]}>
                  {step === 1 && 'Set a clear title, group category, and estimated traveler headcount.'}
                  {step === 2 && 'Add candidate destinations for your group to evaluate during initial voting.'}
                  {step === 3 && 'Define group base currency and target budget limits.'}
                </Text>
              </View>

              {/* MILESTONE 1: Trip Name, Group Type & Travelers */}
              {step === 1 && (
                <View style={[styles.createCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {/* Trip Name Input */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TRIP NAME</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
                    ]}
                    value={tripName}
                    onChangeText={(t) => {
                      setTripName(t);
                      if (createError) setCreateError('');
                    }}
                    placeholder="e.g. Goa Beach Escape 2026"
                    placeholderTextColor="#454857"
                  />

                  {/* Group Type Selector Chips */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>GROUP TYPE</Text>
                  <View style={styles.groupTypeGrid}>
                    {GROUP_TYPES.map((gt) => {
                      const selected = groupType === gt;
                      return (
                        <TouchableOpacity
                          key={gt}
                          activeOpacity={0.75}
                          onPress={() => {
                            triggerHaptic();
                            setGroupType(gt);
                          }}
                          style={[
                            styles.groupTypeChip,
                            { backgroundColor: theme.surfaceSubtle, borderColor: selected ? '#FF5A5F' : theme.border },
                            selected && { backgroundColor: 'rgba(255, 90, 95, 0.12)' }
                          ]}
                        >
                          <Text style={[styles.groupTypeChipText, { color: selected ? '#FF5A5F' : theme.textPrimary }]}>
                            {gt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Member Count Stepper & Tier */}
                  <View style={[styles.memberStepperSection, { marginTop: 18 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ESTIMATED TRAVELERS</Text>
                      <Text style={[styles.tierTag, { color: liveTotal <= 8 ? '#3DE0A0' : (liveTotal <= 24 ? '#FF5A5F' : '#EF4444') }]}>
                        {liveTotal <= 24 ? `${liveTier.name} • ${liveTier.capacityLabel}` : 'Enterprise Custom Plan (25+)'}
                      </Text>
                    </View>
                    <View style={styles.stepperBox}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          const nextVal = Math.max(1, liveTotal - 1);
                          setMemberCount(String(nextVal));
                          triggerHaptic();
                        }}
                        style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                      >
                        <Minus size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.stepperCount, { color: theme.textPrimary, minWidth: 40, textAlign: 'center' }]}
                        value={memberCount}
                        onChangeText={(val) => {
                          setMemberCount(val);
                          if (createError) setCreateError('');
                        }}
                        keyboardType="numeric"
                        accessibilityLabel="Estimated Travelers Count"
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          const nextVal = liveTotal + 1;
                          setMemberCount(String(nextVal));
                          triggerHaptic();
                        }}
                        style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                      >
                        <Plus size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {Boolean(createError) && <Text style={styles.errorText}>{createError}</Text>}

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                      if (tripName.trim().length < 2) {
                        setCreateError('Please enter a trip name with at least 2 characters.');
                        return;
                      }
                      setCreateError('');
                      triggerHaptic();
                      setStep(2);
                    }}
                    style={styles.nextButton}
                  >
                    <Text style={styles.nextButtonText}>Continue to Destination Pool</Text>
                    <ChevronRight size={16} color="#050608" />
                  </TouchableOpacity>
                </View>
              )}

              {/* MILESTONE 2: Destination Candidates Pool */}
              {step === 2 && (
                <View style={[styles.createCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ADD CANDIDATE DESTINATIONS</Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={[
                        styles.textInput,
                        { flex: 1, marginBottom: 0, backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
                      ]}
                      value={candidateInput}
                      onChangeText={setCandidateInput}
                      onSubmitEditing={handleAddCandidate}
                      placeholder="e.g. Goa, Pune, Bengaluru"
                      placeholderTextColor="#454857"
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleAddCandidate}
                      style={[styles.addCandidateBtn, { backgroundColor: '#FF5A5F' }]}
                    >
                      <Plus size={18} color="#050608" />
                    </TouchableOpacity>
                  </View>

                  {/* Candidate Destination Tag Chips */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 16 }]}>
                    CURRENT CANDIDATES POOL ({candidates.length})
                  </Text>
                  <View style={styles.chipWrapper}>
                    {candidates.map((cand) => (
                      <View key={cand} style={[styles.candidateChip, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                        <Text style={[styles.candidateChipText, { color: theme.textPrimary }]}>{cand}</Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleRemoveCandidate(cand)}
                          style={styles.removeChipBtn}
                        >
                          <X size={12} color="#8B8D98" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                      triggerHaptic();
                      setStep(3);
                    }}
                    style={[styles.nextButton, { marginTop: 24 }]}
                  >
                    <Text style={styles.nextButtonText}>Continue to Currency & Budget</Text>
                    <ChevronRight size={16} color="#050608" />
                  </TouchableOpacity>
                </View>
              )}

              {/* MILESTONE 3: Base Currency & Approximate Budget Range */}
              {step === 3 && (
                <View style={[styles.createCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {/* Currency Selector */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>BASE CURRENCY</Text>

                  {/* Selected Currency Banner Trigger */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerHaptic();
                      setShowCurrencyModal(true);
                    }}
                    style={[
                      styles.currencyActiveCard,
                      { backgroundColor: theme.surfaceSubtle, borderColor: '#3DE0A0' }
                    ]}
                  >
                    <View style={styles.currencyActiveLeft}>
                      <Text style={styles.currencyFlag}>{activeCurrencyOption.flag}</Text>
                      <View>
                        <Text style={[styles.currencyActiveCode, { color: theme.textPrimary }]}>
                          {activeCurrencyOption.code} ({activeCurrencyOption.symbol})
                        </Text>
                        <Text style={[styles.currencyActiveName, { color: theme.textSecondary }]}>
                          {activeCurrencyOption.name}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.currencyChangeBadge}>
                      <Globe size={13} color="#3DE0A0" />
                      <Text style={styles.currencyChangeText}>Browse 25+ ▾</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Quick Currency Shortcuts */}
                  <View style={styles.quickCurrencyRow}>
                    {QUICK_CURRENCIES.map((qc) => {
                      const selected = currencyCode === qc;
                      const opt = SUPPORTED_CURRENCIES.find((c: CurrencyItem) => c.code === qc);
                      return (
                        <TouchableOpacity
                          key={qc}
                          activeOpacity={0.8}
                          onPress={() => {
                            triggerHaptic();
                            setCurrencyCodeState(qc);
                          }}
                          style={[
                            styles.quickCurrencyChip,
                            {
                              backgroundColor: selected ? 'rgba(61, 224, 160, 0.12)' : theme.surfaceSubtle,
                              borderColor: selected ? '#3DE0A0' : theme.border
                            }
                          ]}
                        >
                          <Text
                            style={[
                              styles.quickCurrencyText,
                              { color: selected ? '#3DE0A0' : theme.textPrimary }
                            ]}
                          >
                            {opt?.flag} {qc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Budget Range Inputs */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 18 }]}>
                    TARGET PER-PERSON BUDGET RANGE ({activeCurrencyOption.symbol})
                  </Text>
                  <View style={styles.budgetRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.subInputLabel, { color: theme.textSecondary }]}>MIN</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }]}
                        value={budgetMin}
                        onChangeText={setBudgetMin}
                        keyboardType="numeric"
                        placeholder="300"
                        placeholderTextColor="#454857"
                      />
                    </View>
                    <Text style={{ color: theme.textSecondary, marginTop: 22 }}>–</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.subInputLabel, { color: theme.textSecondary }]}>MAX</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }]}
                        value={budgetMax}
                        onChangeText={setBudgetMax}
                        keyboardType="numeric"
                        placeholder="1200"
                        placeholderTextColor="#454857"
                      />
                    </View>
                  </View>

                  {Boolean(createError) && <Text style={styles.errorText}>{createError}</Text>}

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleConfirmCreate}
                    style={[styles.createButton, { marginTop: 18 }]}
                  >
                    <Sparkles size={16} color="#050608" />
                    <Text style={styles.createButtonText}>Create Circle & Initialize Voting</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            /* Option 2: Join with a code Card */
            <View style={[styles.joinCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.joinIconBox}>
                  <Svg width="20" height="20" viewBox="0 0 20 20">
                    <Path
                      d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 8.5l3 3"
                      stroke="#3DE0A0"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>Join with a code</Text>
                  <Text style={[styles.cardSubtext, { color: theme.textSecondary }]}>Ask your trip organizer for their code</Text>
                </View>
              </View>

              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
                  error ? { borderColor: '#E0484D' } : {}
                ]}
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="e.g. GOA-4F82"
                placeholderTextColor="#454857"
                autoCapitalize="characters"
              />

              {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleJoin}
                style={styles.joinButton}
              >
                <Text style={styles.joinButtonText}>Join trip</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy Footnote */}
          <View style={styles.privacyRow}>
            <Svg width="14" height="14" viewBox="0 0 14 14">
              <Circle cx="7" cy="7" r="6.2" fill="none" stroke="#454857" strokeWidth="1.2" />
              <Path d="M7 4v3.3l2.2 1.3" stroke="#454857" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </Svg>
            <Text style={styles.privacyText}>
              Your budgets & dates stay private until consensus is reached
            </Text>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>

      {/* Celebratory Micro-Badge Modal */}
      <Modal visible={showCelebrationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.celebrationCard, { backgroundColor: '#13151E', borderColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <View style={styles.badgeIconWrapper}>
              <Award size={36} color="#3DE0A0" />
            </View>
            <Text style={styles.celebrationTitle}>Trip Circle Initialized!</Text>
            <Text style={styles.celebrationBadgeText}>🏆 Micro-badge Unlocked: "Founding Organizer"</Text>
            <Text style={styles.celebrationSubtext}>
              {tripName || 'Your trip circle'} has been set up with {candidates.length} candidate options in {activeCurrencyOption.symbol} {currencyCode}.
            </Text>

            <View style={{ flexDirection: 'column', gap: 10, width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setShowCelebrationModal(false);
                  const targetId = createdGroupId || 'circle-college-reunion-2026';
                  router.push(`/circle/${targetId}/preferences` as any);
                }}
                style={[styles.celebrationBtn, { backgroundColor: '#FF5A5F' }]}
              >
                <Text style={[styles.celebrationBtnText, { color: '#050608' }]}>
                  Lock My Preferences Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowCelebrationModal(false);
                  const targetId = createdGroupId || 'circle-college-reunion-2026';
                  router.push(`/circle/${targetId}/hub` as any);
                }}
                style={[styles.celebrationBtn, { backgroundColor: '#13151E', borderWidth: 1, borderColor: '#262938' }]}
              >
                <Text style={[styles.celebrationBtnText, { color: '#F4F3F0' }]}>
                  Explore Circle Hub
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Global Currency & Country Picker Modal */}
      <CurrencyCountryPicker
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        selectedCurrency={currencyCode}
        onSelectCurrency={(selected: CurrencyItem) => {
          triggerHaptic();
          setCurrencyCodeState(selected.code as CurrencyCode);
          setShowCurrencyModal(false);
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 440,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 120
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 15,
    color: '#F4F3F0'
  },
  tabToggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 18
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabToggleText: {
    fontFamily: fontUIBold,
    fontSize: 13
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5A5F',
    borderRadius: 2
  },
  stepHeader: {
    marginBottom: 16
  },
  mainTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    color: '#F4F3F0',
    marginBottom: 4
  },
  mainSubtitle: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98',
    lineHeight: 18
  },
  createCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },
  inputLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: '#8B8D98',
    marginBottom: 6
  },
  subInputLabel: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: '#8B8D98',
    marginBottom: 4
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#090A0F',
    color: '#F4F3F0',
    fontSize: 14,
    fontFamily: fontUI,
    marginBottom: 10
  },
  groupTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  groupTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1
  },
  groupTypeChipText: {
    fontFamily: fontUIBold,
    fontSize: 12.5
  },
  memberStepperSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  tierTag: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#1E2130',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperCount: {
    fontFamily: fontUIBold,
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center'
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  addCandidateBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  candidateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  candidateChipText: {
    fontFamily: fontUI,
    fontSize: 12.5
  },
  removeChipBtn: {
    padding: 2
  },
  currencyActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  currencyActiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  currencyFlag: {
    fontSize: 24
  },
  currencyActiveCode: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '700'
  },
  currencyActiveName: {
    fontFamily: fontUI,
    fontSize: 12,
    marginTop: 1
  },
  currencyChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(61, 224, 160, 0.12)'
  },
  currencyChangeText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#3DE0A0'
  },
  quickCurrencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  quickCurrencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1
  },
  quickCurrencyText: {
    fontFamily: fontUIBold,
    fontSize: 12
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#FF5A5F',
    marginTop: 14
  },
  nextButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050608'
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#3DE0A0'
  },
  createButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050608'
  },
  joinCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16
  },
  joinIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTextCol: {
    flex: 1
  },
  cardHeading: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  cardSubtext: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#6C6F7A',
    marginTop: 2
  },
  errorText: {
    fontSize: 12,
    color: '#E0484D',
    marginBottom: 10,
    fontFamily: fontUI
  },
  joinButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4F3F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  joinButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#090A0F'
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center'
  },
  privacyText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center'
  },
  badgeIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  celebrationTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 6,
    textAlign: 'center'
  },
  celebrationBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#3DE0A0',
    marginBottom: 10,
    textAlign: 'center'
  },
  celebrationSubtext: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#8B8D98',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  celebrationBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#3DE0A0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  celebrationBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050608'
  }
});
