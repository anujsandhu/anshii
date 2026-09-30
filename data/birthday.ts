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
    importantPersonDetected: string;
    investigatePrompt: string;
    buttonYes: string;
    buttonObviously: string;
    responseYes: string;
    responseObviously: string;
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
    playlist: Array<{
      id: string;
      title: string;
      artist: string;
      src: string;
      vibe: string;
    }>;
  };
  quest: {
    tasks: Array<{
      id: string;
      title: string;
      description: string;
    }>;
    allCompletedMessage: string;
  };
  birthdayMode: {
    title: string;
    subtitle: string;
    options: Array<{
      id: "cake" | "sleep" | "chaos";
      label: string;
      emoji: string;
      response: string;
      reactionDetail: string;
    }>;
  };
  starCatcher: {
    title: string;
    subtitle: string;
    targetStars: number;
    winMessage: string;
  };
  sentenceCompletion: {
    prompt: string;
    options: Array<{
      text: string;
      response: string;
    }>;
  };
  reactionTest: {
    title: string;
    waitingText: string;
    triggerText: string;
    responses: {
      fast: string;
      medium: string;
      slow: string;
    };
  };
  interstitials: {
    break1: { main: string; followUp: string };
    break2: { main: string; followUp: string };
    preFinal: { main: string; followUp: string };
  };
  photos: Array<{
    id: number;
    src: string;
    caption: string;
    tag?: string;
    rotation?: number;
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
  debugMiniGame: {
    title: string;
    subtitle: string;
    bugs: Array<{
      id: string;
      bugNumber: string;
      title: string;
      fixLabel: string;
      fixedTitle: string;
      fixedDetail: string;
    }>;
  };
  secretButton: {
    initialLabel: string;
    steps: Array<{
      buttonText: string;
      dialogue: string;
    }>;
    reward: string;
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
    konamiSequence: string[];
  };
  gifs: {
    celebrate: string;
    coding: string;
    reaction: string;
  };
  final: {
    introText: string;
    compilingHeadline: string;
    compilingSteps: Array<{ percent: number; status: string }>;
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
      "> Searching birthday configuration...",
      "> Birthday detected: 19",
      "> Loading surprise...",
      "> System ready.",
    ],
    importantPersonDetected: "System detected an important person.",
    investigatePrompt: "Would you like to investigate?",
    buttonYes: "YES",
    buttonObviously: "Obviously",
    responseYes: "Good choice.",
    responseObviously: "I knew you'd click that.",
    enterButtonText: "ENTER EXPERIENCE",
  },

  hero: {
    badge: "RELEASE v19.0 // OCT 28, 2026",
    title: "Happy 19th Birthday, Anshika",
    highlightWord: "Anshika",
    subtext:
      "Someone had to make you a website instead of just sending a birthday text.",
    scrollHint: "Scroll down to explore the journey ↓",
  },

  music: {
    title: "Midnight Coding Lofi",
    artist: "Chilled Synthwave & Coffee",
    src: "/music/song.mp3",
    playlist: [
      {
        id: "track-1",
        title: "Midnight Coding Lofi",
        artist: "Chilled Synthwave & Coffee",
        src: "/music/song.mp3",
        vibe: "🌙 Warm late-night study session",
      },
      {
        id: "track-2",
        title: "Campus Morning Acoustic",
        artist: "Chill Melodic Guitars",
        src: "/music/song.wav",
        vibe: "☕ Autumn morning walk to lecture",
      },
      {
        id: "track-3",
        title: "Celebration Ambient Chimes",
        artist: "Synthesized Harmony",
        src: "/music/song.mp3",
        vibe: "✨ Festive golden sparkler atmosphere",
      },
    ],
  },

  // Birthday Quest Task Definitions
  quest: {
    tasks: [
      { id: "start_bday", title: "Start the Birthday", description: "Tap the launch button to kick off Year 19." },
      { id: "find_star", title: "Find the Hidden Star", description: "Locate the secret glowing star hidden on the page." },
      { id: "make_choice", title: "Make the Birthday Decision", description: "Choose between Cake, Sleep, or Chaos." },
      { id: "fix_code", title: "Fix the Birthday Code", description: "Debug the age variable from 18 to 19." },
      { id: "choose_music", title: "Select a Soundtrack", description: "Choose the ambient tune for your website exploration." },
      { id: "reaction_test", title: "Test Your Reflexes", description: "Click as soon as the prompt flashes NOW!" },
      { id: "complete_sentence", title: "Complete the Sentence", description: "Answer what you deserve on your birthday." },
    ],
    allCompletedMessage:
      "🎉 100% BIRTHDAY EXPLORER UNLOCKED!\nYou actually found and completed every single task. That curiosity and attention to detail is why working and laughing with you is always a highlight. Happy 19th, Anshika! — Anuj",
  },

  // Interactive Choice: What are you choosing today?
  birthdayMode: {
    title: "Important birthday decision.",
    subtitle: "What are you choosing today?",
    options: [
      {
        id: "cake",
        label: "CAKE",
        emoji: "🍰",
        response: "Correct. Obviously.",
        reactionDetail: "Cake mode confirmed: Maximum sugar, sweet memories, and zero caloric accountability.",
      },
      {
        id: "sleep",
        label: "SLEEP",
        emoji: "😴",
        response: "Valid choice.",
        reactionDetail: "Sleep mode requested: 12 hours minimum, do-not-disturb on, stress strictly forbidden.",
      },
      {
        id: "chaos",
        label: "CHAOS",
        emoji: "⚡",
        response: "I expected this.",
        reactionDetail: "Chaos mode initiated: Spontaneous adventures, loud laughs, and debugging at 2 AM.",
      },
    ],
  },

  // Reaction Speed Test
  reactionTest: {
    title: "Mini Reaction Test",
    waitingText: "Don't click yet...",
    triggerText: "NOW!",
    responses: {
      fast: "Okay, speed demon. Top-tier CS reflexes.",
      medium: "Pretty fast! Ready for quick bug hotfixes.",
      slow: "We'll blame the birthday excitement. Still counts!",
    },
  },

  // Complete the Sentence
  sentenceCompletion: {
    prompt: "Today I deserve ______.",
    options: [
      { text: "Cake", response: "Correct. Infinite slices reserved." },
      { text: "A Holiday", response: "100% approved by the department." },
      { text: "Everything", response: "As you should. It's your 19th!" },
      { text: "All of the above", response: "Correct. All of the above. Unanimous decision." },
    ],
  },

  // Mini-Game: Catch 5 Birthday Sparks / Stars
  starCatcher: {
    title: "Catch 5 Birthday Sparks ✨",
    subtitle: "Tap or click the floating sparks to calibrate reflex metrics:",
    targetStars: 5,
    winMessage: "Reflex calibration 100%! All 5 sparks captured.",
  },

  // Conversational Pacing Interstitials between major areas
  interstitials: {
    break1: {
      main: "Okay, enough scrolling.",
      followUp: "...actually keep going.",
    },
    break2: {
      main: "You thought that was the end?",
      followUp: "Not even close.",
    },
    preFinal: {
      main: "Okay, enough playing.",
      followUp: "There's one thing I actually wanted to say...",
    },
  },

  // Photos
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

  // GIF paths
  gifs: {
    celebrate: "/gifs/celebrate.gif",
    coding: "/gifs/coding.gif",
    reaction: "/gifs/reaction.gif",
  },

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

  // CS Developer Mini-Game: "Debugging Anshika's Birthday"
  debugMiniGame: {
    title: "Debugging Anshika's Birthday",
    subtitle: "A quick hotfix session before the production release of Year 19.",
    bugs: [
      {
        id: "bug-01",
        bugNumber: "Bug #001",
        title: "Birthday girl is getting older.",
        fixLabel: "FIX BUG",
        fixedTitle: "Bug fixed.",
        fixedDetail: "Age updated: 19. (Zero deprecation warnings)",
      },
      {
        id: "bug-02",
        bugNumber: "Bug #002",
        title: "Insufficient happiness detected.",
        fixLabel: "DEBUG",
        fixedTitle: "Happiness level restored.",
        fixedDetail: "State: MAX_SAFE_INTEGER joy allocated.",
      },
      {
        id: "bug-03",
        bugNumber: "Bug #003",
        title: "Coffee and energy supply running low.",
        fixLabel: "REFILL CAFFEINE",
        fixedTitle: "Caffeine replenished.",
        fixedDetail: "Ready for Semester 4 coding sprints.",
      },
      {
        id: "bug-04",
        bugNumber: "Bug #004",
        title: "Infinite loop of good vibes.",
        fixLabel: "LET IT RUN",
        fixedTitle: "Feature confirmed.",
        fixedDetail: "Intentional design: This loop will never terminate.",
      },
    ],
  },

  // Interactive Playful "Click Me" moment
  secretButton: {
    initialLabel: "DO NOT PRESS 🛑",
    steps: [
      {
        buttonText: "Why did you click it? 😂",
        dialogue: "Seriously, this button has zero practical utility.",
      },
      {
        buttonText: "Okay, one more...",
        dialogue: "Are you inspecting the source code right now?",
      },
      {
        buttonText: "Okay, undo...",
        dialogue: "Fine. You're forgiven. Here is your secret reward:",
      },
    ],
    reward:
      "🎉 Achievement Unlocked: Unchecked Curiosity! Here's your secret reward: May your 19th year be full of breakthroughs, peace of mind, and zero compile errors. You're awesome, Anshika! ✨",
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

  // Interactive vertical timeline with Compile & Lock mechanism
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
    konamiSequence: [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
    ],
  },

  final: {
    introText: "One last thing...",
    compilingHeadline: "Compiling final message...",
    compilingSteps: [
      { percent: 10, status: "Loading sentiments..." },
      { percent: 37, status: "Checking memory buffers..." },
      { percent: 64, status: "Optimizing good wishes..." },
      { percent: 89, status: "Linking heartfelt assets..." },
      { percent: 100, status: "Compilation successful." },
    ],
    headline: "Happy 19th Birthday, Anshika.",
    celebrateLine: "Here's to 19.",
    signature: "— Anuj",
    replayText: "Run the experience again",
  },
};
