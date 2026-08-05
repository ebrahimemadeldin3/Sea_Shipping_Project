import { useRef, useState } from 'react'
import Icon from '../Icon'

export function FileUpload({ accept, multiple = false, maxSizeMB, label = 'Drop files here or browse', onFiles, className = '' }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])

  const handleFiles = (list) => {
    const accepted = Array.from(list).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }))
    setFiles(accepted)
    onFiles?.(accepted, list)
  }

  return (
    <div
      className={`file-upload ${dragActive ? 'is-drag' : ''} ${className}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragActive(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        id="file-upload-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <label htmlFor="file-upload-input" className="file-upload-label">
        <span className="file-upload-icon" aria-hidden="true">
          <Icon name="upload" size={22} />
        </span>
        <strong>{label}</strong>
        <span className="file-upload-hint">
          {maxSizeMB ? `Max ${maxSizeMB} MB per file · ` : ''}
          PDF, DOCX, XLSX or images
        </span>
      </label>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => (
            <li key={i} className="file-item">
              <Icon name="file-text" size={17} aria-hidden="true" />
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatBytes(file.size)}</span>
              <button
                type="button"
                className="file-remove"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((current) => current.filter((_, idx) => idx !== i))}
              >
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ImageViewer({ src, alt, caption }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="image-viewer" onClick={() => setOpen(true)} aria-label={`View image: ${alt || caption || ''}`}>
        <img src={src} alt={alt || ''} loading="lazy" />
        {caption && <span className="image-viewer-caption">{caption}</span>}
        <span className="image-viewer-zoom" aria-hidden="true">
          <Icon name="search" size={16} />
        </span>
      </button>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={alt || 'Image viewer'}>
          <button type="button" className="lightbox-close" aria-label="Close image viewer">
            <Icon name="close" size={22} />
          </button>
          <img src={src} alt={alt || ''} />
          {caption && <p>{caption}</p>}
        </div>
      )}
    </>
  )
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
