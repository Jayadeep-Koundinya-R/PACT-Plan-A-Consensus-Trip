import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView
} from 'react-native';
import { X, ShieldCheck, FileCheck2, Lock, Scale } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { radius } from '../theme/colors';
import { fontDisplay, fontUIBold } from '../theme/typography';

export type LegalSection = 'privacy' | 'terms' | 'rules';

interface LegalModalProps {
  visible: boolean;
  section: LegalSection;
  onClose: () => void;
}

const SECTIONS: Record<LegalSection, { title: string; subtitle: string; icon: any }> = {
  privacy: { title: 'Privacy Policy', subtitle: 'How PACT protects your data', icon: ShieldCheck },
  terms: { title: 'Terms of Service', subtitle: 'Rules for using PACT', icon: FileCheck2 },
  rules: { title: 'PACT Protection Rules', subtitle: 'Our commitments to your group', icon: Lock }
};

const PRIVACY_CONTENT = [
  { heading: '1. Data We Collect', body: 'PACT collects only what is necessary: your account email, display name, trip circle details, and private constraints (budget range, available dates, destination preferences). We do NOT collect payment card details — all transactions are processed securely by RevenueCat / Apple / Google.' },
  { heading: '2. How We Use Your Data', body: 'Your data is used exclusively to: (a) operate your trip circles and compute consensus results, (b) send notifications about circle activity, (c) improve the AI recommendation engine using anonymized, aggregated patterns. We never sell your personal data to third parties.' },
  { heading: '3. Private Constraints Stay Private', body: 'Your exact budget cap, specific available dates, and destination preferences are encrypted and visible ONLY to the consensus algorithm. Other members never see your raw inputs — only the final overlapping result. This is the core privacy guarantee of PACT.' },
  { heading: '4. Voting Anonymity', body: 'All votes cast within a circle are anonymous. The organizer sees only aggregate counts (e.g., "4 of 5 prefer Goa"), never individual ballot choices. Veto history is auto-deleted after the vote concludes (configurable in Settings).' },
  { heading: '5. Data Storage & Security', body: 'All data is stored in encrypted PostgreSQL databases (Supabase) with row-level security policies. Authentication is handled via secure OAuth tokens. AI prompts are processed via Google Gemini API with no long-term storage of conversation history.' },
  { heading: '6. Your Rights', body: 'You may: (a) export all your data at any time from Settings, (b) delete your account and purge all private data permanently, (c) revoke AI processing consent, (d) request a copy of all data we hold about you. Contact concierge@pact.travel for any data request.' },
  { heading: '7. Cookies & Analytics', body: 'PACT uses minimal first-party analytics (anonymous usage patterns) to improve the app. No third-party tracking cookies. No cross-app tracking. No advertising identifiers are collected or shared.' },
  { heading: '8. Children\'s Privacy', body: 'PACT is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has provided us data, contact us immediately for deletion.' },
  { heading: '9. Changes to This Policy', body: 'We may update this policy. Material changes will be notified via in-app notification and email. Continued use after changes constitutes acceptance. Previous versions are archived and available on request.' },
  { heading: '10. Contact', body: 'For privacy questions, data requests, or concerns: concierge@pact.travel. We respond within 48 hours.' }
];

const TERMS_CONTENT = [
  { heading: '1. Acceptance of Terms', body: 'By creating an account, using PACT, or accessing any of our services, you agree to these Terms of Service. If you do not agree, do not use the app. These terms form a binding agreement between you and PACT.' },
  { heading: '2. Eligibility', body: 'You must be at least 13 years old to use PACT. If you are between 13 and 18, you must have parental or guardian consent. PACT is not for commercial travel agencies — it is designed for friend groups and personal trip planning.' },
  { heading: '3. Account Responsibilities', body: 'You are responsible for: (a) maintaining the security of your account credentials, (b) all activity under your account, (c) ensuring your profile information is accurate. Notify us immediately of unauthorized access.' },
  { heading: '4. Acceptable Use', body: 'You agree NOT to: (a) create circles for illegal activities, (b) harass, bully, or pressure other members, (c) attempt to reverse-engineer the consensus algorithm, (d) scrape or data-mine the app, (e) use automated bots to cast votes, (f) share invite codes publicly to invite strangers into private circles.' },
  { heading: '5. Group Pass Purchases', body: 'Group passes are one-time purchases (per trip) or annual subscriptions processed via Apple App Store / Google Play. Refunds are handled by the respective platform\'s refund policy. PACT does not directly process refunds. All prices are displayed in your selected currency before purchase.' },
  { heading: '6. Free Tier Limitations', body: 'The Free tier includes: (a) up to 1 active trip circle, (b) up to 5 members per circle, (c) 15 AI prompts per day, (d) basic consensus features. PACT reserves the right to adjust free tier limits with 30 days\' notice. Current limits are always displayed in-app.' },
  { heading: '7. AI-Generated Content', body: 'AI recommendations (destination suggestions, itinerary drafts, budget estimates) are generated by Google Gemini and provided for informational purposes only. PACT does not guarantee accuracy. Always verify travel details independently. PACT is not liable for decisions made solely on AI suggestions.' },
  { heading: '8. Intellectual Property', body: 'PACT\'s design, algorithms, consensus engine, and user interface are proprietary. You may not copy, modify, or distribute any part of the app. Your trip data belongs to you — we claim no ownership over your circles, votes, or constraints.' },
  { heading: '9. Termination', body: 'We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings. Upon deletion, all private data is permanently purged within 30 days. Aggregate anonymized analytics may be retained.' },
  { heading: '10. Limitation of Liability', body: 'PACT is provided "as is" without warranties. We are not liable for: (a) trip cancellations, (b) disagreements between group members, (c) inaccurate AI suggestions, (d) data loss beyond our reasonable control. Our total liability is limited to the amount you paid in the last 12 months.' },
  { heading: '11. Dispute Resolution', body: 'Any disputes shall be resolved through binding arbitration under the Indian Arbitration and Conciliation Act (for Indian users) or the American Arbitration Act (for US users). Class action waiver applies.' },
  { heading: '12. Governing Law', body: 'These terms are governed by the laws of India (for users in India) or the State of Delaware, USA (for users elsewhere). Exclusive jurisdiction in the courts of Bangalore, India or Delaware, USA.' },
  { heading: '13. Changes to Terms', body: 'We may update these terms. Material changes will be notified 30 days in advance via email and in-app notification. Continued use after changes constitutes acceptance.' },
  { heading: '14. Contact', body: 'For legal questions or to report violations: concierge@pact.travel.' }
];

