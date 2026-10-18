import React from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';

/**
 * Full-area placeholder for a screen's data request: spinner while loading,
 * message + retry on error, message when empty.
 *
 * Props:
 *   loading   boolean
 *   error     string | null
 *   empty     boolean
 *   emptyText string
 *   emptySubtext string
 *   onRetry   () => void
 *
 * Renders nothing when there's data to show.
 */
const RequestState = ({loading, error, empty, emptyText, emptySubtext, onRetry}) => {
  if (loading) {
    return <ActivityIndicator style={styles.loader} color={theme.PRIMARY_COLOR} />;
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{error}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{emptyText}</Text>
        {!!emptySubtext && <Text style={styles.text}>{emptySubtext}</Text>}
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  loader: {
    marginTop: 80,
  },
  container: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 16,
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  text: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR,
    marginTop: 4,
  },
});

export default RequestState;
