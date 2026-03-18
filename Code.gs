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
    // 스프레드시트의 날짜 형식이 다를 수 있으므로 문자열로 비교
    const cellValue = rows[i][2];
    const dateStr = cellValue instanceof Date ? Utilities.formatDate(cellValue, "GMT+9", "yyyy-MM-dd") : String(cellValue);
    if (dateStr === data.noticeDate) {
      rowIndex = i + 1;
      break;
    }
  }
  
  // 입력일시를 KST로 저장
  const nowKST = Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd HH:mm:ss");
  
  const rowData = [
    Utilities.getUuid(),
    nowKST,
    data.noticeDate,
    data.workNotice,
    data.safetyNotice,
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
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getContent(targetDate) {
  const sheet = setupSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return createJsonResponse({ data: null });
  
  let targetRow = rows[rows.length - 1]; // 기본값: 마지막 행

  if (targetDate) {
    targetRow = null; 
    for (let i = rows.length - 1; i >= 1; i--) {
      const cellValue = rows[i][2];
      const dateStr = cellValue instanceof Date ? Utilities.formatDate(cellValue, "GMT+9", "yyyy-MM-dd") : String(cellValue);
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
    let value = targetRow[index];
    // 날짜 객체 데이터는 문자열로 변환 (안내날짜 등)
    if (value instanceof Date) {
      value = Utilities.formatDate(value, "GMT+9", index === 1 ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd");
    }
    result[header] = value;
  });
  
  return createJsonResponse({ data: result });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}