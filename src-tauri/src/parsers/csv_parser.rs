use std::fs::File;
use csv::ReaderBuilder;
use crate::models::file_data::FileData;
use crate::utils::contacts::identify_contact_columns;

pub fn parse_csv(file_path: &str) -> Result<FileData, String> {
    println!("[CSV Parser] 开始解析CSV文件: {}", file_path);
    
    let file = File::open(file_path).map_err(|e| {
        println!("[CSV Parser] 文件打开失败: {}", e);
        e.to_string()
    })?;
    
    let mut rdr = ReaderBuilder::new().from_reader(file);
    
    let headers = rdr.headers().map_err(|e| {
        println!("[CSV Parser] 读取表头失败: {}", e);
        e.to_string()
    })?
        .iter().map(|h| h.to_string()).collect::<Vec<String>>();
    
    println!("[CSV Parser] 解析到 {} 个表头", headers.len());
    
    let mut rows = Vec::new();
    for result in rdr.records() {
        let record = result.map_err(|e| {
            println!("[CSV Parser] 读取行数据失败: {}", e);
            e.to_string()
        })?;
        let row = record.iter().map(|f| f.to_string()).collect::<Vec<String>>();
        rows.push(row);
    }
    
    println!("[CSV Parser] 解析到 {} 行数据", rows.len());
    
    let contact_columns = identify_contact_columns(&headers, &rows);
    println!("[CSV Parser] 识别到 {} 个联系方式列", contact_columns.len());
    
    Ok(FileData::new(
        headers,
        rows,
        contact_columns,
        Vec::new(), // CSV files don't contain images
    ))
}