const RULES_CONTENT = [
  { heading: 'Rule 1: Zero Peer Pressure', body: 'No member ever sees another member\'s raw budget, exact dates, or destination preferences. The algorithm computes the overlap — humans only see the result. This eliminates the social pressure to inflate budgets or shift dates to accommodate others.' },
  { heading: 'Rule 2: Private Constraints, Public Overlap', body: 'Your inputs are encrypted and visible ONLY to the consensus engine. The group only sees the final overlapping date range, budget band, and destination shortlist. Individual constraints are mathematically impossible to reverse-engineer from the output.' },
  { heading: 'Rule 3: Silent Voting', body: 'All votes are cast privately. The organizer sees only aggregate counts (e.g., "4 of 5 prefer Goa over Kerala"). No member knows how any other member voted. This prevents groupthink and social pressure during decision-making.' },
  { heading: 'Rule 4: Supermajority Consensus', body: 'A decision is confirmed only when 80% or more of members agree (supermajority threshold). This ensures broad buy-in without requiring unanimity, which often leads to deadlock in group travel planning.' },
  { heading: 'Rule 5: One Person Pays, Everyone Joins Free', body: 'Only the trip organizer purchases a group pass. All invited members join, input constraints, and vote at zero cost. There are no paywalls for participants — only the organizer unlocks the circle capacity.' },
  { heading: 'Rule 6: AI Guidance, Human Decision', body: 'AI provides suggestions (destinations, itineraries, budget estimates) but NEVER makes final decisions. The group always votes on AI-generated shortlists. AI is an advisor, not a decision-maker.' },
  { heading: 'Rule 7: Auto-Delete Veto History', body: 'After a vote concludes, all individual veto history and ballot details are automatically deleted. Only the final aggregate result is retained. This ensures no future awkwardness about who vetoed what.' },
  { heading: 'Rule 8: No Spam, No Pressure', body: 'Members cannot nudge, pressure, or spam other members to change their inputs. The only notification a member receives is: "A vote is open" and "A decision has been reached." No individual targeting.' },
  { heading: 'Rule 9: Transparent Pricing', body: 'All group pass prices are displayed upfront in the organizer\'s local currency. No hidden fees, no per-member charges, no surprise renewals. Single-trip passes expire after the trip concludes. Annual passes auto-renew with 30-day cancellation notice.' },
  { heading: 'Rule 10: Data Ownership', body: 'You own your data. Always. Export everything at any time. Delete everything permanently at any time. PACT is a tool for your group — your trip data is yours, not ours.' }
];

const CONTENT_MAP: Record<LegalSection, { heading: string; body: string }[]> = {
  privacy: PRIVACY_CONTENT,
  terms: TERMS_CONTENT,
  rules: RULES_CONTENT
};

export default function LegalModal({ visible, section, onClose }: LegalModalProps) {
  const { theme, isDarkMode } = useTheme();
  const config = SECTIONS[section];
  const Icon = config.icon;
  const content = CONTENT_MAP[section];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#323C5A' : '#FFEFC9' }]}>
              <Icon size={18} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{config.title}</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{config.subtitle}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}>
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.effectiveDate, { color: theme.textMuted }]}>
            Effective Date: January 1, 2026 · Last Updated: January 1, 2026
          </Text>
          {content.map((item, idx) => (
            <View key={idx} style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>{item.heading}</Text>
              <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{item.body}</Text>
            </View>
          ))}
          <View style={[styles.footerNote, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Scale size={16} color={theme.primary} />
            <Text style={[styles.footerNoteText, { color: theme.textSecondary }]}>
              This document is provided for transparency. For questions, contact concierge@pact.travel.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 16, fontWeight: '800', fontFamily: fontDisplay },
  headerSubtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  effectiveDate: { fontSize: 11, fontWeight: '500', marginBottom: 20, textAlign: 'center' },
  sectionBlock: { marginBottom: 18 },
  sectionHeading: { fontSize: 14, fontWeight: '800', fontFamily: fontUIBold, marginBottom: 6, lineHeight: 20 },
  sectionBody: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 10
  },
  footerNoteText: { flex: 1, fontSize: 11, lineHeight: 16 }
});
