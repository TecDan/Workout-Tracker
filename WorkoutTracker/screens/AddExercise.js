import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { getDatabase, ref, onValue } from "firebase/database";
import { database } from "../FirebaseConfig";

export default function AddExercise() {
  const [categories, setCategories] = useState({});
  const navigation = useNavigation(); // Hook to get navigation object

  useEffect(() => {
    const categoriesRef = ref(database, 'exerciseCategories');

    // Subscribe to the categoriesRef to listen for value changes
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val(); // Extract the data from the snapshot
      setCategories(data || {}); // Set categories or an empty object if null
    });
    // Cleanup function to unsubscribe from the listener
    return () => unsubscribe();
  }, []);

  const handlePressCategory = (categoryId) => {
    navigation.navigate('ExerciseDetails', { categoryId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Categories:</Text>
      {Object.keys(categories).length > 0 ? (
        Object.keys(categories).map(key => (
          <View key={key} style={styles.buttonContainer}>
            <Button
              title={categories[key].name}
              onPress={() => handlePressCategory(key)}
              color="#1295ff" 
            />
          </View>
        ))
      ) : (
        <Text style={styles.infoText}>No categories found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Adjust content alignment to start
    alignItems: 'center',
    paddingTop: 30, // Add padding to the top to push content down
  },
  title: {
    fontSize: 24, // Larger font size
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%', // Set a fixed width for all buttons
    marginBottom: 10, // Add space between buttons
  },
  infoText: {
    fontSize: 16,
  }
});
