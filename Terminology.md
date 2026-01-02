# Sobok 용어 통일 대조표 (Terminology Mapping)

이 문서는 프로젝트 내에서 사용되는 주요 용어의 영문명(Code/DB)과 한글명(UI)을 정의합니다.
이 파일을 수정하여 용어를 확정해 주시면, 시스템 전체에 일괄 적용하겠습니다.

## 1. 페이지 및 주요 기능 (Pages & Features)
| 영문명 (Code/DB) | 한글명 (UI 표기) | 비고 |
| :--- | :--- | :--- |
| **Dashboard** | 대시보드 | 메인 화면 |
| **Items** | 제품 관리 | 기존: 품목 및 원가 관리 |
| **Orders** | 주문 관리 | |
| **Expenses** | 지출 관리 | 기존: 지출 내역 관리 |
| **InventoryCheck** | 재고 관리 | Inventory Audit 혼용 주의 |
| **Profit** | 수익 분석 | 기존: 마진율 분석 |
| **Config** | 환경 설정 | 기존: 주문서 디자인 설정 |
| **BOMDetail** | 재료 관리 | BOM (Bill of Materials) |

## 2. 품목 유형 (Item Types)
| 영문명 (Code) | 한글명 (UI/Guide) | 비고 |
| :--- | :--- | :--- |
| **Product** | 제품 | 고객에게 판매 (Sell) |
| **Material** | 재료 | 구매하여 사용 (Buy) |
| **Component** | 반제품 | 매장에서 만듦 (Make) |

## 3. 주문 상태 (Order Status)
| 영문명 (Code) | 한글명 (UI) | 비고 |
| :--- | :--- | :--- |
| **Pending** | 신규 | 접수 대기와 혼용 중 |
| **Processing** | 확인 | 접수됨과 혼용 중 |
| **Completed** | 완료 | |
| **Cancelled** | 취소 | |

## 4. 재무 용어 (Financial)
| 영문명 (Code) | 한글명 (UI/Guide) | 비고 |
| :--- | :--- | :--- |
| **Revenue** | 매출 | Total Amount |
| **Cost Price** | 원가 | 매입 단가와 혼용 중 |
| **Margin** | 이익 | 마진과 혼용 중 |
| **Fixed Cost** | 고정비 | |
| **Variable Cost** | 변동비 | |
| **BEP** | 손익분기점 | |

## 5. 재고 용어 (Inventory)
| 영문명 (Code) | 한글명 (UI) | 비고 |
| :--- | :--- | :--- |
| **Stock** | 재고 | 전산 재고 |
| **Loss** | 손실 | 차이(Difference)와 혼용 중 |
| **Adjustment** | 조정 | |
