import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import colors from './constants/colors';
import typography from './constants/typography';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading, { color: colors.primary }]}>SafeHer</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});