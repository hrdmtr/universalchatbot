interface InputProps {
  type?: 'text' | 'email' | 'password'
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  maxLength?: number
  className?: string
}

export default function Input({
  type = 'text',
  id,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  className = ""
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      required={required}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white ${className}`}
    />
  )
}