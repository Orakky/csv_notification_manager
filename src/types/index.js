// 文件数据类型
export const FileDataTypes = {
  headers: Array,
  rows: Array,
  contact_columns: Array,
  cell_images: Array
}

// 联系方式列类型
export const ContactColumnTypes = {
  index: Number,
  name: String,
  contact_type: String // 'email', 'phone', 'qq'
}

// 历史记录项类型
export const HistoryItemTypes = {
  id: Number,
  fileName: String,
  filePath: String,
  headers: Array,
  rowCount: Number,
  contactColumns: Array,
  timestamp: String,
  data: Object
}

// 生成的消息类型
export const GeneratedMessageTypes = {
  index: Number,
  contact: String,
  contactType: String,
  message: String
}

// 消息模板类型
export const TemplateTypes = {
  id: Number,
  name: String,
  content: String,
  isActive: Boolean,
  usedCount: Number,
  lastUsed: String
}

// 视图类型
export const ViewTypes = {
  DASHBOARD: 'dashboard',
  IMPORT: 'import',
  HISTORY: 'history',
  TEMPLATES: 'templates',
  SETTINGS: 'settings'
}

// 联系方式类型枚举
export const ContactTypes = {
  EMAIL: 'email',
  PHONE: 'phone',
  QQ: 'qq'
}

// 状态徽章类型
export const StatusBadgeTypes = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}