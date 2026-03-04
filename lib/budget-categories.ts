export const BUDGET_CATEGORIES = [
  '인건비',       // 연구보조원, RA 인건비
  '장비비',       // 실험 장비, 기자재 구매
  '재료비',       // 소모품, 실험 재료
  '여비',         // 출장비, 교통비, 숙박비
  '전산처리비',   // 소프트웨어, 클라우드, 라이선스
  '인쇄출판비',   // 논문 게재료, 자료 인쇄
  '학술활동비',   // 학회 등록비, 세미나
  '위탁연구비',   // 외부 기관 위탁
  '기타',         // 위 분류 외
] as const

export type BudgetCategory = typeof BUDGET_CATEGORIES[number]
