import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [period, setPeriod] = useState('day');

  // Définir la fonction filterTasksByPeriod
  const filterTasksByPeriod = (tasks, period) => {
    const now = moment();
    return tasks.filter(task => {
      if (period === 'day') {
        return moment(task.date).isSame(now, 'day');
      } else if (period === 'week') {
        return moment(task.date).isSame(now, 'week');
      } else if (period === 'month') {
        return moment(task.date).isSame(now, 'month');
      }
      return false;
    });
  };

  // Charger les notes lorsque l'écran est focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  // Charger les notes depuis AsyncStorage
  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Filtrer les notes
  const filteredNotes = notes.filter((note) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && note.completed) ||
      (filter === 'pending' && !note.completed) ||
      (filter === 'notes' && note.category === 'note') ||
      (filter === 'tasks' && note.category === 'task');

    const matchesPeriod = filterTasksByPeriod([note], period).length > 0;
    const matchesSearch =
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.description.toLowerCase().includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch && matchesPeriod;
  });

  // Composant pour les boutons de filtre
  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Rendu d'un élément de la liste
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.categoryIcon}>
          {item.category === 'note' ? '📝' : '✓'}
        </Text>
        <View style={styles.noteContent}>
          <Text style={[styles.noteTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          <Text style={[styles.noteDescription, item.completed && styles.completedText]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.noteMetadata}>
          <Text style={styles.noteDate}>{item.date}</Text>
          {item.location && <Text style={styles.noteIcon}>📍</Text>}
          {item.photo && <Text style={styles.noteIcon}>📷</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <FilterButton title="Tout" value="all" />
        <FilterButton title="Notes" value="notes" />
        <FilterButton title="Tâches" value="tasks" />
        <FilterButton title="Terminé" value="completed" />
        <FilterButton title="En cours" value="pending" />
      </ScrollView>

      <Picker
        selectedValue={period}
        onValueChange={(itemValue) => setPeriod(itemValue)}
        style={styles.periodPicker}
      >
        <Picker.Item label="Aujourd'hui" value="day" />
        <Picker.Item label="Cette semaine" value="week" />
        <Picker.Item label="Ce mois" value="month" />
      </Picker>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNote')}
      >
        <Text style={styles.addButtonText}>+ Nouvelle Note</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    height: 10,
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: 'black',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteDescription: {
    fontSize: 14,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  noteMetadata: {
    alignItems: 'flex-end',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  noteIcon: {
    fontSize: 12,
    marginTop: 4,
  },
  periodPicker: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
});