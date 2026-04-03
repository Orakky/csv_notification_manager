use serde::{Deserialize, Serialize};
use super::contact_column::ContactColumn;
use super::image_data::ImageData;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileData {
    pub headers: Vec<String>,
    pub rows: Vec<Vec<String>>,
    pub contact_columns: Vec<ContactColumn>,
    pub images: Vec<ImageData>,
    pub cell_images: Vec<Vec<Option<String>>>, // 每个单元格对应的图片base64数据
}

impl FileData {
    pub fn new(
        headers: Vec<String>,
        rows: Vec<Vec<String>>,
        contact_columns: Vec<ContactColumn>,
        images: Vec<ImageData>,
    ) -> Self {
        // Create cell_images matrix based on images with cell_ref
        let mut cell_images = Vec::new();
        for row_idx in 0..rows.len() {
            let mut row_images = Vec::new();
            for col_idx in 0..headers.len() {
                // Find if there's an image for this cell
                let cell_ref = format!("{}{}", 
                    match col_idx {
                        0 => "A", 1 => "B", 2 => "C", 3 => "D", 4 => "E",
                        5 => "F", 6 => "G", 7 => "H", 8 => "I", 9 => "J",
                        _ => "K",
                    }, 
                    row_idx + 1
                );
                
                let image_data = images.iter()
                    .find(|img| img.cell_ref == cell_ref)
                    .map(|img| format!("data:{};base64,{}", img.content_type, img.data));
                
                row_images.push(image_data);
            }
            cell_images.push(row_images);
        }
        
        Self {
            headers,
            rows,
            contact_columns,
            images,
            cell_images,
        }
    }
    
    pub fn empty() -> Self {
        Self {
            headers: Vec::new(),
            rows: Vec::new(),
            contact_columns: Vec::new(),
            images: Vec::new(),
            cell_images: Vec::new(),
        }
    }
    
    pub fn row_count(&self) -> usize {
        self.rows.len()
    }
    
    pub fn column_count(&self) -> usize {
        self.headers.len()
    }
}