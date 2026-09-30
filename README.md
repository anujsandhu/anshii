# ✨ Anshika's 19th Birthday Website (`ANSHIKA.EXE`)

A personal, highly interactive, playful CS-themed birthday experience built by **Anuj** for **Anshika** on her 19th birthday (28 October 2026).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

---

## 🚀 Live Demo & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

---

## 🗺️ The Birthday Quest & Mini-Tasks

Anshika is greeted with a non-intrusive, playful checklist (`BIRTHDAY QUEST: X / 7`) that encourages curiosity and smiling without creating pressure or homework:

1. **Task 01: Start the Birthday (`[ START MY BIRTHDAY ]`)**
   - Tap the launch button to officially kick off Year 19 with celebration confetti and music.

2. **Task 02: Find the Hidden Star**
   - *"There's something hidden here... Find it."* A subtle glowing star hidden on the page triggers *"Explorer Mode: ON"*.

3. **Task 03: Important Birthday Decision (Cake / Sleep / Chaos)**
   - Witty runtime configuration:
     - `[ CAKE 🍰 ]` $\rightarrow$ *"Correct. Obviously."*
     - `[ SLEEP 😴 ]` $\rightarrow$ *"Valid choice."*
     - `[ CHAOS ⚡ ]` $\rightarrow$ *"I expected this."*

4. **Task 04: Debug the Birthday Code**
   - `const birthday = 18;` $\rightarrow$ Choose `[ 19 ]` to successfully compile Version 19.0.

5. **Task 05: Select a Soundtrack**
   - Choose between *"Midnight Coding Lofi"*, *"Campus Morning Acoustic"*, and *"Celebration Ambient Chimes"*.

6. **Task 06: Mini Reaction Test**
   - *"Don't click yet..."* $\rightarrow$ *"NOW!"* Calculates reaction time (e.g. `0.38s`) with funny CS feedback.

7. **Task 07: Complete the Sentence**
   - *"Today I deserve ______."* (`[ Cake ]`, `[ A Holiday ]`, `[ Everything ]`, `[ All of the above ]`).

8. **Bonus Mini-Game: 3-Pair Memory Match**
   - Match the 3 essential CS pairs (☕ Coffee, 💻 Code, 🎂 Cake) to compile the memory stack.

9. **Bonus Mini-Game: Star Catcher**
   - Catch 5 floating golden sparks across the screen in 5 seconds.

10. **Final Task: `[ READY ]` Before The Grand Finale**
    - A gentle pause: *"Okay. That's enough playing. There's one thing I actually wanted to say..."* smoothly leads into the sincere final birthday moment!

11. **100% Explorer Reward**
    - Completing all tasks reveals a heartfelt personal achievement note from Anuj!
    - *Note: If any task is skipped, all core birthday content, memories, photos, and messages remain 100% accessible.*

---

## 🛠️ Customization Guide

All personal information, photo captions, messages, and settings are located in one file:
👉 **[`data/birthday.ts`](./data/birthday.ts)**

- **Real Photos**: Drop 5 images into `public/photos/` (`photo1.jpg` to `photo5.jpg`).
- **Music**: Place your song in `public/music/` (e.g. `public/music/song.mp3`).
- **Message**: Edit `message.content` in [`data/birthday.ts`](./data/birthday.ts).
- **Memories & Qualities**: Edit `timeline` and `qualities` arrays.
- **Choices & Copy**: Everything is editable directly in [`data/birthday.ts`](./data/birthday.ts).

---

## 🚢 Deploying to Vercel

```bash
# Push to GitHub
git add .
git commit -m "feat: complete interactive birthday quest experience"
git push origin main
```
Import the repository on [Vercel](https://vercel.com) and deploy with standard Next.js settings!

---

*Designed & developed by Anuj for Anshika • 19th Birthday • 28 October 2026*
