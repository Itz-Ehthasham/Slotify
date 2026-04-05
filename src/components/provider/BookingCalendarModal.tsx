import { Brand } from '@/constants/brand';
import { formatHourlyRateInr } from '@/data/mockProviders';
import {
  type BookingAddressType,
  getBookedTimesForProviderOnDate,
  todayLocalIsoDate,
} from '@/storage/bookingsStorage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type CalendarCell = {
  iso: string | null;
  label: string | null;
  inMonth: boolean;
  disabled: boolean;
  isToday: boolean;
};

function padIso(year: number, month1to12: number, day: number): string {
  return `${year}-${String(month1to12).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendar(year: number, monthIndex0: number, todayIso: string): CalendarCell[] {
  const first = new Date(year, monthIndex0, 1);
  const startPad = first.getDay();
  const dim = new Date(year, monthIndex0 + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({ iso: null, label: null, inMonth: false, disabled: true, isToday: false });
  }
  for (let d = 1; d <= dim; d++) {
    const iso = padIso(year, monthIndex0 + 1, d);
    const isPast = iso < todayIso;
    cells.push({
      iso,
      label: String(d),
      inMonth: true,
      disabled: isPast,
      isToday: iso === todayIso,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ iso: null, label: null, inMonth: false, disabled: true, isToday: false });
  }
  return cells;
}

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatDateDropdownLabel(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export type BookingConfirmDetails = {
  serviceAddress: string;
  addressType: BookingAddressType;
};

export type BookingCalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  category: string;
  slots: string[];
  hourlyRate: number;
  onConfirmBooking: (dateIso: string, time: string, details: BookingConfirmDetails) => Promise<void>;
};

export function BookingCalendarModal({
  visible,
  onClose,
  providerId,
  providerName,
  category,
  slots,
  hourlyRate,
  onConfirmBooking,
}: BookingCalendarModalProps) {
  const todayIso = todayLocalIsoDate();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const [selectedDateIso, setSelectedDateIso] = useState(todayIso);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [addressType, setAddressType] = useState<BookingAddressType>('home');
  const [serviceAddress, setServiceAddress] = useState('');

  useEffect(() => {
    if (!visible) return;
    const t = new Date();
    setCalendarMonth({ y: t.getFullYear(), m: t.getMonth() });
    setSelectedDateIso(todayLocalIsoDate());
    setSelectedSlot(null);
    setBookedSlots(new Set());
    setDatePickerOpen(false);
    setAddressType('home');
    setServiceAddress('');
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void getBookedTimesForProviderOnDate(providerId, selectedDateIso).then((s) => {
      if (!cancelled) setBookedSlots(s);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, providerId, selectedDateIso]);

  useEffect(() => {
    setSelectedSlot((cur) => (cur && bookedSlots.has(cur) ? null : cur));
  }, [bookedSlots]);

  const cells = useMemo(
    () => buildCalendar(calendarMonth.y, calendarMonth.m, todayIso),
    [calendarMonth, todayIso],
  );

  const calendarRows = useMemo(() => {
    const rows: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [cells]);

  const monthTitle = useMemo(
    () =>
      new Date(calendarMonth.y, calendarMonth.m, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [calendarMonth],
  );

  const minYm = useMemo(() => {
    const t = new Date();
    return t.getFullYear() * 12 + t.getMonth();
  }, [visible]);

  const visibleYm = calendarMonth.y * 12 + calendarMonth.m;
  const canGoPrev = visibleYm > minYm;
  const canGoNext = visibleYm < minYm + 3;

  const goPrevMonth = useCallback(() => {
    if (!canGoPrev) return;
    setCalendarMonth((prev) => {
      if (prev.m === 0) return { y: prev.y - 1, m: 11 };
      return { y: prev.y, m: prev.m - 1 };
    });
  }, [canGoPrev]);

  const goNextMonth = useCallback(() => {
    if (!canGoNext) return;
    setCalendarMonth((prev) => {
      if (prev.m === 11) return { y: prev.y + 1, m: 0 };
      return { y: prev.y, m: prev.m + 1 };
    });
  }, [canGoNext]);

  const toggleDatePicker = useCallback(() => {
    setDatePickerOpen((open) => {
      const willOpen = !open;
      if (willOpen) {
        setCalendarMonth(() => {
          const parts = selectedDateIso.split('-').map(Number);
          const y = parts[0];
          const m = parts[1] - 1;
          return { y, m };
        });
      }
      return willOpen;
    });
  }, [selectedDateIso]);

  const onPickDay = (iso: string | null, disabled: boolean) => {
    if (!iso || disabled) return;
    setSelectedDateIso(iso);
    setSelectedSlot(null);
    setDatePickerOpen(false);
  };

  const addressOk = serviceAddress.trim().length > 0;
  const canConfirm = Boolean(selectedSlot && addressOk && !submitting);

  const onConfirm = async () => {
    if (!canConfirm || !selectedSlot) return;
    setSubmitting(true);
    try {
      await onConfirmBooking(selectedDateIso, selectedSlot, {
        serviceAddress: serviceAddress.trim(),
        addressType,
      });
    } catch {
      Alert.alert('Booking failed', 'Could not save your appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.sheetTitle}>Book appointment</Text>
              <Text style={styles.sheetSubtitle} numberOfLines={1}>
                {providerName} · {category}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="close" size={26} color="#111111" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.blockLabel}>Date</Text>
            <Pressable
              onPress={toggleDatePicker}
              style={({ pressed }) => [
                styles.dateDropdown,
                datePickerOpen && styles.dateDropdownFocused,
                pressed && styles.dateDropdownPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Choose appointment date"
              accessibilityState={{ expanded: datePickerOpen }}>
              <Text style={styles.dateDropdownText}>{formatDateDropdownLabel(selectedDateIso)}</Text>
              <Ionicons
                name={datePickerOpen ? 'chevron-up' : 'chevron-down'}
                size={22}
                color="#374151"
              />
            </Pressable>

            {datePickerOpen ? (
              <View style={styles.calendarPanel}>
                <View style={styles.calNav}>
                  <Pressable
                    onPress={goPrevMonth}
                    disabled={!canGoPrev}
                    style={({ pressed }) => [
                      styles.calNavBtn,
                      !canGoPrev && styles.calNavBtnDisabled,
                      pressed && canGoPrev && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Previous month">
                    <Ionicons name="chevron-back" size={22} color={canGoPrev ? '#111111' : '#D1D5DB'} />
                  </Pressable>
                  <Text style={styles.calMonthTitle}>{monthTitle}</Text>
                  <Pressable
                    onPress={goNextMonth}
                    disabled={!canGoNext}
                    style={({ pressed }) => [
                      styles.calNavBtn,
                      !canGoNext && styles.calNavBtnDisabled,
                      pressed && canGoNext && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Next month">
                    <Ionicons name="chevron-forward" size={22} color={canGoNext ? '#111111' : '#D1D5DB'} />
                  </Pressable>
                </View>

                <View style={styles.weekRow}>
                  {WEEK_LETTERS.map((w, i) => (
                    <Text key={`${w}-${i}`} style={styles.weekLetter}>
                      {w}
                    </Text>
                  ))}
                </View>
                <View style={styles.calBody}>
                  {calendarRows.map((row, ri) => (
                    <View key={ri} style={styles.calRow}>
                      {row.map((cell, ci) => {
                        const selected = cell.iso != null && cell.iso === selectedDateIso;
                        return (
                          <Pressable
                            key={ci}
                            disabled={!cell.iso || cell.disabled}
                            onPress={() => onPickDay(cell.iso, cell.disabled)}
                            style={[
                              styles.calCell,
                              !cell.inMonth && styles.calCellHidden,
                              cell.isToday && !selected && styles.calCellToday,
                              selected && styles.calCellSelected,
                              cell.disabled && cell.inMonth && styles.calCellDisabled,
                            ]}
                            accessibilityRole={cell.iso && !cell.disabled ? 'button' : 'none'}
                            accessibilityState={{
                              selected: !!selected,
                              disabled: !cell.iso || cell.disabled,
                            }}>
                            <Text
                              style={[
                                styles.calCellText,
                                !cell.inMonth && styles.calCellTextHidden,
                                cell.disabled && cell.inMonth && styles.calCellTextDisabled,
                                selected && styles.calCellTextSelected,
                              ]}>
                              {cell.label ?? ''}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <Text style={[styles.blockLabel, styles.slotsSectionLabel]}>Available slots</Text>
            <View style={styles.slotsRow}>
              {slots.map((slot) => {
                const booked = bookedSlots.has(slot);
                const sel = selectedSlot === slot && !booked;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => !booked && setSelectedSlot((p) => (p === slot ? null : slot))}
                    disabled={booked}
                    style={({ pressed }) => [
                      styles.slotChip,
                      booked && styles.slotChipBooked,
                      sel && styles.slotChipSelected,
                      !booked && !sel && pressed && styles.slotChipPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: booked, selected: sel }}>
                    <Text
                      style={[
                        styles.slotText,
                        booked && styles.slotTextBooked,
                        sel && styles.slotTextSelected,
                      ]}>
                      {slot}
                    </Text>
                    {booked ? <Text style={styles.slotBookedLabel}>Booked</Text> : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.blockLabel, styles.addressSectionLabel]}>Service address</Text>
            <Text style={styles.addressHint}>Where should the professional visit?</Text>
            <View style={styles.addressTypeRow}>
              <Pressable
                onPress={() => setAddressType('home')}
                style={({ pressed }) => [
                  styles.typeChip,
                  addressType === 'home' && styles.typeChipSelected,
                  pressed && styles.typeChipPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: addressType === 'home' }}>
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={addressType === 'home' ? Brand.logoLime : '#374151'}
                />
                <Text
                  style={[styles.typeChipText, addressType === 'home' && styles.typeChipTextSelected]}>
                  Home
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setAddressType('work')}
                style={({ pressed }) => [
                  styles.typeChip,
                  addressType === 'work' && styles.typeChipSelected,
                  pressed && styles.typeChipPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: addressType === 'work' }}>
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={addressType === 'work' ? Brand.logoLime : '#374151'}
                />
                <Text
                  style={[styles.typeChipText, addressType === 'work' && styles.typeChipTextSelected]}>
                  Work
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={serviceAddress}
              onChangeText={setServiceAddress}
              placeholder="Flat / house no., street, area, landmark, city, PIN"
              placeholderTextColor="#9CA3AF"
              style={styles.addressInput}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Full service address"
            />

            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>{formatHourlyRateInr(hourlyRate)}</Text>
              <Text style={styles.priceHint}>Estimated for a 1-hour visit</Text>
            </View>

            <Pressable
              onPress={() => void onConfirm()}
              disabled={!canConfirm}
              style={({ pressed }) => [
                styles.confirmBtn,
                !canConfirm && styles.confirmBtnDisabled,
                pressed && canConfirm && styles.confirmBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Confirm booking">
              {submitting ? (
                <ActivityIndicator color={Brand.logoLime} />
              ) : (
                <Text
                  style={[
                    styles.confirmBtnText,
                    !canConfirm && !submitting && styles.confirmBtnTextDisabled,
                  ]}>
                  Confirm booking
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const CELL_SIZE = 42;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  closeBtn: {
    padding: 4,
    marginTop: -2,
  },
  pressed: {
    opacity: 0.65,
  },
  sheetScroll: {
    maxHeight: 580,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  blockLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  slotsSectionLabel: {
    marginTop: 8,
  },
  dateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.12)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 6,
    gap: 12,
  },
  dateDropdownFocused: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  dateDropdownPressed: {
    opacity: 0.92,
  },
  dateDropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  calendarPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingBottom: 12,
    paddingTop: 8,
    marginBottom: 8,
  },
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calNavBtn: {
    padding: 8,
  },
  calNavBtnDisabled: {
    opacity: 0.4,
  },
  calMonthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLetter: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  calBody: {
    marginBottom: 4,
    gap: 4,
  },
  calRow: {
    flexDirection: 'row',
    gap: 4,
  },
  calCell: {
    flex: 1,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  calCellHidden: {
    opacity: 0,
  },
  calCellToday: {
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.2)',
  },
  calCellSelected: {
    backgroundColor: '#000000',
  },
  calCellDisabled: {
    opacity: 0.35,
  },
  calCellText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  calCellTextHidden: {
    color: 'transparent',
  },
  calCellTextDisabled: {
    color: '#9CA3AF',
  },
  calCellTextSelected: {
    color: Brand.logoLime,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  addressSectionLabel: {
    marginTop: 4,
  },
  addressHint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
    marginTop: -4,
  },
  addressTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.1)',
  },
  typeChipSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  typeChipPressed: {
    opacity: 0.9,
  },
  typeChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  typeChipTextSelected: {
    color: Brand.logoLime,
  },
  addressInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  slotChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.12)',
    minWidth: 96,
    alignItems: 'center',
  },
  slotChipSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: 'rgba(22, 101, 52, 0.45)',
    borderWidth: 2,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  slotChipBooked: {
    opacity: 0.55,
    backgroundColor: '#F3F4F6',
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  slotChipPressed: {
    opacity: 0.88,
    backgroundColor: '#E5E7EB',
  },
  slotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  slotTextSelected: {
    color: '#166534',
  },
  slotTextBooked: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  slotBookedLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priceBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  priceHint: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmBtnPressed: {
    opacity: 0.92,
  },
  confirmBtnDisabled: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.08)',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.logoLime,
    letterSpacing: 0.1,
  },
  confirmBtnTextDisabled: {
    color: '#6B7280',
  },
});
