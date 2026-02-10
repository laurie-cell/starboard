'use client'

import { Entry } from '@/lib/posts'
import { useState } from 'react'
import EntryModal from './EntryModal'

interface EntryCardProps {
  entry: Entry
  showPrivacyLabel?: boolean
  showDecodeButton?: boolean
  isOwnEntry?: boolean
  showDeleteButton?: boolean
  onDelete?: (entryId: string) => void
}

export default function EntryCard({ entry, showPrivacyLabel = false, showDecodeButton = false, isOwnEntry = false, showDeleteButton = false, onDelete }: EntryCardProps) {
  const [isDecoded, setIsDecoded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const content = displayContent()
  const lines = content.split('\n')

  // Always truncate to 3 lines for consistency (even if content is shorter)
  const truncatedContent = lines.slice(0, 3).join('\n')

  return (
    <>
      <div
        className="rounded-lg p-6 transition-all"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 1)',
          border: '1px solid rgba(124, 151, 191, 0.3)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.borderColor = 'rgba(124, 151, 191, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = 'rgba(124, 151, 191, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
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
            {showDecodeButton && isOwnEntry && entry.is_anonymized && entry.original_content && (
              <button
                onClick={() => setIsDecoded(!isDecoded)}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: isDecoded ? 'rgba(232, 244, 243, 0.6)' : 'rgba(240, 232, 232, 0.6)',
                  color: isDecoded ? '#5a8a7a' : '#8a5a5a',
                  border: '1px solid rgba(124, 151, 191, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {isDecoded ? 'Hide Original' : 'Decode'}
              </button>
            )}
            {showPrivacyLabel && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: entry.is_public ? 'rgba(232, 244, 243, 0.6)' : 'rgba(240, 232, 232, 0.6)',
                  color: entry.is_public ? '#5a8a7a' : '#8a5a5a',
                  border: '1px solid rgba(124, 151, 191, 0.2)'
                }}
              >
                {entry.is_public ? 'Public' : 'Private'}
              </span>
            )}
            {showDeleteButton && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
                    onDelete(entry.id)
                  }
                }}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 229, 229, 0.7)',
                  color: '#cc6666',
                  border: '1px solid rgba(255, 204, 204, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 204, 204, 0.8)'
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 229, 229, 0.7)'
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <div className="relative" style={{ minHeight: '5.1em', paddingRight: '90px' }}>
          <div
            className="leading-relaxed"
            style={{
              color: '#5a5a5a',
              lineHeight: '1.7',
              maxHeight: '5.1em', // 3 lines * 1.7 line-height
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              paddingBottom: '0.5em',
              paddingRight: '8px'
            }}
          >
            {truncatedContent}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm transition-colors"
            style={{
              color: '#7c97bf',
              textDecoration: 'underline',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              padding: '2px 4px',
              borderRadius: '4px',
              position: 'absolute',
              bottom: '0',
              right: '0',
              border: 'none',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7'
              e.currentTarget.style.backgroundColor = 'rgba(124, 151, 191, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
            }}
          >
            Read More
          </button>
        </div>
      </div>
      <EntryModal
        entry={entry}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDecoded={isDecoded}
        onToggleDecode={() => setIsDecoded(!isDecoded)}
        showDecodeButton={showDecodeButton}
        isOwnEntry={isOwnEntry}
      />
    </>
  )
}
