interface ComingSoonProps {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-4xl" aria-hidden>
        🚧
      </div>
      <h1 className="text-invora-text text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-invora-text-muted mt-2 max-w-sm">{description}</p>
      )}
    </div>
  )
}
