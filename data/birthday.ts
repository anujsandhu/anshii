export interface BirthdayConfig {
  recipient: {
    name: string;
    nickname: string;
    age: number;
    birthdayDate: string; // "28 October 2026"
    creatorName: string; // "Anuj"
  };
  intro: {
    terminalCommand: string;
    bootLines: string[];
    readyPrompt: string;
    enterButtonText: string;
  };
  hero: {
    badge: string;
    title: string;
    highlightWord: string;
    subtext: string;
    scrollHint: string;
  };
  music: {
    title: string;
    artist: string;
    src: string; // Local path e.g. "/music/song.mp3" or remote URL
  };
  photos: Array<{
    id: number;
    src: string;
    caption: string;
    tag?: string;
    rotation?: number; // degrees for polaroid tilt
  }>;
  message: {
    title: string;
    codeComment: string;
    content: string[];
  };
  devDashboard: {
    title: string;
    badge: string;
    stats: Array<{
      label: string;
      value: string;
      color: "emerald" | "cyan" | "amber" | "violet" | "rose" | "blue";
    }>;
    codeSnippet: string;
    logs: string[];
  };
  qualities: Array<{
    id: number;
    icon: string;
    title: string;
    description: string;
    tag: string;
  }>;
  timeline: Array<{
    id: string;
    step: string;
    title: string;
    date: string;
    description: string;
    photo?: string;
  }>;
  easterEgg: {
    triggerCount: number;
    secretCommand: string;
    wishOutput: string;
  };
  final: {
    introText: string;
    headline: string;
    celebrateLine: string;
    signature: string;
    replayText: string;
  };
}

