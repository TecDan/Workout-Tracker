import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import ProfileScreen from "./screens/ProfileScreen"
import WorkoutScreen from "./screens/WorkoutScreen";
import AuthScreen from "./screens/AuthScreen"; // Import the LoginScreen component
import AddFriendScreen from "./screens/AddFriendScreen";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

//import firebase from "firebase/compat/app";
import { auth } from './FirebaseConfig'; // Import auth from your Firebase config
import { onAuthStateChanged } from 'firebase/auth';
import AddExercise from "./screens/AddExercise";
import ExerciseDetails from './screens/ExerciseDetails';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectRoutine from "./screens/SelectRoutineScreen";
const WorkoutStack = createNativeStackNavigator();

function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator>
      <WorkoutStack.Screen name="Workouts" component={WorkoutScreen} />
      <WorkoutStack.Screen name="AddExercise" component={AddExercise} />
      <WorkoutStack.Screen name="ExerciseDetails" component={ExerciseDetails} />
      <WorkoutStack.Screen name="SelectRoutine" component={SelectRoutine} />
    </WorkoutStack.Navigator>
  );
}
const Tab = createMaterialBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    // Show loading indicator while checking authentication state
    return (
      <View style={styles.container}>
        {/* loading indicator */}
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <View style={styles.container}>
          <Tab.Navigator
            barStyle={{ backgroundColor: "#000000" }} // Change the background colour of the tab bar
            activeColor="#1c95f7" // Change the text colour of active tab labels
            inactiveColor="#8594a1" // Change the text colour of inactive tab labels
          >
            <Tab.Screen name="Profile" component={ProfileScreen} 
                   options={{
                    tabBarIcon: ({ color }) => (
                      <MaterialCommunityIcons name="face-man" color={color} size={26} />
                    ),
                  }}/>
            <Tab.Screen name="Workout" component={WorkoutStackNavigator} 
            options={{
                    tabBarIcon: ({ color }) => (
                      <MaterialCommunityIcons name="weight-lifter" color={color} size={26} />
                    ),
                  }}/>
            <Tab.Screen name="Friends" component={AddFriendScreen} 
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="chat" color={color} size={26} />
              ),
            }}/>
          </Tab.Navigator>
          <StatusBar style="auto" />
        </View>
      ) : (
        <AuthScreen setUser={setUser} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

