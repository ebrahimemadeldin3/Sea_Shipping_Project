/* eslint-disable react/only-export-components */
/**
 * Real report generation from local database state.
 * Supports CSV, JSON and a printable PDF (text-based, valid PDF structure).
 */

const PAD = 8

function toCSVValue(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function toCSV(rows) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.map(toCSVValue).join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((h) => toCSVValue(row[h])).join(','))
  })
  return lines.join('\n')
}

export function rowsFor(report, db) {
  const t = report
  const key = t?.id || t?.name
  const name = String(t?.name || '').toLowerCase()

  if (key === 'RP-02' || name.includes('financial')) {
    return (db.payments || []).map((p) => ({
      Payment: p.id,
      Customer: p.customer,
      Amount: p.amount,
      Date: p.date,
      Method: p.method,
      Status: p.status,
      Invoice: p.invoice,
    }))
  }
  if (key === 'RP-03' || name.includes('utilization')) {
    return (db.ships || []).map((s) => ({
      Vessel: s.id,
      Name: s.name,
      Type: s.type,
      Status: s.status,
      'Utilization %': s.utilization,
      'Fuel %': s.fuelLevel,
      Captain: s.captain,
    }))
  }
  if (key === 'RP-04' || name.includes('maintenance')) {
    return (db.maintenance || []).map((m) => ({
      Task: m.id,
      Vessel: m.ship,
      Type: m.type,
      Status: m.status,
      Due: m.due || m.date || '',
      Cost: m.cost ?? '—',
    }))
  }
  if (key === 'RP-05' || name.includes('customer') || name.includes('shipment history')) {
    return (db.shipments || []).map((s) => ({
      Shipment: s.id,
      Customer: s.customer,
      Origin: s.origin,
      Destination: s.destination,
      Cargo: s.cargo,
      Weight: s.weight,
      Cost: s.cost,
      Status: s.status,
      ETA: s.eta,
    }))
  }
  if (key === 'RP-06' || name.includes('fuel') || name.includes('emission')) {
    return (db.ships || []).map((s) => ({
      Vessel: s.id,
      Name: s.name,
      'Fuel Level %': s.fuelLevel,
      'Fuel Capacity': s.fuelCapacity,
      Status: s.status,
      Route: `${s.currentPort} → ${s.nextPort}`,
    }))
  }

  // Default: Operations Summary — full operational snapshot.
  return (db.shipments || []).map((s) => ({
    Shipment: s.id,
    Customer: s.customer,
    Ship: s.ship,
    Route: `${s.origin} → ${s.destination}`,
    Status: s.status,
    ETA: s.eta,
    Cost: s.cost,
    Priority: s.priority,
  }))
}

export function jsonPayload(report, db) {
  return {
    report: report?.name || 'Report',
    generated: new Date().toISOString(),
    summary: {
      ships: (db.ships || []).length,
      shipments: (db.shipments || []).length,
      ports: (db.ports || []).length,
      customers: (db.customers || []).length,
      employees: (db.employees || []).length,
      payments: (db.payments || []).length,
      openMaintenance: (db.maintenance || []).filter((m) => m.status !== 'Completed').length,
    },
    rows: rowsFor(report, db),
  }
}

/** Minimal valid single-file PDF writer (ASCII text table, Helvetica). */
export function buildPdf(report, db) {
  const rows = rowsFor(report, db)
  const title = report?.name || 'Report'
  const generated = new Date().toLocaleString()

  const lines = []
  lines.push(title.toUpperCase())
  lines.push(`Generated: ${generated}`)
  lines.push('')
  if (rows.length === 0) {
    lines.push('No data available for this report.')
  } else {
    const headers = Object.keys(rows[0])
    const widths = headers.map((h) => Math.max(h.length, ...rows.map((r) => String(r[h] ?? '').length)))
    const renderRow = (row) =>
      headers.map((h, i) => String(row?.[h] ?? '').padEnd(widths[i]).slice(0, widths[i])).join('  ').replace(/\s+$/, '')
    lines.push(renderRow(Object.fromEntries(headers.map((h) => [h, h]))))
    lines.push(headers.map((h, i) => '-'.repeat(widths[i])).join('  '))
    rows.forEach((r) => lines.push(renderRow(r)))
  }

  return pdfFromLines(lines)
}

function pdfFromLines(lines) {
  const content = lines.map((line) => `(${escapePdfString(line)}) Tj\nT*`).join('')
  const objects = []
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj')
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
  )
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj')

  const stream =
    'BT\n/F1 9 Tf\n50 742 Td\n16 TL\n' + content + 'ET'
  objects.push(`5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`)

  const header = `%PDF-1.4\n`
  let pdf = header
  const offsets = [0]
  objects.forEach((obj, i) => {
    offsets.push(header.length + objects.slice(0, i).reduce((sum, o) => sum + o.length + 1, 0))
    pdf += obj + '\n'
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((off) => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return pdf
}

function escapePdfString(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function buildExport(report, format, db) {
  const safeName = String(report?.name || 'report').replace(/\s+/g, '-').toLowerCase()
  const ext = format.toLowerCase()

  if (ext === 'csv') {
    const csv = toCSV(rowsFor(report, db))
    return { blob: new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), filename: `${safeName}.csv` }
  }
  if (ext === 'json') {
    const payload = JSON.stringify(jsonPayload(report, db), null, 2)
    return { blob: new Blob([payload], { type: 'application/json' }), filename: `${safeName}.json` }
  }
  const pdf = buildPdf(report, db)
  return { blob: new Blob([pdf], { type: 'application/pdf' }), filename: `${safeName}.pdf` }
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export { PAD }
