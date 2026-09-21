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
    paddingHorizontal: 24,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['4xl'],
    color: theme.PRIMARY_TEXT_COLOR,
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize['3xl'],
    color: theme.PRIMARY_TEXT_COLOR,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    color: theme.PRIMARY_TEXT_COLOR,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: theme.SECONDARY_TEXT_COLOR,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: theme.TERTIARY_TEXT_COLOR,
  },
});
