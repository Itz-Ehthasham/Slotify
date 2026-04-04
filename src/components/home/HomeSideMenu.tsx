import { clearUser } from '@/auth/session';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  type ImageSourcePropType,
  InteractionManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DRAWER_MAX_W = 340;
const ROW_PAD_H = 20;
const ICON_ROW = 22;
const MENU_ICON = 24;

const GROUP_BAND = '#E8EDF4';
const ROW_BORDER = 'rgba(15, 15, 15, 0.08)';
const CHEVRON = '#9CA3AF';
const LABEL_COLOR = '#111111';

const profileIcon = require('../../../assets/icons/profile.svg') as ImageSourcePropType;
const contactIcon = require('../../../assets/icons/contact us.svg') as ImageSourcePropType;
const workerIcon = require('../../../assets/icons/worker.svg') as ImageSourcePropType;
const registerIcon = require('../../../assets/icons/register.svg') as ImageSourcePropType;
const shareIcon = require('../../../assets/icons/share.svg') as ImageSourcePropType;
const starIcon = require('../../../assets/icons/star.svg') as ImageSourcePropType;
const logoutIcon = require('../../../assets/icons/log-out.svg') as ImageSourcePropType;
const footerMark = require('../../../assets/images/logo.svg') as ImageSourcePropType;

type Row = { key: string; label: string; source: ImageSourcePropType };
const MENU_SECTIONS: Row[][] = [
  [
    { key: 'profile', label: 'My Profile', source: profileIcon },
    { key: 'contact', label: 'Contact us', source: contactIcon },
  ],
  [
    { key: 'worker', label: 'Become a worker', source: workerIcon },
    { key: 'company', label: 'Register a company', source: registerIcon },
  ],
  [
    { key: 'share', label: 'Share', source: shareIcon },
    { key: 'rate', label: 'Rate', source: starIcon },
    { key: 'logout', label: 'Logout', source: logoutIcon },
  ],
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HomeSideMenu({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const drawerW = Math.min(DRAWER_MAX_W, windowWidth * 0.88);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const logoutPromptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (logoutPromptTimer.current) clearTimeout(logoutPromptTimer.current);
    };
  }, []);

  const onRowPress = (key: string) => {
    if (key === 'logout') {
      onClose();
      if (logoutPromptTimer.current != null) {
        clearTimeout(logoutPromptTimer.current);
        logoutPromptTimer.current = null;
      }
      InteractionManager.runAfterInteractions(() => {
        logoutPromptTimer.current = setTimeout(() => {
          logoutPromptTimer.current = null;
          setLogoutConfirmVisible(true);
        }, 320);
      });
      return;
    }
    onClose();
  };

  const handleLogoutConfirm = async () => {
    setLogoutConfirmVisible(false);
    await clearUser();
    router.replace('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutConfirmVisible(false);
  };

  return (
    <>
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.drawer, { width: drawerW, paddingTop: insets.top }]}>
          <View style={styles.drawerInner}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Slotify</Text>
              <Pressable
                hitSlop={14}
                onPress={onClose}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
                accessibilityLabel="Close menu">
                <Ionicons name="close" size={26} color="#000022" />
              </Pressable>
            </View>
            <View style={styles.headerRule} />

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false} bounces={false}>
              {MENU_SECTIONS.map((section, sIdx) => (
                <View key={`s-${sIdx}`}>
                  {sIdx > 0 ? <View style={styles.groupBand} /> : null}
                  <View style={styles.group}>
                    {section.map((row, rIdx) => (
                      <View key={row.key}>
                        <Pressable
                          style={({ pressed }) => [styles.menuRow, pressed && styles.rowPressed]}
                          onPress={() => onRowPress(row.key)}>
                          <Image source={row.source} style={styles.menuIcon} contentFit="contain" />
                          <Text style={styles.menuLabel}>{row.label}</Text>
                          <Ionicons name="chevron-forward" size={ICON_ROW} color={CHEVRON} />
                        </Pressable>
                        {rIdx < section.length - 1 ? <View style={styles.rowDivider} /> : null}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <Image source={footerMark} style={styles.footerMark} contentFit="contain" />
              <Text style={styles.version}>Version 1.0</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Dismiss menu" />
      </View>
    </Modal>

    <ConfirmModal
      visible={logoutConfirmVisible}
      title="Log out"
      message="Are you sure you want to log out?"
      confirmLabel="Log out"
      cancelLabel="Cancel"
      onConfirm={handleLogoutConfirm}
      onCancel={handleLogoutCancel}
    />
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerInner: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ROW_PAD_H,
    paddingVertical: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  pressed: {
    opacity: 0.65,
  },
  headerRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ROW_BORDER,
    marginHorizontal: ROW_PAD_H,
  },
  menuScroll: {
    flex: 1,
  },
  groupBand: {
    height: 10,
    backgroundColor: GROUP_BAND,
    marginTop: 4,
  },
  group: {
    backgroundColor: '#FFFFFF',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ROW_PAD_H,
    minHeight: 56,
    gap: 14,
  },
  rowPressed: {
    opacity: 0.92,
  },
  menuIcon: {
    width: MENU_ICON,
    height: MENU_ICON,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: LABEL_COLOR,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ROW_BORDER,
    marginLeft: ROW_PAD_H + MENU_ICON + 14,
  },
  footer: {
    backgroundColor: GROUP_BAND,
    paddingHorizontal: ROW_PAD_H,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomRightRadius: 28,
  },
  footerMark: {
    width: 40,
    height: 40,
  },
  version: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
