
const MOJIBAKE_PATTERN = /(Ã|Â|Ä|Æ|áº|á»)/

export function normalizeUploadedFileName(fileName: string) {
  const safeName = fileName?.trim() || 'file'

  if (!MOJIBAKE_PATTERN.test(safeName)) {
    return safeName
  }

  try {
    const decodedName = Buffer.from(safeName, 'latin1').toString('utf8')

    if (decodedName.includes('�')) {
      return safeName
    }

    return decodedName
  } catch {
    return safeName
  }
}