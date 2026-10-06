import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {SearchInput} from '../../components/ui';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import Svg, {Path} from 'react-native-svg';

// FAQ Data
const FAQ_DATA = [
  {
    id: '1',
    question: 'How to verify my identity?',
    answer: 'To verify your identity, go to Profile > Contact & Verification and follow the steps to upload your ID document and take a selfie.',
  },
  {
    id: '2',
    question: 'How to withdraw?',
    answer: 'To withdraw funds, go to your wallet, tap Withdraw, select your preferred bank account, enter the amount and confirm the transaction.',
  },
  {
    id: '3',
    question: 'Why is my top up pending?',
    answer: 'Top ups may be pending due to bank processing times, network issues, or verification requirements. Most top ups are processed within minutes.',
  },
  {
    id: '4',
    question: 'Account security tips',
    answer: 'Keep your account secure by enabling 2FA, using a strong PIN, never sharing your credentials, and regularly reviewing your transaction history.',
  },
];

const ChevronRight = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6l6 6-6 6"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FAQItem = ({item, onPress, showDivider = true}) => (
  <>
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}>
      <Text style={styles.faqQuestion}>Q: {item.question}</Text>
      <ChevronRight />
    </TouchableOpacity>
    {showDivider && <View style={styles.divider} />}
  </>
);

const FAQ = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filteredFAQs = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;
    const searchLower = search.toLowerCase();
    return FAQ_DATA.filter(
      faq =>
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower),
    );
  }, [search]);

  const handleFAQPress = (item) => {
    // Could navigate to FAQ detail screen
    // For now, we'll just log it
    console.log('FAQ pressed:', item);
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <BackIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search FAQ"
          />
        </View>

        {/* FAQ List */}
        <View style={styles.faqList}>
          {filteredFAQs.map((item, index) => (
            <FAQItem
              key={item.id}
              item={item}
              onPress={handleFAQPress}
              showDivider={index < filteredFAQs.length - 1}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredFAQs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No FAQs found</Text>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  faqList: {
    paddingHorizontal: spacing.base,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: theme.TEXT_PRIMARY,
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: theme.TEXT_MUTED,
  },
});

export default FAQ;
