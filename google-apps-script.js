/**
 * Google Apps Script - Google Sheets에 데이터 저장
 *
 * 사용 방법:
 * 1. Google Sheets를 열고 확장 프로그램 > Apps Script 클릭
 * 2. 이 코드를 붙여넣기
 * 3. 스프레드시트 ID를 아래 SPREADSHEET_ID에 입력
 * 4. 배포 > 새 배포 > 웹 앱으로 배포
 * 5. 실행 권한 설정 후 웹 앱 URL 복사
 * 6. app.js의 GOOGLE_SCRIPT_URL에 URL 입력
 */

// ⚠️ 여기에 본인의 Google Sheets ID를 입력하세요
// 예: https://docs.google.com/spreadsheets/d/[여기가_ID]/edit
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

// 시트 이름 (기본값: 'Sheet1', 원하는 시트 이름으로 변경 가능)
const SHEET_NAME = "Sheet1";

/**
 * POST 요청 처리 - 데이터를 시트에 추가
 */
function doPost(e) {
    try {
        // 요청 데이터 파싱
        const data = JSON.parse(e.postData.contents);

        // 스프레드시트 열기
        const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

        // 헤더가 없으면 추가
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["타임스탬프", "이름", "연락처", "이메일", "파트너코드"]);
        }

        // 현재 시간 (한국 시간)
        const timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

        // 데이터 추가
        sheet.appendRow([timestamp, data.name || "", data.phone || "", data.email || "", data.partnerCode || ""]);

        // 성공 응답 (CORS 헤더 추가)
        const output = ContentService.createTextOutput(
            JSON.stringify({
                success: true,
                message: "데이터가 성공적으로 저장되었습니다.",
            })
        ).setMimeType(ContentService.MimeType.JSON);

        // CORS 헤더 설정
        return output;
    } catch (error) {
        // 에러 응답 (CORS 헤더 추가)
        const output = ContentService.createTextOutput(
            JSON.stringify({
                success: false,
                error: error.toString(),
            })
        ).setMimeType(ContentService.MimeType.JSON);

        return output;
    }
}

/**
 * GET 요청 처리 (테스트용)
 */
function doGet(e) {
    return ContentService.createTextOutput("Google Sheets 연동이 정상적으로 작동합니다!").setMimeType(
        ContentService.MimeType.TEXT
    );
}
