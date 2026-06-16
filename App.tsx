import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { WeddingProvider } from './context/WeddingContext';
import TabNavigator from './navigation/TabNavigator';

export default function App() {
  return (
    <WeddingProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
    </WeddingProvider>
  );
}
