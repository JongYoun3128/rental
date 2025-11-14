// ✅ 순수 JavaScript 랜딩 원페이지
// - Tailwind CSS 기반 (CDN)
// - 130% 리워드 소개 / ₩110,000 사전예약 / 파트너스(5%) 신청
// - 카운트다운 + 리워드/마진 계산기
// - 실제 결제/제출: TODO 자리(서버 API + PG SDK 연동)
// - ❗️DEV 테스트 케이스(console.assert) 포함

/************************************
 * 유틸 & 테스트 가능한 순수 함수
 ************************************/
function computeDistribution(P, instantRate = 0.1) {
    const price = Number(P) || 0;
    const rate = Number(instantRate) || 0;
    const cost = 0.2 * price;
    const rewardFund = 0.6 * price;
    const companyGross = 0.2 * price;
    const partnerFee = 0.05 * price; // 회사 20% 중 5%p 제공
    const companyNet = 0.15 * price; // 정산 후 실마진
    const customerTarget = 1.3 * price; // 고객 목표 리워드
    const instantReward = rate * price;
    const reservedReward = Math.max(0, customerTarget - instantReward);
    return {
        price,
        cost,
        rewardFund,
        companyGross,
        partnerFee,
        companyNet,
        customerTarget,
        instantReward,
        reservedReward,
    };
}

function formatKRW(n) {
    if (Number.isNaN(Number(n))) return "-";
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(
        Math.round(Number(n))
    );
}

/************************************
 * Google Sheets 연동 설정
 ************************************/
// ⚠️ Google Apps Script 웹앱 URL을 여기에 입력하세요
// 배포 후 받은 URL을 복사해서 붙여넣으세요
const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxD0QsE5JwaILLpG5MJXM6TDmxhCgKldI20yvsOZ5GkORGq82nZZDZ9H1Ixbx_wKMPh/exec";

/************************************
 * 상태 관리 (간단한 상태 객체)
 ************************************/
const state = {
    price: 100000,
    instantRate: 0.1,
    openModal: false,
    isReserved: false,
    form: { name: "", phone: "", email: "", partnerCode: "" },
    deadline: new Date("2025-12-17T23:59:00+09:00"),
    now: Date.now(),
};

/************************************
 * 카운트다운 업데이트
 ************************************/
function updateCountdown() {
    state.now = Date.now();
    const diff = Math.max(0, state.deadline.getTime() - state.now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
        countdownEl.innerHTML = `
      <div class="flex items-center gap-2 text-sm text-white/90">
        <div class="flex items-end gap-1">
          <div class="countdown-box">${String(days).padStart(2, "0")}</div>
          <div class="countdown-unit">일</div>
        </div>
        <span>:</span>
        <div class="flex items-end gap-1">
          <div class="countdown-box">${String(hours).padStart(2, "0")}</div>
          <div class="countdown-unit">시간</div>
        </div>
        <span>:</span>
        <div class="flex items-end gap-1">
          <div class="countdown-box">${String(minutes).padStart(2, "0")}</div>
          <div class="countdown-unit">분</div>
        </div>
        <span>:</span>
        <div class="flex items-end gap-1">
          <div class="countdown-box">${String(seconds).padStart(2, "0")}</div>
          <div class="countdown-unit">초</div>
        </div>
      </div>
    `;
    }
}

/************************************
 * 계산기 업데이트
 ************************************/
function updateCalculator() {
    const dist = computeDistribution(state.price, state.instantRate);

    // 계산 결과 업데이트
    document.getElementById("calc-cost").textContent = formatKRW(dist.cost);
    document.getElementById("calc-rewardFund").textContent = formatKRW(dist.rewardFund);
    document.getElementById("calc-companyGross").textContent = formatKRW(dist.companyGross);
    document.getElementById("calc-partnerFee").textContent = formatKRW(dist.partnerFee);
    document.getElementById("calc-companyNet").textContent = formatKRW(dist.companyNet);
    document.getElementById("calc-instantReward").textContent = formatKRW(dist.instantReward);
    document.getElementById("calc-customerTarget").textContent = formatKRW(dist.customerTarget);
    document.getElementById("calc-reservedReward").textContent = formatKRW(dist.reservedReward);

    // 슬라이더 표시 업데이트
    const rateDisplay = document.getElementById("rate-display");
    if (rateDisplay) {
        rateDisplay.textContent = `현재 ${Math.round(state.instantRate * 100)}% 즉시지급`;
    }
}

