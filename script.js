// Replace with your Firebase config
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
const storage = firebase.storage();

// Anonymous login
auth.signInAnonymously().catch(console.error);

// Post message with optional image
async function postMessage() {
  const msg = document.getElementById("message").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!msg && !file) return;

  let imageUrl = null;

  if (file) {
    const storageRef = storage.ref('images/' + Date.now() + '_' + file.name);
    await storageRef.put(file);
    imageUrl = await storageRef.getDownloadURL();
  }

  db.collection("messages").add({
    text: msg,
    image: imageUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("message").value = "";
  document.getElementById("imageInput").value = "";
}

// Display messages
db.collection("messages")
  .orderBy("timestamp", "desc")
  .onSnapshot(snapshot => {
    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");

      if (data.text) li.innerHTML += `<div>${data.text}</div>`;
      if (data.image) li.innerHTML += `<img src="${data.image}" alt="image">`;
      if (data.timestamp)
        li.innerHTML += `<div class="timestamp">${new Date(data.timestamp.toDate()).toLocaleString()}</div>`;

      messagesList.appendChild(li);
    });
  });
