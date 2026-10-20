import {StyleSheet} from 'react-native';
import {theme} from './colors';
import {fontFamily, fontSize} from './typography';

export const GlobalStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenPadding: {
    paddingHorizontal: 20,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    color: theme.TEXT_PRIMARY,
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize['3xl'],
    color: theme.TEXT_PRIMARY,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    color: theme.TEXT_PRIMARY,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: theme.TEXT_SECONDARY,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: theme.TEXT_TERTIARY,
  },
});
