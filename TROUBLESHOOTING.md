# 문제 해결 가이드

## Google Sheets 연동이 작동하지 않을 때

### 1. 브라우저 콘솔 확인
1. F12 키를 눌러 개발자 도구 열기
2. **Console** 탭 확인
3. 에러 메시지 확인

### 2. Google Apps Script 확인사항

#### ✅ 스프레드시트 ID 확인
- `google-apps-script.js`에서 `SPREADSHEET_ID`가 올바른지 확인
- Google Sheets URL에서 ID 복사:
  ```
  https://docs.google.com/spreadsheets/d/[여기가_ID]/edit
  ```

#### ✅ 웹앱 배포 설정 확인
1. **배포 > 배포 관리** 클릭
2. 설정 확인:
   - **다음 사용자로 실행**: **나**
   - **액세스 권한**: **모든 사용자** (또는 **알 수 없는 사용자 포함**)

#### ✅ 권한 재승인
1. **배포 > 배포 관리** 클릭
2. **새 버전으로 수정** 클릭
3. 권한을 다시 승인

### 3. CORS 오류가 발생할 때

Google Apps Script는 기본적으로 CORS를 지원하지만, 때로는 문제가 발생할 수 있습니다.

**해결 방법:**
1. Google Apps Script에서 **배포 > 새 배포** 클릭
2. **웹 앱** 선택
3. **액세스 권한**을 **모든 사용자**로 설정
4. **배포** 후 새 URL 복사
5. `app.js`의 `GOOGLE_SCRIPT_URL` 업데이트

### 4. 데이터가 저장되지 않을 때

#### 확인사항:
1. **Google Sheets에서 시트 이름 확인**
   - `google-apps-script.js`의 `SHEET_NAME`이 실제 시트 이름과 일치하는지 확인
   - 기본값: `Sheet1`

2. **헤더 행 확인**
   - 첫 번째 행에 헤더가 있는지 확인
   - 없으면 자동으로 추가됨

3. **스크립트 실행 로그 확인**
   - Google Apps Script에서 **실행** 클릭
   - 에러가 있는지 확인

### 5. 테스트 방법

#### Google Apps Script 직접 테스트:
1. Google Apps Script 에디터에서 **실행 > doGet** 클릭
2. "Google Sheets 연동이 정상적으로 작동합니다!" 메시지가 나오면 정상

#### 웹페이지에서 테스트:
1. 브라우저 콘솔 열기 (F12)
2. 모달에서 폼 작성 후 제출
3. 콘솔에서 다음 메시지 확인:
   - 성공: `Google Sheets 저장 성공: {success: true, ...}`
   - 실패: `Google Sheets 저장 실패: ...`

### 6. 자주 발생하는 오류

#### "Google Sheets URL이 설정되지 않았습니다."
- `app.js`의 `GOOGLE_SCRIPT_URL`이 올바르게 설정되었는지 확인

#### "CORS policy" 오류
- Google Apps Script 웹앱 배포 설정 확인
- **액세스 권한**을 **모든 사용자**로 설정

#### "Cannot find method doPost"
- Google Apps Script 코드가 올바르게 저장되었는지 확인
- 함수 이름이 정확한지 확인 (`doPost`, `doGet`)

#### "Spreadsheet not found"
- `SPREADSHEET_ID`가 올바른지 확인
- 스프레드시트에 접근 권한이 있는지 확인

### 7. 디버깅 팁

#### 콘솔 로그 확인:
```javascript
// app.js에서 자동으로 콘솔에 로그 출력
console.log("Google Sheets 저장 성공:", result);
console.error("Google Sheets 저장 실패:", error);
```

#### Google Apps Script 로그 확인:
1. Google Apps Script 에디터에서 **실행 > doPost** 클릭
2. **실행 로그** 확인
3. 에러 메시지 확인

### 8. 여전히 작동하지 않으면

1. **새 웹앱 배포**
   - Google Apps Script에서 **배포 > 새 배포** 클릭
   - 새 버전으로 배포
   - 새 URL 받아서 `app.js`에 입력

2. **코드 재확인**
   - `google-apps-script.js` 코드가 정확한지 확인
   - `app.js`의 `GOOGLE_SCRIPT_URL`이 올바른지 확인

3. **브라우저 캐시 삭제**
   - Ctrl + Shift + Delete
   - 캐시된 이미지 및 파일 삭제
   - 페이지 새로고침 (Ctrl + F5)


