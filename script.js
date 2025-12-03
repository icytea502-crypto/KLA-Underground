// ----------------------
// CONFIG - replace only if you change project
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyCh59xkIYmNa3AEB786C62cFPnYLck3_Mo",
  authDomain: "kla-underground.firebaseapp.com",
  projectId: "kla-underground",
  storageBucket: "kla-underground.appspot.com",
  messagingSenderId: "39702040020",
  appId: "1:39702040020:web:2905b368096a09e5591a41"
};

// Cloudinary (leave your cloud name + preset)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dw2d8pfj2/image/upload";
const CLOUDINARY_PRESET = "KLA-UndergroundPreset";

// ----------------------
// Init Firebase services
// ----------------------
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// sign in anonymously
auth.signInAnonymously().catch(err => console.error("Auth error:", err));

// ----------------------
// ROOM handling
// ----------------------
function getRoomId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("room") || "general";
}
const ROOM_ID = getRoomId();
document.getElementById("roomName").textContent = ROOM_ID.replace(/_/g, " ");

// ----------------------
// Post message (text + optional image via Cloudinary)
// ----------------------
async function postMessage() {
  const text = document.getElementById("message").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!text && !file) return;

  let imageUrl = null;

  if (file) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");
      imageUrl = data.secure_url;
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Image upload failed. Try again.");
      return;
    }
  }

  try {
    await db.collection("messages")
      .doc(ROOM_ID)
      .collection("roomMessages")
      .add({
        text: text || null,
        image: imageUrl || null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (err) {
    console.error("Firestore add error:", err);
    alert("Failed to send message.");
    return;
  }

  document.getElementById("message").value = "";
  document.getElementById("imageInput").value = "";
}

// wire up post button safely after DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("postBtn").addEventListener("click", postMessage);
});

// ----------------------
// Load messages for this room (real-time)
// ----------------------
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
        if (msg.text) {
          const p = document.createElement("div");
          p.textContent = msg.text;
          li.appendChild(p);
        }
        if (msg.image) {
          const img = document.createElement("img");
          img.src = msg.image;
          img.style.maxWidth = "100%";
          img.style.marginTop = "8px";
          li.appendChild(img);
        }
        if (msg.timestamp) {
          const ts = document.createElement("div");
          ts.className = "timestamp";
          ts.textContent = new Date(msg.timestamp.toDate()).toLocaleString();
          li.appendChild(ts);
        }
        list.appendChild(li);
      });
    }, err => {
      console.error("Message subscription error:", err);
      list.innerHTML = "<li>Failed to load messages.</li>";
    });
}
loadMessages();

// ----------------------
// Load subjects.json and build the sidebar
// ----------------------
async function loadSubjects() {
  try {
    const res = await fetch("subjects.json", {cache: "no-store"});
    if (!res.ok) throw new Error("fetch failed " + res.status);
    const data = await res.json();
    console.log("Subjects loaded", data);

    const container = document.getElementById("subjects");
    container.innerHTML = ""; // clear

    for (const subject of Object.keys(data)) {
      const box = document.createElement("div");
      box.className = "subject-box";

      const header = document.createElement("div");
      header.className = "subject-header";
      header.textContent = subject;

      const teachersDiv = document.createElement("div");
      teachersDiv.className = "teachers";
      teachersDiv.style.display = "none";

      data[subject].forEach(t => {
        const tDiv = document.createElement("div");
        tDiv.className = "teacher";
        tDiv.dataset.subject = subject;
        tDiv.dataset.teacher = t;
        tDiv.textContent = t;
        teachersDiv.appendChild(tDiv);
      });

      box.appendChild(header);
      box.appendChild(teachersDiv);
      container.appendChild(box);
    }

    // expand/collapse
    container.querySelectorAll(".subject-header").forEach(h => {
      h.addEventListener("click", () => {
        const s = h.nextElementSibling;
        s.style.display = s.style.display === "none" ? "block" : "none";
      });
    });

    // teacher click -> open room
    container.addEventListener("click", e => {
      const el = e.target;
      if (el.classList.contains("teacher")) {
        const subject = el.dataset.subject;
        const teacher = el.dataset.teacher;
        const roomId = `${subject}_${teacher}`.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g,"");
        window.location.href = `chat.html?room=${roomId}`;
      }
    });

  } catch (err) {
    console.error("Failed to load subjects.json:", err);
    const container = document.getElementById("subjects");
    container.innerHTML = "<div style='color:#f88;padding:10px;'>Failed to load subjects</div>";
  }
}
loadSubjects();