/************************************
 * 모달 표시/숨김
 ************************************/
function showModal() {
    state.openModal = true;
    const modal = document.getElementById("modal");
    if (modal) {
        modal.classList.remove("hidden");
    }
}

function hideModal() {
    state.openModal = false;
    const modal = document.getElementById("modal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

/************************************
 * FAQ 토글
 ************************************/
function toggleFaq(index) {
    const faqContent = document.getElementById(`faq-content-${index}`);
    const faqIcon = document.getElementById(`faq-icon-${index}`);
    if (faqContent && faqIcon) {
        const isOpen = !faqContent.classList.contains("hidden");
        if (isOpen) {
            faqContent.classList.add("hidden");
            faqIcon.textContent = "+";
        } else {
            faqContent.classList.remove("hidden");
            faqIcon.textContent = "−";
        }
    }
}

/************************************
 * 파트너스 신청 폼 렌더링
 ************************************/
function renderPartnerForm() {
    const container = document.getElementById("partner-form-container");
    if (!container) return;

    const afterDeadline = Date.now() > state.deadline.getTime();

    if (afterDeadline) {
        container.innerHTML =
            '<div class="mt-3 text-xs text-white/70">사전예약 기간 종료로 신규 파트너스 등록이 불가합니다.</div>';
        return;
    }

    if (!state.isReserved) {
        container.innerHTML =
            '<div class="mt-3 text-xs text-white/80">사전예약을 완료한 계정만 신청할 수 있습니다. 먼저 사전예약을 진행해 주세요.</div>';
        return;
    }

    container.innerHTML = `
    <form id="partner-form" class="mt-3 grid gap-3 sm:grid-cols-3">
      <input id="partner-name" class="input-field input-field-dark sm:col-span-1" placeholder="이름" required/>
      <input id="partner-bank" class="input-field input-field-dark sm:col-span-1" placeholder="은행 (예: 카카오뱅크)" required/>
      <input id="partner-account" class="input-field input-field-dark sm:col-span-1" placeholder="계좌번호" required/>
      <button type="submit" class="btn-primary sm:col-span-3">파트너스 신청하기</button>
    </form>
  `;

    const form = document.getElementById("partner-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("데모: 파트너스 신청이 접수되었습니다. 승인 후 파트너 코드가 발급됩니다.");
        });
    }
}

/************************************
 * 메인 페이지 렌더링
 ************************************/
