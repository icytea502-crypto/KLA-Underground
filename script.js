// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCh59xkIYmNa3AEB786C62cFPnYLck3_Mo",
  authDomain: "kla-underground.firebaseapp.com",
  projectId: "kla-underground",
  storageBucket: "kla-underground.firebasestorage.app",
  messagingSenderId: "39702040020",
  appId: "1:39702040020:web:2905b368096a09e5591a41"
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
