const SHEET_NAME = '공지사항_데이터';
const HEADERS = ['ID', '입력일시', '안내날짜', '일정안내', '업무안내', '안전교육', '교장_오늘', '교감_오늘', '교장_다음', '교감_다음'];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // 스타일 적용
    const range = sheet.getRange(1, 1, 1, HEADERS.length);
    range.setBackground('#4285f4').setFontColor('#ffffff').setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  setupSheet();
  const action = e.parameter.action;
  const date = e.parameter.date;
  
  if (action === 'read') {
    return getContent(date);
  }
  
  if (action === 'list') {
    const limit = parseInt(e.parameter.limit || '30');
    return listContent(limit);
  }
  
  return ContentService.createTextOutput("API is running").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const sheet = setupSheet();
  const data = JSON.parse(e.postData.contents);
  const lastRow = sheet.getLastRow();
  let rowIndex = -1;

  if (lastRow > 1) {
    // 마지막 100개 행에서 검색 (성능 향상)
    const startRowSearch = Math.max(2, lastRow - 99);
    const searchNumRows = lastRow - startRowSearch + 1;
    const rows = sheet.getRange(startRowSearch, 1, searchNumRows, HEADERS.length).getDisplayValues();
    
    for (let i = rows.length - 1; i >= 0; i--) {
      const dateStr = rows[i][2]; // 안내날짜 (getDisplayValues로 인해 무조건 문자열)
      if (dateStr === data.noticeDate) {
        rowIndex = startRowSearch + i;
        break;
      }
    }
  }
  
  // 입력일시를 KST로 저장
  const nowKST = Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd HH:mm:ss");
  
  const rowData = [
    Utilities.getUuid(),
    nowKST,
    data.noticeDate,
    data.일정안내,
    data.업무안내,
    data.안전교육,
    data.prinToday,
    data.vpToday,
    data.prinNext,
    data.vpNext
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return createJsonResponse({ status: 'success' });
}

function getContent(targetDate) {
  const sheet = setupSheet();
  const rows = sheet.getDataRange().getDisplayValues();
  if (rows.length <= 1) return createJsonResponse({ data: null });
  
  let targetRow = rows[rows.length - 1]; // 기본값: 마지막 행

  if (targetDate) {
    targetRow = null; 
    for (let i = rows.length - 1; i >= 1; i--) {
      const dateStr = rows[i][2];
      if (dateStr === targetDate) {
        targetRow = rows[i];
        break;
      }
    }
    if (!targetRow) {
      return createJsonResponse({ data: null });
    }
  }
  
  const result = {};
  HEADERS.forEach((header, index) => {
    result[header] = targetRow[index];
  });
  
  return createJsonResponse({ data: result });
}

function listContent(limit) {
  const sheet = setupSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return createJsonResponse({ data: [] });
  
  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;
  
  // 전체 대신 필요한 범위만 가져옴
  const rows = sheet.getRange(startRow, 1, numRows, HEADERS.length).getDisplayValues();
  const result = [];
  
  for (let i = rows.length - 1; i >= 0; i--) {
    const item = {};
    HEADERS.forEach((header, index) => {
      item[header] = rows[i][index];
    });
    result.push(item);
  }
  
  return createJsonResponse({ data: result });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}