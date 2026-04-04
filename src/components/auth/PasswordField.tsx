import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const LABEL_COLOR = '#374151';
const INPUT_BORDER = 'rgba(15, 15, 15, 0.12)';
const PLACEHOLDER = '#9CA3AF';

const GAP_LABEL_INPUT = 8;

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  autoComplete?: 'password' | 'password-new';
};

export function PasswordField({
  label,
  value,
  onChangeText,
  autoComplete = 'password',
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.shell}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="••••••••"
          placeholderTextColor={PLACEHOLDER}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          underlineColorAndroid="transparent"
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          style={({ pressed }) => [styles.eyeHit, pressed && styles.eyePressed]}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityRole="button">
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={LABEL_COLOR}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: GAP_LABEL_INPUT,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LABEL_COLOR,
    textAlign: 'left',
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111111',
  },
  eyeHit: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyePressed: {
    opacity: 0.65,
  },
});
