import { JournalStep, SoundscapeTrack } from './types';

export const IMMANUEL_STEPS: JournalStep[] = [
  {
    id: 1,
    title: "Interactive Gratitude",
    primaryPrompt: "What are you grateful for in this moment?",
    breathingCue: "Pause. Breathe slowly. Notice the goodness around you.",
    guidance: "Write a few sentences about something specific. Then, pause and sense how a good Father receives this gratitude.",
    placeholder: "Lord, I am grateful for...",
    example: "e.g., \"I am grateful for the warmth of the sun on my face and the quiet hum of the morning.\""
  },
  {
    id: 2,
    title: "God Sees You",
    primaryPrompt: "From God's perspective, write: \"My child, I see you...\"",
    breathingCue: "Close your eyes. Imagine His gaze is warm and kind.",
    guidance: "What does He notice about your physical body, your breathing, your posture, or your current energy? Be specific.",
    placeholder: "My child, I see you sitting here...",
    example: "e.g., \"My child, I see you sitting in your chair with your shoulders tight, trying so hard to get this right.\""
  },
  {
    id: 3,
    title: "God Hears You",
    primaryPrompt: "From God's perspective, write: \"I hear you...\"",
    breathingCue: "Quiet your mind. Listen to the thoughts circling in your heart.",
    guidance: "What are you saying to yourself internally? He hears the doubts, the questions, and the quiet hopes.",
    placeholder: "I hear you telling yourself that...",
    example: "e.g., \"I hear you telling yourself that you are behind schedule and worrying that you aren't doing enough.\""
  },
  {
    id: 4,
    title: "God Understands",
    primaryPrompt: "From God's perspective, write: \"I understand...\"",
    breathingCue: "Breathe out the need to explain yourself. He already knows.",
    guidance: "How does He view your dreams, troubles, or fears? Write from His compassionate understanding of your history.",
    placeholder: "I understand how hard this is for you because...",
    example: "e.g., \"I understand how heavy the burden of caring for your family feels today, and I know how much you want to help them.\""
  },
  {
    id: 5,
    title: "God Is With You",
    primaryPrompt: "From God's perspective, write: \"I am with you...\"",
    breathingCue: "Sense His nearness. He is not distant.",
    guidance: "How is He holding your weakness tenderly right now? How does He express His desire to be near?",
    placeholder: "I am with you and I hold your weakness tenderly by...",
    example: "e.g., \"I am with you, sitting right beside you, admiring the honest heart you have brought to me today.\""
  },
  {
    id: 6,
    title: "God Has Resources",
    primaryPrompt: "From God's perspective, write: \"I give you...\"",
    breathingCue: "Open your hands physically. Receive what He offers.",
    guidance: "What specific resource (peace, strength, clarity, rest) does He have for you in this moment?",
    placeholder: "My child, today I give you...",
    example: "e.g., \"My child, today I give you permission to rest without guilt, and my peace which surpasses understanding.\""
  }
];

export const SOUNDSCAPES: SoundscapeTrack[] = [
  {
    id: 'confession',
    label: 'Confession',
    src: '/audio/confession.mp3'
  },
  {
    id: '432hz',
    label: '432Hz Frequency',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'rain',
    label: 'Soft Rain',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'chant',
    label: 'Monastic Chant',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' 
  },
  {
    id: 'piano',
    label: 'Sacred Piano',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  }
];
