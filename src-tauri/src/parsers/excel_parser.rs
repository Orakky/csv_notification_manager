use std::fs::File;
use std::io::Read;
use calamine::{open_workbook_auto, Reader, DataType};
use zip::ZipArchive;
use base64::{Engine as _, engine::general_purpose};
use crate::models::file_data::FileData;
use crate::models::image_data::ImageData;
use crate::utils::contacts::identify_contact_columns;

pub fn parse_excel(file_path: &str) -> Result<FileData, String> {
    println!("[Excel Parser] 开始解析Excel文件: {}", file_path);
    
    let mut workbook = open_workbook_auto(file_path)
        .map_err(|e| {
            println!("[Excel Parser] 打开工作簿失败: {}", e);
            format!("Failed to open Excel file: {}", e)
        })?;
    
    let sheets = workbook.sheet_names();
    println!("[Excel Parser] 发现 {} 个工作表", sheets.len());
    
    if sheets.is_empty() {
        println!("[Excel Parser] 没有找到工作表");
        return Err("No sheets found in Excel file".to_string());
    }
    
    let sheet_name = sheets[0].to_string();
    println!("[Excel Parser] 使用第一个工作表: {}", sheet_name);
    
    let range = match workbook.worksheet_range(&sheet_name) {
        Some(Ok(range)) => range,
        Some(Err(e)) => return Err(format!("Failed to read sheet: {}", e)),
        None => return Err(format!("Sheet '{}' not found", sheet_name)),
    };
    
    let mut headers = Vec::new();
    let mut rows = Vec::new();
    
    for (row_idx, row) in range.rows().enumerate() {
        let mut row_data = Vec::new();
        for cell in row {
            let value = match cell {
                DataType::String(s) => s.clone(),
                DataType::Float(f) => f.to_string(),
                DataType::Int(i) => i.to_string(),
                DataType::Bool(b) => b.to_string(),
                DataType::Empty => String::new(),
                DataType::Error(e) => format!("Error: {:?}", e),
                _ => String::new(),
            };
            row_data.push(value);
        }
        
        if row_idx == 0 {
            headers = row_data;
        } else {
            rows.push(row_data);
        }
    }
    
    if headers.is_empty() {
        return Err("Excel file is empty or has no headers".to_string());
    }
    
    let contact_columns = identify_contact_columns(&headers, &rows);
    let images = extract_images_from_excel(file_path)?;
    
    Ok(FileData::new(
        headers,
        rows,
        contact_columns,
        images,
    ))
}

pub fn extract_images_from_excel(file_path: &str) -> Result<Vec<ImageData>, String> {
    let file = File::open(file_path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("Failed to read ZIP archive: {}", e))?;
    
    let mut images = Vec::new();
    let mut image_files = Vec::new();
    
    // First pass: collect all image files
    for i in 0..archive.len() {
        let mut zip_file = archive.by_index(i).map_err(|e| format!("Failed to read ZIP entry: {}", e))?;
        let name = zip_file.name().to_string();
        
        // Check if this is an image file in the xl/media/ directory
        if name.starts_with("xl/media/") && (name.ends_with(".png") || name.ends_with(".jpg") || name.ends_with(".jpeg") || name.ends_with(".gif") || name.ends_with(".bmp")) {
            let mut buffer = Vec::new();
            zip_file.read_to_end(&mut buffer).map_err(|e| format!("Failed to read image data: {}", e))?;
            
            // Determine content type
            let content_type = if name.ends_with(".png") {
                "image/png".to_string()
            } else if name.ends_with(".jpg") || name.ends_with(".jpeg") {
                "image/jpeg".to_string()
            } else if name.ends_with(".gif") {
                "image/gif".to_string()
            } else if name.ends_with(".bmp") {
                "image/bmp".to_string()
            } else {
                "application/octet-stream".to_string()
            };
            
            // Generate unique ID
            let id = format!("img_{}", images.len());
            
            // Extract filename from path
            let image_name = name.split('/').last().unwrap_or("unknown").to_string();
            
            // Encode as base64
            let base64_data = general_purpose::STANDARD.encode(&buffer);
            
            images.push(ImageData::new(
                id,
                image_name,
                base64_data,
                content_type,
                String::new(), // Will be filled in second pass
            ));
            
            image_files.push(name.clone());
        }
    }
    
    // Second pass: try to find drawing files to map images to cells
    let mut drawing_files = Vec::new();
    for i in 0..archive.len() {
        let mut zip_file = archive.by_index(i).map_err(|e| format!("Failed to read ZIP entry: {}", e))?;
        let name = zip_file.name().to_string();
        
        if name.starts_with("xl/drawings/") && name.ends_with(".xml") {
            let mut content = String::new();
            zip_file.read_to_string(&mut content).map_err(|e| format!("Failed to read drawing file: {}", e))?;
            drawing_files.push((name, content));
        }
    }
    
    // Parse drawing files to extract image positions
    for (_drawing_name, drawing_content) in &drawing_files {
        let mut current_col = 0;
        let mut current_row = 0;
        let mut in_anchor = false;
        
        for line in drawing_content.lines() {
            let line = line.trim();
            
            if line.contains("<xdr:twoCellAnchor>") {
                in_anchor = true;
                current_col = 0;
                current_row = 0;
            }
            
            if line.contains("</xdr:twoCellAnchor>") {
                in_anchor = false;
            }
            
            if in_anchor {
                if line.contains("<xdr:col>") && line.contains("</xdr:col>") {
                    if let Some(start) = line.find("<xdr:col>") {
                        if let Some(end) = line.find("</xdr:col>") {
                            let col_str = &line[start + 9..end];
                            if let Ok(col) = col_str.parse::<usize>() {
                                current_col = col;
                            }
                        }
                    }
                }
                
                if line.contains("<xdr:row>") && line.contains("</xdr:row>") {
                    if let Some(start) = line.find("<xdr:row>") {
                        if let Some(end) = line.find("</xdr:row>") {
                            let row_str = &line[start + 10..end];
                            if let Ok(row) = row_str.parse::<usize>() {
                                current_row = row;
                            }
                        }
                    }
                }
                
                if line.contains("<a:blip") && line.contains("r:embed") {
                    for img in images.iter_mut() {
                        if img.cell_ref.is_empty() {
                            let col_letter = match current_col {
                                0 => "A", 1 => "B", 2 => "C", 3 => "D", 4 => "E",
                                5 => "F", 6 => "G", 7 => "H", 8 => "I", 9 => "J",
                                10 => "K", 11 => "L", 12 => "M", 13 => "N", 14 => "O",
                                _ => "P",
                            };
                            img.cell_ref = format!("{}{}", col_letter, current_row + 1);
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // If no drawing files found or no matches, fall back to simple mapping
    if drawing_files.is_empty() {
        for (i, image) in images.iter_mut().enumerate() {
            let row = (i / 3) + 1;
            let col = (i % 3) + 1;
            let col_letter = match col {
                1 => "A",
                2 => "B", 
                3 => "C",
                _ => "D",
            };
            image.cell_ref = format!("{}{}", col_letter, row);
        }
    }
    
    Ok(images)
}