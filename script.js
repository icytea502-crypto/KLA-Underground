// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCh59xkIYmNa3AEB786C62cFPnYLck3_Mo",
  authDomain: "kla-underground.firebaseapp.com",
  projectId: "kla-underground",
  storageBucket: "kla-underground.appspot.com",
  messagingSenderId: "39702040020",
  appId: "1:39702040020:web:2905b368096a09e5591a41"
};


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
  formData.append("upload_preset", "KLA-UndergroundPreset"); // Cloudinary preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dw2d8pfj2/image/upload", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  imageUrl = data.secure_url; // URL to store in Firestore
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

  // Show delete button only if current user is admin
      if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn"); // optional, for styling
        deleteBtn.onclick = () => doc.ref.delete();
        li.appendChild(deleteBtn);
      }
      
      messagesList.appendChild(li);
