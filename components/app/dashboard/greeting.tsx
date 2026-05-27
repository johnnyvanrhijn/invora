'use client'

import { useEffect, useState } from 'react'
import { getGreeting } from '@/lib/utils'

export function Greeting({ firstName }: { firstName: string }) {
  // Bepaal de begroeting client-side zodat we niet rond middernacht een
  // mismatch tussen server en client krijgen.
  const [text, setText] = useState(() => getGreeting(firstName))

  useEffect(() => {
    setText(getGreeting(firstName))
  }, [firstName])

  return <h1 className="text-invora-text text-xl font-bold md:text-2xl">{text}</h1>
}
