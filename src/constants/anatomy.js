// Definisi 6 lapisan anatomi prompt Claude: Role, Task, Context, Reasoning, Stop conditions, Output.
// Class Tailwind ditulis utuh (bukan string dinamis) agar tetap terdeteksi oleh scanner Tailwind.
export const ANATOMY_LAYERS = [
  {
    key: 'role',
    title: 'Role',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500',
    placeholder: 'Siapa AI ini? Apa keahliannya?',
  },
  {
    key: 'task',
    title: 'Task',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-400',
    placeholder: 'Apa tugas utamanya?',
  },
  {
    key: 'context',
    title: 'Context',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-500',
    placeholder: 'Apa latar belakang, sumber daya, atau targetnya?',
  },
  {
    key: 'reasoning',
    title: 'Reasoning',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    placeholder: 'Apa alasan strategis di balik tugas ini?',
  },
  {
    key: 'stop',
    title: 'Stop conditions',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-500',
    placeholder: 'Kapan tugas ini dianggap selesai/sukses?',
  },
  {
    key: 'output',
    title: 'Output',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-500',
    placeholder: 'Bagaimana format penyajian akhirnya?',
  },
];

export const LAYER_KEYS = ANATOMY_LAYERS.map((layer) => layer.key);

export const EMPTY_PROMPT_DATA = {
  shortPrompt: '',
  ...Object.fromEntries(LAYER_KEYS.map((key) => [key, ''])),
};

export const STORAGE_KEY = 'promptArchitectData';

