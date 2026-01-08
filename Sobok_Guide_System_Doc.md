# Sobok 가이드 시스템 아키텍처 문서

이 문서는 Sobok 프로젝트에 구현된 **데이터베이스 기반 가이드 시스템 (Database-Driven Guide System)**의 구조와 사용법을 설명합니다. 추후 가이드 내용을 업데이트하거나 시스템을 확장할 때 이 문서를 참고하십시오.

## 1. 개요 (Overview)
이 시스템은 애플리케이션의 도움말(가이드) 콘텐츠를 소스 코드가 아닌 **Supabase 데이터베이스**에서 관리하도록 설계되었습니다. 이를 통해 코드를 재배포하지 않고도 가이드 문구, 순서, 아이콘 등을 자유롭게 수정할 수 있습니다.

## 2. 데이터베이스 구조 (Database Schema)

### 테이블: `HelpGuides`
모든 가이드 콘텐츠는 이 테이블에 저장됩니다.

| 컬럼명 | 타입 | 설명 | 비고 |
| --- | --- | --- | --- |
| `id` | bigint | 고유 ID | PK, Auto-increment |
| `page_id` | text | 페이지 식별자 | 예: `dashboard`, `items` |
| `section_id` | text | 섹션 식별자 | 예: `overview`, `add_item` |
| `title` | text | 가이드 제목 | |
| `content` | text | 가이드 본문 내용 | 줄바꿈(\n) 지원 |
| `icon_name` | text | 아이콘 이름 | Lucide React 아이콘 이름 (예: `Box`, `Settings`) |
| `display_order` | integer | 정렬 순서 | 오름차순 정렬 |

### 초기 데이터 및 스키마 스크립트
- **파일 위치**: `d:\06_Coding\AntiGravity\Sobok\supabase\schema\00_create_help_guides.sql`
- **역활**: 테이블 생성, RLS 정책 설정, 초기 가이드 데이터(Seed Data) 입력.
- **업데이트 방법**: 가이드 내용을 변경하려면 위 SQL 파일의 `INSERT` 구문을 수정한 후 Supabase SQL Editor에서 실행하십시오.
- **추가 업데이트 (2026.01.06)**: `d:\06_Coding\AntiGravity\Sobok\supabase\schema\01_update_guides.sql` 파일을 통해 지출 관리 및 수익 시뮬레이션 가이드가 갱신되었습니다.
- **추가 업데이트 (2026.01.09)**: `d:\06_Coding\AntiGravity\Sobok\supabase\schema\02_update_bom_guide.sql` 파일을 통해 일괄 BOM 계산기 가이드가 추가되었습니다.

## 3. 프론트엔드 아키텍처 (Frontend Architecture)

### 3.1 Custom Hook: `useGuide`
- **위치**: `react/src/hooks/useGuide.ts`
- **기능**: `page_id`를 입력받아 해당 페이지의 가이드 목록을 `display_order` 순으로 가져옵니다.

### 3.2 UI 컴포넌트

#### `GuideButton`
- **위치**: `react/src/components/common/GuideButton.tsx`
- **기능**: 페이지 타이틀 옆에 위치하는 통일된 스타일의 도움말 버튼 (?) 입니다.
- **사용법**:
  ```tsx
  <GuideButton onClick={() => setShowGuide(true)} className="..." />
  ```

#### `GuideModal`
- **위치**: `react/src/components/common/GuideModal.tsx`
- **기능**: 실제 가이드 내용을 보여주는 모달 창입니다. DB에서 가져온 `icon_name` 문자열을 실제 `Lucide` 아이콘 컴포넌트로 동적 매핑하며, `\n` 문자를 실제 줄바꿈(`<br />`)으로 변환하여 렌더링합니다.
- **사용법**:
  ```tsx
  <GuideModal
      isOpen={showGuide}
      onClose={() => setShowGuide(false)}
      pageId="dashboard" // DB의 page_id와 일치해야 함
      title="대시보드 가이드"
  />
  ```

## 4. 새로운 페이지에 가이드 추가하는 법 (How to Add Guide)

새로운 페이지(예: `AnalysisPage`)에 가이드를 추가하려면 다음 단계를 따르세요.

### 1단계: DB에 데이터 추가
`supabase/schema/00_create_help_guides.sql` 파일에 데이터를 추가하고 실행합니다.

```sql
insert into "HelpGuides" (page_id, section_id, title, content, icon_name, display_order) values
('analysis', 'intro', '분석 개요', '분석 페이지에 대한 설명입니다.', 'PieChart', 1);
```

### 2단계: React 페이지 수정
해당 페이지 파일(`Analysis.tsx`)을 열고 컴포넌트를 연결합니다.

1. **상태 추가**:
   ```tsx
   const [showGuide, setShowGuide] = useState(false);
   ```
2. **Import**:
   ```tsx
   import { GuideButton } from '../components/common/GuideButton';
   import { GuideModal } from '../components/common/GuideModal';
   ```
3. **버튼 배치**: 타이틀 옆에 버튼을 둡니다.
   ```tsx
   <h1>페이지 제목 <GuideButton onClick={() => setShowGuide(true)} /></h1>
   ```
4. **모달 배치**: 페이지 최하단(return 문 닫기 직전)에 모달을 둡니다.
   ```tsx
   <GuideModal
       isOpen={showGuide}
       onClose={() => setShowGuide(false)}
       pageId="analysis" // 위에서 넣은 page_id
       title="분석 도움말"
   />
   ```

## 5. 현재 적용된 페이지 목록 (Current Integrations)
현재 다음 페이지들에 가이드 시스템이 적용되어 있습니다.

- **Dashboard** (`page_id`: `dashboard`)
- **Items** (`page_id`: `items`)
- **Orders** (`page_id`: `orders`)
- **Expenses** (`page_id`: `expenses`)
- **InventoryCheck** (`page_id`: `inventory_check`)
- **Config** (`page_id`: `config`)
- **BOMDetail** (`page_id`: `bom_detail`)
- **Profit** (`page_id`: `profit_analysis`)
