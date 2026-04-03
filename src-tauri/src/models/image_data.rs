use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageData {
    pub id: String,
    pub name: String,
    pub data: String, // base64 encoded
    pub content_type: String,
    pub cell_ref: String, // 单元格引用，如 "A1", "B2" 等
}

impl ImageData {
    pub fn new(
        id: String,
        name: String,
        data: String,
        content_type: String,
        cell_ref: String,
    ) -> Self {
        Self {
            id,
            name,
            data,
            content_type,
            cell_ref,
        }
    }
    
    pub fn data_url(&self) -> String {
        format!("data:{};base64,{}", self.content_type, self.data)
    }
    
    pub fn has_cell_ref(&self) -> bool {
        !self.cell_ref.is_empty()
    }
}