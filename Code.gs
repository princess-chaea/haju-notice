const SHEET_NAME = '공지사항_데이터';
const HEADERS = ['ID', '입력일시', '안내날짜', '업무안내', '안전교육', '교장_오늘', '교감_오늘', '교장_다음', '교감_다음'];

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
  
  if (action === 'read') {
    return getContent();
  }
  
  // 기본적으로 안내 메시지 반환
  return ContentService.createTextOutput("API is running").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const sheet = setupSheet();
  const data = JSON.parse(e.postData.contents);
  
  const newRow = [
    Utilities.getUuid(),
    new Date(),
    data.noticeDate,
    data.workNotice,
    data.safetyNotice,
    data.prinToday,
    data.vpToday,
    data.prinNext,
    data.vpNext
  ];
  
  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getContent() {
  const sheet = setupSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return createJsonResponse({ data: null });
  
  const lastRow = rows[rows.length - 1];
  const result = {};
  HEADERS.forEach((header, index) => {
    result[header] = lastRow[index];
  });
  
  return createJsonResponse({ data: result });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}