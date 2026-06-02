import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Colors, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

const { width } = Dimensions.get('window');

// Placeholder posts — will come from Supabase realtime in Step 5
const DEMO_POSTS = [
  {
    id: '1',
    user: 'ghost_urban',
    avatar: '👻',
    level: 12,
    questTitle: 'Тайный агент',
    rarity: 'Эпик' as const,
    caption: 'Дед реально поверил что я потерял осьминога 💀 лучший день в жизни',
    likes: 84,
    comments: 12,
    time: '2м',
    liked: false,
  },
  {
    id: '2',
    user: 'neon_vanya',
    avatar: '🦊',
    level: 7,
    questTitle: 'Рассвет на крыше',
    rarity: 'Редкий' as const,
    caption: 'Вышел в 4 утра. Не пожалел ни секунды. Хайп Жорика +50 😤',
    likes: 231,
    comments: 34,
    time: '17м',
    liked: true,
  },
  {
    id: '3',
    user: 'katya_boom',
    avatar: '🔥',
    level: 23,
    questTitle: 'Добрый детектив',
    rarity: 'Легендарка' as const,
    caption: 'Нашла бабуле её кота. Она накормила меня пирогами. Это лучший квест ever.',
    likes: 512,
    comments: 67,
    time: '1ч',
    liked: false,
  },
];

interface PostCardProps {
  post: (typeof DEMO_POSTS)[0];
}

function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  return (
    <Card style={styles.postCard}>
      {/* User row */}
      <View style={styles.postHeader}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarEmoji}>{post.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userRow}>
            <Text style={styles.username}>{post.user}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LVL {post.level}</Text>
            </View>
          </View>
          <Text style={styles.postTime}>{post.time} назад</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Quest tag */}
      <View style={styles.questTag}>
        <Ionicons name="flash" size={11} color={Colors.lime} />
        <Text style={styles.questTagText}>{post.questTitle}</Text>
        <RarityBadge rarity={post.rarity} />
      </View>

      {/* Media placeholder */}
      <View style={styles.mediaBox}>
        <Ionicons name="image-outline" size={40} color={Colors.textDisabled} />
        <Text style={styles.mediaPlaceholder}>Фото/Видео пруф</Text>
      </View>

      {/* Caption */}
      <Text style={styles.caption}>{post.caption}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setLiked(!liked);
            setLikes(liked ? likes - 1 : likes + 1);
          }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? Colors.pink : Colors.textMuted}
          />
          <Text style={[styles.actionCount, liked && { color: Colors.pink }]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ЛЕНТА</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        {['Все', 'Эпик', 'Легендарка', 'Рядом', 'Подписки'].map((f, i) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, i === 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={DEMO_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: 3,
  },

  filters: { maxHeight: 44 },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.limeDim,
    borderColor: Colors.lime,
  },
  filterText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  filterTextActive: { color: Colors.lime },

  listContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },

  postCard: { gap: 0 },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarEmoji: { fontSize: 20 },
  userInfo: { flex: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  levelText: {
    fontFamily: Fonts.monoBold,
    fontSize: 9,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  postTime: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },

  questTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  questTagText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.lime,
    flex: 1,
  },

  mediaBox: {
    height: width - Spacing.md * 2 - Spacing.md * 2,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  mediaPlaceholder: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textDisabled,
    marginTop: 8,
  },

  caption: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing.md,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
