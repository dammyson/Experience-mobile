import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import SkeletonList from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import {logout} from '../../actions/authActions';
import {isNetworkError, isSessionExpired} from '../../utilities/errors';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Placeholder for a screen's data request: skeleton rows while loading,
 * message + retry on error (network and expired-session variants), dashed
 * empty state when there's nothing to show.
 *
 * Props:
 *   loading       boolean
 *   error         string | null
 *   empty         boolean
 *   emptyText     string
 *   emptySubtext  string
 *   onRetry       () => void
 *   skeletonRows  number (default 4)
 *
 * Renders nothing when there's data to show.
 */
const RequestState = ({loading, error, empty, emptyText, emptySubtext, onRetry, skeletonRows = 4}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.skeleton}>
        <SkeletonList rows={skeletonRows} />
      </View>
    );
  }

  if (error) {
    const expired = isSessionExpired(error);
    const offline = isNetworkError(error);

    const signInAgain = async () => {
      await dispatch(logout());
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    };

    const title = expired
      ? 'Your session has expired'
      : offline
        ? "Can't reach Arena"
        : 'Something went wrong';
    const body = expired
      ? 'Sign in again to carry on.'
      : offline
        ? 'Check your internet connection and try again.'
        : error;
    const action = expired
      ? {label: 'Sign in again', onPress: signInAgain}
      : onRetry && {label: 'Try again', onPress: onRetry};

    return (
      <View style={styles.container} accessibilityRole="alert">
        <Text style={styles.title}>{title}</Text>
        {!!body && <Text style={styles.text}>{body}</Text>}
        {!!action && (
          <TouchableOpacity
            onPress={action.onPress}
            style={styles.action}
            accessibilityRole="button"
            activeOpacity={0.85}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState title={emptyText} hint={emptySubtext} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  skeleton: {
    paddingTop: 16,
  },
  container: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyWrap: {
    paddingTop: 24,
  },
  title: {
    ...type.sectionHeading,
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  actionText: {
    ...type.bodyStrong,
    color: colors.text,
  },
});

export default RequestState;
