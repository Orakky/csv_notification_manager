#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
    println!("[Rust] 开始发送邮件到: {}", to_email);
    println!("[Rust] SMTP服务器: {}:{}", smtp_server, smtp_port);
    println!("[Rust] 发件人: {}", from_email);
    println!("[Rust] 用户名: {}", username);
    
    // 验证SMTP服务器地址
    if smtp_server.is_empty() || smtp_server == "smtp.example.com" {
        println!("[Rust] 错误：SMTP服务器地址无效");
        return Err("SMTP服务器地址无效，请在设置中配置正确的邮箱信息".to_string());
    }
    
    // 验证密码
    if password.is_empty() {
        println!("[Rust] 错误：密码为空");
        return Err("邮箱密码不能为空，请在设置中配置邮箱密码".to_string());
    }
    
    println!("[Rust] 正在使用lettre发送邮件...");
    
    // 使用lettre发送真实邮件
    use lettre::{Message, SmtpTransport, Transport};
    use lettre::message::header::ContentType;
    use lettre::transport::smtp::authentication::Credentials;
    
    // 创建邮件
    let email = Message::builder()
        .from(from_email.parse().map_err(|e| format!("发件人地址无效: {}", e))?)
        .to(to_email.parse().map_err(|e| format!("收件人地址无效: {}", e))?)
        .subject(subject)
        .header(ContentType::TEXT_PLAIN)
        .body(body)
        .map_err(|e| format!("创建邮件失败: {}", e))?;
    
    // 创建SMTP凭证
    let creds = Credentials::new(username, password);
    
    // 创建SMTP传输
    let mailer = SmtpTransport::relay(&smtp_server)
        .map_err(|e| format!("SMTP服务器连接失败: {}", e))?
        .credentials(creds)
        .port(smtp_port)
        .build();
    
    // 发送邮件
    match mailer.send(&email) {
        Ok(_) => {
            println!("[Rust] 邮件发送成功！");
            Ok(format!("邮件成功发送到 {}，使用SMTP服务器 {}", to_email, smtp_server))
        }
        Err(e) => {
            println!("[Rust] 邮件发送失败: {}", e);
            Err(format!("邮件发送失败: {}", e))
        }
    }
}

#[tauri::command]
pub async fn parse_file(file_path: &str) -> Result<crate::models::file_data::FileData, String> {
    println!("[Rust] 开始解析文件: {}", file_path);
    
    if file_path.ends_with(".csv") {
        println!("[Rust] 检测到CSV文件格式");
        crate::parsers::csv_parser::parse_csv(file_path)
    } else if file_path.ends_with(".xlsx") || file_path.ends_with(".xls") {
        println!("[Rust] 检测到Excel文件格式");
        crate::parsers::excel_parser::parse_excel(file_path)
    } else {
        println!("[Rust] 不支持的文件格式");
        Err("Unsupported file format".to_string())
    }
}
