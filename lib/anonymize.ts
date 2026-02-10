import { AnonymizationMapping } from './anonymization-mappings'

// Permissive matching: case-insensitive and handles variations
function normalizeString(str: string): string {
  return str.toLowerCase().trim()
}

function createWordBoundaryRegex(pattern: string): RegExp {
  // Escape special regex characters
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match word boundaries, case-insensitive
  return new RegExp(`\\b${escaped}\\b`, 'gi')
}

export function anonymizeText(text: string, mappings: AnonymizationMapping[]): string {
  if (!mappings || mappings.length === 0) return text

  let result = text
  const normalizedMappings = mappings.map(m => ({
    ...m,
    normalizedOriginal: normalizeString(m.original),
  }))

  // Sort by length (longest first) to handle overlapping matches correctly
  normalizedMappings.sort((a, b) => b.original.length - a.original.length)

  for (const mapping of normalizedMappings) {
    const regex = createWordBoundaryRegex(mapping.original)
    result = result.replace(regex, mapping.pseudonym)
  }

  return result
}

export function deanonymizeText(text: string, mappings: AnonymizationMapping[]): string {
  if (!mappings || mappings.length === 0) return text

  let result = text
  const normalizedMappings = mappings.map(m => ({
    ...m,
    normalizedPseudonym: normalizeString(m.pseudonym),
  }))

  // Sort by length (longest first)
  normalizedMappings.sort((a, b) => b.pseudonym.length - a.pseudonym.length)

  for (const mapping of normalizedMappings) {
    const regex = createWordBoundaryRegex(mapping.pseudonym)
    result = result.replace(regex, mapping.original)
  }

  return result
}
