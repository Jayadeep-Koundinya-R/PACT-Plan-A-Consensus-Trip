import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Search, X, Check, Globe } from 'lucide-react-native';
import { colors, radius } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';
import { usePactHaptics } from '../hooks/usePactHaptics';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  rateToUSD: number;
}

export type CurrencyOption = CurrencyItem;

export const GLOBAL_CURRENCIES: CurrencyItem[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', flag: '🇺🇸', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union', flag: '🇪🇺', rateToUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', rateToUSD: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', flag: '🇮🇳', rateToUSD: 83.5 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', rateToUSD: 152.0 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', flag: '🇦🇪', rateToUSD: 3.67 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺', rateToUSD: 1.54 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦', rateToUSD: 1.36 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬', rateToUSD: 1.35 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭', rateToUSD: 0.91 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭', rateToUSD: 36.8 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand', flag: '🇳🇿', rateToUSD: 1.68 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil', flag: '🇧🇷', rateToUSD: 5.15 },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', country: 'Mexico', flag: '🇲🇽', rateToUSD: 17.2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa', flag: '🇿🇦', rateToUSD: 18.6 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden', flag: '🇸🇪', rateToUSD: 10.6 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway', flag: '🇳🇴', rateToUSD: 10.8 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark', flag: '🇩🇰', rateToUSD: 6.87 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong', flag: '🇭🇰', rateToUSD: 7.82 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea', flag: '🇰🇷', rateToUSD: 1375.0 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey', flag: '🇹🇷', rateToUSD: 32.4 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia', flag: '🇮🇩', rateToUSD: 16200.0 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia', flag: '🇲🇾', rateToUSD: 4.75 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines', flag: '🇵🇭', rateToUSD: 58.2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam', flag: '🇻🇳', rateToUSD: 25400.0 }
];

export const FALLBACK_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AED: 'AED ',
  AUD: 'A$',
  CAD: 'CA$',
  SGD: 'S$',
  CHF: 'CHF ',
  THB: '฿',
  NZD: 'NZ$',
  BRL: 'R$',
  MXN: 'Mex$',
  ZAR: 'R',
  SEK: 'kr ',
  NOK: 'kr ',
  DKK: 'kr ',
  HKD: 'HK$',
  KRW: '₩',
  TRY: '₺',
  IDR: 'Rp ',
  MYR: 'RM ',
  PHP: '₱',
  VND: '₫'
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function getCachedFormatter(code: string): Intl.NumberFormat {
  let fmt = formatterCache.get(code);
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    });
    formatterCache.set(code, fmt);
  }
  return fmt;
}

/**
 * Universal Hermes-safe currency formatter with symbol dictionary fallback.
 */
export function formatCurrencyUniversal(
  amount: number,
  currencyCode: string = 'USD'
): string {
  const code = (currencyCode || 'USD').toUpperCase().trim();
  const fallbackSymbol = FALLBACK_CURRENCY_SYMBOLS[code] || `${code} `;

  try {
    if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function') {
      return getCachedFormatter(code).format(amount);
    }
  } catch (_e) {
    // Hermes fallback on non-standard currency code or missing Intl data
  }

  const rounded = Math.round(amount);
  const formattedNumber = rounded.toLocaleString('en-US');
  return `${fallbackSymbol}${formattedNumber}`;
}


export const SUPPORTED_CURRENCIES = GLOBAL_CURRENCIES;

export interface CurrencyCountryPickerProps {
  visible: boolean;
  selectedCode?: string;
  selectedCurrency?: string;
  onSelect?: (currency: CurrencyItem) => void;
  onSelectCurrency?: (currency: CurrencyItem) => void;
  onClose: () => void;
}

export function CurrencyCountryPicker({
  visible,
  selectedCode,
  selectedCurrency,
  onSelect,
  onSelectCurrency,
  onClose
}: CurrencyCountryPickerProps) {
  const activeCode = (selectedCode || selectedCurrency || 'USD').toUpperCase();
  const [searchQuery, setSearchQuery] = useState('');
  const haptics = usePactHaptics();

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return GLOBAL_CURRENCIES;
    return GLOBAL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (item: CurrencyItem) => {
    haptics.tap();
    if (onSelect) onSelect(item);
    if (onSelectCurrency) onSelectCurrency(item);
    onClose();
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.sheetContainer}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleRow}>
                <Globe size={18} color="#FF5A5F" />
                <Text style={styles.headerTitle}>Select Currency & Country</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
                accessibilityLabel="Close currency picker"
              >
                <X size={18} color="#8B8D98" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchRow}>
              <Search size={16} color="#8B8D98" style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by currency, country, or code..."
                placeholderTextColor="#8B949E"
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={14} color="#8B8D98" />
                </TouchableOpacity>
              )}
            </View>

            {/* Currency List */}
            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              getItemLayout={(_, index) => ({ length: 64, offset: 64 * index, index })}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.code.toUpperCase() === activeCode;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${item.name} (${item.code}), ${item.country}`}
                    style={[
                      styles.currencyRow,
                      isSelected && styles.currencyRowSelected
                    ]}
                  >
                    <View style={styles.flagSymbolCol}>
                      <Text style={styles.flagEmoji}>{item.flag}</Text>
                      <View style={styles.symbolBadge}>
                        <Text style={styles.symbolText}>{item.symbol}</Text>
                      </View>
                    </View>

                    <View style={styles.infoCol}>
                      <View style={styles.codeCountryRow}>
                        <Text style={styles.currencyCode}>{item.code}</Text>
                        <Text style={styles.countryName} numberOfLines={1}>{item.country}</Text>
                      </View>
                      <Text style={styles.currencyName} numberOfLines={1}>{item.name}</Text>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkPill}>
                        <Check size={14} color="#050608" strokeWidth={3} />
                      </View>
                    ) : (
                      <Text style={styles.approxRate}>
                        {item.code === 'USD' ? 'Base (1.0x)' : `~${item.rateToUSD}x USD`}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No currency matching "{searchQuery}"</Text>
                  <Text style={styles.emptySubtext}>Try searching "EUR", "Yen", or "Japan"</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%'
  },
  sheetContainer: {
    backgroundColor: '#13151E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#262938',
    maxHeight: '85%',
    width: '100%',
    maxWidth: 440,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262938'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1D2B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D2B',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontFamily: fontUI,
    fontSize: 14,
    color: '#FFFFFF',
    paddingVertical: 0
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6
  },
  currencyRowSelected: {
    backgroundColor: '#1A1D2B',
    borderColor: '#FF5A5F'
  },
  flagSymbolCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60
  },
  flagEmoji: {
    fontSize: 20
  },
  symbolBadge: {
    backgroundColor: '#13151E',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4
  },
  symbolText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FFB800'
  },
  infoCol: {
    flex: 1,
    marginLeft: 8
  },
  codeCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  currencyCode: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#FFFFFF'
  },
  countryName: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B949E'
  },
  currencyName: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B949E',
    marginTop: 2
  },
  checkPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3DE0A0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  approxRate: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B949E'
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center'
  },
  emptyText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#FFFFFF'
  },
  emptySubtext: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B949E',
    marginTop: 4
  }
});

export default CurrencyCountryPicker;

