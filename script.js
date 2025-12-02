// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Sign in anonymously
auth.signInAnonymously().catch(console.error);

// Post a message
function postMessage() {
  const msg = document.getElementById("message").value;
  if (msg.trim() === "") return;

  db.collection("messages").add({
    text: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("message").value = "";
  });
}

// Display messages in real-time
db.collection("messages").orderBy("timestamp", "desc").onSnapshot(snapshot => {
  const messagesList = document.getElementById("messagesList");
  messagesList.innerHTML = "";
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    messagesList.appendChild(li);
  });
});
