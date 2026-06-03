import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Project URL и publishable-ключ безопасны для клиента — они и предназначены,
// чтобы жить в коде приложения. СЕКРЕТНЫЙ ключ (sb_secret_...) сюда класть НЕЛЬЗЯ:
// он только для серверных Edge Functions.
const SUPABASE_URL = 'https://djbcpdtadrdcgfssgqea.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Ko1BjOT7aN6Xb8UlgisVuw_R-JLpg3C';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // В мобильном приложении сессия не приходит через URL.
    detectSessionInUrl: false,
  },
});
