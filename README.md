# 🏥 Healthcare Translation Web App with Generative AI

## 📌 Objective

**Healthcare Translation Web App** is a real-time, multilingual healthcare communication prototype built to help patients and health providers break language barriers. It uses voice input, AI-powered translation, and audio playback to assist in clinical communication.


---

## 🚀 Live Demo

🔗 [View Deployed App on Vercel](https://speak-translate-heal-now.vercel.app)

---

## 🧠 Key Features

- 🎙️ **Voice-to-Text**: Converts spoken input into written text using Web Speech API.
- 🌍 **Real-Time Translation**: Translates the transcript using OpenAI’s GPT-4 for accurate, contextual translations.
- 🔊 **Audio Playback**: Uses the Web Speech Synthesis API to read translated text aloud.
- 📱 **Mobile-First Design**: Responsive layout optimized for both desktop and mobile devices.
- 📝 **Dual Transcript View**: Displays both the original and translated text in real-time.
- 🌐 **Language Selector**: Allows users to choose input and output languages.

---

## 🧰 Tech Stack

| Functionality           | Tool/Technology                  |
|-------------------------|----------------------------------|
| Frontend                | HTML, CSS, JavaScript            |
| Speech Recognition      | Web Speech API                   |
| AI Translation          | OpenAI GPT-4 (via `fetch` API)   |
| Text-to-Speech          | Web Speech API         |
| Deployment              | Vercel                           |
| Version Control         | Git & GitHub                     |

---

## 📂 Project Structure

speak-translate-heal-now/
│
├── index.html # Main HTML structure
├── script.js # Handles speech recognition, translation, TTS
├── style.css # UI styling and responsive layout
├── .env (ignored) # OpenAI API Key (not pushed)
├── vercel.json # Optional Vercel config
└── README.md # Project documentation


---

## 🧪 Testing & Error Handling

- ✅ Graceful handling of microphone access denial
- ✅ Handles empty inputs and API errors
- ✅ Validates language selections
- ✅ Mobile and desktop responsiveness

---

## 🔒 Security & Privacy

- Voice data is not stored or saved.
- API requests are made securely over HTTPS.
- No personally identifiable or medical data is retained.

---

## 🧠 Use of Generative AI

- **Translation**: Uses OpenAI GPT-4 API for high-quality translation of spoken medical phrases.
- **Coding Assistance**: Generative AI tools (e.g., ChatGPT) were used to rapidly prototype, debug, and optimize code.

---

## 📘 User Guide

1. **Choose Languages**: Select input and output languages using the dropdowns.
2. **Speak**: Click the microphone button and begin speaking.
3. **View Transcript**: Original and translated text will appear below.
4. **Hear Translation**: Click the "Speak" button to listen to the translated output.

---

## 📊 Evaluation Checklist

| Criteria                 | Status  |
|--------------------------|---------|
| AI-powered translation   | ✅       |
| Speech-to-text           | ✅       |
| Text-to-speech playback  | ✅       |
| Dual transcript display  | ✅       |
| Mobile responsiveness    | ✅       |
| Delivered within 48 hrs  | ✅       |

---

## 👤 About the Developer

**Mairo Gospel**  
💼 Data & Cloud Engineer | Passionate about healthcare, AI, and real-world problem solving  
📧 gospelmairo@gmail.com  
🔗 [GitHub](https://github.com/Gospelmairo)

---

> ⚠️ This project is a functional prototype built for a technical assessment and is not intended for clinical or production use.
