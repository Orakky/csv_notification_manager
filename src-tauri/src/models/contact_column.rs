use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContactColumn {
    pub index: usize,
    pub name: String,
    pub contact_type: String,
}

impl ContactColumn {
    pub fn new(index: usize, name: String, contact_type: String) -> Self {
        Self {
            index,
            name,
            contact_type,
        }
    }
    
    pub fn is_email(&self) -> bool {
        self.contact_type == "email"
    }
    
    pub fn is_phone(&self) -> bool {
        self.contact_type == "phone"
    }
    
    pub fn is_qq(&self) -> bool {
        self.contact_type == "qq"
    }
}