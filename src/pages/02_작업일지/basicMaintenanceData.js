// 화면 구현 단계의 기본정비 코드입니다. API 연결 시 이 배열만 조회 데이터로 교체합니다.
export const BASIC_MAINTENANCE_CATEGORIES = [
  { value: 'm_cate1', label: '정형작업' },
  {
    value: 'm_cate2',
    label: '차체고정',
    items: [
      { value: 'X0101', label: 'Car-Oliner', defValue: '0.5' },
      { value: 'X0102', label: 'Car-Oliner(엔진-뒤서스펜션탈거시)', defValue: '0.3' },
      { value: 'X0103', label: 'Data liner', defValue: '0.3' },
    ],
  },
  {
    value: 'm_cate3',
    label: '차체계측',
    items: [
      { value: 'X0201', label: '차체 2D계측', defValue: '0.8' },
      { value: 'X0202', label: '차체 3D계측', defValue: '0.7' },
      { value: 'X0203', label: '이동형(리프팅포함)', defValue: '0.7' },
    ],
  },
  {
    value: 'm_cate4',
    label: '차체수정',
    items: [
      { value: 'X0301', label: '수리 전 기초정형', defValue: '0.8' },
      { value: 'X0302', label: '양면 스폿 용접(패널당)', defValue: '0.8' },
      { value: 'X0303', label: '수정작업(프레임 수정기 비용별도)', defValue: '0.7' },
    ],
  },
  {
    value: 'm_cate5',
    label: '시운전',
    items: [
      { value: 'X0401', label: '진단 시운전', defValue: '0.8' },
      { value: 'X0402', label: '작업 시운전', defValue: '0.3' },
      { value: 'A0403', label: '출고 시운전', defValue: '0.5' },
    ],
  },
  {
    value: 'm_cate6',
    label: '세차',
    items: [
      { value: 'X0501', label: '세차-내부', defValue: '0.2' },
      { value: 'X0502', label: '세차-외부', defValue: '0.5' },
      { value: 'A0503', label: '세차-전체', defValue: '0.2' },
    ],
  },
]
