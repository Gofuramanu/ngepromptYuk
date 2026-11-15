import type { AnatomyLayerKey, AnatomyLayerMeta, PromptData } from '../types/prompt';

// Definisi 6 lapisan anatomi prompt Claude: Role, Task, Context, Reasoning, Stop conditions, Output.
// Teks penjelasan (question) dibuat singkat, padat, dan jelas agar langsung mudah terbaca.
export const ANATOMY_LAYERS: AnatomyLayerMeta[] = [
  {
    key: 'role',
    title: 'Role',
    eyebrow: 'Persona',
    icon: 'user',
    iconSrc: '/icons/role.png',
    question: 'Siapa AI ini & keahliannya.',
    placeholder:
      'Contoh: Anda adalah seorang konsultan bisnis senior dengan spesialisasi pasar lokal Indonesia...',
    eyebrowColor: 'text-sky-400',
    dotColor: 'bg-sky-400',
    iconStyle: 'bg-sky-500/15 text-sky-400 ring-sky-400/25',
    activeBorder: 'border-sky-500/30 shadow-[0_0_35px_-12px_rgba(56,189,248,0.28)]',
    cornerGlow: 'radial-gradient(140px circle at 92% 12%, rgba(56, 189, 248, 0.14), transparent 70%)',
    focus: 'focus:border-sky-400/40 focus:ring-sky-400/10',
  },
  {
    key: 'task',
    title: 'Task',
    eyebrow: 'Objective',
    icon: 'listChecks',
    iconSrc: '/icons/task.png',
    question: 'Tugas utama yang dikerjakan.',
    placeholder: 'Contoh: Susunlah rencana bisnis komprehensif selama 12 bulan ke depan...',
    eyebrowColor: 'text-orange-400',
    dotColor: 'bg-orange-400',
    iconStyle: 'bg-orange-500/15 text-orange-400 ring-orange-400/25',
    activeBorder: 'border-orange-500/30 shadow-[0_0_35px_-12px_rgba(251,146,60,0.28)]',
    cornerGlow: 'radial-gradient(140px circle at 92% 12%, rgba(251, 146, 60, 0.14), transparent 70%)',
    focus: 'focus:border-orange-400/40 focus:ring-orange-400/10',
  },
  {
    key: 'context',
    title: 'Context',
    eyebrow: 'Background',
    icon: 'globe',
    iconSrc: '/icons/context.png',
    question: 'Latar belakang & batasan.',
    placeholder:
      'Contoh: Target pasar adalah warga lokal Yogyakarta dan turis domestik dengan modal awal Rp50 juta...',
    eyebrowColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    iconStyle: 'bg-emerald-500/15 text-emerald-400 ring-emerald-400/25',
    activeBorder: 'border-emerald-500/30 shadow-[0_0_35px_-12px_rgba(52,211,153,0.28)]',
    cornerGlow: 'radial-gradient(140px circle at 92% 12%, rgba(52, 211, 153, 0.14), transparent 70%)',
    focus: 'focus:border-emerald-400/40 focus:ring-emerald-400/10',
  },
  {
    key: 'reasoning',
    title: 'Reasoning',
    eyebrow: 'Logic',
    icon: 'brain',
    iconSrc: '/icons/reasoning.png',
    question: 'Tujuan & alasan strategis.',
    placeholder:
      'Contoh: Berikan penjelasan mengapa strategi tersebut dipilih berdasarkan analisis SWOT sederhana...',
    eyebrowColor: 'text-rose-400',
    dotColor: 'bg-rose-400',
    iconStyle: 'bg-rose-500/15 text-rose-400 ring-rose-400/25',
    activeBorder: 'border-rose-500/30 shadow-[0_0_35px_-12px_rgba(251,113,133,0.28)]',
    cornerGlow: 'radial-gradient(140px circle at 92% 12%, rgba(251, 113, 133, 0.14), transparent 70%)',
    focus: 'focus:border-rose-400/40 focus:ring-rose-400/10',
  },
  {
    key: 'stop',
    title: 'Stop Conditions',
    eyebrow: 'Guardrails',
    icon: 'hand',
    iconSrc: '/icons/stop_conditions.png',
    question: 'Kriteria tugas selesai.',
    placeholder: 'Contoh: Berhenti jika sudah memberikan 5 strategi utama dan proyeksi finansial...',
    eyebrowColor: 'text-pink-400',
    dotColor: 'bg-pink-400',
    iconStyle: 'bg-pink-500/15 text-pink-400 ring-pink-400/25',
    activeBorder: 'border-pink-500/30 shadow-[0_0_35px_-12px_rgba(244,114,182,0.28)]',
    cornerGlow: 'radial-gradient(140px circle at 92% 12%, rgba(244, 114, 182, 0.14), transparent 70%)',
    focus: 'focus:border-pink-400/40 focus:ring-pink-400/10',
  },
  {
    key: 'output',
    title: 'Output',
    eyebrow: 'Delivery',
    icon: 'fileOutput',
    iconSrc: '/icons/output.png',
    question: 'Format penyajian hasil.',
    placeholder: 'Contoh: Sajikan dalam format Markdown dengan tabel untuk proyeksi keuangan...',
    eyebrowColor: 'text-violet-400',
    dotColor: 'bg-violet-400',
    iconStyle: 'bg-violet-500/15 text-violet-400 ring-violet-400/25',
    activeBorder: 'border-violet-500/30 shadow-[0_0_35px_-12px_rgba(167,139,250,0.28)]',
    cornerGlow: 'radial-gradient(140px circle at 92% 12%, rgba(167, 139, 250, 0.14), transparent 70%)',
    focus: 'focus:border-violet-400/40 focus:ring-violet-400/10',
  },
];

export const LAYER_KEYS: AnatomyLayerKey[] = ANATOMY_LAYERS.map((layer) => layer.key);

export const EMPTY_PROMPT_DATA: PromptData = {
  shortPrompt: '',
  role: '',
  task: '',
  context: '',
  reasoning: '',
  stop: '',
  output: '',
  variables: {},
};

export const STORAGE_KEY = 'promptArchitectData';
