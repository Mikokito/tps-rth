import type { ReactNode } from "react";

interface Props {
  id: string;
  label: string;
  type?: string;
  icon: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  rightElement?: ReactNode;
  autoComplete?: string;
  disabled?: boolean;
}

export default function FormInput({
  id,
  label,
  type = "text",
  icon,
  placeholder,
  value,
  onChange,
  error,
  required,
  rightElement,
  autoComplete,
  disabled,
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full pl-10 ${rightElement ? "pr-10" : "pr-4"} py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? "border-red-300 bg-red-50 focus:ring-red-400"
              : "border-gray-200 bg-white focus:ring-[#2F855A]"
          }`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
    </div>
  );
}