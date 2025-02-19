import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';

// Empêche le splash screen de se fermer automatiquement
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simule un chargement (remplacez ceci par votre logique de chargement)
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondes de simulation
      } catch (e) {
        console.warn(e);
      } finally {
        // Indique que l'application est prête
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Cache le splash screen une fois que l'application est prête
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Affiche un écran vide pendant le chargement
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Notes & Tasks' }}
          />
          <Stack.Screen
            name="AddNote"
            component={AddNoteScreen}
            options={{ title: 'Nouvelle Note' }}
          />
          <Stack.Screen
            name="NoteDetail"
            component={NoteDetailScreen}
            options={{ title: 'Détails' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}