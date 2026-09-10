import { useState } from 'react';
import { Platform, Share, Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { usePactHaptics } from './usePactHaptics';

export interface ShareInviteOptions {
  groupName: string;
  inviteCode: string;
  customMessage?: string;
}

export interface ShareWhatsAppOptions {
  message: string;
  inviteCode?: string;
}

export interface ShareTripBriefOptions {
  groupName: string;
  destination: string;
  dates: string;
  budget: string;
  memberCount?: number;
  briefCode?: string;
  briefUrl?: string;
}

export interface ShareNudgeOptions {
  groupName: string;
  inviteCode: string;
  lockedCount: number;
  neededCount: number;
  memberName?: string;
}

export function formatInviteMessage(groupName: string, inviteCode: string, customMessage?: string): string {
  if (customMessage) return customMessage;
  const joinUrl = `pact://join/${inviteCode}`;
  return `🌴 Join our trip circle for "${groupName}" on PACT!\n\nYour raw constraints are protected from other members.\n\n👉 App Link: ${joinUrl}\n👉 Invite Code: ${inviteCode}\n\nIf the app link does not open, enter the invite code in PACT.`;
}

export function formatTripBriefMessage(options: ShareTripBriefOptions): string {
  const { groupName, destination, dates, budget, memberCount = 5, briefCode = 'PACT-8821', briefUrl } = options;
  const viewLine = briefUrl?.startsWith('pact://')
    ? `Open confirmed itinerary: ${briefUrl}`
    : `Open PACT to view the confirmed itinerary and vouchers (brief ${briefCode}).`;
  return `🏖️ *PACT Consensus Brief: ${destination}*\nTrip: ${groupName}\n🗓️ Dates: ${dates}\n💰 Target: ~${budget} / person\n👥 ${memberCount} members locked\n📍 Stay: Private villa\n\n${viewLine}`;
}

export function formatNudgeMessage(options: ShareNudgeOptions): string {
  const { groupName, inviteCode, lockedCount, neededCount, memberName } = options;
  const greeting = memberName ? `Hey ${memberName}! 👋` : 'Hey team! ✈️';
  const joinUrl = `pact://join/${inviteCode}`;
  return `${greeting} ${lockedCount} of us have locked in trip preferences for "${groupName}" on PACT. We need ${neededCount} more to reveal the consensus match!\n\nLock in your dates & budget here (100% private):\n${joinUrl}\nInvite Code: ${inviteCode}`;
}

export function useShareInvite() {
  const haptics = usePactHaptics();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const copyToClipboard = async (text: string, codeToMark?: string): Promise<boolean> => {
    haptics.tap();
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      if (codeToMark) {
        setCopiedCode(codeToMark);
        setTimeout(() => setCopiedCode(null), 2200);
      }
      haptics.success();
      return true;
    } catch (err) {
      console.warn('Clipboard copy error:', err);
      return false;
    }
  };

  const copyInviteCode = async (inviteCode: string): Promise<boolean> => {
    return copyToClipboard(inviteCode, inviteCode);
  };

  const copyInviteLink = async (inviteCode: string): Promise<boolean> => {
    const joinUrl = `pact://join/${inviteCode}`;
    return copyToClipboard(joinUrl, inviteCode);
  };

  const shareInvite = async (options: ShareInviteOptions): Promise<boolean> => {
    haptics.action();
    setIsSharing(true);
    const { groupName, inviteCode, customMessage } = options;
    const message = formatInviteMessage(groupName, inviteCode, customMessage);
    const joinUrl = `pact://join/${inviteCode}`;
    const title = `Join ${groupName} on PACT`;

    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
          await (navigator as any).share({
            title,
            text: message,
            url: joinUrl
          });
          setIsSharing(false);
          return true;
        } else {
          await copyToClipboard(message, inviteCode);
          Alert.alert('Invite Copied', 'Share link and invite code copied to clipboard!');
          setIsSharing(false);
          return true;
        }
      } else {
        const result = await Share.share(
          {
            title,
            message,
            url: joinUrl
          },
          {
            dialogTitle: `Invite friends to ${groupName}`
          }
        );
        setIsSharing(false);
        return result.action === Share.sharedAction;
      }
    } catch (err: any) {
      setIsSharing(false);
      if (err.name !== 'AbortError') {
        await copyToClipboard(message, inviteCode);
        Alert.alert('Invite Code', message);
      }
      return false;
    }
  };

  const shareToWhatsApp = async (options: ShareWhatsAppOptions): Promise<boolean> => {
    haptics.action();
    const { message, inviteCode } = options;
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/?text=${encoded}`;
    const waAppUrl = `whatsapp://send?text=${encoded}`;

    try {
      if (Platform.OS === 'web') {
        await copyToClipboard(message, inviteCode);
        if (typeof window !== 'undefined') {
          window.open(waUrl, '_blank');
        }
        return true;
      } else {
        const canOpenApp = await Linking.canOpenURL(waAppUrl);
        if (canOpenApp) {
          await Linking.openURL(waAppUrl);
          return true;
        }
        const canOpenWeb = await Linking.canOpenURL(waUrl);
        if (canOpenWeb) {
          await Linking.openURL(waUrl);
          return true;
        }
        await Share.share({ message, title: 'Share via WhatsApp' });
        return true;
      }
    } catch (err) {
      console.warn('WhatsApp share error:', err);
      await copyToClipboard(message, inviteCode);
      Alert.alert('WhatsApp Share', 'Message copied to clipboard.');
      return false;
    }
  };

  const shareViaSMS = async (options: ShareInviteOptions): Promise<boolean> => {
    haptics.action();
    const { groupName, inviteCode, customMessage } = options;
    const message = formatInviteMessage(groupName, inviteCode, customMessage);
    const encoded = encodeURIComponent(message);
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:${separator}body=${encoded}`;

    try {
      await copyToClipboard(message, inviteCode);
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return true;
      }
      return shareInvite(options);
    } catch (err) {
      console.warn('SMS share error:', err);
      return shareInvite(options);
    }
  };

  const shareViaEmail = async (options: ShareInviteOptions): Promise<boolean> => {
    haptics.action();
    const { groupName, inviteCode, customMessage } = options;
    const message = formatInviteMessage(groupName, inviteCode, customMessage);
    const subject = encodeURIComponent(`Join our trip circle: ${groupName}`);
    const body = encodeURIComponent(message);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    try {
      await copyToClipboard(message, inviteCode);
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        return true;
      }
      return shareInvite(options);
    } catch (err) {
      console.warn('Email share error:', err);
      return shareInvite(options);
    }
  };

  const shareTripBrief = async (options: ShareTripBriefOptions): Promise<boolean> => {
    haptics.action();
    const message = formatTripBriefMessage(options);
    return shareToWhatsApp({ message });
  };

  const shareNudge = async (options: ShareNudgeOptions): Promise<boolean> => {
    haptics.action();
    const message = formatNudgeMessage(options);
    return shareToWhatsApp({ message, inviteCode: options.inviteCode });
  };

  return {
    shareInvite,
    shareToWhatsApp,
    shareViaSMS,
    shareViaEmail,
    shareTripBrief,
    shareNudge,
    copyInviteCode,
    copyInviteLink,
    copyToClipboard,
    copiedCode,
    isSharing
  };
}