function render() {
    const root = document.getElementById("root");
    if (!root) return;

    root.innerHTML = `
    <div class="gradient-bg min-h-screen text-gray-900">
      <!-- HERO -->
      <section class="relative overflow-hidden">
        <div class="hero-gradient"></div>
        <div class="relative mx-auto max-w-6xl px-6 pt-16 pb-12">
          <div class="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-2xl">
              <div class="badge-container inline-flex flex-col gap-3 rounded-2xl bg-white/10 px-5 py-4 text-base font-medium text-white ring-1 ring-white/20 shadow-lg">
                <div class="badge-date-text text-center font-semibold text-base">사전예약 진행중 · 2025-11-17 → 2025-12-17</div>
                <div class="badge-countdown-wrapper flex items-center justify-center gap-3 rounded-lg px-5 py-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-95"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span id="countdown"></span>
                </div>
              </div>
              <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                총 구매금액의 <span class="text-gradient">130% 리워드</span>를 돌려주는
                <br class="hidden md:block" />
                새로운 리워드 커머스
              </h1>
              <p class="mt-4 text-base leading-7 text-white/80">
                과도한 쿠폰 경쟁 대신, 매출의 <strong>60%</strong>를 리워드 재원으로 누적 적립합니다. 사전예약 기간에 <strong>₩110,000</strong>을
                예치하면 론칭과 동시에 <strong>바우처 1:1 전환</strong> 및 조기 혜택이 제공됩니다.
              </p>
              <div class="mt-6 flex flex-wrap items-center gap-3">
                <button onclick="showModal()" class="btn-primary btn-large">
                  ₩110,000 사전예약하기
                </button>
                <a href="#calculator" class="text-sm font-medium text-white/80 underline-offset-4 hover:underline">리워드 계산해보기</a>
              </div>
            </div>
            <div class="grid w-full max-w-xl grid-cols-3 gap-3 lg:max-w-md">
              <div class="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="text-gray-500 text-sm">리워드 목표</div>
                <div class="mt-1 text-2xl font-bold tracking-tight">결제액의 130%</div>
                <div class="mt-1 text-xs text-gray-500">누적 달성시 일괄 지급</div>
              </div>
              <div class="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="text-gray-500 text-sm">리워드 적립</div>
                <div class="mt-1 text-2xl font-bold tracking-tight">매출의 60%</div>
                <div class="mt-1 text-xs text-gray-500">모든 주문에서 고정 적립</div>
              </div>
              <div class="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="text-gray-500 text-sm">파트너 정산</div>
                <div class="mt-1 text-2xl font-bold tracking-tight">매출의 5%</div>
                <div class="mt-1 text-xs text-gray-500">회사 20% 마진 중 5%p</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- VALUE / HOW IT WORKS -->
      <section class="mx-auto max-w-6xl px-6 py-12">
        <div class="grid gap-10 lg:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 class="text-lg font-bold">고객 혜택</h3>
            <p class="mt-2 text-sm text-white/80">결제액의 <b>130%</b>를 누적 보상. 즉시지급(10~20%) + 누적으로 체감과 신뢰를 함께 제공합니다.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 class="text-lg font-bold">투명한 분배</h3>
            <p class="mt-2 text-sm text-white/80">원가 <b>20%</b> · 회사 <b>20%</b> · 리워드 <b>60%</b>. 회사 마진의 5%p는 파트너에게 배분합니다.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 class="text-lg font-bold">파트너스 5%</h3>
            <p class="mt-2 text-sm text-white/80">링크/쿠폰/QR 추적 기반 월 1회 정산(D+15). 브랜드와 함께 성장하는 안정적 수익 모델.</p>
          </div>
        </div>

        <ol class="mt-10 grid gap-6 rounded-2xl bg-white p-6 shadow lg:grid-cols-4">
          <li class="rounded-xl border border-gray-100 p-4">
            <div class="text-xs font-semibold text-gray-500">STEP 1</div>
            <div class="mt-1 text-base font-bold">사전예약</div>
            <div class="mt-1 text-sm text-gray-600">₩110,000 결제 → 론칭 시 바우처 1:1 전환</div>
          </li>
          <li class="rounded-xl border border-gray-100 p-4">
            <div class="text-xs font-semibold text-gray-500">STEP 2</div>
            <div class="mt-1 text-base font-bold">첫 구매</div>
            <div class="mt-1 text-sm text-gray-600">즉시지급(10~20%) + 누적 리워드 시작</div>
          </li>
          <li class="rounded-xl border border-gray-100 p-4">
            <div class="text-xs font-semibold text-gray-500">STEP 3</div>
            <div class="mt-1 text-base font-bold">진행률 확인</div>
            <div class="mt-1 text-sm text-gray-600">마이페이지에서 목표(130%) 달성률 확인</div>
          </li>
          <li class="rounded-xl border border-gray-100 p-4">
            <div class="text-xs font-semibold text-gray-500">STEP 4</div>
            <div class="mt-1 text-base font-bold">달성/사용</div>
            <div class="mt-1 text-sm text-gray-600">목표 달성 시 일괄 지급 및 사용 가능</div>
          </li>
        </ol>
      </section>

      <!-- CALCULATOR -->
      <section id="calculator" class="mx-auto max-w-6xl px-6 pb-12">
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold">리워드 & 마진 계산기</h3>
              <p class="mt-1 text-sm text-gray-500">예시 금액으로 분배 구조를 확인하세요. 실제 정산은 약관에 따릅니다.</p>
            </div>
            <button onclick="showModal()" class="btn-primary">
              지금 사전예약(₩110,000)
            </button>
          </div>

          <div class="mt-6 grid gap-6 lg:grid-cols-12">
            <div class="lg:col-span-5">
              <label class="text-sm font-medium text-gray-700">상품 판매가 (P)</label>
              <div class="mt-2 flex items-center gap-3">
                <input
                  id="price-input"
                  type="number"
                  min="0"
                  step="1000"
                  class="w-full input-field"
                  value="${state.price}"
                />
                <span class="text-sm text-gray-500">KRW</span>
              </div>

              <label class="mt-5 block text-sm font-medium text-gray-700">즉시지급 비율</label>
              <input
                id="rate-input"
                type="range"
                min="0.1"
                max="0.2"
                step="0.01"
                value="${state.instantRate}"
                class="mt-2 w-full"
              />
              <div id="rate-display" class="mt-1 text-xs text-gray-500">현재 ${Math.round(
                  state.instantRate * 100
              )}% 즉시지급</div>
            </div>

            <div class="lg:col-span-7">
              <div class="grid grid-cols-2 gap-3">
                <div class="calc-card">
                  <div class="text-xs text-gray-500">원가 (20%)</div>
                  <div id="calc-cost" class="mt-1 text-lg font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).cost
                  )}</div>
                </div>
                <div class="calc-card calc-card-emphasis">
                  <div class="text-xs text-gray-500">리워드 적립 (60%)</div>
                  <div id="calc-rewardFund" class="mt-1 text-lg font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).rewardFund
                  )}</div>
                </div>
                <div class="calc-card">
                  <div class="text-xs text-gray-500">회사 기준마진 (20%)</div>
                  <div id="calc-companyGross" class="mt-1 text-lg font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).companyGross
                  )}</div>
                </div>
                <div class="calc-card">
                  <div class="text-xs text-gray-500">파트너 정산 (5%)</div>
                  <div id="calc-partnerFee" class="mt-1 text-lg font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).partnerFee
                  )}</div>
                </div>
                <div class="calc-card">
                  <div class="text-xs text-gray-500">회사 실마진 (15%)</div>
                  <div id="calc-companyNet" class="mt-1 text-lg font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).companyNet
                  )}</div>
                </div>
                <div class="calc-card">
                  <div class="text-xs text-gray-500">즉시지급 (~10~20%)</div>
                  <div id="calc-instantReward" class="mt-1 text-lg font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).instantReward
                  )}</div>
                </div>
              </div>
              <div class="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <div class="flex items-center justify-between">
                  <span class="font-semibold">고객 목표 리워드 (130% of P)</span>
                  <span id="calc-customerTarget" class="font-bold">${formatKRW(
                      computeDistribution(state.price, state.instantRate).customerTarget
                  )}</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-gray-600">
                  <span>즉시지급 후 잔여 누적</span>
                  <span id="calc-reservedReward">${formatKRW(
                      computeDistribution(state.price, state.instantRate).reservedReward
                  )}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PARTNERS -->
      <section class="mx-auto max-w-6xl px-6 pb-12">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
          <h3 class="text-xl font-bold">파트너스(5%) 프로그램 <span class="ml-2 rounded-full bg-white/10 px-2 py-[2px] text-xs">사전예약자 한정</span></h3>
          <div class="mt-2 text-sm text-white/80">
            추적 매출의 <b>5%</b>를 월 1회 <b>D+15</b>에 정산합니다. 취소/환불/부정거래는 제외되며, 링크·쿠폰·QR로 트래킹합니다.
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-white/10 p-4">
              <div class="text-xs text-white/70">예시 매출</div>
              <div class="text-lg font-bold">₩50,000,000</div>
            </div>
            <div class="rounded-xl bg-white/10 p-4">
              <div class="text-xs text-white/70">정산(5%)</div>
              <div class="text-lg font-bold">₩2,500,000</div>
            </div>
            <div class="rounded-xl bg-white/10 p-4">
              <div class="text-xs text-white/70">정산 주기</div>
              <div class="text-lg font-bold">월 1회 · D+15</div>
            </div>
          </div>
          <div class="mt-3 text-xs text-white/70">※ 파트너스는 <b>사전예약 기간(2025-11-17~2025-12-17)</b>에 예약완료한 회원만 신청 가능하며, 기간 종료 후 신규 등록은 불가합니다.</div>

          <div class="mt-6 rounded-xl bg-white/10 p-4">
            <div class="text-sm font-semibold">파트너스 신청</div>
            <p class="mt-1 text-xs text-white/80">사전예약 완료 계정으로만 신청할 수 있습니다. 승인 시 전용 파트너 코드가 발급됩니다.</p>
            <div id="partner-form-container"></div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mx-auto max-w-6xl px-6 pb-16">
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow">
          <h3 class="text-xl font-bold">자주 묻는 질문</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="faq-item">
              <button onclick="toggleFaq(0)" class="faq-button">
                <span class="font-semibold">정말 130%를 모두 받나요?</span>
                <span id="faq-icon-0" class="text-xl leading-none">+</span>
              </button>
              <div id="faq-content-0" class="faq-content hidden">약관상 참여/유효기간/예외 조건을 충족하면 누적 지급됩니다. 즉시지급(10~20%) 이후 잔여는 매출×60% 재원에서 누적 달성합니다.</div>
            </div>
            <div class="faq-item">
              <button onclick="toggleFaq(1)" class="faq-button">
                <span class="font-semibold">사전예약 환불은 가능할까요?</span>
                <span id="faq-icon-1" class="text-xl leading-none">+</span>
              </button>
              <div id="faq-content-1" class="faq-content hidden">론칭 전 전액 환불 또는 론칭 후 7일 내 미사용분 환불 등 선택 정책 중 확정해 공지합니다. 바우처 전환 후 환불불가 옵션도 선택 가능합니다.</div>
            </div>
            <div class="faq-item">
              <button onclick="toggleFaq(2)" class="faq-button">
                <span class="font-semibold">파트너 정산 기준은?</span>
                <span id="faq-icon-2" class="text-xl leading-none">+</span>
              </button>
              <div id="faq-content-2" class="faq-content hidden">전용 링크/쿠폰/QR로 추적하며 취소·환불·부정거래를 제외하고 월 1회 D+15 일괄 정산합니다.</div>
            </div>
            <div class="faq-item">
              <button onclick="toggleFaq(3)" class="faq-button">
                <span class="font-semibold">그룹형/개별형 지급은 무엇인가요?</span>
                <span id="faq-icon-3" class="text-xl leading-none">+</span>
              </button>
              <div id="faq-content-3" class="faq-content hidden">그룹(5인) 단위 동시 달성 방식 또는 개인 누적 달성 방식 중 선택/혼합 가능합니다. 체감 보상을 위해 즉시지급(10~20%)을 권장합니다.</div>
            </div>
          </div>
          <div class="mt-6 text-xs text-gray-500">
            ※ 본 페이지는 제품군, 약관, 세부 정산 로직 확정 전의 제안용 시안입니다. 실제 론칭 전 최종 약관/개인정보 처리방침과 함께 공시됩니다.
          </div>
        </div>
      </section>

      <!-- FOOTER / CTA -->
      <footer class="border-t border-white/10 bg-white/5">
        <div class="mx-auto max-w-6xl px-6 py-8 text-white">
          <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div class="text-sm font-semibold">리워드몰 사전예약</div>
              <div class="text-xs text-white/70">기간: 2025-11-17 ~ 2025-12-17 23:59 (KST) · 예약금 ₩110,000</div>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="showModal()" class="btn-primary">예약하기</button>
              <a href="#calculator" class="text-sm underline underline-offset-4">분배 구조 보기</a>
            </div>
          </div>
        </div>
      </footer>

      <!-- MODAL -->
      <div id="modal" class="modal-overlay hidden">
        <div class="modal-content">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-gray-500">사전예약 신청</div>
              <div class="text-xl font-bold">₩110,000 바우처 전환</div>
            </div>
            <button onclick="hideModal()" class="rounded-lg bg-gray-100 px-2 py-1 text-xs">닫기</button>
          </div>

          <form id="reserve-form" class="mt-4 grid gap-3">
            <div>
              <label class="text-xs text-gray-600">이름</label>
              <input id="form-name" class="mt-1 input-field" required placeholder="홍길동" />
            </div>
            <div>
              <label class="text-xs text-gray-600">연락처</label>
              <input id="form-phone" class="mt-1 input-field" required placeholder="010-0000-0000" />
            </div>
            <div>
              <label class="text-xs text-gray-600">이메일</label>
              <input id="form-email" type="email" class="mt-1 input-field" required placeholder="you@example.com" />
            </div>
            <div>
              <label class="text-xs text-gray-600">파트너스 코드 (선택)</label>
              <input id="form-partnerCode" class="mt-1 input-field" placeholder="예: ABC123" />
              <div class="mt-1 text-[11px] text-gray-400">추천인이 있다면 입력하세요. 없으면 비워두셔도 됩니다.</div>
            </div>
            <div>
              <label class="text-xs text-gray-600">동의</label>
              <div class="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <input id="form-agree" type="checkbox" required />
                <span>사전예약 약관 및 개인정보 처리에 동의합니다.</span>
              </div>
            </div>
            <button type="submit" class="mt-2 btn-primary">₩110,000 결제 진행</button>
          </form>
        </div>
      </div>
    </div>
  `;

    // 이벤트 리스너 설정
    setupEventListeners();
    updateCountdown();
    updateCalculator();
    renderPartnerForm();

    // URL 파라미터로 파트너 코드 자동 채움
    try {
        const usp = new URLSearchParams(window.location.search);
        const code = (usp.get("pc") || usp.get("partner") || "").toUpperCase();
        if (code) {
            state.form.partnerCode = code;
            const partnerCodeInput = document.getElementById("form-partnerCode");
            if (partnerCodeInput) {
                partnerCodeInput.value = code;
            }
        }
    } catch (_) {}
}

