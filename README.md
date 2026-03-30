# FlashLearn: AI-Powered Adaptive Learning Ecosystem (v1.2.1)

FlashLearn is a high-fidelity, cinematic learning platform designed to revolutionize how students and professionals master complex subjects. By fusing a **Cyber-Neon** aesthetic with a state-of-the-art **Adaptive AI Tutoring Engine**, FlashLearn transforms passive study into an immersive cognitive experience.

---

## 🚀 The Vision: Mastery at the Speed of Intelligence
In an age of information overload, FlashLearn acts as your personal cognitive architect. It distills vast subjects into manageable, mastered neural links, using precision-engineered study protocols and real-time AI feedback.

## ✨ Key Features (v1.2.1)

### 🧠 Dynamic AI Tutoring (Neural Link)
Our flagship feature. The AI shifts from a static reader to an **Active Mentor**.
*   **Adaptive Personality**: Evaluates your conversational responses in real-time.
*   **Difficulty Scaling**: Automatically adjusts complexity (Beginner to Expert) based on your verbalized understanding.
*   **Session Transcripts**: Generates professionally formatted PDF logs of your tutoring sessions for offline review.

### ⚡ Automated Content Generation
Eliminate the bottleneck of manual entry with our **Automated Architect**.
*   **Static Decks**: Surgical contextual accuracy for traditional flashcards.
*   **Intelligent MCQ Engine**: Generates multiple-choice questions with "plausible distractors" to challenge deep conceptual mastery.

### 📊 Neural Analytics & Sync
*   **Real-Time Mastery Tracking**: Every correct answer across all modes updates your subject mastery in the database.
*   **Neon Progress Metrics**: Visualize retention curves and learning velocity with customized charting.
*   **Cloud-Native Persistence**: Secure data sync via Supabase ensures your progress is never lost across devices.

### 📱 Premium Mobile Experience
*   **Keyboard-Aware Inputs**: The tutoring interface dynamically slides to accommodate mobile keyboards.
*   **Cyber-Aesthetic UI**: Smooth Kinetic transitions and glassmorphism designed to trigger "flow states."

---

## 🛠 Technology Stack
*   **Frontend**: React (Vite-optimized), TypeScript, Tailwind CSS
*   **Animations**: Framer Motion
*   **Backend**: Supabase (Auth, RLS, PostgreSQL, Edge Functions)
*   **AI Engine**: OpenAI Cognitive Model (via OpenRouter)
*   **Analytics**: Recharts
*   **Export Engine**: jsPDF

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Supabase Account (for database/auth)
*   OpenRouter API Key (for AI generation)

### Installation
```bash
git clone https://github.com/ClydeCorrea7/FlashLearn.git
cd FlashLearn
npm install
```

### Environment Variables
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_api_key
```

### Development
```bash
npm run dev
```

---

## 📈 Roadmap
- [ ] **v1.3.0**: VIM-style keyboard mastery for high-speed study.
- [ ] **v1.4.0**: Collaborative "Study Nodes" for live group sessions.
- [ ] **v1.5.0**: Voice-to-Text integration for hands-free dynamic sessions.

## 📄 License
Licensed under the MIT License. Built with passion for the future of education.

---
*Created by [Clyde Correa](https://github.com/ClydeCorrea7) | FlashLearn: Accelerate Your Mastery.*
