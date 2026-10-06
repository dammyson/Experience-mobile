import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

const {width, height} = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Unified Rewards',
    subtitle: 'All your loyalty points in one place',
    image: require('../../assets/images/image1.png'),
  },
  {
    id: '2',
    title: 'Earn More',
    subtitle: 'Shop at 500+ partner brands',
    image: require('../../assets/images/image2.png'),
  },
  {
    id: '3',
    title: 'Redeem Easily',
    subtitle: 'Cashback, gift cards, or exclusive perks',
    image: require('../../assets/images/image3.png'),
  },
];

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Onboarding = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Welcome');
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Welcome');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({item}) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(11, 11, 14, 0.8)', 'rgba(11, 11, 14, 0)']}
        style={styles.topGradient}
      />
      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['rgba(11, 11, 14, 0)', 'rgba(11, 11, 14, 1)']}
        style={styles.bottomGradient}
      />
      {/* Text positioned above pagination */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.dotActive,
            index < currentIndex && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Back button overlaid on image */}
      {currentIndex > 0 && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}>
          <BackIcon />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={item => item.id}
        bounces={false}
        style={styles.flatList}
      />

      {/* Bottom section with pagination and buttons */}
      <View style={styles.bottom}>
        {renderPagination()}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={styles.nextText}>Next</Text>
            <ArrowRight />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: 60,
    left: spacing.base,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
  },
  backText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  image: {
    width: '100%',
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  textContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: theme.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: theme.TEXT_SECONDARY,
    lineHeight: 22,
  },
  bottom: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: '#6715EA',
  },
  dotCompleted: {
    backgroundColor: '#6715EA',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  skipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#6715EA',
  },
  nextText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
});

export default Onboarding;
