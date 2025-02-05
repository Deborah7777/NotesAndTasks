import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('note');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission de caméra nécessaire');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur camera:', error);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission de localisation nécessaire');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Erreur localisation:', error);
    }
  };

  const saveNote = async () => {
    try {
        // Récupérer les notes existantes depuis AsyncStorage
        const savedNotes = await AsyncStorage.getItem('notes');

        // Convertir les notes en tableau JavaScript si elles existent, sinon initialiser un tableau vide
        const notes = savedNotes ? JSON.parse(savedNotes) : [];

        // Créer un nouvel objet "note" avec les données actuelles
        const newNote = {
            id: Date.now().toString(), // Générer un ID unique basé sur le timestamp actuel
            title, // Titre de la note (supposé être une variable définie ailleurs)
            description, // Description de la note (supposé être une variable définie ailleurs)
            category, // Catégorie de la note (supposé être une variable définie ailleurs)
            photo, // Photo associée à la note (supposé être une variable définie ailleurs)
            location, // Localisation associée à la note (supposé être une variable définie ailleurs)
            date: new Date().toLocaleDateString(), // Date actuelle au format local
            completed: false, // Statut de la note (non complétée par défaut)
        };

        // Ajouter la nouvelle note au tableau existant
        const updatedNotes = [...notes, newNote];

        // Sauvegarder le tableau mis à jour dans AsyncStorage
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));

        // Revenir à l'écran précédent après la sauvegarde
        navigation.goBack();
    } catch (error) {
        // Gérer les erreurs éventuelles lors de la sauvegarde
        console.error('Erreur sauvegarde:', error);
    }
};

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}

        >
          <Picker.Item label="Note" value="note" />
          <Picker.Item label="Tâche" value="tâche" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>📷 Prendre une photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.locationButton]} onPress={getLocation}>
        <Text style={styles.buttonText}>📍 Ajouter la localisation</Text>
      </TouchableOpacity>

      {photo && (
        <Image source={{ uri: photo }} style={styles.preview} />
      )}

      {location && (
        <Text style={styles.locationText}>
          📍 {location.latitude}, {location.longitude}
        </Text>
      )}

      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveNote}>
        <Text style={styles.buttonText}>Enregistrer</Text>
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
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 16,
  },
  locationText: {
    color: '#666',
    marginBottom: 16,
  },
});
