// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCh59xkIYmNa3AEB786C62cFPnYLck3_Mo",
  authDomain: "kla-underground.firebaseapp.com",
  projectId: "kla-underground",
  storageBucket: "kla-underground.appspot.com",
  messagingSenderId: "39702040020",
  appId: "1:39702040020:web:2905b368096a09e5591a41"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Get room from URL
function getRoomId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("room") || "general";
}

const ROOM_ID = getRoomId();

// Admin user ID
const ADMIN_UID = "MtH6Avi6rMVkTxudlDdVWBUUWrw2";

// Login anonymously
auth.signInAnonymously().catch(console.error);


// ------------------------------------------------------
// SEND MESSAGE (TEXT + OPTIONAL IMAGE)
// ------------------------------------------------------
async function postMessage() {
  const msg = document.getElementById("message").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!msg && !file) return;

  let imageUrl = null;

  // Upload image to Cloudinary if provided
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "KLA-UndergroundPreset");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dw2d8pfj2/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (data.secure_url) {
      imageUrl = data.secure_url;
    } else {
      console.error("Cloudinary upload failed:", data);
      alert("Image upload failed. Try again.");
      return;
    }
  }

  // Store message in its chat room
  await db.collection("rooms").doc(ROOM_ID).collection("messages").add({
    text: msg || null,
    image: imageUrl || null,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Clear fields
  document.getElementById("message").value = "";
  document.getElementById("imageInput").value = "";
}


// ------------------------------------------------------
// LISTEN for new messages in this room
// ------------------------------------------------------
db.collection("rooms")
  .doc(ROOM_ID)
  .collection("messages")
  .orderBy("timestamp", "asc")
  .onSnapshot(snapshot => {
    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");

      // Text
      if (data.text) {
        const textEl = document.createElement("div");
        textEl.textContent = data.text;
        li.appendChild(textEl);
      }

      // Image
      if (data.image) {
        const imgEl = document.createElement("img");
        imgEl.src = data.image;
        imgEl.alt = "image";
        li.appendChild(imgEl);
      }

      // Timestamp
      if (data.timestamp) {
        const timeEl = document.createElement("div");
        timeEl.classList.add("timestamp");
        timeEl.textContent = new Date(
          data.timestamp.toDate()
        ).toLocaleString();
        li.appendChild(timeEl);
      }

      // Delete button for admin
      if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
        const del = document.createElement("button");
        del.textContent = "Delete";
        del.classList.add("delete-btn");
        del.onclick = () => doc.ref.delete();
        li.appendChild(del);
      }

      messagesList.appendChild(li);
    });
  });

