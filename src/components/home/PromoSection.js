import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SectionHeader from './SectionHeader';
import { theme } from '../../theme/colors';

const PROMO_IMAGE = require('../../assets/images/promo.jpg');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding each side

const PROMOS = [
  {
    id: '1',
    discountLabel: 'Discount up to',
    discountAmount: '25%',
    details: 'minimum transaction $500 \nin IKEA with Credit Card',
    date: '25–29 June 2025',
    terms: 'Term of Condition',
  },
  {
    id: '2',
    discountLabel: 'Save on',
    discountAmount: '15%',
    details: 'on electronics purchases over\n$300 with Store Card',
    date: '1–5 Dec 2025',
    terms: 'Term of Condition',
  },
  {
    id: '3',
    discountLabel: 'Cashback of',
    discountAmount: '10%',
    details: 'on travel bookings above $200 via\nApp',
    date: '10–15 Dec 2025',
    terms: 'Term of Condition',
  },
];

const PromoCard = ({ promo, onDetails }) => (
  <ImageBackground
    source={PROMO_IMAGE}
    style={styles.card}
    imageStyle={styles.cardImage}
  >
    {/* Gradient overlay left-to-right for text readability */}
    <LinearGradient
      colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.15)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />

    {/* Text content — x:26, y:13, width 193 */}
    <View style={styles.cardContent}>
      <View style={styles.discountBlock}>
        <Text style={styles.discountLabel}>{promo.discountLabel}</Text>
        <Text style={styles.discountAmount}>{promo.discountAmount}</Text>
        <Text style={styles.discountDetails}>{promo.details}</Text>
      </View>
      <Text style={styles.discountDate}>{promo.date}</Text>
      <Text style={styles.terms}>{promo.terms}</Text>
    </View>

    {/* See Details button — Brand/br400, borderRadius 16, padding 8, bottom-right */}
    <TouchableOpacity
      style={styles.detailsBtn}
      onPress={onDetails}
      activeOpacity={0.85}
    >
      <Text style={styles.detailsBtnText}>See Details</Text>
    </TouchableOpacity>
  </ImageBackground>
);

const PaginationDots = ({ count, activeIndex }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[styles.dot, i === activeIndex && styles.dotActive]}
      />
    ))}
  </View>
);

const PromoSection = ({ onSeeAll }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const onScroll = e => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Promo & Rewards" onSeeAll={onSeeAll} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {PROMOS.map(promo => (
          <PromoCard key={promo.id} promo={promo} onDetails={() => {}} />
        ))}
      </ScrollView>

      <PaginationDots count={PROMOS.length} activeIndex={activeIndex} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  scrollContent: {
    gap: CARD_GAP,
  },
  // Promo card — height 221, fill width, borderRadius 28, overflow hidden
  card: {
    width: CARD_WIDTH,
    height: 221,
    borderRadius: 28,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 28,
    resizeMode: 'cover',
  },
  cardContent: {
    position: 'absolute',
    left: 10,
    top: 13,
    width: 200,
    gap: 6,
  },
  discountBlock: {
    gap: 2,
  },
  discountLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.WHITE,
    textAlign: 'center',
  },
  discountAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 36,
    lineHeight: 50,
    color: theme.WHITE,
    textAlign: 'center',
  },
  discountDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.WHITE,
    textAlign: 'center',
  },
  discountDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: theme.WHITE,
    opacity: 0.82,
    marginTop: 4,
    textAlign: 'center',
  },
  terms: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: theme.WHITE,
    opacity: 0.82,
    textAlign: 'center',
  },
  // See Details — Brand/br400 #6715EA, borderRadius 16, padding 8, absolute bottom-right
  detailsBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: theme.BRAND_400,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  detailsBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: theme.WHITE,
  },
  // Pagination dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B5B5B5',
  },
  dotActive: {
    backgroundColor: theme.PRIMARY_COLOR,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default PromoSection;
