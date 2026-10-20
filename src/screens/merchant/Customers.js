import React from 'react';
import {View, ScrollView, StatusBar, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import {Button} from '../../components/ui';
import CustomerFinder from '../../components/merchant/CustomerFinder';
import {useMerchantId, customerName} from '../../utilities/merchantData';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {layout} from '../../theme/tokens';

const Customers = () => {
  const navigation = useNavigation();
  const merchantId = useMerchantId();

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Customers" root />
      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: TAB_SCROLL_INSET}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <CustomerFinder
          merchantId={merchantId}
          renderFound={(customer, identifier) => (
            <>
              <View style={styles.flex}>
                <Button
                  title="View activity"
                  variant="secondary"
                  size="sm"
                  onPress={() =>
                    navigation.navigate('CustomerActivity', {
                      customerId: customer.id,
                      customerName: customerName(customer),
                    })
                  }
                />
              </View>
              <View style={styles.flex}>
                <Button
                  title="Award points"
                  size="sm"
                  onPress={() => navigation.navigate('AwardPoints', {customer, foundBy: identifier.label})}
                />
              </View>
            </>
          )}
          renderMissing={(identifier, value) => (
            <View style={styles.missingAction}>
              <Button
                title="Award as new customer"
                size="sm"
                onPress={() =>
                  navigation.navigate('AwardPoints', {
                    identifier: {key: identifier.awardKey, value, label: identifier.label, short: identifier.short},
                  })
                }
              />
            </View>
          )}
        />
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingHorizontal: layout.screenPadding,
  },
  flex: {
    flex: 1,
  },
  missingAction: {
    alignSelf: 'flex-start',
    minWidth: 190,
  },
});

export default Customers;
