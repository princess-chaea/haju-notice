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
  const date = e.parameter.date;
  
  if (action === 'read') {
    return getContent(date);
  }
  
  return ContentService.createTextOutput("API is running").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const sheet = setupSheet();
  const data = JSON.parse(e.postData.contents);
  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;

  // 특정 날짜가 이미 존재하는지 확인 (안내날짜는 3번째 열, 인덱스 2)
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === data.noticeDate) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const rowData = [
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
  
  if (rowIndex > 0) {
    // 기존 데이터 업데이트
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // 새 데이터 추가
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getContent(targetDate) {
  const sheet = setupSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return createJsonResponse({ data: null });
  
  let targetRow = rows[rows.length - 1]; // 기본값: 마지막 행

  if (targetDate) {
    // 특정 날짜 찾기 (역순으로 검색하여 가장 최근 것 찾기)
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][2] === targetDate) {
        targetRow = rows[i];
        break;
      }
    }
    // 날짜를 지정했는데 못 찾으면 null 반환하거나 적절히 처리 (여기선 null)
    if (targetRow[2] !== targetDate) {
      return createJsonResponse({ data: null });
    }
  }
  
  const result = {};
  HEADERS.forEach((header, index) => {
    result[header] = targetRow[index];
  });
  
  return createJsonResponse({ data: result });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}