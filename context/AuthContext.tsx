import React, {
  createContext, useContext, useEffect, useState, ReactNode, useCallback,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Отправить 6-значный код на email. */
  sendCode: (email: string) => Promise<{ error: string | null }>;
  /** Проверить код и войти. */
  verifyCode: (email: string, code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Восстанавливаем сессию из хранилища при старте.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Слушаем вход/выход/обновление токена.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // Разрешаем создавать нового пользователя при первом входе.
        shouldCreateUser: true,
      },
    });
    return { error: error ? humanize(error.message) : null };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    return { error: error ? humanize(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    sendCode,
    verifyCode,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// Понятные сообщения вместо технических ошибок Supabase.
function humanize(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('token has expired') || m.includes('expired')) return 'Код истёк — запроси новый';
  if (m.includes('invalid') && m.includes('token')) return 'Неверный код';
  if (m.includes('invalid') && m.includes('otp')) return 'Неверный код';
  if (m.includes('rate limit') || m.includes('too many')) return 'Слишком часто — подожди минуту';
  if (m.includes('invalid') && m.includes('email')) return 'Проверь адрес почты';
  return msg;
}
