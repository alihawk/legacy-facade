/**
 * ThemeSelector Component
 * 
 * Theme mode and accent color selection interface.
 * Allows users to choose light/dark/auto mode and accent colors.
 */

interface ThemeSelectorProps {
  mode: 'light' | 'dark' | 'auto';
  accentColor: 'blue' | 'green' | 'purple' | 'orange';
  onModeChange: (mode: 'light' | 'dark' | 'auto') => void;
  onColorChange: (color: 'blue' | 'green' | 'purple' | 'orange') => void;
}

const COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-cyan-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
] as const;

export function ThemeSelector({
  mode,
  accentColor,
  onModeChange,
  onColorChange
}: ThemeSelectorProps) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <span>🎨</span>
        Theme
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Choose the theme for your generated portal (this won't affect the current page).
      </p>

      {/* Mode Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Mode</label>
        <div className="flex gap-2">
          {(['light', 'auto', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`
                flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {m === 'light' && '☀️ '}
              {m === 'auto' && '🌗 '}
              {m === 'dark' && '🌙 '}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Accent Color</label>
        <div className="flex gap-3">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`
                w-10 h-10 rounded-full ${color.class} transition-transform
                ${accentColor === color.value
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  : 'hover:scale-105'
                }
              `}
              title={color.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
