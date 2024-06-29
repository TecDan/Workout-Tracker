import React, { useState, useEffect} from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  Modal
} from "react-native";
import {
  getDatabase,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
  get,
  update,
  onValue,
  push,
  remove
} from "firebase/database";
import { database, auth } from "../FirebaseConfig";

function AddFriendScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState({});
  const [friends, setFriends] = useState({});
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChatFriendId, setCurrentChatFriendId] = useState(null);
  const [isChatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      // Listen for incoming friend requests
      const requestsRef = ref(
        database,
        `friendRequests/${auth.currentUser.uid}`
      );
      onValue(requestsRef, (snapshot) => {
        setRequests(snapshot.val() || {});
      });

      // Listen for confirmed friends
      const friendsRef = ref(database, `friends/${auth.currentUser.uid}`);
      onValue(friendsRef, (snapshot) => {
        setFriends(snapshot.val() || {});
      });
    }
  }, []);

  const handleAddFriend = () => {
    if (!auth.currentUser) {
      setMessage("You need to be logged in to add friends.");
      return;
    }

    const userRef = query(
      ref(database, "users"),
      orderByChild("email"),
      equalTo(email.trim())
    );
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userId = Object.keys(snapshot.val())[0];
          const friendRef = ref(
            database,
            `friendRequests/${userId}/${auth.currentUser.uid}`
          );
          set(friendRef, {
            email: auth.currentUser.email,
            status: "pending",
          })
            .then(() => {
              setMessage("Friend request sent.");
            })
            .catch((error) => {
              console.error("Failed to send friend request: ", error);
              setMessage("Failed to send friend request.");
            });
        } else {
          setMessage("No user found with that email.");
        }
      })
      .catch((error) => {
        console.error("Failed to find user: ", error);
        setMessage("Failed to find user.");
      });
  };

  const handleResponse = (requestId, status) => {
    const updates = {};
    updates[`friends/${auth.currentUser.uid}/${requestId}`] = {
      email: requests[requestId].email,
    };
    updates[`friends/${requestId}/${auth.currentUser.uid}`] = {
      email: auth.currentUser.email,
    };
    update(ref(database), updates)
      .then(() => {
        remove(
          ref(database, `friendRequests/${auth.currentUser.uid}/${requestId}`)
        );
        setMessage(`Friend request ${status}.`);
      })
      .catch((error) => {
        setMessage("Failed to update friend status.");
        console.error(error);
      });
  };

  const openChat = (friendId) => {
    setCurrentChatFriendId(friendId);
    setChatModalVisible(true);

    // Generate a chat ID from the sorted user IDs
    const chatId = [auth.currentUser.uid, friendId].sort().join("_");

    // Listen for chat messages
    const messagesRef = ref(database, `messages/${chatId}`);
    onValue(messagesRef, (snapshot) => {
      const msgs = snapshot.val() ? Object.values(snapshot.val()) : [];
      setChatMessages(msgs);
    });
  };

  const handleChatMessageSend = () => {
    if (chatMessage.trim() === "") return;

    // Use the same chatId formation logic for sending messages
    const chatId = [auth.currentUser.uid, currentChatFriendId].sort().join("_");
    const chatRef = ref(database, `messages/${chatId}`);
    
    push(chatRef, {
      text: chatMessage,
      senderId: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
    });
    setChatMessage("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Friend</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Enter friend's email"
      />
      <Button title="Add Friend" onPress={handleAddFriend} />
      <Text>{message}</Text>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.subTitle}>Friends:</Text>
        {Object.entries(friends).map(([key, friend]) => (
          <View key={key} style={styles.friendItem}>
            <Text>{friend.email}</Text>
            <Button title="Chat" onPress={() => openChat(key)} />
          </View>
        ))}

        <Text style={styles.subTitle}>Friend Requests:</Text>
        {Object.entries(requests).map(([key, req]) => (
          <View key={key} style={styles.requestItem}>
            <Text>{`${req.email} (${req.status})`}</Text>
            {req.status === "pending" && (
              <View style={styles.buttonContainer}>
                <Button
                  title="Accept"
                  onPress={() => handleResponse(key, "accepted")}
                />
                <Button
                  title="Decline"
                  onPress={() => handleResponse(key, "declined")}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={isChatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.chatModal}>
          <Text>Chat with {friends[currentChatFriendId]?.email}</Text>
          <ScrollView>
            {chatMessages.map((msg, index) => (
              <Text key={index} style={styles.chatMessage}>
                {msg.senderId === auth.currentUser.uid
                  ? "You"
                  : friends[currentChatFriendId]?.email}
                : {msg.text}
              </Text>
            ))}
          </ScrollView>
          <TextInput
            style={styles.chatInput}
            value={chatMessage}
            onChangeText={setChatMessage}
            placeholder="Type your message..."
          />
          <View style={styles.modalButtonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Close"
                onPress={() => setChatModalVisible(false)}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Send" onPress={handleChatMessageSend} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    marginTop: 80,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  scrollView: {
    width: "100%",
  },
  requestItem: {
    backgroundColor: "#FFF",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#CCC",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendItem: {
    backgroundColor: "#FFF",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#CCC",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 160,
  },
  chatModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // This can also be 'space-around' or 'space-evenly' based on your preference
    width: "100%", // Ensure it spans the full width
    paddingHorizontal: 10, // Ensure there is some horizontal padding if needed
    paddingVertical: 20, // Optional: add some vertical padding for better aesthetics
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5, // Adjust this value as needed to increase space between buttons
    padding: 10,
  },
  chatInput: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  chatMessage: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    marginVertical: 2,
  },
});

export default AddFriendScreen;
