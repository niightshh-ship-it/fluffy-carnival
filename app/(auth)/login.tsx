import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard,
} from 'react-native';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { Colors, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 45;

export default function LoginScreen() {
  const { sendCode, verifyCode } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<TextInput>(null);

  // Таймер для повторной отправки кода.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSendCode = async () => {
    Keyboard.dismiss();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Введи корректный email');
      return;
    }
    setBusy(true);
    const { error } = await sendCode(email);
    setBusy(false);
    if (error) { setError(error); return; }
    setStep('code');
    setCooldown(RESEND_SECONDS);
    setTimeout(() => codeRef.current?.focus(), 250);
  };

  const onVerify = async (value?: string) => {
    const c = (value ?? code).trim();
    setError(null);
    if (c.length < 6) { setError('Код состоит из 6 цифр'); return; }
    setBusy(true);
    const { error } = await verifyCode(email, c);
    setBusy(false);
    if (error) { setError(error); setCode(''); return; }
    // Успех — навигация произойдёт автоматически через AuthProvider/index.
  };

  const onResend = async () => {
    if (cooldown > 0 || busy) return;
    setError(null);
    setBusy(true);
    const { error } = await sendCode(email);
    setBusy(false);
    if (error) { setError(error); return; }
    setCooldown(RESEND_SECONDS);
  };

  const changeEmail = () => {
    setStep('email');
    setCode('');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AuroraBackground active />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Лого */}
          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Icon name="bolt" size={30} color={Colors.background} />
            </View>
            <Text style={styles.logo}>ДВИЖ</Text>
            <Text style={styles.tagline}>движ начинается с тебя</Text>
          </View>

          {step === 'email' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Вход по коду</Text>
              <Text style={styles.cardSub}>
                Пришлём 6-значный код на почту. Пароль не нужен.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="твой@email.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(null); }}
                onSubmitEditing={onSendCode}
                returnKeyType="go"
                editable={!busy}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.btn, busy && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={onSendCode}
                disabled={busy}
              >
                {busy
                  ? <ActivityIndicator color={Colors.background} />
                  : <Text style={styles.btnTxt}>Получить код</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Введи код</Text>
              <Text style={styles.cardSub}>
                Отправили на <Text style={styles.email}>{email}</Text>
              </Text>

              <TextInput
                ref={codeRef}
                style={[styles.input, styles.codeInput]}
                placeholder="••••••"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, '').slice(0, 6);
                  setCode(digits);
                  setError(null);
                  if (digits.length === 6) onVerify(digits);
                }}
                editable={!busy}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.btn, busy && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={() => onVerify()}
                disabled={busy}
              >
                {busy
                  ? <ActivityIndicator color={Colors.background} />
                  : <Text style={styles.btnTxt}>Войти</Text>}
              </TouchableOpacity>

              <View style={styles.row}>
                <TouchableOpacity onPress={changeEmail} disabled={busy}>
                  <Text style={styles.link}>Изменить почту</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onResend} disabled={cooldown > 0 || busy}>
                  <Text style={[styles.link, cooldown > 0 && styles.linkMuted]}>
                    {cooldown > 0 ? `Повтор через ${cooldown}с` : 'Отправить снова'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={styles.legal}>
            Входя, ты соглашаешься двигаться по-настоящему 🔥
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 28 },

  brand: { alignItems: 'center', gap: 8 },
  logoMark: {
    width: 64, height: 64, borderRadius: 22,
    backgroundColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 22,
  },
  logo: { fontFamily: Fonts.display, fontSize: 40, letterSpacing: 2, color: Colors.text },
  tagline: { fontFamily: Fonts.regular, fontSize: FontSize.md, color: Colors.textMuted },

  card: {
    backgroundColor: Colors.surface1,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: 22,
    gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.5, shadowRadius: 30,
  },
  cardTitle: { fontFamily: Fonts.display, fontSize: FontSize.xxl, color: Colors.text },
  cardSub: { fontFamily: Fonts.regular, fontSize: FontSize.md, color: Colors.textMuted, lineHeight: 20, marginTop: -4 },
  email: { fontFamily: Fonts.monoBold, color: Colors.cyan },

  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 15,
    fontFamily: Fonts.medium, fontSize: 17, color: Colors.text,
  },
  codeInput: {
    textAlign: 'center',
    fontFamily: Fonts.monoBold,
    fontSize: 30, letterSpacing: 14,
  },

  error: { fontFamily: Fonts.medium, fontSize: FontSize.sm, color: Colors.hot, marginTop: -4 },

  btn: {
    backgroundColor: Colors.lime,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 18,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.background },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  link: { fontFamily: Fonts.semiBold, fontSize: FontSize.sm, color: Colors.cyan },
  linkMuted: { color: Colors.textMuted },

  legal: { fontFamily: Fonts.regular, fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});
