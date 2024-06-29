import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { auth, database } from '../FirebaseConfig';  

export default function UserProfileScreen() {
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [personalRecords, setPersonalRecords] = useState({});
  const [userData, setUserData] = useState({ email: auth.currentUser?.email });

  useEffect(() => {
    const userRef = ref(database, `users/${auth.currentUser.uid}`); // Create a reference to the current user's data in Firebase
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      // Check if there is any data
      if (data) {
        setUserData(data); // Update user data state with the fetched data

        // Structure personal records to include checks for existence and formatting
        if (data.personalRecords) {
          const records = {
            Squat: data.personalRecords.Squat ? data.personalRecords.Squat.maxWeight : 'Not set yet',
            'Bench Press': data.personalRecords['Bench Press'] ? data.personalRecords['Bench Press'].maxWeight : 'Not set yet',
            Deadlift: data.personalRecords.Deadlift ? data.personalRecords.Deadlift.maxWeight : 'Not set yet',
          };
          setPersonalRecords(records);
        }
        setCurrentWeight(data.currentWeight || '');
        setTargetWeight(data.targetWeight || '');
      }
    });
  }, []);

  const handleSaveWeight = () => {
    const userRef = ref(database, `users/${auth.currentUser.uid}`);
    // Update the database at the specified userRef
    set(userRef, {
      ...userData, // Spread operator to include all existing user data
      currentWeight,
      targetWeight,
    }).then(() => {
      // Check if the current weight matches the target weight
      if (parseFloat(currentWeight) === parseFloat(targetWeight)) {
        Alert.alert("Congratulations!", "You have reached your target body weight!");
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.text}>User email: {userData.email}</Text>
      <View style={styles.section}>
        <Text>Current Body Weight (kg):</Text>
        <TextInput
          style={styles.input}
          value={currentWeight}
          onChangeText={setCurrentWeight}
          keyboardType="numeric"
        />
        <Text>Target Body Weight (kg):</Text>
        <TextInput
          style={styles.input}
          value={targetWeight}
          onChangeText={text => setTargetWeight(text)}
          keyboardType="numeric"
        />
        <Button title="Save Weight" onPress={handleSaveWeight} />
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Personal Records:</Text>
        <Text style={styles.text}>Squat: {personalRecords.Squat || 'Not set yet'} kg</Text>
        <Text style={styles.text}>Bench Press: {personalRecords['Bench Press'] || 'Not set yet'} kg</Text>
        <Text style={styles.text}>Deadlift: {personalRecords.Deadlift || 'Not set yet'} kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
});
