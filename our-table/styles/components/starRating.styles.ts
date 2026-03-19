import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  starButton: {
    padding: 2,
  },
  starText: {
    // Size and color are passed as props to the component directly
    // but we can add base styles here if needed.
    lineHeight: 30, // Adjust based on font size if needed
  },
});
