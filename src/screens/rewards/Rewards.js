import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';

// ── Mock promo data ────────────────────────────────────────────────────────
// Drop in additional images to src/assets/images/ and add entries here
const PROMOS = [
  {
    id: '1',
    image: require('../../assets/images/promo.jpg'),
    label: 'Discount up to',
    value: '25%',
    description: 'minimum transaction $500 in IKEA\nwith Credit Card',
    dates: '25 – 29 Nov 2025',
  },
  {
    id: '2',
    image: require('../../assets/images/apple.jpg'),
    label: 'Save on',
    value: '15%',
    description: 'on electronics purchases over\n$300 with Store Card',
    dates: '1 – 5 Dec 2025',
  },
  {
    id: '3',
    image: require('../../assets/images/travel.jpg'),
    label: 'Cashback of',
    value: '10%',
    description: 'on travel bookings above $200\nvia App',
    dates: '10 – 15 Dec 2025',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────
const PromoCard = ({item}) => (
  <ImageBackground
    source={item.image}
    style={styles.card}
    imageStyle={styles.cardImage}
    resizeMode="cover">
    <LinearGradient
      colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.3)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.cardContent}>
      <View style={styles.cardBody}>
        <Text style={styles.cardLabel}>{item.label}</Text>
        <Text style={styles.cardValue}>{item.value}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <Text style={styles.cardDates}>{item.dates}</Text>
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.tnc}>Term of Condition</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8}>
          <Text style={styles.detailsBtnText}>See Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>
);

// ── Screen ─────────────────────────────────────────────────────────────────
const Rewards = () => (
  <ScreenBackground>
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <AppHeader
        title="Promo & Rewards"
        showCard
        onCard={() => {}}
      />
      <View style={styles.list}>
        {PROMOS.map(item => (
          <PromoCard key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
  </ScreenBackground>
);

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {paddingBottom: 110},

  list: {
    paddingHorizontal: spacing.base,
    gap: 16,
  },

  // Promo card
  card: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardBody: {
    gap: 4,
  },
  cardLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
    opacity: 0.85,
  },
  cardValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 40,
    lineHeight: 46,
    color: theme.TEXT_WHITE,
  },
  cardDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_PRIMARY,
    lineHeight: 19,
  },
  cardDates: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tnc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    textDecorationLine: 'underline',
  },
  detailsBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  detailsBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.WHITE,
  },
});

export default Rewards;
