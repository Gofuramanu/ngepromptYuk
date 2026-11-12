// Didefinisikan di luar App agar tidak di-remount setiap render (mencegah textarea kehilangan fokus).
export default function AnatomyBlock({ layer, value, onChange }) {
  const { key, title, borderColor, textColor, placeholder } = layer;
  const inputId = `anatomy-${key}`;

  return (
    <div
      className={`border-l-4 ${borderColor} bg-panel p-4 rounded-r-md flex flex-row gap-4 items-start shadow-sm transition hover:bg-panel-hover`}
    >
      <textarea
        id={inputId}
        className="w-full bg-transparent text-gray-200 outline-none resize-y min-h-[70px] text-lg leading-relaxed"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder}
      />
      <label htmlFor={inputId} className={`text-xl font-bold min-w-[120px] text-right ${textColor}`}>
        {title}
      </label>
    </div>
  );
}

