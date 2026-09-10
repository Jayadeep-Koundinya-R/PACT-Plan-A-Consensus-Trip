import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemeId, PactThemeDefinition } from '../theme/colors';
import { radius, shadows } from '../theme/colors';
import {
  X,
  Check,
  Palette,
  Moon,
  Sun,
  Sparkles,
  ShieldCheck,
  Sliders,
} from 'lucide-react-native';
import { Visual3DConsensusOrb } from './3d/Visual3DConsensusOrb';
import { usePactHaptics } from '../hooks/usePactHaptics';

interface ThemeCustomizerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, themeId, themeDefinition, allThemes, isDarkMode, setTheme } = useTheme();
  const haptics = usePactHaptics();
  const [filter, setFilter] = useState<'all' | 'dark' | 'light'>('all');

  const filteredThemes = allThemes.filter((t) => {
    if (filter === 'all') return true;
    return t.category === filter;
  });

  const handleSelectTheme = (id: ThemeId) => {
    haptics.tap();
    setTheme(id);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.lg,
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: theme.primaryLight }]}>
                <Palette size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Themes &amp; 3D Appearance
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Customize your visual experience
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Live 3D Device Preview Card */}
            <View
              style={[
                styles.preview3DContainer,
                {
                  backgroundColor: theme.backgroundDeep,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.preview3DHeader}>
                <Sparkles size={14} color={theme.primary} />
                <Text style={[styles.preview3DLabel, { color: theme.textSecondary }]}>
                  LIVE 3D THEME PREVIEW — {themeDefinition.name.toUpperCase()}
                </Text>
              </View>

              {/* 3D Tilted Isometric Phone Mockup */}
              <View
                style={[
                  styles.phone3dFrame,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.primary,
                  },
                ]}
              >
                {/* Simulated App Header */}
                <View style={[styles.mockHeader, { backgroundColor: theme.surface }]}>
                  <View style={[styles.mockDot, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.mockTitle, { color: theme.textPrimary }]}>Goa Trip Circle</Text>
                  <View style={[styles.mockTag, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.mockTagText, { color: theme.primary }]}>Live</Text>
                  </View>
                </View>

                {/* Simulated Content with 3D Orb */}
                <View style={styles.mockContentRow}>
                  <View style={styles.mockContentLeft}>
                    <Text style={[styles.mockSubtitle, { color: theme.textSecondary }]}>Consensus State</Text>
                    <Text style={[styles.mockHeading, { color: theme.seal }]}>100% Locked</Text>
                    <View style={[styles.mockProgressBar, { backgroundColor: theme.surfaceSubtle }]}>
                      <View style={[styles.mockProgressFill, { backgroundColor: theme.seal }]} />
                    </View>
                  </View>
                  <Visual3DConsensusOrb size={56} primaryColor={theme.primary} sealColor={theme.seal} />
                </View>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={[styles.filterBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setFilter('all')}
                style={[
                  styles.filterBtn,
                  filter === 'all' && { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.filterBtnText, { color: filter === 'all' ? theme.textPrimary : theme.textSecondary }]}>
                  All ({allThemes.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('dark')}
                style={[
                  styles.filterBtn,
                  filter === 'dark' && { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Moon size={12} color={filter === 'dark' ? theme.primary : theme.textSecondary} />
                <Text style={[styles.filterBtnText, { color: filter === 'dark' ? theme.textPrimary : theme.textSecondary }]}>
                  Dark (2)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('light')}
                style={[
                  styles.filterBtn,
                  filter === 'light' && { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Sun size={12} color={filter === 'light' ? theme.primary : theme.textSecondary} />
                <Text style={[styles.filterBtnText, { color: filter === 'light' ? theme.textPrimary : theme.textSecondary }]}>
                  Light (2)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Themes Grid */}
            <View style={styles.themeList}>
              {filteredThemes.map((item: PactThemeDefinition) => {
                const isSelected = item.id === themeId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.88}
                    onPress={() => handleSelectTheme(item.id)}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: isSelected ? theme.surfaceElevated : theme.surfaceSubtle,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.themeCardTop}>
                      <View style={styles.themeTitleRow}>
                        <Text style={[styles.themeName, { color: theme.textPrimary }]}>
                          {item.name}
                        </Text>
                        <View
                          style={[
                            styles.categoryPill,
                            {
                              backgroundColor:
                                item.category === 'dark' ? '#1B2232' : '#F0ECE4',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryPillText,
                              { color: item.category === 'dark' ? '#38BDF8' : '#B45309' },
                            ]}
                          >
                            {item.category.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <View style={[styles.checkCircle, { backgroundColor: theme.seal }]}>
                          <Check size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={[styles.emptyCircle, { borderColor: theme.textSecondary }]} />
                      )}
                    </View>

                    <Text style={[styles.themeDesc, { color: theme.textSecondary }]}>
                      {item.description}
                    </Text>

                    {/* Color Swatch Bar */}
                    <View style={styles.swatchesRow}>
                      <View style={[styles.swatch, { backgroundColor: item.previewBg }]} />
                      <View style={[styles.swatch, { backgroundColor: item.previewCard }]} />
                      <View style={[styles.swatch, { backgroundColor: item.previewPrimary }]} />
                      <View style={[styles.swatch, { backgroundColor: item.previewSeal }]} />
                      <Text style={[styles.swatchLabel, { color: theme.textSecondary }]}>
                        Color Palette Preview
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Persistent Device Storage Note */}
            <View style={[styles.persistenceNotice, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <ShieldCheck size={16} color={theme.seal} />
              <Text style={[styles.persistenceNoticeText, { color: theme.textSecondary }]}>
                Saved automatically to device storage. Whenever you reopen PACT or navigate screens, your selected theme ({themeDefinition.name}) stays 100% active.
              </Text>
            </View>

            {/* Apply & Close Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                haptics.success();
                onClose();
              }}
              style={[styles.applyBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.applyBtnText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    maxHeight: '92%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    gap: 14,
    paddingBottom: 10,
  },
  preview3DContainer: {
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  preview3DHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  preview3DLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  phone3dFrame: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
    transform: [
      { perspective: 1000 },
      { rotateY: '-6deg' },
      { rotateX: '4deg' },
    ],
  },
  mockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: radius.sm,
    marginBottom: 10,
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mockTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  mockTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  mockContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
  },
  mockContentLeft: {
    flex: 1,
    paddingRight: 10,
  },
  mockSubtitle: {
    fontSize: 10,
    fontWeight: '600',
  },
  mockHeading: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  mockProgressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  mockProgressFill: {
    width: '100%',
    height: '100%',
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeList: {
    gap: 10,
  },
  themeCard: {
    padding: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  themeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  swatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  swatchLabel: {
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '600',
  },
  persistenceNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  persistenceNoticeText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  applyBtn: {
    paddingVertical: 14,
    borderRadius: radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
