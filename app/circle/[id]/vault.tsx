import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { EmptyState } from '../../../src/components/EmptyState';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, FileText, Home, Shield, Copy, Check, Plus, RefreshCw } from 'lucide-react-native';
import { VaultDocSkeleton } from '../../../src/components/SkeletonLoader';

export default function PactTripVault() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], finalizedBrief, vaultDocuments = {} } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Goa',
      inviteCode: 'GOA-4F82'
    };

  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncVault = () => {
    haptics.tap();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      haptics.success();
    }, 1200);
  };

  // Demo docs â€” in production, this would come from Supabase storage
  const [documents] = useState([
    { section: 'FLIGHTS & TRANSPORT', items: [
      { name: 'IndiGo_Flight_All5.pdf', meta: 'Uploaded by Alex  Â·  1.2 MB', type: 'flight' },
      { name: 'Airport_Transfer_Receipt.pdf', meta: 'Uploaded by Sam', type: 'transfer' }
    ]},
    { section: 'ACCOMMODATION BOOKINGS', items: [
      { name: 'South_Goa_Villa_Confirmation.pdf', meta: 'Uploaded by You  Â·  Code #PACT-9921', type: 'villa' }
    ]}
  ]);

  const hasDocuments = finalizedBrief !== null || documents.length > 0;

  const aiText = 'âœˆï¸ Goa trip update: flights & villa confirmed! All PDF vouchers are ready in the vault.';

  const handleCopy = async () => {
    haptics.success();
    try {
      await Clipboard.setStringAsync(aiText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const DocCard = ({
    icon,
    name,
    meta,
    chips = true
  }: {
    icon: React.ReactNode;
    name: string;
    meta: React.ReactNode;
    chips?: boolean;
  }) => (
    <View style={styles.docCard}>
      <View style={styles.docIconBox}>{icon}</View>
      <View style={styles.docTextCol}>
        <Text style={styles.docName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.docMeta}>{meta}</Text>
        {chips && (
          <View style={styles.docChipsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                haptics.tap();
                Alert.alert('View Document', `Opening ${name}...`);
              }}
              style={styles.docChip}
            >
              <Text style={styles.docChipText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                haptics.tap();
                Alert.alert('Download', `Downloading ${name} to device storage.`);
              }}
              style={styles.docChip}
            >
              <Text style={styles.docChipText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const FlightIcon = () => (
    <Svg width="17" height="17" viewBox="0 0 17 17">
      <Path d="M4 1.5h6l3 3v11h-9z" fill="none" stroke="#FF5A5F" strokeWidth="1.1" strokeLinejoin="round" />
      <Path d="M10 1.5v3h3" fill="none" stroke="#FF5A5F" strokeWidth="1.1" strokeLinejoin="round" />
    </Svg>
  );

  const TransferIcon = () => (
    <Svg width="17" height="17" viewBox="0 0 17 17">
      <Path
        d="M1.5 6l1.4-1.4a1.6 1.6 0 0 0 2.3 0l1-1a1.6 1.6 0 0 1 2.3 0l1 1a1.6 1.6 0 0 0 2.3 0L13.2 3l2.3 2.3v6.4L13.2 14l-1.4-1.4a1.6 1.6 0 0 0-2.3 0l-1 1a1.6 1.6 0 0 1-2.3 0l-1-1a1.6 1.6 0 0 0-2.3 0L1.5 14z"
        fill="none"
        stroke="#FF5A5F"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const VillaIcon = () => (
    <Svg width="17" height="17" viewBox="0 0 17 17">
      <Path d="M2 8L8.5 2.5 15 8" fill="none" stroke="#FF5A5F" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.7 6.8V14.5h9.6V6.8" fill="none" stroke="#FF5A5F" strokeWidth="1.1" strokeLinejoin="round" />
    </Svg>
  );

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'flight': return <FlightIcon />;
      case 'transfer': return <TransferIcon />;
      case 'villa': return <VillaIcon />;
      default: return <FlightIcon />;
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{currentGroup.name || 'Goa'} trip vault</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Upload Document', 'Select PDF or screenshot to upload to vault.')}
              style={styles.uploadBtnTop}
            >
              <Text style={styles.uploadBtnTopText}>+ Upload</Text>
            </TouchableOpacity>
          </View>

          {/* Vault Security Banner */}
          <View style={styles.securityBanner}>
            <Shield size={15} color="#3DE0A0" />
            <Text style={styles.securityBannerText}>
              Trip vault is shared with your circle only. No one outside can access these files.
            </Text>
          </View>

          {!hasDocuments ? (
            /* Empty State â€” No documents yet */
            <EmptyState
              icon="folder"
              title="No documents yet"
              description="Upload flight confirmations, hotel vouchers, and booking PDFs here for your circle to access."
              actionLabel="Upload first document"
              onAction={() => Alert.alert('Upload Document', 'Opening file picker...')}
              isDarkMode={true}
            />
          ) : (
            <>
              {/* Document Sections */}
              {documents.map((section) => (
                <View key={section.section}>
                  <Text style={styles.sectionHeading}>{section.section}</Text>
                  <View style={styles.docsList}>
                    {section.items.map((doc) => (
                      <DocCard
                        key={doc.name}
                        icon={getDocIcon(doc.type)}
                        name={doc.name}
                        meta={doc.meta}
                      />
                    ))}
                  </View>
                </View>
              ))}

              {/* AI Copy Assistant Card */}
              <View style={styles.aiCopyCard}>
                <View style={styles.aiCopyHeader}>
                  <Text style={{ fontSize: 13 }}>âœ¨</Text>
                  <Text style={styles.aiCopyTitle}>AI copy assistant</Text>
                </View>

                <View style={styles.aiTextBox}>
                  <Text style={styles.aiTextContent}>{aiText}</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCopy}
                  style={[
                    styles.copyBtn,
                    copied ? { backgroundColor: '#0F6E56' } : { backgroundColor: '#3DE0A0' }
                  ]}
                >
                  {copied ? <Check size={14} color="#CFF3E4" /> : <Copy size={14} color="#052E20" />}
                  <Text
                    style={[
                      styles.copyBtnText,
                      copied ? { color: '#CFF3E4' } : { color: '#052E20' }
                    ]}
                  >
                    {copied ? 'Copied to clipboard' : 'Copy text to clipboard'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              haptics.action();
              Alert.alert('Upload Document', 'Opening file picker...');
            }}
            style={styles.uploadFullBtn}
          >
            <Text style={styles.uploadFullBtnText}>+ Upload booking PDF / screenshot</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 16,
    color: '#F4F3F0'
  },
  uploadBtnTop: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  uploadBtnTopText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5A5F'
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(61,224,160,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61,224,160,0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20
  },
  securityBannerText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#3DE0A0',
    lineHeight: 16,
    flex: 1
  },
  sectionHeading: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  docsList: {
    gap: 10,
    marginBottom: 22
  },
  docCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: 'rgba(255,90,95,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  docTextCol: {
    flex: 1
  },
  docName: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  docMeta: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A',
    marginTop: 3
  },
  docChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  docChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4
  },
  docChipText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  aiCopyCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20
  },
  aiCopyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12
  },
  aiCopyTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  aiTextBox: {
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12
  },
  aiTextContent: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#B4B6C0',
    lineHeight: 18
  },
  copyBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  copyBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  uploadFullBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadFullBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2E0805'
  }
});