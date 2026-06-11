interface AlertProps {
  message: string
  details?: string[]
}

export function Alert({ message, details }: AlertProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <p className="font-medium">{message}</p>
      {details && details.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
