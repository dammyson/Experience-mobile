import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

// Mock data
const SAVED_CARDS = [
  {
    id: '1',
    type: 'visa',
    lastFour: '8096',
    maskedNumber: '**** **** **** 8096',
  },
];

const LINKED_BANKS = [
  {
    id: '1',
    name: 'Bank of America',
    lastFour: '5678',
    logo: 'boa',
  },
];

// Icons
const VisaLogo = () => (
  <Svg width={50} height={16} viewBox="0 0 50 16" fill="none">
    <Path
      d="M19.5 1.2L16.3 14.8H13L16.2 1.2H19.5ZM35.5 9.8L37.2 4.8L38.2 9.8H35.5ZM39.3 14.8H42.3L39.7 1.2H37C36.2 1.2 35.5 1.7 35.2 2.4L29.7 14.8H33.3L34 12.9H38.5L39.3 14.8ZM30.5 10.1C30.5 6.5 25.4 6.3 25.4 4.7C25.4 4.2 25.9 3.6 27 3.5C27.5 3.4 29.1 3.4 30.8 4.1L31.5 1.6C30.6 1.3 29.4 1 28 1C24.6 1 22.2 2.8 22.2 5.4C22.2 7.3 23.9 8.4 25.2 9C26.5 9.7 27 10.1 26.9 10.7C26.9 11.6 25.8 11.9 24.8 12C23 12 22 11.6 21.1 11.2L20.4 13.8C21.3 14.2 23 14.5 24.8 14.5C28.4 14.5 30.5 12.8 30.5 10.1ZM14 1.2L8.5 14.8H4.8L2 3.7C1.8 3 1.6 2.7 1.1 2.4C0.3 2 -0.1 1.7 0 1.7L0 1.2H5.8C6.6 1.2 7.3 1.7 7.5 2.6L8.8 9.6L12.3 1.2H14Z"
      fill="#1A1F71"
    />
  </Svg>
);

const BankOfAmericaLogo = () => (
  <Svg width={40} height={24} viewBox="0 0 40 24" fill="none">
    <Rect width={40} height={24} rx={4} fill="#FFFFFF" />
    <Path
      d="M8 8L12 6L16 8L20 6L24 8L28 6L32 8"
      stroke="#E31837"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M8 12L12 10L16 12L20 10L24 12L28 10L32 12"
      stroke="#012169"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M8 16L12 14L16 16L20 14L24 16L28 14L32 16"
      stroke="#E31837"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#6715EA"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CardItem = ({card, onEdit, onDelete}) => (
  <>
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={styles.logoContainer}>
          <VisaLogo />
        </View>
        <Text style={styles.itemText}>{card.maskedNumber}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(card)}
          activeOpacity={0.7}>
          <EditIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onDelete(card)}
          activeOpacity={0.7}>
          <DeleteIcon />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.divider} />
  </>
);

const BankItem = ({bank, onEdit, onDelete}) => (
  <>
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={styles.bankLogoContainer}>
          <BankOfAmericaLogo />
        </View>
        <Text style={styles.itemText}>
          {bank.name} ****{bank.lastFour}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(bank)}
          activeOpacity={0.7}>
          <EditIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onDelete(bank)}
          activeOpacity={0.7}>
          <DeleteIcon />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.divider} />
  </>
);

const AddButton = ({label, onPress}) => (
  <TouchableOpacity style={styles.addBtn} onPress={onPress} activeOpacity={0.7}>
    <PlusIcon />
    <Text style={styles.addBtnText}>{label}</Text>
  </TouchableOpacity>
);

const CardsAndBanks = () => {
  const navigation = useNavigation();

  const handleEditCard = card => {
    console.log('Edit card:', card);
  };

  const handleDeleteCard = card => {
    console.log('Delete card:', card);
  };

  const handleEditBank = bank => {
    console.log('Edit bank:', bank);
  };

  const handleDeleteBank = bank => {
    console.log('Delete bank:', bank);
  };

  const handleAddCard = () => {
    console.log('Add new card');
  };

  const handleAddBank = () => {
    console.log('Add new bank');
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <BackIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cards & Banks</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Saved Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          {SAVED_CARDS.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          ))}
          <AddButton label="Add New Cards" onPress={handleAddCard} />
        </View>

        {/* Linked Bank Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Bank Accounts</Text>
          {LINKED_BANKS.map(bank => (
            <BankItem
              key={bank.id}
              bank={bank}
              onEdit={handleEditBank}
              onDelete={handleDeleteBank}
            />
          ))}
          <AddButton label="Add New Bank" onPress={handleAddBank} />
        </View>
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
  section: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logoContainer: {
    width: 50,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogoContainer: {
    width: 40,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: theme.TEXT_PRIMARY,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: '#6715EA',
  },
});

export default CardsAndBanks;
