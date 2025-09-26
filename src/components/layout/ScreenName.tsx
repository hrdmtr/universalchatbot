interface ScreenNameProps {
  name: string
}

export default function ScreenName({ name }: ScreenNameProps) {
  return (
    <div className="absolute top-4 left-4 text-xs text-gray-400 font-mono">
      [{name}]
    </div>
  )
}