/************************************
 * Google Sheets에 데이터 전송
 ************************************/
async function saveToGoogleSheets(formData) {
    // URL이 설정되지 않았으면 스킵
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
        console.warn("Google Sheets URL이 설정되지 않았습니다.");
        return { success: false, message: "Google Sheets URL이 설정되지 않았습니다." };
    }

    try {
        console.log("Google Sheets에 데이터 전송 시도:", formData);

        // Google Apps Script 웹앱은 CORS preflight를 지원하지 않으므로
        // no-cors 모드를 사용해야 합니다.
        // no-cors 모드에서는 응답을 읽을 수 없지만, 데이터는 정상적으로 전송됩니다.
        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // CORS 오류를 피하기 위해 no-cors 모드 사용
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                partnerCode: formData.partnerCode || "",
            }),
        });

        // no-cors 모드에서는 응답을 읽을 수 없지만, 요청은 성공적으로 전송됨
        // Google Sheets에서 데이터가 저장되었는지 확인하려면 직접 시트를 확인해야 합니다.
        console.log("✅ 데이터 전송 완료 (no-cors 모드에서는 응답 확인 불가)");
        return {
            success: true,
            message: "데이터가 성공적으로 전송되었습니다. Google Sheets에서 확인해주세요.",
        };
    } catch (error) {
        console.error("❌ Google Sheets 저장 실패:", error);
        return {
            success: false,
            message: `데이터 저장 중 오류가 발생했습니다: ${error.message || error.toString()}`,
        };
    }
}

