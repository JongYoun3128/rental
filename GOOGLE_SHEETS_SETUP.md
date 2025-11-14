# Google Sheets 연동 설정 가이드

모달 폼에 입력된 데이터를 Google Sheets에 자동으로 저장하는 방법입니다.

## 📋 단계별 설정 방법

### 1단계: Google Sheets 생성

1. [Google Sheets](https://sheets.google.com)에 접속
2. 새 스프레드시트 생성
3. 시트 이름 확인 (기본값: 'Sheet1')

### 2단계: Google Apps Script 설정

1. 생성한 스프레드시트에서 **확장 프로그램 > Apps Script** 클릭
2. `google-apps-script.js` 파일의 내용을 복사해서 붙여넣기
3. **스프레드시트 ID 확인 방법:**
   - 브라우저 주소창에서 확인
   - 예: `https://docs.google.com/spreadsheets/d/[여기가_ID]/edit`
   - `[여기가_ID]` 부분을 복사
4. 코드에서 `SPREADSHEET_ID` 부분을 본인의 ID로 변경:
   ```javascript
   const SPREADSHEET_ID = '여기에_본인의_ID_붙여넣기';
   ```
5. 시트 이름이 'Sheet1'이 아니면 `SHEET_NAME`도 변경

### 3단계: 웹앱으로 배포

1. Apps Script 에디터에서 **배포 > 새 배포** 클릭
2. **유형 선택** 옆의 톱니바퀴 아이콘 클릭
3. **웹 앱** 선택
4. 설정:
   - **설명**: 원하는 설명 입력 (예: "리워드몰 사전예약 데이터 수집")
   - **다음 사용자로 실행**: **나**
   - **액세스 권한**: **모든 사용자** (또는 **알 수 없는 사용자 포함**)
5. **배포** 버튼 클릭
6. 권한 승인:
   - **권한 확인** 클릭
   - Google 계정 선택
   - **고급 > 안전하지 않은 페이지로 이동** 클릭 (필요시)
   - **허용** 클릭
7. **웹 앱 URL 복사** (예: `https://script.google.com/macros/s/...`)

### 4단계: JavaScript 코드에 URL 입력

1. `app.js` 파일 열기
2. 상단의 `GOOGLE_SCRIPT_URL` 찾기:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. 복사한 웹앱 URL로 변경:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/여기에_복사한_URL';
   ```

### 5단계: 테스트

1. 웹페이지에서 모달 열기
2. 이름, 연락처, 이메일, 파트너코드 입력
3. 제출 버튼 클릭
4. Google Sheets에서 데이터가 추가되었는지 확인

## 📊 저장되는 데이터 형식

| 타임스탬프 | 이름 | 연락처 | 이메일 | 파트너코드 |
|-----------|------|--------|--------|-----------|
| 2025-01-15 14:30:00 | 홍길동 | 010-1234-5678 | test@example.com | ABC123 |

## ⚠️ 주의사항

1. **보안**: 웹앱 URL은 공개되면 누구나 사용할 수 있습니다. 필요시 추가 보안 설정을 고려하세요.
2. **할당량**: Google Apps Script는 일일 실행 제한이 있습니다 (약 20,000회/일).
3. **CORS**: `no-cors` 모드를 사용하므로 응답을 확인할 수 없지만, 데이터는 정상적으로 저장됩니다.

## 🔧 문제 해결

### 데이터가 저장되지 않을 때

1. **스프레드시트 ID 확인**: URL에서 올바른 ID를 복사했는지 확인
2. **시트 이름 확인**: `SHEET_NAME`이 실제 시트 이름과 일치하는지 확인
3. **권한 확인**: 웹앱 배포 시 "모든 사용자"로 설정했는지 확인
4. **브라우저 콘솔 확인**: F12를 눌러 콘솔에서 에러 메시지 확인

### 권한 오류가 발생할 때

1. Apps Script에서 **배포 > 배포 관리** 클릭
2. **새 버전으로 수정** 클릭
3. 권한을 다시 승인

## 📝 추가 기능 (선택사항)

### 이메일 알림 추가

`google-apps-script.js`에 다음 코드를 추가하면 데이터 저장 시 이메일 알림을 받을 수 있습니다:

```javascript
// doPost 함수 내부, sheet.appendRow() 다음에 추가
MailApp.sendEmail({
  to: 'your-email@gmail.com',
  subject: '새로운 사전예약 신청',
  body: `이름: ${data.name}\n연락처: ${data.phone}\n이메일: ${data.email}\n파트너코드: ${data.partnerCode || '없음'}`
});
```

### 데이터 검증 추가

필요시 이메일 형식, 전화번호 형식 등을 검증할 수 있습니다.


