import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, TextInput, ScrollView, Alert, StyleSheet } from "react-native";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { auth, database } from "../FirebaseConfig";

export default function SelectRoutine() {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inputs, setInputs] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});

  useEffect(() => {
    const routinesRef = ref(database, "routines");
    onValue(routinesRef, (snapshot) => {
      const routineData = snapshot.val() || [];
      setRoutines(Object.values(routineData));
    });

    if (auth.currentUser) {
      const prRef = ref(database, `users/${auth.currentUser.uid}/personalRecords`);
      onValue(prRef, (snapshot) => {
        setPersonalRecords(snapshot.val() || {});
      });
    }
  }, []);

  const handleSelectRoutine = (routine) => {
    setSelectedRoutine(routine);
    setInputs(
      routine.exercises.map((exercise) => ({
        name: exercise,
        weight: "",
        reps: "",
        sets: "",
      }))
    );
    setShowModal(true);
  };

  const handleInputChange = (text, index, field) => {
    const newInputs = [...inputs];
    newInputs[index][field] = text;
    setInputs(newInputs);
  };

  const submitWorkout = () => {
    if (!auth.currentUser) {
      console.error("No user logged in!");
      return;
    }
    const userId = auth.currentUser.uid;
    const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const logRef = ref(database, `users/${userId}/workoutLogs/${todayDate}`);
  
    inputs.forEach((input) => {
      const newLogEntryRef = push(logRef);
      set(newLogEntryRef, {
        exerciseName: input.name,
        weight: input.weight,
        repetitions: input.reps,
        sets: input.sets,
        date: new Date().toISOString()
      }).then(() => {
        // Check and update personal records
        const recordRef = ref(database, `users/${userId}/personalRecords/${input.name}/maxWeight`);
        get(recordRef).then((snapshot) => {
          const currentMaxWeight = snapshot.val() || 0;
          if (parseInt(input.weight) > currentMaxWeight) {
            set(recordRef, parseInt(input.weight))
              .then(() => {
                Alert.alert("Congratulations!", `New record for ${input.name}: ${input.weight} kg`);
              })
              .catch(error => {
                console.error("Failed to update personal record: ", error);
              });
          }
        });
      }).catch(error => {
        console.error("Failed to log exercise: ", error);
      });
    });
    setShowModal(false); // Close modal after operations
  };
  
  
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Routines:</Text>
      {routines.map((routine, index) => (
        <View key={index} style={styles.routineItem}>
          <Button
            title={routine.routineName}
            onPress={() => handleSelectRoutine(routine)}
            color="#1295ff"
          />
        </View>
      ))}

      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modalContent}>
          {inputs.map((input, index) => (
            <View key={index} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{input.name}</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange(text, index, "weight")}
              />
              <TextInput
                style={styles.input}
                placeholder="Repetitions"
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange(text, index, "reps")}
              />
              <TextInput
                style={styles.input}
                placeholder="Sets"
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange(text, index, "sets")}
              />
            </View>
          ))}
          <View style={styles.submit}>
            <Button title="Submit Workout" onPress={submitWorkout} />
          </View>
          <View style={styles.cancel}>
            <Button title="Cancel" onPress={() => setShowModal(false)} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Adjust content alignment to start
    alignItems: "center",
    paddingTop: 30, // Add padding to the top to push content down
  },
  title: {
    fontSize: 24, // Larger font size
    fontWeight: "bold",
    marginBottom: 20,
  },
  submit: {
    marginBottom: 10,
    maginTop: 10,
  },
  cancel: {
    marginBottom: 10,
    maginTop: 10,
    paddingBottom: 50,
  },
  routineItem: {
    marginBottom: 10,
    width: "80%",
  },
  routineText: {
    fontSize: 18,
    color: "#333",
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
