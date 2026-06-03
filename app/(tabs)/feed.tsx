import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { TopBar } from '@/components/ui/TopBar';
import { Toast } from '@/components/ui/Toast';
import { useGame } from '@/context/GameContext';
import { FEED_POSTS } from '@/constants/data';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

/** A single bolt that flies up and fades when a post is hyped. */
function FlyBolt({ trigger }: { trigger: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trigger === 0) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [trigger, anim]);

  if (trigger === 0) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -46] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.3] });

  return (
    <Animated.View style={[styles.fly, { opacity, transform: [{ translateY }, { scale }] }]}>
      <Icon name="bolt" size={22} color={Colors.lime} />
    </Animated.View>
  );
}

export default function FeedScreen() {
  const { liked, hypeCounts, toggleLike } = useGame();
  const [ftab, setFtab] = useState<'hot' | 'fr'>('hot');
  const [flies, setFlies] = useState<Record<number, number>>({});

  const onLike = (i: number) => {
    const wasLiked = liked[i];
    toggleLike(i);
    if (!wasLiked) {
      setFlies(f => ({ ...f, [i]: (f[i] || 0) + 1 }));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.feedTabs}>
          <TouchableOpacity onPress={() => setFtab('hot')}>
            <Text style={[styles.feedTab, ftab === 'hot' && styles.feedTabActive]}>Горячее</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFtab('fr')}>
            <Text style={[styles.feedTab, ftab === 'fr' && styles.feedTabActive]}>Друзья</Text>
          </TouchableOpacity>
        </View>

        {FEED_POSTS.map((p, i) => (
          <View style={styles.post} key={i}>
            <View style={styles.postHead}>
              <View style={styles.ava} />
              <View>
                <Text style={styles.postName}>{p.name}</Text>
                <Text style={styles.postTime}>{p.time}</Text>
              </View>
            </View>

            <View style={styles.media}>
              <View style={styles.play}>
                <Icon name="play" size={22} color="#fff" />
              </View>
              {p.hot && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>🔥 в топе движа</Text>
                </View>
              )}
            </View>

            <Text style={styles.caption}>{p.caption}</Text>

            <View style={styles.postFoot}>
              <TouchableOpacity
                style={[styles.hypeBtn, liked[i] && styles.hypeBtnLiked]}
                activeOpacity={0.8}
                onPress={() => onLike(i)}
              >
                <Icon name="bolt" size={16} color={liked[i] ? Colors.background : Colors.lime} />
                <Text style={[styles.hypeBtnTxt, liked[i] && { color: Colors.background }]}>
                  {hypeCounts[i]}
                </Text>
                <FlyBolt trigger={flies[i] || 0} />
              </TouchableOpacity>

              <View style={styles.cmt}>
                <Icon name="comment" size={16} color={Colors.textMuted} />
                <Text style={styles.cmtTxt}>{p.cmt}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },

  feedTabs: { flexDirection: 'row', gap: 18, marginTop: 2, marginBottom: 14 },
  feedTab: {
    fontFamily: Fonts.bold, fontSize: 20,
    color: Colors.textMuted, paddingVertical: 2,
  },
  feedTabActive: {
    color: Colors.text,
    borderBottomWidth: 3, borderBottomColor: Colors.lime,
  },

  post: {
    backgroundColor: Colors.surface1,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 28,
  },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 12 },
  ava: {
    width: 40, height: 40, borderRadius: 15,
    backgroundColor: Colors.violet,
  },
  postName: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.text },
  postTime: { fontFamily: Fonts.regular, fontSize: 12.5, color: Colors.textMuted },

  media: {
    aspectRatio: 4 / 3,
    borderRadius: Radius.lg,
    backgroundColor: '#1c2436',
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  play: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', left: 12, bottom: 12,
    paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badgeTxt: { fontFamily: Fonts.mono, fontSize: 12, color: '#fff' },

  caption: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text, marginTop: 12 },

  postFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12 },
  hypeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingVertical: 9, paddingHorizontal: 15,
    borderRadius: Radius.md,
    backgroundColor: Colors.chipBg, borderWidth: 1, borderColor: Colors.chipBorder,
  },
  hypeBtnLiked: { backgroundColor: Colors.lime, borderColor: 'transparent' },
  hypeBtnTxt: { fontFamily: Fonts.monoBold, fontSize: 14, color: Colors.text },
  cmt: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cmtTxt: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.textMuted },

  fly: { position: 'absolute', left: '50%', top: 0 },
});
