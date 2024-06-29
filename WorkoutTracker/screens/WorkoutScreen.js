import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../FirebaseConfig";
import { getDatabase, ref, onValue } from "firebase/database";

const WorkoutScreen = () => {
  const navigation = useNavigation();
  const [workoutLog, setWorkoutLog] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const formattedDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const logRef = ref(
        database,
        `users/${userId}/workoutLogs/${formattedDate}`
      );
      const unsubscribe = onValue(logRef, (snapshot) => {
        const data = snapshot.val() || [];
        setWorkoutLog(Object.values(data)); // Convert object of objects into an array
      });

      return () => unsubscribe();
    }
  }, [currentDate]);

  const handleAddExercisePress = () => {
    navigation.navigate("AddExercise");
  };

  const handleSelectRoutinePress = () => {
    navigation.navigate("SelectRoutine");
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    const today = new Date();
    if (newDate <= today) {
      setCurrentDate(newDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>
        Workout Log for {currentDate.toISOString().split("T")[0]}
      </Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handlePreviousDay}>
          <AntDesign name="leftcircleo" size={24} color="white" />
          <Text style={styles.textButton}>Previous Day</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleNextDay}>
          <AntDesign name="rightcircleo" size={24} color="white" />
          <Text style={styles.textButton}>Next Day</Text>
        </Pressable>
      </View>
      <ScrollView style={{ width: "100%" }}>
        {workoutLog.length > 0 ? (
          workoutLog.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text>
                {log.exerciseName} - {log.sets} sets of {log.repetitions} reps
                at {log.weight} kgs
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No exercises logged for this day.</Text>
        )}
      </ScrollView>

      <View style={styles.addExerciseContainer}>
        <Pressable
          style={styles.button}
          onPress={handleAddExercisePress}
        >
          <AntDesign name="pluscircleo" size={24} color="white" />
          <Text style={styles.textButton}>Add Exercise</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={handleSelectRoutinePress}
        >
          <AntDesign name="pluscircleo" size={24} color="white" />
          <Text style={styles.textButton}>Select Routine</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    width: "90%",
  },
  addExerciseContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  date: {
    fontSize: 20,
    marginBottom: 20,
  },
  text: {
    textAlign: 'center',
    lineHeight: 300,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1295ff",
    padding: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  textButton: {
    fontSize: 16,
    marginLeft: 5,
    color: "white",
  },
  logEntry: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default WorkoutScreen;
