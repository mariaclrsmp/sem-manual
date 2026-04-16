import * as Sharing from 'expo-sharing'
import { useRef } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ViewShot from 'react-native-view-shot'

import { Text } from '@/src/components/ui/Text'
import { colors, fonts } from '@/src/constants/theme'
import { type HomeType, type UserProfile, useProfileStore } from '@/src/stores/profileStore'

export interface StarterPackItem {
  emoji: string
  label: string
}

export interface StarterPackSection {
  title: string
  items: StarterPackItem[]
}

const KITCHEN_STUDIO: StarterPackItem[] = [
  { emoji: '🍳', label: 'Frigideira antiaderente' },
  { emoji: '🥣', label: 'Panela média' },
  { emoji: '🔪', label: 'Faca de chef' },
  { emoji: '🧂', label: 'Sal, azeite e alho' },
  { emoji: '🫙', label: 'Potes herméticos' },
]

const KITCHEN_FULL: StarterPackItem[] = [
  ...KITCHEN_STUDIO,
  { emoji: '🥘', label: 'Panela de pressão' },
  { emoji: '🥗', label: 'Saladeira grande' },
  { emoji: '☕', label: 'Chaleira elétrica' },
]

const CLEANING_STUDIO: StarterPackItem[] = [
  { emoji: '🧹', label: 'Vassoura e pá' },
  { emoji: '🧽', label: 'Esponja dupla face' },
  { emoji: '🧴', label: 'Detergente e desengordurante' },
  { emoji: '🪣', label: 'Balde e rodo' },
  { emoji: '🧻', label: 'Papel toalha' },
]

const CLEANING_FULL: StarterPackItem[] = [
  ...CLEANING_STUDIO,
  { emoji: '🫧', label: 'Água sanitária' },
  { emoji: '🧺', label: 'Cesto de roupa suja' },
  { emoji: '🪥', label: 'Escova sanitária' },
]

const BEDROOM_STUDIO: StarterPackItem[] = [
  { emoji: '🛏️', label: 'Jogo de cama completo' },
  { emoji: '🪞', label: 'Espelho de corpo inteiro' },
  { emoji: '💡', label: 'Luminária de cabeceira' },
  { emoji: '📦', label: 'Caixas organizadoras' },
  { emoji: '🧦', label: 'Organizador de gaveta' },
]

const BEDROOM_FULL: StarterPackItem[] = [
  ...BEDROOM_STUDIO,
  { emoji: '🛁', label: 'Tapete de banheiro' },
  { emoji: '🪴', label: 'Planta de interior fácil' },
  { emoji: '🔧', label: 'Kit ferramentas básico' },
]

const PET_ITEMS: StarterPackItem[] = [
  { emoji: '🥣', label: 'Comedouro e bebedouro' },
  { emoji: '🧸', label: 'Brinquedo interativo' },
  { emoji: '🪮', label: 'Escova para pelo' },
  { emoji: '🧹', label: 'Rolo tira-pelos' },
  { emoji: '🛁', label: 'Shampoo pet' },
  { emoji: '🏥', label: 'Carteira de vacinação em dia' },
]

function getSectionsByHomeType(homeType: HomeType): {
  kitchen: StarterPackItem[]
  cleaning: StarterPackItem[]
  bedroom: StarterPackItem[]
} {
  const full = homeType !== 'studio'
  return {
    kitchen: full ? KITCHEN_FULL : KITCHEN_STUDIO,
    cleaning: full ? CLEANING_FULL : CLEANING_STUDIO,
    bedroom: full ? BEDROOM_FULL : BEDROOM_STUDIO,
  }
}

export function generateStarterPack(profile: UserProfile): StarterPackSection[] {
  const { kitchen, cleaning, bedroom } = getSectionsByHomeType(profile.home_type)

  const sections: StarterPackSection[] = [
    { title: '🍳 Cozinha', items: kitchen },
    { title: '🧹 Limpeza', items: cleaning },
    { title: '🛏️ Quarto', items: bedroom },
  ]

  if (profile.has_pet) {
    sections.push({ title: '🐾 Pet', items: PET_ITEMS })
  }

  return sections
}

function PackCard({
  profile,
  sections,
}: {
  profile: UserProfile
  sections: StarterPackSection[]
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{profile.name}'s</Text>
        <Text style={styles.cardSubtitle}>Starter Pack 🏠</Text>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.itemsGrid}>
            {section.items.map((item) => (
              <View key={item.label} style={styles.item}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.cardFooter}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>Sem Manual · semmanual.app</Text>
      </View>
    </View>
  )
}

const MOCK_PROFILE: UserProfile = {
  name: 'Você',
  home_type: 'apartment',
  has_pet: false,
}

export default function StarterPackScreen() {
  const cardRef = useRef<ViewShot>(null)
  const profile = useProfileStore((s) => s.profile) ?? MOCK_PROFILE
  const sections = generateStarterPack(profile)

  async function handleShare() {
    try {
      const uri = await cardRef.current!.capture!()
      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) {
        Alert.alert('Compartilhamento indisponível', 'Seu dispositivo não suporta compartilhamento.')
        return
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar meu Starter Pack',
      })
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar o card.')
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.fundo }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.verde} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.verde }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seu Starter Pack</Text>
          <Text style={styles.headerSub}>Tudo que você precisa para começar</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }}>
          <PackCard profile={profile} sections={sections} />
        </ViewShot>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.shareButton, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.shareButtonText}>📤 Compartilhar meu starter pack</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 2,
  },
  headerTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: '#fff',
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#2E2E2E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    backgroundColor: colors.verde,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  cardTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: '#fff',
  },
  cardSubtitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors.texto,
  },
  itemsGrid: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  itemEmoji: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  itemLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.texto,
    flex: 1,
  },
  cardFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    alignItems: 'center',
    gap: 10,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  footerText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 0.4,
  },
  shareButton: {
    backgroundColor: colors.verde,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.verde,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  shareButtonText: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: '#fff',
  },
})