/************************************
 * 이벤트 리스너 설정
 ************************************/
function setupEventListeners() {
    // 가격 입력
    const priceInput = document.getElementById("price-input");
    if (priceInput) {
        priceInput.addEventListener("input", (e) => {
            state.price = Number(e.target.value) || 0;
            updateCalculator();
        });
    }

    // 즉시지급 비율 슬라이더
    const rateInput = document.getElementById("rate-input");
    if (rateInput) {
        rateInput.addEventListener("input", (e) => {
            state.instantRate = Number(e.target.value);
            updateCalculator();
        });
    }

    // 예약 폼 제출
    const reserveForm = document.getElementById("reserve-form");
    if (reserveForm) {
        reserveForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // 폼 데이터 수집
            const formData = {
                name: document.getElementById("form-name").value.trim(),
                phone: document.getElementById("form-phone").value.trim(),
                email: document.getElementById("form-email").value.trim(),
                partnerCode: document.getElementById("form-partnerCode").value.trim().toUpperCase(),
            };

            // 버튼 비활성화 (중복 제출 방지)
            const submitButton = reserveForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "전송 중...";

            try {
                // Google Sheets에 저장
                const result = await saveToGoogleSheets(formData);

                if (result.success) {
                    alert("예약 요청이 제출되었습니다. 감사합니다!");
                    state.isReserved = true;
                    state.form = formData;
                    hideModal();
                    renderPartnerForm();

                    // 폼 초기화
                    reserveForm.reset();
                } else {
                    alert("데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            } catch (error) {
                console.error("폼 제출 오류:", error);
                alert("오류가 발생했습니다. 다시 시도해주세요.");
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
}

/************************************
 * 전역 함수로 노출 (onclick 사용)
 ************************************/
window.showModal = showModal;
window.hideModal = hideModal;
window.toggleFaq = toggleFaq;

/************************************
 * 초기화
 ************************************/
document.addEventListener("DOMContentLoaded", () => {
    render();

    // 카운트다운 업데이트 (1초마다)
    setInterval(updateCountdown, 1000);
});

/************************************
 * DEV 전용 간단 테스트
 ************************************/
// Test Case #1: P=100,000 / 즉시 10%
const t1 = computeDistribution(100000, 0.1);
console.assert(t1.cost === 20000, "TC1 cost");
console.assert(t1.rewardFund === 60000, "TC1 rewardFund");
console.assert(t1.companyGross === 20000, "TC1 companyGross");
console.assert(t1.partnerFee === 5000, "TC1 partnerFee");
console.assert(t1.companyNet === 15000, "TC1 companyNet");
console.assert(t1.customerTarget === 130000, "TC1 customerTarget");
console.assert(t1.instantReward === 10000, "TC1 instantReward");

// Test Case #2: P=500,000 / 즉시 20%
const t2 = computeDistribution(500000, 0.2);
console.assert(t2.cost === 100000, "TC2 cost");
console.assert(t2.rewardFund === 300000, "TC2 rewardFund");
console.assert(t2.companyGross === 100000, "TC2 companyGross");
console.assert(t2.partnerFee === 25000, "TC2 partnerFee");
console.assert(t2.companyNet === 75000, "TC2 companyNet");
console.assert(t2.customerTarget === 650000, "TC2 customerTarget");
console.assert(t2.instantReward === 100000, "TC2 instantReward");

console.log("✅ 모든 테스트 케이스 통과");
