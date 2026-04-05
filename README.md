# 🚀 EduConnect

EduConnect is a full-stack student collaboration platform designed to connect students through real-time chat, events, posts, and academic interactions.

---

## 🌟 Features

### 🔐 Authentication

* Firebase Authentication (Login / Signup)
* Persistent user sessions
* Automatic backend user profile creation

### 👤 User Management

* MongoDB user profiles
* Role-based system (student / admin)
* Online/offline status tracking

### 💬 Real-Time Chat (Core Feature)

* One-to-one messaging
* Real-time communication using Socket.IO ⚡
* Typing indicator ✍
* Seen status (✔ / ✔✔)
* Auto-scroll to latest messages 📜
* Online users indicator 🟢

### 🧑‍🤝‍🧑 Chat UI

* Sidebar with user list
* Search users
* Message bubbles (sent / received)
* Clean WhatsApp-style layout

---

## 🚧 Coming Soon

* 🎤 Voice messages
* 🎥 Video calling
* 🔔 Notifications system
* 🛡 Admin control panel
* 📎 File & image sharing
* 👥 Group chat


---

## 🛠 Tech Stack

### Frontend

* React.js
* Redux Toolkit
* CSS (Custom styling)

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Real-Time

* Socket.IO

### Authentication

* Firebase Auth

---

## 📁 Project Structure

```
educonnect/
│
├── educonnect-frontend/
│   ├── src/
│   │   ├── components/
│   │   │  
│   │   │
│   │   ├── pages/
│   │   │  
│   │   │
│   │   ├── socket.js
│   │   └── store/
│
├── educonnect-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │
│   ├── server.js
│
└── README.md
```

--

## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/NirajPandit320/educonnect.git
cd educonnect
```

---

### 2️⃣ Setup Backend

```
cd educonnect-backend
npm install
npm start
```

---

### 3️⃣ Setup Frontend

```
cd educonnect-frontend
npm install
npm start
```

---

## 🔑 Environment Variables

### Backend (.env)

```
MONGO_URI=your_mongodb_connection
PORT=5000
```

### Frontend (.env)

```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
```

---

## 🧪 How to Use

1. Login using Firebase authentication
2. Select a user from sidebar
3. Start chatting instantly ⚡
4. Experience:

   * Typing indicator ✍
   * Seen status ✔✔
   * Online users 🟢

---

## 🤝 Contribution

Contributions are welcome! Feel free to fork and improve.

---


## 👨‍💻 Author

**Niraj Kumar Pandit**
Final Year Project 🚀

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
