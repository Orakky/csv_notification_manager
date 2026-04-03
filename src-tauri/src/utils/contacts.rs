use regex::Regex;
use crate::models::contact_column::ContactColumn;

pub fn identify_contact_columns(headers: &[String], rows: &[Vec<String>]) -> Vec<ContactColumn> {
    let mut contact_columns = Vec::new();
    
    for (col_idx, header) in headers.iter().enumerate() {
        let mut email_count = 0;
        let mut phone_count = 0;
        let mut qq_count = 0;
        
        for row in rows {
            if col_idx < row.len() {
                let value = &row[col_idx];
                if is_email(value) {
                    email_count += 1;
                } else if is_phone(value) {
                    phone_count += 1;
                } else if is_qq(value) {
                    qq_count += 1;
                }
            }
        }
        
        let max_count = email_count.max(phone_count).max(qq_count);
        if max_count > 0 {
            let contact_type = if max_count == email_count {
                "email"
            } else if max_count == phone_count {
                "phone"
            } else {
                "qq"
            };
            
            contact_columns.push(ContactColumn::new(
                col_idx,
                header.clone(),
                contact_type.to_string(),
            ));
        }
    }
    
    contact_columns
}

pub fn is_email(s: &str) -> bool {
    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    email_regex.is_match(s)
}

pub fn is_phone(s: &str) -> bool {
    let phone_regex = Regex::new(r"^1[3-9]\d{9}$").unwrap();
    phone_regex.is_match(s)
}

pub fn is_qq(s: &str) -> bool {
    let qq_regex = Regex::new(r"^[1-9]\d{4,10}$").unwrap();
    qq_regex.is_match(s)
}