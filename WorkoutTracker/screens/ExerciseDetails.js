import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Modal, Alert } from 'react-native';
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { database, auth } from "../FirebaseConfig";

function ExerciseDetails({ route }) {
  const { categoryId } = route.params;
  const [exercises, setExercises] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weight, setWeight] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [sets, setSets] = useState('');
  const [personalRecords, setPersonalRecords] = useState({});

  useEffect(() => {
    const exercisesRef = ref(database, `exerciseCategories/${categoryId}/exercises`);
    const unsubscribe = onValue(exercisesRef, (snapshot) => {
      const data = snapshot.val();
      setExercises(data || {});
    });

    return () => unsubscribe();
  }, [categoryId]);

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handleAddToLog = () => {
    if (!auth.currentUser) {
      console.error("No user logged in!");
      return;
    }
    const userId = auth.currentUser.uid;
    const logRef = ref(database, `users/${userId}/workoutLogs/${new Date().toISOString().slice(0, 10)}`);
    const newLogEntryRef = push(logRef);

    set(newLogEntryRef, {
      exerciseName: selectedExercise.name,
      weight: weight,
      repetitions: repetitions,
      sets: sets,
      date: new Date().toISOString()
    }).then(() => {
      // Check and update personal records
      const recordRef = ref(database, `users/${userId}/personalRecords/${selectedExercise.name}`);
      get(recordRef).then((snapshot) => {
        const currentRecord = snapshot.val() ? snapshot.val().maxWeight : 0;
        if (parseInt(weight) > currentRecord) {
          set(recordRef, { maxWeight: parseInt(weight) });
          Alert.alert("New Record!", `Congratulations! You've set a new personal record for ${selectedExercise.name} ${weight} kg`);
        }
      });

      console.log("Exercise logged successfully!");
      setModalVisible(false);
      setWeight('');
      setRepetitions('');
      setSets('');
    }).catch(error => {
      console.error("Failed to log exercise: ", error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises:</Text>
      {Object.keys(exercises).length > 0 ? (
        Object.entries(exercises).map(([key, exercise]) => (
          <View key={key} style={styles.buttonContainer}>
            <Button
              title={exercise.name}
              onPress={() => handleSelectExercise(exercise)}
              color="#1295ff"
            />
          </View>
        ))
      ) : (
        <Text style={styles.infoText}>No exercises found in this category.</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter details for {selectedExercise?.name}</Text>
            <TextInput style={styles.input} onChangeText={setWeight} value={weight} placeholder="Weight (kgs)" keyboardType="numeric" />
            <TextInput style={styles.input} onChangeText={setRepetitions} value={repetitions} placeholder="Repetitions" keyboardType="numeric" />
            <TextInput style={styles.input} onChangeText={setSets} value={sets} placeholder="Sets" keyboardType="numeric" />
            <Button title="Add to Log" onPress={handleAddToLog} color="#1295ff" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    height: 40,
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    padding: 10
  }
});

export default ExerciseDetails;
