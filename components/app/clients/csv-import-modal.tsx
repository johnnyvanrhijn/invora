'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Loader2, Upload, CheckCircle2, AlertCircle, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface CsvImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleted: () => void
}

interface PreviewRow {
  index: number
  data: Record<string, string>
  valid: boolean
  errors: string[]
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

const REQUIRED_HEADERS = ['naam', 'email']
const OPTIONAL_HEADERS = ['telefoon', 'straat', 'postcode', 'stad', 'type']

const TEMPLATE_CSV = `naam,email,telefoon,straat,postcode,stad,type
Anna de Vries,anna@example.com,0612345678,Kerkstraat 1,1234AB,Amsterdam,particulier
Praktijk de Linde,info@delinde.nl,0201234567,Lindelaan 22,5611BB,Eindhoven,zakelijk
`

export function CsvImportModal({
  open,
  onOpenChange,
  onCompleted,
}: CsvImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [validCount, setValidCount] = useState(0)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  function reset() {
    setFile(null)
    setPreviewRows([])
    setValidCount(0)
    setResult(null)
  }

  function handleClose(open: boolean) {
    if (!isImporting) {
      onOpenChange(open)
      if (!open) reset()
    }
  }

  async function handleFile(f: File | null) {
    if (!f) return
    if (f.size > 2 * 1024 * 1024) {
      toast.error('Bestand te groot (max 2MB)')
      return
    }
    setFile(f)
    setIsParsing(true)
    const text = await f.text()
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const headers = results.meta.fields ?? []
        const missingRequired = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
        if (missingRequired.length > 0) {
          toast.error(
            `CSV mist verplichte kolommen: ${missingRequired.join(', ')}`
          )
          setIsParsing(false)
          setPreviewRows([])
          setValidCount(0)
          return
        }
        const rows: PreviewRow[] = results.data.map((row, idx) => {
          const errors: string[] = []
          const naam = (row.naam ?? '').trim()
          const email = (row.email ?? '').trim()
          if (!naam) errors.push('Naam is verplicht')
          if (!email) errors.push('E-mail is verplicht')
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errors.push('Ongeldig e-mailadres')
          const type = (row.type ?? 'particulier').trim().toLowerCase()
          if (type && type !== 'particulier' && type !== 'zakelijk') {
            errors.push("type moet 'particulier' of 'zakelijk' zijn")
          }
          return {
            index: idx,
            data: row,
            valid: errors.length === 0,
            errors,
          }
        })
        setPreviewRows(rows)
        setValidCount(rows.filter((r) => r.valid).length)
        setIsParsing(false)
      },
      error: () => {
        toast.error('CSV kon niet worden gelezen')
        setIsParsing(false)
      },
    })
  }

  async function handleImport() {
    if (!file) return
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/clients/import', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Import mislukt')
      const data = (await res.json()) as ImportResult
      setResult(data)
      if (data.imported > 0) {
        toast.success(`${data.imported} cliënten geïmporteerd`)
      }
      if (data.imported === 0 && data.skipped > 0) {
        toast.error('Geen cliënten geïmporteerd')
      }
    } catch (err) {
      console.error(err)
      toast.error('Import mislukt')
    } finally {
      setIsImporting(false)
    }
  }

  function downloadTemplate() {
    const blob = new Blob(['﻿' + TEMPLATE_CSV], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invora-clienten-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const previewHeaders = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cliënten importeren via CSV</DialogTitle>
          <DialogDescription>
            Upload een CSV-bestand met je cliëntenlijst. Verplicht: naam,
            email. Optioneel: telefoon, straat, postcode, stad, type.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {!file && (
              <>
                <div
                  className={
                    'border-invora-primary/30 hover:bg-invora-primary-light/40 rounded-card cursor-pointer border-2 border-dashed bg-transparent p-8 text-center transition-colors'
                  }
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fileRef.current?.click()
                  }}
                >
                  <Upload className="text-invora-primary mx-auto mb-2 size-8" />
                  <p className="text-foreground text-sm font-medium">
                    Klik om een CSV te kiezen
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Max 2 MB · UTF-8
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <FileDown />
                  Download CSV template
                </Button>
              </>
            )}

            {isParsing && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Bestand wordt gelezen...
              </div>
            )}

            {file && !isParsing && previewRows.length > 0 && (
              <>
                <div className="bg-invora-background rounded-card border p-3 text-sm">
                  <strong>{previewRows.length}</strong> rijen gevonden,{' '}
                  <strong className="text-invora-primary-dark">
                    {validCount}
                  </strong>{' '}
                  geldig
                </div>

                <div className="rounded-card max-h-64 overflow-auto border">
                  <table className="w-full text-xs">
                    <thead className="bg-invora-background sticky top-0">
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        {previewHeaders.map((h) => (
                          <th key={h} className="px-2 py-1 text-left">
                            {h}
                          </th>
                        ))}
                        <th className="px-2 py-1 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 10).map((row) => (
                        <tr
                          key={row.index}
                          className={!row.valid ? 'bg-red-50' : 'border-t'}
                        >
                          <td className="text-muted-foreground px-2 py-1">
                            {row.index + 2}
                          </td>
                          {previewHeaders.map((h) => (
                            <td key={h} className="px-2 py-1">
                              {row.data[h] ?? ''}
                            </td>
                          ))}
                          <td className="px-2 py-1">
                            {row.valid ? (
                              <span className="text-invora-primary-dark inline-flex items-center gap-1">
                                <CheckCircle2 className="size-3" /> OK
                              </span>
                            ) : (
                              <span
                                className="text-destructive inline-flex items-center gap-1"
                                title={row.errors.join(', ')}
                              >
                                <AlertCircle className="size-3" />{' '}
                                {row.errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.length > 10 && (
                    <div className="text-muted-foreground p-2 text-center text-xs">
                      + {previewRows.length - 10} meer rijen…
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={reset}
                    disabled={isImporting}
                  >
                    Annuleren
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={validCount === 0 || isImporting}
                  >
                    {isImporting && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Importeer {validCount} cliënten
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-invora-primary-light rounded-card border p-3 text-sm">
              <p>
                <strong>{result.imported}</strong> cliënten succesvol
                geïmporteerd
              </p>
              {result.skipped > 0 && (
                <p className="text-muted-foreground mt-1">
                  {result.skipped} rijen overgeslagen
                </p>
              )}
            </div>
            {result.errors.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">
                  Details ({result.errors.length} meldingen)
                </summary>
                <ul className="text-muted-foreground mt-2 space-y-0.5">
                  {result.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>· {e}</li>
                  ))}
                </ul>
              </details>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  onCompleted()
                  reset()
                }}
              >
                Sluiten
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