export const birthdayData: BirthdayConfig = {
  recipient: {
    name: "Anshika",
    nickname: "Anshi",
    age: 19,
    birthdayDate: "28 October 2026",
    creatorName: "Anuj",
  },

  intro: {
    terminalCommand: "anuj@terminal:~$ ./anshika.exe --init --birthday-mode",
    bootLines: [
      "> Initializing Anshika.exe...",
      "> Loading memories...",
      "> Compiling good moments...",
      "> Checking birthday status...",
      "> Birthday detected: 19",
      "> System ready.",
    ],
    readyPrompt: "Ready?",
    enterButtonText: "ENTER EXPERIENCE",
  },

  hero: {
    badge: "RELEASE v19.0 // OCT 28, 2026",
    title: "Happy 19th Birthday, Anshika",
    highlightWord: "Anshika",
    subtext:
      "Someone had to make you a website instead of just sending a birthday text.",
    scrollHint: "Scroll down to initialize the build",
  },

  music: {
    title: "Midnight Coding Lofi",
    artist: "Chilled Synthwave & Coffee",
    // Replace with your own audio file placed in /public/music/ (e.g. "/music/song.mp3")
    // When no file is found, the built-in ambient Web Audio synth engine plays automatically!
    src: "/music/song.mp3",
  },

  // Replace photo1.jpg through photo5.jpg in /public/photos/ with real pictures of Anshika or moments together.
  photos: [
    {
      id: 1,
      src: "/photos/photo1.jpg",
      caption: "[A favorite picture or candid moment]",
      tag: "Memory 01",
      rotation: -3,
    },
    {
      id: 2,
      src: "/photos/photo2.jpg",
      caption: "[A fun day or college snapshot]",
      tag: "Memory 02",
      rotation: 2,
    },
    {
      id: 3,
      src: "/photos/photo3.jpg",
      caption: "[Study session or spontaneous hangout]",
      tag: "Memory 03",
      rotation: -2,
    },
    {
      id: 4,
      src: "/photos/photo4.jpg",
      caption: "[A genuine smile worth capturing]",
      tag: "Memory 04",
      rotation: 3,
    },
    {
      id: 5,
      src: "/photos/photo5.jpg",
      caption: "[One of the best memories this year]",
      tag: "Memory 05",
      rotation: -1,
    },
  ],

  message: {
    title: "A little message",
    codeComment: "// personal_note.ts (Compiled with care)",
    content: [
      "Happy Birthday, Anshika.",
      "I could have just sent you a normal birthday message, but where's the fun in that when we're both CS students?",
      "So I decided to build something instead.",
      "I hope this year brings you a lot of good memories, good people, good opportunities, and plenty of reasons to smile.",
      "Have an amazing 19th.",
    ],
  },

  devDashboard: {
    title: "Birthday Build v19.0",
    badge: "BUILD SUCCESSFUL",
    stats: [
      { label: "Version", value: "19.0", color: "cyan" },
      { label: "Status", value: "Stable", color: "emerald" },
      { label: "Build", value: "Successful", color: "violet" },
      { label: "Mood", value: "Happy", color: "amber" },
      { label: "Bugs", value: "Hopefully none", color: "rose" },
      { label: "Future", value: "Loading...", color: "blue" },
    ],
    codeSnippet: `// Configuration for an exceptional 19th year
interface BirthdayYear {
  version: number;
  wishes: number;
  memories: "loading..." | "accumulated";
  smile: boolean;
}

const birthday: BirthdayYear = {
  version: 19.0,
  wishes: Infinity,
  memories: "loading...",
  smile: true,
};

async function celebrateYear(person = "Anshika") {
  console.log(\`Running year 19 for \${person}...\`);
  return {
    growth: "exponential",
    stress: 0,
    happiness: Number.MAX_SAFE_INTEGER
  };
}`,
    logs: [
      "INFO [2026-10-28 00:00:00] Initializing core modules...",
      "INFO [2026-10-28 00:00:01] Loading academic achievements and CS grit...",
      "SUCCESS [2026-10-28 00:00:02] Zero critical exceptions found.",
      "SUCCESS [2026-10-28 00:00:03] Deployment target: Anshika's 19th year is live!",
    ],
  },

  // Edit these placeholders with genuine qualities, quirks, or inside jokes
  qualities: [
    {
      id: 1,
      icon: "Sparkles",
      title: "Genuine Vibe",
      description:
        "[Personal quality: Easy to talk to, grounded, and always bringing positive energy.]",
      tag: "Trait 01",
    },
    {
      id: 2,
      icon: "Code2",
      title: "CS Problem Solver",
      description:
        "[Funny habit: The determined face when debugging code or tackling difficult concepts.]",
      tag: "Trait 02",
    },
    {
      id: 3,
      icon: "Coffee",
      title: "Great Conversationalist",
      description:
        "[Something I appreciate: Late discussions, random humor, and insightful perspectives.]",
      tag: "Trait 03",
    },
    {
      id: 4,
      icon: "Laugh",
      title: "Sense of Humor",
      description:
        "[Something that makes conversations fun: Effortless jokes and laughing at chaotic moments.]",
      tag: "Trait 04",
    },
    {
      id: 5,
      icon: "HeartHandshake",
      title: "Reliable Friend",
      description:
        "[Another genuine quality: Someone you can always trust to have your back.]",
      tag: "Trait 05",
    },
    {
      id: 6,
      icon: "Compass",
      title: "Curious Mind",
      description:
        "[Always eager to learn new things, explore ideas, and keep moving forward.]",
      tag: "Trait 06",
    },
  ],

  // Interactive vertical timeline
  timeline: [
    {
      id: "mem-01",
      step: "01",
      title: "[First memorable moment]",
      date: "Semester 01 / Initial Meet",
      description:
        "[Add details here: The first time we met, collaborated on a project, or had an interesting conversation.]",
      photo: "/photos/photo1.jpg",
    },
    {
      id: "mem-02",
      step: "02",
      title: "[Funny conversation]",
      date: "Late Night Tech Talk",
      description:
        "[Add details here: A hilarious debate, a chaotic lab session, or an inside joke that still makes us laugh.]",
      photo: "/photos/photo2.jpg",
    },
    {
      id: "mem-03",
      step: "03",
      title: "[A moment I remember]",
      date: "Exam Week / Coffee Run",
      description:
        "[Add details here: Surviving deadline rush together or celebrating after wrapping up a tough week.]",
      photo: "/photos/photo3.jpg",
    },
    {
      id: "mem-04",
      step: "04",
      title: "[Another memory]",
      date: "Random Adventure",
      description:
        "[Add details here: A random spontaneous day or memorable milestone worth looking back on.]",
      photo: "/photos/photo4.jpg",
    },
  ],

  easterEgg: {
    triggerCount: 5,
    secretCommand: "sudo birthday --wish",
    wishOutput: "May your code compile on the first try.",
  },

  final: {
    introText: "One last thing...",
    headline: "Happy Birthday, Anshika.",
    celebrateLine: "Here's to 19.",
    signature: "— Anuj",
    replayText: "Run Again",
  },
};
