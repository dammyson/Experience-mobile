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
import Svg, {Path} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../theme/colors';

const PROMO_IMAGE = require('../../assets/images/promo.jpg');

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - 32;

const EmptyOffersIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Path
      d="M25 8.33203V11.6654M25 18.332V21.6654M25 28.332V31.6654M8.33333 8.33203H31.6667C32.5507 8.33203 33.3986 8.68322 34.0237 9.30834C34.6488 9.93346 35 10.7813 35 11.6654V16.6654C34.1159 16.6654 33.2681 17.0166 32.643 17.6417C32.0179 18.2668 31.6667 19.1146 31.6667 19.9987C31.6667 20.8828 32.0179 21.7306 32.643 22.3557C33.2681 22.9808 34.1159 23.332 35 23.332V28.332C35 29.2161 34.6488 30.0639 34.0237 30.6891C33.3986 31.3142 32.5507 31.6654 31.6667 31.6654H8.33333C7.44928 31.6654 6.60143 31.3142 5.97631 30.6891C5.35119 30.0639 5 29.2161 5 28.332V23.332C5.88405 23.332 6.7319 22.9808 7.35702 22.3557C7.98214 21.7306 8.33333 20.8828 8.33333 19.9987C8.33333 19.1146 7.98214 18.2668 7.35702 17.6417C6.7319 17.0166 5.88405 16.6654 5 16.6654V11.6654C5 10.7813 5.35119 9.93346 5.97631 9.30834C6.60143 8.68322 7.44928 8.33203 8.33333 8.33203Z"
      stroke="#F2F2F2"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

const EmptyState = () => (
  <View style={styles.emptyState}>
    <EmptyOffersIcon />
    <Text style={styles.emptyText}>No offers available</Text>
    <Text style={styles.emptySubtext}>Check back later for exclusive deals</Text>
  </View>
);

const OffersSection = ({offers = [], onDetails}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const onScroll = e => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
    );
    setActiveIndex(index);
  };

  if (offers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Offers For You</Text>
        <View style={styles.emptyCard}>
          <EmptyState />
        </View>
      </View>
    );
  }

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
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_SECONDARY,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
  },
});

export default OffersSection;
