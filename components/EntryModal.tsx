'use client'

import { Entry } from '@/lib/posts'
import { useEffect } from 'react'

interface EntryModalProps {
  entry: Entry
  isOpen: boolean
  onClose: () => void
  isDecoded?: boolean
  onToggleDecode?: () => void
  showDecodeButton?: boolean
  isOwnEntry?: boolean
}

export default function EntryModal({
  entry,
  isOpen,
  onClose,
  isDecoded = false,
  onToggleDecode,
  showDecodeButton = false,
  isOwnEntry = false
}: EntryModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const date = new Date(entry.created_at)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const displayContent = () => {
    if (showDecodeButton && isOwnEntry && entry.is_anonymized && entry.original_content) {
      return isDecoded ? entry.original_content : entry.content
    }
    return entry.content
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(124, 151, 191, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {entry.username && (
                <a
                  href={`/profile/${entry.username}`}
                  className="text-sm font-medium hover:underline transition-opacity"
                  style={{ color: '#7c97bf' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  @{entry.username}
                </a>
              )}
              <span className="text-sm" style={{ color: '#5a5a5a', opacity: 0.7 }}>• {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              {showDecodeButton && isOwnEntry && entry.is_anonymized && entry.original_content && onToggleDecode && (
                <button
                  onClick={onToggleDecode}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: isDecoded ? 'rgba(232, 244, 243, 0.6)' : 'rgba(240, 232, 232, 0.6)',
                    color: isDecoded ? '#5a8a7a' : '#8a5a5a',
                    border: '1px solid rgba(124, 151, 191, 0.2)'
                  }}
                >
                  {isDecoded ? 'Hide Original' : 'Decode'}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-sm px-3 py-1 rounded transition-colors"
                style={{
                  backgroundColor: 'rgba(124, 151, 191, 0.2)',
                  color: '#5a5a5a',
                  border: '1px solid rgba(124, 151, 191, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(124, 151, 191, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(124, 151, 191, 0.2)'
                }}
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto leading-relaxed whitespace-pre-wrap"
            style={{
              color: '#5a5a5a',
              lineHeight: '1.7',
              paddingRight: '8px'
            }}
          >
            {displayContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
