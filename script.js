// ------------------------
// Initialize Firebase
// ------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCh59xkIYmNa3AEB786C62cFPnYLck3_Mo",
  authDomain: "kla-underground.firebaseapp.com",
  projectId: "kla-underground",
  storageBucket: "kla-underground.appspot.com",
  messagingSenderId: "39702040020",
  appId: "1:39702040020:web:2905b368096a09e5591a41"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();


// ------------------------
// Admin UID
// ------------------------
const ADMIN_UID = "MtH6Avi6rMVkTxudlDdVWBUUWrw2";


// ------------------------
// Login anonymous
// ------------------------
auth.signInAnonymously().catch(console.error);


// ------------------------
// Get chat room from URL
// ------------------------
function getRoomId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("room") || "general";
}

const ROOM_ID = getRoomId();


// ------------------------
// Post message
// ------------------------
async function postMessage() {
  const text = document.getElementById("message").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!text && !file) return;

  let imageUrl = null;

  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "KLA-UndergroundPreset");

    const res = await fetch("https://api.cloudinary.com/v1_1/dw2d8pfj2/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    imageUrl = data.secure_url;
  }

  db.collection("messages")
    .doc(ROOM_ID)
    .collection("roomMessages")
    .add({
      text: text || null,
      image: imageUrl || null,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

  document.getElementById("message").value = "";
  document.getElementById("imageInput").value = "";
}


// ------------------------
// Load messages
// ------------------------
function loadMessages() {
  const list = document.getElementById("messagesList");
  list.innerHTML = "<li>Loading...</li>";

  db.collection("messages")
    .doc(ROOM_ID)
    .collection("roomMessages")
    .orderBy("timestamp", "asc")
    .onSnapshot(snapshot => {
      list.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");

        if (data.text) {
          li.innerHTML += `<div>${data.text}</div>`;
        }

        if (data.image) {
          li.innerHTML += `<img src="${data.image}" alt="image">`;
        }

        list.appendChild(li);
      });
    });
}

loadMessages();
