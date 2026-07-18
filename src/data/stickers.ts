export interface StickerPreset {
  id: string;
  name: string;
  category: 'study' | 'shapes' | 'doodles' | 'cute' | 'decorations';
  // Returns SVG contents or path elements to render
  path: string;
  viewBox: string;
  color?: string;
  opacity?: number;
  width: number;
  height: number;
}

export const STICKER_PRESETS: StickerPreset[] = [
  {
    id: 's-star',
    name: 'Hand-drawn Star ⭐',
    category: 'study',
    viewBox: '0 0 24 24',
    width: 50,
    height: 50,
    color: '#FBBF24',
    path: '<path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4-6.3-4.6-6.3 4.6 2.4-7.4-6.3-4.6h7.8z" stroke="#B45309" stroke-width="1.5" stroke-linejoin="round" fill="#FDE68A" />'
  },
  {
    id: 's-heart',
    name: 'Wobbly Heart ❤️',
    category: 'cute',
    viewBox: '0 0 24 24',
    width: 50,
    height: 50,
    color: '#EF4444',
    path: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#991B1B" stroke-width="1.5" fill="#FECACA" />'
  },
  {
    id: 's-check',
    name: 'Study Checkmark ✅',
    category: 'study',
    viewBox: '0 0 24 24',
    width: 40,
    height: 40,
    color: '#10B981',
    path: '<path d="M2 13.5l5 5 15-15" stroke="#047857" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />'
  },
  {
    id: 's-warning',
    name: 'Warning Label ⚠️',
    category: 'study',
    viewBox: '0 0 24 24',
    width: 60,
    height: 55,
    color: '#F59E0B',
    path: '<path d="M12 2L2 22h20L12 2z" stroke="#92400E" stroke-width="2" stroke-linejoin="round" fill="#FEF3C7" /><path d="M12 9v5" stroke="#92400E" stroke-width="2" stroke-linecap="round" fill="none" /><circle cx="12" cy="17" r="1.5" fill="#92400E" />'
  },
  {
    id: 's-bulb',
    name: 'Idea Lightbulb 💡',
    category: 'study',
    viewBox: '0 0 24 24',
    width: 50,
    height: 55,
    color: '#FBBF24',
    path: '<path d="M9 21h6m-6-3h6m3-7c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6z" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" fill="#FEF3C7" /><path d="M12 2v2m-6 2l1.5 1.5m10.5 0L18 6m-9 15v1a3 3 0 006 0v-1" stroke="#D97706" stroke-width="1.5" fill="none" />'
  },
  {
    id: 's-pin',
    name: 'Notebook Push Pin 📌',
    category: 'decorations',
    viewBox: '0 0 24 24',
    width: 40,
    height: 40,
    color: '#EF4444',
    path: '<path d="M16 12V4h1V2H7v2h1v8L6 14v2h5v6l1 1 1-1v-6h5v-2l-2-2z" stroke="#990000" stroke-width="1.5" fill="#EF4444" />'
  },
  {
    id: 's-tape-yellow',
    name: 'Sticky Tape Yellow 🎗️',
    category: 'decorations',
    viewBox: '0 0 100 30',
    width: 100,
    height: 30,
    opacity: 0.5,
    path: '<path d="M2 5 L8 2 L92 3 L98 6 L95 25 L88 28 L10 27 L3 24 Z" fill="rgba(253, 224, 71, 0.6)" stroke="rgba(202, 138, 4, 0.3)" stroke-width="1" />'
  },
  {
    id: 's-tape-pink',
    name: 'Sticky Tape Pink 🎗️',
    category: 'decorations',
    viewBox: '0 0 100 30',
    width: 100,
    height: 30,
    opacity: 0.5,
    path: '<path d="M3 3 L12 6 L90 2 L97 5 L95 24 L89 27 L8 28 L2 23 Z" fill="rgba(244, 114, 182, 0.6)" stroke="rgba(190, 24, 93, 0.3)" stroke-width="1" />'
  },
  {
    id: 's-tape-blue',
    name: 'Sticky Tape Blue 🎗️',
    category: 'decorations',
    viewBox: '0 0 100 30',
    width: 100,
    height: 30,
    opacity: 0.5,
    path: '<path d="M1 4 L10 2 L88 3 L99 5 L96 26 L87 28 L9 27 L2 24 Z" fill="rgba(96, 165, 250, 0.6)" stroke="rgba(29, 78, 216, 0.3)" stroke-width="1" />'
  },
  {
    id: 's-doodle-arrow',
    name: 'Curved Arrow Doodle ↪️',
    category: 'doodles',
    viewBox: '0 0 24 24',
    width: 50,
    height: 50,
    path: '<path d="M3 17c5.5-1 9-5.5 8-10.5M8 9.5l3-3.5 3.5 3" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />'
  },
  {
    id: 's-doodle-smile',
    name: 'Smiley Doodle 😊',
    category: 'doodles',
    viewBox: '0 0 24 24',
    width: 45,
    height: 45,
    path: '<circle cx="12" cy="12" r="9" stroke="#475569" stroke-width="2" fill="none" /><circle cx="9" cy="9.5" r="1.2" fill="#475569" /><circle cx="15" cy="9.5" r="1.2" fill="#475569" /><path d="M8.5 14.5c1.5 2 5.5 2 7 0" stroke="#475569" stroke-width="2" stroke-linecap="round" fill="none" />'
  },
  {
    id: 's-doodle-exclamation',
    name: 'Double Exclamation ‼️',
    category: 'doodles',
    viewBox: '0 0 24 24',
    width: 35,
    height: 45,
    path: '<path d="M8 4l1 10M15 4l-1 10" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" fill="none" /><circle cx="9.2" cy="19" r="1.5" fill="#DC2626" /><circle cx="13.8" cy="19" r="1.5" fill="#DC2626" />'
  },
  {
    id: 's-sticky-yellow',
    name: 'Yellow Sticky Note 📝',
    category: 'decorations',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    path: '<path d="M5 5h85l8 8v82H5V5z" fill="#FFF9C4" stroke="#FBC02D" stroke-width="1" /><path d="M90 5l8 8h-8V5z" fill="#FBC02D" opacity="0.5" />'
  },
  {
    id: 's-sticky-pink',
    name: 'Pink Sticky Note 📝',
    category: 'decorations',
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    path: '<path d="M5 5h85l8 8v82H5V5z" fill="#FCE4EC" stroke="#F174AC" stroke-width="1" /><path d="M90 5l8 8h-8V5z" fill="#F174AC" opacity="0.5" />'
  }
];
