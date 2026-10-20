/**
 * Leave a stack screen and land on a tab. Works with both tab bars: the
 * legacy React Navigation tabs read `screen`; the native iOS 26 tab view reads
 * `tab` (with `at` so repeating the same tab still triggers).
 */
const goToTab = (navigation, tab) =>
  navigation.navigate('TabsNavigation', {screen: tab, tab, at: Date.now()});

export default goToTab;
