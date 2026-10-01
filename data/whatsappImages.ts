export interface ShareableImageConfig {
  id: string;
  title: string;
  pageName: string;
  src: string;
  description: string;
  allowWhatsAppShare: boolean;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  maxSizeBytes: number; // Max allowed file size in bytes
  category: "childhood" | "memory" | "scrapbook" | "portrait";
}

// Explicitly whitelisted images enabled for WhatsApp sharing
export const SHAREABLE_IMAGES: ShareableImageConfig[] = [
  {
    id: "childhood-chaos",
    title: "Childhood Chaos",
    pageName: "Chapter 03: Photo Scrapbook",
    src: "/photos/childhood.jpg",
    description: "The young chaos edition — some things never change.",
    allowWhatsAppShare: true,
    mimeType: "image/jpeg",
    maxSizeBytes: 5 * 1024 * 1024,
    category: "childhood",
  },
  {
    id: "coffee-date-syntax",
    title: "Campus Coffee Date",
    pageName: "Chapter 03: Photo Scrapbook",
    src: "/photos/photo1.jpg",
    description: "That coffee date where we argued over syntax.",
    allowWhatsAppShare: true,
    mimeType: "image/jpeg",
    maxSizeBytes: 5 * 1024 * 1024,
    category: "memory",
  },
  {
    id: "anshika-moment",
    title: "A Certified Anshika Moment",
    pageName: "Chapter 03: Photo Scrapbook",
    src: "/photos/photo2.jpg",
    description: "The kind of day I'd remember for no reason.",
    allowWhatsAppShare: true,
    mimeType: "image/jpeg",
    maxSizeBytes: 5 * 1024 * 1024,
    category: "scrapbook",
  },
  {
    id: "childhood-polaroid-ch2",
    title: "Look Who Grew Up",
    pageName: "Chapter 02: 19th Birthday",
    src: "/photos/childhood.jpg",
    description: "19 years later and still causing chaos.",
    allowWhatsAppShare: true,
    mimeType: "image/jpeg",
    maxSizeBytes: 5 * 1024 * 1024,
    category: "childhood",
  },
  {
    id: "golden-hour-moment",
    title: "Golden Hour Glow",
    pageName: "Chapter 03: Photo Scrapbook",
    src: "/photos/photo3.jpg",
    description: "Sunset smiles and calm evenings.",
    allowWhatsAppShare: true,
    mimeType: "image/jpeg",
    maxSizeBytes: 5 * 1024 * 1024,
    category: "memory",
  },
];

export const SHAREABLE_IMAGES_MAP = new Map<string, ShareableImageConfig>(
  SHAREABLE_IMAGES.map((img) => [img.id, img])
);

export function getShareableImage(id: string): ShareableImageConfig | undefined {
  return SHAREABLE_IMAGES_MAP.get(id);
}

/**
 * Format timestamp nicely for WhatsApp captions:
 * e.g. "Oct 1, 2026, 10:20 AM"
 */
export function formatWhatsAppTimestamp(date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Generate standard message text:
 * “New image shared from the website 📸 — [page/image name] • [timestamp]”
 */
export function generateWhatsAppCaption(
  imageTitle: string,
  pageName: string,
  timestampStr?: string
): string {
  const ts = timestampStr || formatWhatsAppTimestamp();
  return `New image shared from the website 📸 — ${pageName} / ${imageTitle} • ${ts}`;
}

export const TARGET_WHATSAPP_CONFIG = {
  rawNumber: "918278710552",
  displayNumber: "+91 8278710552",
  recipientName: "Anuj",
};
