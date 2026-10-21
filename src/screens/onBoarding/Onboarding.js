import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Defs, RadialGradient, Stop, Rect} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenBackground from '../../components/layout/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import {colors, gradients, fonts, type, layout} from '../../theme/tokens';

const SLIDES = [
  {
    id: 'earn',
    title: 'Earn everywhere',
    body: 'Collect loyalty points from the places you already love, all in one wallet.',
    glyph: 'pts',
    tile: gradients.brandCard.colors.slice(0, 2),
    ink: colors.white,
  },
  {
    id: 'spend',
    title: 'Spend smarter',
    body: 'Turn your points into rewards and pay for eligible purchases with them.',
    glyph: '₦',
    tile: [colors.success, colors.success],
    ink: '#0A2E22',
  },
  {
    id: 'grow',
    title: 'Grow your business',
    body: 'Merchants: give customers a reason to come back, and see what works.',
    glyph: '↗',
    tile: [colors.white, colors.white],
    ink: '#101828',
  },
];

const Hero = ({slide, width}) => (
  <View style={[styles.hero, {width}]} accessible={false} importantForAccessibility="no-hide-descendants">
    <View style={[styles.ring, styles.ringOuter]} />
    <View style={[styles.ring, styles.ringInner]} />
    <LinearGradient colors={slide.tile} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.tile}>
      <Text style={[styles.glyph, {color: slide.ink}]}>{slide.glyph}</Text>
    </LinearGradient>
    <View style={[styles.floatChip, styles.floatChipLight]}>
      <Text style={[styles.floatChipText, styles.floatChipTextDark]}>+120 pts · Kopi House</Text>
    </View>
    <View style={[styles.floatChip, styles.floatChipDark]}>
      <Text style={[styles.floatChipText, styles.floatChipTextMint]}>+80 pts · Pulse Gym</Text>
    </View>
  </View>
);

const Onboarding = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const goTo = i => {
    listRef.current?.scrollToIndex({index: i, animated: true});
    setIndex(i);
  };

  const leave = async route => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace(route);
  };

  const handleNext = () => (isLast ? leave('SignUp') : goTo(index + 1));

  const onMomentumScrollEnd = e => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="onboardingGlow" cx="50%" cy="38%" rx="90%" ry="55%">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.45} />
            <Stop offset="0.7" stopColor={colors.bg} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#onboardingGlow)" />
      </Svg>

      <View style={[styles.topBar, {paddingTop: insets.top + 12}]}>
        <View style={styles.brand}>
          <Image
            source={require('../../assets/images/arena_logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.brandText}>Arena</Text>
        </View>
        {!isLast && (
          <TouchableOpacity
            onPress={() => goTo(SLIDES.length - 1)}
            style={styles.skip}
            accessibilityRole="button"
            activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        renderItem={({item}) => <Hero slide={item} width={width} />}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({length: width, offset: width * i, index: i})}
        style={styles.flex}
      />

      <View style={[styles.bottom, {paddingBottom: Math.max(40, insets.bottom + 16)}]}>
        <View style={styles.copy}>
          <View style={styles.dots} accessibilityRole="tablist">
            {SLIDES.map((s, i) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => goTo(i)}
                accessibilityRole="tab"
                accessibilityState={{selected: i === index}}
                accessibilityLabel={`Step ${i + 1}: ${s.title}`}
                hitSlop={{top: 18, bottom: 18, left: 4, right: 4}}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {slide.title}
          </Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title={isLast ? 'Create account' : 'Continue'} onPress={handleNext} />
          <TouchableOpacity
            onPress={() => leave('Login')}
            style={styles.secondaryLink}
            accessibilityRole="button"
            activeOpacity={0.7}>
            <Text style={styles.secondaryLinkText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 44,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 24,
    height: 30,
  },
  brandText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    letterSpacing: -0.17,
    color: colors.white,
  },
  skip: {
    height: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  skipText: {
    ...type.button,
    color: '#C7CCE0',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  ringOuter: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderColor: 'rgba(199,204,224,0.16)',
  },
  ringInner: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderColor: 'rgba(199,204,224,0.22)',
  },
  tile: {
    width: 132,
    height: 132,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '-6deg'}],
  },
  glyph: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
  },
  floatChip: {
    position: 'absolute',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  floatChipLight: {
    top: '18%',
    left: 30,
    backgroundColor: colors.white,
  },
  floatChipDark: {
    bottom: '20%',
    right: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  floatChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  floatChipTextDark: {
    color: '#101828',
  },
  floatChipTextMint: {
    color: colors.success,
  },
  bottom: {
    paddingHorizontal: 24,
    gap: 32,
  },
  copy: {
    gap: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(199,204,224,0.35)',
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.success,
  },
  title: {
    marginTop: 8,
    fontFamily: fonts.semiBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#C7CCE0',
  },
  actions: {
    gap: 10,
  },
  secondaryLink: {
    height: layout.ctaHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLinkText: {
    ...type.button,
    color: colors.white,
  },
});

export default Onboarding;
