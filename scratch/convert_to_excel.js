const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const mdPath = path.join(process.cwd(), 'feature.md');
if (!fs.existsSync(mdPath)) {
  console.error('feature.md not found');
  process.exit(1);
}

const md = fs.readFileSync(mdPath, 'utf-8');
const lines = md.split('\n');

const data = [];
let currentGroup = '';
let currentSubgroup = '';

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  
  if (trimmed.startsWith('## ')) {
    currentGroup = trimmed.substring(3).trim();
    currentSubgroup = '';
  } else if (line.startsWith('- **') || line.startsWith('- ')) {
    // Top level list item
    let cleanLine = trimmed.replace(/^-\s+/, '');
    let name = '';
    let desc = '';
    
    if (cleanLine.startsWith('**')) {
      const boldEnd = cleanLine.indexOf('**', 2);
      if (boldEnd !== -1) {
        name = cleanLine.substring(2, boldEnd).trim();
        let remain = cleanLine.substring(boldEnd + 2).trim();
        if (remain.startsWith(':')) {
          remain = remain.substring(1).trim();
        } else if (remain.startsWith('-')) {
          remain = remain.substring(1).trim();
        }
        desc = remain;
      } else {
        name = cleanLine;
      }
    } else {
      name = cleanLine;
    }
    
    if (name.endsWith(':')) {
      name = name.slice(0, -1).trim();
    }
    
    if (!desc) {
      currentSubgroup = name;
      data.push({
        'Nhóm tính năng': currentGroup,
        'Tên tính năng': name,
        'Mô tả chi tiết': ''
      });
    } else {
      currentSubgroup = '';
      data.push({
        'Nhóm tính năng': currentGroup,
        'Tên tính năng': name,
        'Mô tả chi tiết': desc
      });
    }
  } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
    // Nested level list item
    let cleanLine = trimmed.replace(/^[*-\s]+/, '');
    let name = cleanLine;
    
    data.push({
      'Nhóm tính năng': currentGroup,
      'Tên tính năng': currentSubgroup ? `${currentSubgroup} -> ${name}` : name,
      'Mô tả chi tiết': ''
    });
  }
}

// create workbook
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);

// set column widths
const wscols = [
  {wch: 40}, // Nhóm tính năng
  {wch: 50}, // Tên tính năng
  {wch: 80}  // Mô tả chi tiết
];
ws['!cols'] = wscols;

xlsx.utils.book_append_sheet(wb, ws, 'Danh sách tính năng');
xlsx.writeFile(wb, 'feature.xlsx');
console.log('Successfully wrote feature.xlsx');
