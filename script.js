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

function getRoomId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("room") || "general"; 
}

const ROOM_ID = getRoomId();


// Admins who can delete
const ADMIN_UID = "MtH6Avi6rMVkTxudlDdVWBUUWrw2";

if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
  // show delete button
}

// Anonymous login
auth.signInAnonymously().catch(console.error);

// Post message with optional image
async function postMessage() {
  const msg = document.getElementById("message").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!msg && !file) return;

  let imageUrl = null;

// Upload image to Cloudinary
if (file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "KLA-UndergroundPreset"); // your Cloudinary preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dw2d8pfj2/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  // Check for errors before using the URL
  if (data.secure_url) {
    imageUrl = data.secure_url;
  } else {
    console.error("Cloudinary upload failed:", data);
    alert("Image upload failed. Try again.");
    return;
  }
}

// Save message to Firestore
db.collection("messages").add({
  text: msg,
  image: imageUrl,
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
});

// Clear fields
document.getElementById("message").value = "";
document.getElementById("imageInput").value = "";
