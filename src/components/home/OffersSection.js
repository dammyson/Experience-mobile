import React, {useRef, useState} from 'react';
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
import {theme} from '../../theme/colors';

const PROMO_IMAGE = require('../../assets/images/promo.jpg');

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - 32;

const OFFERS = [
  {
    id: '1',
    title: 'Rewards This Weekend',
    highlight: '2x points',
    description: 'Earn 500 Bonus Points',
    terms: 'Term of Condition',
  },
  {
    id: '2',
    title: 'Limited Time Offer',
    highlight: '3x points',
    description: 'On All Travel Bookings',
    terms: 'Term of Condition',
  },
  {
    id: '3',
    title: 'New Member Bonus',
    highlight: '1000 pts',
    description: 'Sign Up Reward Available',
    terms: 'Term of Condition',
  },
];

const OfferCard = ({offer, onDetails}) => (
  <ImageBackground
    source={PROMO_IMAGE}
    style={styles.card}
    imageStyle={styles.cardImage}>
    {/* Gradient overlay */}
    <LinearGradient
      colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={StyleSheet.absoluteFill}
    />

    {/* Content */}
    <View style={styles.cardContent}>
      <View style={styles.textContainer}>
        <View style={styles.textGroup}>
          <Text style={styles.titleText}>{offer.title}</Text>
          <Text style={styles.highlightText}>{offer.highlight}</Text>
        </View>
        <Text style={styles.descriptionText}>{offer.description}</Text>
        <Text style={styles.termsText}>{offer.terms}</Text>
      </View>
    </View>

    {/* See Details button */}
    <TouchableOpacity
      style={styles.detailsBtn}
      onPress={() => onDetails?.(offer)}
      activeOpacity={0.85}>
      <Text style={styles.detailsBtnText}>See Details</Text>
    </TouchableOpacity>
  </ImageBackground>
);

const PaginationDots = ({count, activeIndex}) => (
  <View style={styles.dotsRow}>
    {Array.from({length: count}).map((_, i) => (
      <View
        key={i}
        style={[styles.dot, i === activeIndex && styles.dotActive]}
      />
    ))}
  </View>
);

const OffersSection = ({offers = OFFERS, onDetails}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const onScroll = e => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
    );
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Offers For You</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}>
        {offers.map(offer => (
          <OfferCard key={offer.id} offer={offer} onDetails={onDetails} />
        ))}
      </ScrollView>

      <PaginationDots count={offers.length} activeIndex={activeIndex} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    lineHeight: 26,
    color: theme.WHITE,
    marginBottom: 4,
  },
  scrollContent: {
    gap: CARD_GAP,
  },
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
    left: 68,
    top: 36,
    width: 261,
    gap: 10,
  },
  textContainer: {
    gap: 4,
  },
  textGroup: {
    gap: 8,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  highlightText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 36,
    lineHeight: 50,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  termsText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: theme.TEXT_PRIMARY,
    opacity: 0.82,
    textAlign: 'center',
  },
  detailsBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: theme.BRAND_400,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  detailsBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
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
  },
});

export default OffersSection;
