# CSV/Excel 通知管理器 - 项目设计指南

## 项目概述

**项目名称**: CSV/Excel Notification Manager  
**技术栈**: Tauri + Vue 3 + Rust  
**设计风格**: 苹果风格 Material Design

## 一、项目需求

### 1.1 核心功能需求
- **Excel/CSV文件解析**：支持解析.xlsx、.xls、.csv格式文件
- **联系方式识别**：自动识别邮箱、手机号、QQ等联系方式
- **消息模板管理**：创建和管理可复用的消息模板
- **批量消息生成**：根据模板和数据批量生成个性化消息
- **邮件发送功能**：通过SMTP协议发送真实邮件
- **发送历史记录**：保存发送记录，支持重发失败消息

### 1.2 用户体验需求
- **界面风格**：苹果风格的Material Design设计语言
- **响应式布局**：支持不同屏幕尺寸的自适应
- **实时反馈**：发送进度、状态提示、错误处理
- **数据持久化**：本地存储历史记录和配置信息

## 二、设计思路

### 2.1 整体架构
```
前端 Vue 3 (Composition API)
    ↓ invoke 调用
后端 Rust (Tauri Commands)
    ↓ 使用
SMTP邮件发送 (lettre库)
```

### 2.2 模块化设计
```
src/
├── components/          # UI组件
│   ├── Sidebar.vue      # 侧边栏导航
│   ├── TopNav.vue       # 顶部导航
│   ├── DashboardView.vue # 仪表板
│   ├── ImportView.vue   # 数据导入视图
│   ├── HistoryView.vue  # 历史记录视图
│   ├── TemplatesView.vue # 模板管理视图
│   ├── SettingsView.vue # 设置视图
│   └── SendProgressModal.vue # 发送进度弹窗
├── composables/         # 组合式函数
│   ├── useFileHistory.js # 文件历史管理
│   ├── useFileParser.js  # 文件解析
│   ├── useMessageGenerator.js # 消息生成
│   ├── useMessageSender.js # 消息发送
│   └── useMessageTemplates.js # 消息模板
├── utils/               # 工具函数
│   ├── formatters.js    # 格式化函数
│   └── index.js         # 通用工具
└── types/               # 类型定义
    └── index.js
```

### 2.3 后端模块化
```
src-tauri/src/
├── models/              # 数据模型
│   ├── file_data.rs     # 文件数据结构
│   ├── contact_column.rs # 联系方式列
│   └── image_data.rs    # 图片数据
├── parsers/             # 文件解析器
│   ├── csv_parser.rs    # CSV解析
│   └── excel_parser.rs  # Excel解析
├── utils/               # 工具函数
│   └── contacts.rs      # 联系方式识别
└── commands/            # Tauri命令
    └── file_commands.rs # 文件相关命令
```

## 三、关键技术实现

### 3.1 文件解析
- **前端**：使用Tauri的open对话框选择文件
- **后端**：使用calamine库解析Excel，csv库解析CSV
- **联系方式识别**：使用正则表达式识别邮箱、手机号、QQ

### 3.2 邮件发送
- **库选择**：lettre库实现SMTP邮件发送
- **配置管理**：从localStorage读取邮箱配置
- **进度跟踪**：实时更新发送进度和结果
- **历史记录**：保存发送记录到localStorage

### 3.3 消息模板
- **模板存储**：使用localStorage持久化存储
- **占位符替换**：使用{{列名}}格式的占位符
- **快速选择**：提供预设模板快速选择

## 四、关键代码片段

### 4.1 邮件发送Rust命令
```rust
#[tauri::command]
pub async fn send_email_message(
    smtp_server: String,
    smtp_port: u16,
    username: String,
    password: String,
    from_email: String,
    to_email: String,
    subject: String,
    body: String
) -> Result<String, String> {
    use lettre::{Message, SmtpTransport, Transport};
    use lettre::message::header::ContentType;
    use lettre::transport::smtp::authentication::Credentials;
    
    let email = Message::builder()
        .from(from_email.parse().map_err(|e| format!("发件人地址无效: {}", e))?)
        .to(to_email.parse().map_err(|e| format!("收件人地址无效: {}", e))?)
        .subject(subject)
        .header(ContentType::TEXT_PLAIN)
        .body(body)
        .map_err(|e| format!("创建邮件失败: {}", e))?;
    
    let creds = Credentials::new(username, password);
    let mailer = SmtpTransport::relay(&smtp_server)
        .map_err(|e| format!("SMTP服务器连接失败: {}", e))?
        .credentials(creds)
        .port(smtp_port)
        .build();
    
    match mailer.send(&email) {
        Ok(_) => Ok(format!("邮件成功发送到 {}", to_email)),
        Err(e) => Err(format!("邮件发送失败: {}", e))
    }
}
```

### 4.2 消息发送前端逻辑
```javascript
async function sendMessages(messages) {
  // 从设置中读取邮箱配置
  const savedConfig = localStorage.getItem('emailConfig');
  const emailConfig = JSON.parse(savedConfig);
  
  // 调用Rust后端发送邮件
  const result = await invoke('send_email_message', {
    smtpServer: emailConfig.smtpServer,
    smtpPort: emailConfig.smtpPort,
    username: emailConfig.account,
    password: emailConfig.password,
    fromEmail: emailConfig.senderEmail,
    toEmail: message.contact,
    subject: 'CSV通知管理器 - 消息通知',
    body: message.message
  });
}
```

## 五、使用说明

### 5.1 邮箱配置
在"设置"页面配置邮箱信息：
- **163邮箱**：smtp.163.com:465，使用授权码
- **Gmail**：smtp.gmail.com:587，使用应用专用密码
- **QQ邮箱**：smtp.qq.com:465，使用授权码

### 5.2 使用流程
1. 导入Excel/CSV文件
2. 选择联系方式列
3. 选择消息模板或手动输入
4. 生成消息
5. 发送邮件（显示进度弹窗）
6. 查看发送历史

## 六、扩展建议

### 6.1 功能扩展
- 添加更多消息模板
- 支持附件发送
- 实现消息调度发送
- 添加发送统计分析

### 6.2 技术优化
- 使用真实SMTP库替代模拟发送
- 添加消息队列处理
- 实现配置导入/导出
- 优化大文件处理性能

此文档可作为后续开发和维护的参考指南。