// ------------------------
//  Firebase config
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
//  Get ROOM ID from URL
// ------------------------
function getRoomId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("room") || "general";
}

const ROOM_ID = getRoomId();

// ------------------------
//  Login anonymously
// ------------------------
auth.signInAnonymously().catch(console.error);

// ------------------------
//  Post Message
// ------------------------
async function postMessage() {
  const text = document.getElementById("message").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!text && !file) return;

  let imageUrl = null;

  // Upload image to Cloudinary
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "KLA-UndergroundPreset");

    const res = await fetch("https://api.cloudinary.com/v1_1/dw2d8pfj2/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.secure_url) imageUrl = data.secure_url;
    else {
      alert("Image upload failed.");
      return;
    }
  }

  // Save to Firestore in correct room
  await db.collection("messages")
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
//  Load Messages
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
        const msg = doc.data();
        const li = document.createElement("li");
        li.classList.add("message");

        if (msg.text) {
          const p = document.createElement("p");
          p.textContent = msg.text;
          li.appendChild(p);
        }

        if (msg.image) {
          const img = document.createElement("img");
          img.src = msg.image;
          img.classList.add("chat-image");
          li.appendChild(img);
        }

        list.appendChild(li);
      });
    });
}

loadMessages();
