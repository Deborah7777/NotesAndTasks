import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NoteDetailScreen({ route, navigation }) {
  const { note } = route.params;

  const toggleComplete = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      const notes = JSON.parse(savedNotes);
      const updatedNotes = notes.map(n =>
        n.id === note.id ? { ...n, completed: !n.completed } : n
      );
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      navigation.goBack();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const setReminder = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission de notifications nécessaire');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: note.title,
          body: note.description,
        },
        trigger: {
          seconds: 3600, // Rappel dans 1 heure
        },
      });

      Alert.alert('Succès', 'Rappel programmé dans 1 heure');
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };

  const deleteNote = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette note ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const savedNotes = await AsyncStorage.getItem('notes');
              const notes = JSON.parse(savedNotes);
              const updatedNotes = notes.filter(n => n.id !== note.id);
              await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
              navigation.goBack();
            } catch (error) {
              console.error('Erreur suppression:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.description}>{note.description}</Text>

      {note.photo && (
        <Image source={{ uri: note.photo }} style={styles.photo} />
      )}

      {note.location && (
        <Text style={styles.location}>
          📍 {note.location.latitude}, {note.location.longitude}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: note.completed ? '#FF5722' : '#4CAF50' }
        ]}
        onPress={toggleComplete}
      >
        <Text style={styles.buttonText}>
          {note.completed ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
        </Text>
      </TouchableOpacity>

      {note.category === 'tâche' && (
        <TouchableOpacity
          style={[styles.button, styles.reminderButton]}
          onPress={setReminder}
        >
          <Text style={styles.buttonText}>⏰ Définir un rappel</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={deleteNote}
      >
        <Text style={styles.buttonText}>🗑️ Supprimer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 16,
  },
  location: {
    color: '#666',
    marginBottom: 16,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});