import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react-native';

interface FeedbackModalProps {
  visible: boolean;
  isDarkMode?: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  isDarkMode = true,
  onClose
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      onClose();
    }, 1800);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.lg
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MessageSquare size={18} color={theme.primary} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Organizer Feedback & Support
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successState}>
              <CheckCircle2 size={40} color={theme.success} />
              <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
                Thank You for Your Feedback!
              </Text>
              <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
                Our team reviews every idea to make consensus even smoother.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>
                How can PACT help your group reach agreement faster? Let us know what features you'd like to see next.
              </Text>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceElevated,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                placeholder="Share your thoughts or report an issue..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                value={feedback}
                onChangeText={setFeedback}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                style={[styles.submitBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
              >
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.card,
    padding: 22,
    borderWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6
  },
  successDesc: {
    fontSize: 13,
    textAlign: 'center'
  }
});
