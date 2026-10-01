# 🌸 Anshika's 19th Birthday Scrapbook (`ANSHIKA.EXE`)

An interactive, responsive digital scrapbook and gift-unboxing experience built for **Anshika's 19th Birthday (28 October 2026)**.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Cloudinary**, and **Firebase Firestore**.

---

## ✨ Experience Overview & Highlights

- 🔐 **Password-Protected Gate (`SecretGiftGate`)**: Minimalist, animated password entry screen (`ANSHII19`) with session-based expiration and invalid-password feedback.
- 📖 **Interactive Scrapbook Pager**:
  - **Chapter 01: Welcome**: Floral intro with custom hand-drawn cursor and celebration burst.
  - **Chapter 02: 19th Birthday**: Interactive flower bloom and heartfelt birthday card.
  - **Chapter 03: Photo Scrapbook**: Polaroids with custom captions and zoom view.
  - **Chapter 04: Gift Unboxing Snaps**: Step-by-step unboxing flow (Closed Gift Box $\rightarrow$ Wearing Bracelet $\rightarrow$ Gift #2) with live image upload.
  - **Chapter 05: Song & Playlist**: Interactive background music player with multiple tracks and audio visualizer.
  - **Chapter 06: Memory Match**: Engaging 3-pair memory game with CS and personal easter eggs.
  - **Chapter 07: Scratch Card**: Realistic scratchable canvas revealing a hidden birthday message.
  - **Chapter 08: Sincere Letter**: Typing animation and letter reveal.
  - **Chapter 09: Grand Finale**: Floating petals, interactive celebration, and heartfelt wishes.
- ☁️ **Cloudinary Image Storage**: Secure server-side signed uploads with format & size validation (JPEG, PNG, WebP, GIF, HEIC up to 10MB). Image binaries are stored exclusively in Cloudinary; only URLs & metadata are kept in Firestore.
- 🔥 **Firebase Firestore Analytics**: Privacy-conscious, consent-based telemetry tracking anonymous session journeys (`sessions/{sessionId}`), chronological events (`sessions/{sessionId}/events/{eventId}`), and upload records (`uploads/{uploadId}`).
- 🛡️ **Admin Analytics Dashboard (`/admin`)**: Protected analytics dashboard displaying real-time metrics, session timeline inspection, and an uploads gallery.
- 💬 **WhatsApp Notification**: Dedicated trigger sending automated status notifications via official WhatsApp Cloud API.

---

## 📁 Project Directory Structure

```text
├── app/
│   ├── admin/                    # Admin Analytics Dashboard (/admin)
│   ├── api/
│   │   ├── analytics/            # Session, event, and admin metrics API routes
│   │   ├── auth/                 # Password verification & session cookie API
│   │   ├── gift-snaps/           # Firestore gift snaps metadata endpoints
│   │   ├── upload/               # Cloudinary secure upload & signature endpoints
│   │   └── whatsapp/             # WhatsApp Cloud API notification endpoints
│   ├── qr-card/                  # Printable QR Card page (/qr-card)
│   ├── globals.css               # Global theme tokens, typography & animations
│   ├── layout.tsx                # Root layout with font imports & leave guards
│   └── page.tsx                  # Main entry point mounting ScrapbookPager
├── components/
│   ├── flowers/                  # Blooming floral SVGs, canvas petals & particle bursts
│   ├── frames/                   # All 9 scrapbook chapter pages (Welcome, GiftSnaps, etc.)
│   ├── legacy/                   # Archived components from previous iterations
│   ├── transitions/              # Smooth curtain folds & locked skip transition alerts
│   ├── CustomCursor.tsx          # Hand-drawn floral desktop cursor
│   ├── EasterEgg.tsx             # Secret keyboard / gesture easter egg
│   ├── LeavePageGuard.tsx        # Exit confirmation guard
│   ├── MusicPlayer.tsx           # Floating audio player & soundtrack selector
│   ├── PrintableQrCard.tsx       # Printable QR card component
│   ├── PrivacyNoticeBanner.tsx   # Consent-based anonymous telemetry disclosure
│   ├── ScrapbookPager.tsx        # Central scrapbook navigation engine
│   ├── SecretGiftGate.tsx        # Password unlock & session guard
│   ├── SendWhatsAppNotificationButton.tsx # WhatsApp notification trigger
│   └── WhatsAppImageModal.tsx    # Media share confirmation modal
├── data/
│   ├── birthday.ts               # Scrapbook copy, captions, and memory text
│   ├── musicConfig.ts            # Soundtrack tracks & frame-by-frame music map
│   └── whatsappImages.ts         # Pre-configured shareable image metadata
├── lib/
│   ├── analyticsClient.ts        # Client telemetry dispatcher & session manager
│   ├── cloudinary.ts             # Cloudinary SDK wrapper & signed upload handler
│   └── firebaseAdmin.ts          # Firebase Admin SDK & Firestore initializer
├── public/
│   ├── gifs/                     # Reaction GIFs
│   ├── music/                    # Optimized soundtrack audio files
│   └── photos/                   # Scrapbook polaroids & childhood photos
├── scripts/                      # Developer utility scripts (audio generation, etc.)
├── firestore.rules               # Firestore security rules
└── .env.example                  # Environment configuration template
```

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template
cp .env.example .env.local

# 3. Configure your secrets in .env.local (SITE_PASSWORD, Cloudinary, Firebase)

# 4. Start the development server
npm run dev

# 5. Open in browser
http://localhost:3000
```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub (`git push origin main`).
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. In **Project Settings $\rightarrow$ Environment Variables**, configure the following keys:

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `SITE_PASSWORD` | Access password for the scrapbook | `ANSHII19` |
| `ADMIN_KEY` | Password for the `/admin` dashboard | `ANSHII19` |
| `AUTH_SESSION_SECRET` | Secret string for session cookie hashing | Any random 32-char string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Your Cloudinary name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your Cloudinary secret |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Entire Firebase service account JSON | Minified JSON or Base64 string |
| `WHATSAPP_PHONE_NUMBER_ID` | (Optional) Meta Phone Number ID | From Meta Developer App |
| `WHATSAPP_ACCESS_TOKEN` | (Optional) Meta Access Token | System User Token |
| `WHATSAPP_TO_NUMBER` | Recipient WhatsApp number | `918278710552` |

4. Click **Deploy**. Vercel will build and launch your production site automatically!
