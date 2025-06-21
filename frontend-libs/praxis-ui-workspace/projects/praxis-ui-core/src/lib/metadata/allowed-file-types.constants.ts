export const AllowedFileTypes = {
  ALL: '*/*',
  IMAGES: 'image/*',
  JSON: 'application/json',
  XML: 'application/xml,text/xml',
  HTML: 'text/html',
  CSV: 'text/csv,application/csv,application/vnd.ms-excel',
  PDF: 'application/pdf',
  WORD: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  EXCEL: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  TEXT: 'text/plain',
  PPT: 'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ZIP: 'application/zip,application/x-zip-compressed',
  AUDIO: 'audio/*',
  VIDEO: 'video/*',
  CUSTOM: '',
} as const;

export type AllowedFileTypes = typeof AllowedFileTypes[keyof typeof AllowedFileTypes];
