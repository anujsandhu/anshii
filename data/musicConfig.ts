export interface SongConfig {
  id: string;
  order: number;
  title: string;
  movieOrArtist: string;
  src: string;
  startTime: number; // in seconds (starting point of the music)
  endTime?: number;   // optional
  duration?: number;  // optional
  frameId: number;   // default corresponding frame (0 to 7)
  vibe: string;
}

// Candidates for automated filename matching in public/music
const CANDIDATE_MAP: Record<string, string[]> = {
  iktara: [
    "/music/Iktara.mp3",
    "/music/iktara.mp3",
  ],
  ilahi: [
    "/music/Ilahi.mp3",
    "/music/ilahi.mp3",
  ],
  woh_din: [
    "/music/Woh_Din.mp3",
    "/music/woh-din.mp3",
  ],
  i_like_me_better: [
    "/music/Lauv_-_Lauv_-_I_Like_Me_Better_Audio_(mp3.pm).mp3",
    "/music/i-like-me-better.mp3",
    "/music/i_like_me_better.mp3",
  ],
  heeriye: [
    "/music/Heeriye.mp3",
    "/music/heeriye.mp3",
  ],
  kho_gaye_hum_kahan: [
    "/music/Sanjay_S_Yadav_Slickmusix_-_Kalank_Lofi_Reverb_(mp3.pm).mp3",
    "/music/Kho_Gaye_Hum_Kahan.mp3",
  ],
  apna_bana_le: [
    "/music/song.mp3",
    "/music/Apna_Bana_Le.mp3",
  ],
  kalank: [
    "/music/Sanjay_S_Yadav_Slickmusix_-_Kalank_Lofi_Reverb_(mp3.pm).mp3",
    "/music/Kalank.mp3",
  ],
  until_i_found_you: [
    "/music/Until_I_Found_You.mp3",
    "/music/until-i-found-you.mp3",
  ],
};

export function resolveAudioSource(key: string): string {
  const candidates = CANDIDATE_MAP[key];
  if (candidates && candidates.length > 0) {
    return encodeURI(candidates[0]);
  }
  return `/music/${key}.mp3`;
}

export const BIRTHDAY_SOUNDTRACKS: SongConfig[] = [
  {
    id: "song-1",
    order: 1,
    title: "Iktara",
    movieOrArtist: "Wake Up Sid",
    src: resolveAudioSource("iktara"),
    startTime: 0,
    frameId: 0, // Frame 1: Welcome
    vibe: "🌸 Opening the birthday surprise",
  },
  {
    id: "song-2",
    order: 2,
    title: "Ilahi",
    movieOrArtist: "Yeh Jawaani Hai Deewani",
    src: resolveAudioSource("ilahi"),
    startTime: 40, // Energetic chorus starting point
    frameId: 1, // Frame 2: 19th Birthday
    vibe: "✨ Flying into 19 with a big smile",
  },
  {
    id: "song-3",
    order: 3,
    title: "Woh Din",
    movieOrArtist: "Chhichhore",
    src: resolveAudioSource("woh_din"),
    startTime: 35,
    frameId: 2, // Frame 3: Polaroid Photos
    vibe: "📸 College laughter & golden memories",
  },
  {
    id: "song-4",
    order: 4,
    title: "I Like Me Better",
    movieOrArtist: "Lauv",
    src: resolveAudioSource("i_like_me_better"),
    startTime: 0,
    frameId: 3, // Frame 4: Gift Snaps
    vibe: "🎧 Nostalgic late night study vibes",
  },
  {
    id: "song-5",
    order: 5,
    title: "Heeriye",
    movieOrArtist: "Jasleen Royal & Arijit Singh",
    src: resolveAudioSource("heeriye"),
    startTime: 35,
    frameId: 4, // Frame 5: CS Quiz
    vibe: "💖 Soft acoustic happiness",
  },
  {
    id: "song-6",
    order: 6,
    title: "Kho Gaye Hum Kahan",
    movieOrArtist: "Baar Baar Dekho",
    src: resolveAudioSource("kho_gaye_hum_kahan"),
    startTime: 40,
    frameId: 5, // Frame 6: Scratch Card
    vibe: "🌿 Quiet late-night conversations",
  },
  {
    id: "song-7",
    order: 7,
    title: "Apna Bana Le",
    movieOrArtist: "Bhediya",
    src: resolveAudioSource("apna_bana_le"),
    startTime: 45,
    frameId: 6, // Frame 7: Handwritten Letter
    vibe: "💌 Handwritten words from the heart",
  },
  {
    id: "song-8",
    order: 8,
    title: "Kalank (Lofi)",
    movieOrArtist: "Arijit Singh",
    src: resolveAudioSource("kalank"),
    startTime: 20,
    frameId: 7, // Frame 8: Madam Ji's Keepsake
    vibe: "🤍 Quiet, honest heartfelt words",
  },
  {
    id: "song-9",
    order: 9,
    title: "Until I Found You",
    movieOrArtist: "Stephen Sanchez",
    src: resolveAudioSource("until_i_found_you"),
    startTime: 45,
    frameId: 8, // Frame 9: Grand Finale Bloom
    vibe: "🌷 Cinematic final birthday climax",
  },
];

// Helper to map frame index to its default song
export function getSongForFrame(frameIndex: number): SongConfig {
  switch (frameIndex) {
    case 0:
      return BIRTHDAY_SOUNDTRACKS[0]; // Iktara — Welcome
    case 1:
      return BIRTHDAY_SOUNDTRACKS[1]; // Ilahi — Birthday
    case 2:
      return BIRTHDAY_SOUNDTRACKS[2]; // Woh Din — Photos
    case 3:
      return BIRTHDAY_SOUNDTRACKS[3]; // I Like Me Better — Gift Snaps
    case 4:
      return BIRTHDAY_SOUNDTRACKS[4]; // Heeriye — CS Quiz
    case 5:
      return BIRTHDAY_SOUNDTRACKS[5]; // Kho Gaye Hum Kahan — Scratch Card
    case 6:
      return BIRTHDAY_SOUNDTRACKS[6]; // Apna Bana Le — Letter
    case 7:
      return BIRTHDAY_SOUNDTRACKS[7]; // Kalank (Lofi) — Madam Ji's Keepsake
    case 8:
      return BIRTHDAY_SOUNDTRACKS[8]; // Until I Found You — Grand Finale
    default:
      return BIRTHDAY_SOUNDTRACKS[0];
  }
}

// Backward compatibility types and list for legacy components
export interface SongTrack {
  id: string;
  section: string;
  title: string;
  artist: string;
  vibe: string;
  src: string;
}

export const SCRAPBOOK_PLAYLIST: SongTrack[] = BIRTHDAY_SOUNDTRACKS.map((s) => ({
  id: s.id,
  section: `Track ${s.order}`,
  title: s.title,
  artist: s.movieOrArtist,
  vibe: s.vibe,
  src: s.src,
}));
