
-- 일괄 BOM 계산기 가이드 추가
-- Page: bom_detail

-- 기존 가이드 삭제 (중복 방지)
DELETE FROM "HelpGuides" WHERE page_id = 'bom_detail' AND section_id = 'batch_calc';

-- 새 가이드 삽입
INSERT INTO "HelpGuides" (page_id, section_id, title, content, icon_name, display_order)
VALUES
(
    'bom_detail',
    'batch_calc',
    '일괄 BOM 계산기 사용법',
    '배합표(Recipe)를 기준으로 1개 단위 소요량을 자동으로 계산해주는 기능입니다.\n\n1. "일괄 계산" 버튼을 누르세요.\n2. **총 생산 수량**에 한 배합으로 만들어지는 완성품의 개수를 입력하세요 (예: 케익 10개).\n3. **배합 재료 추가**에서 각 재료의 총 소요량을 입력하세요 (예: 밀가루 600g).\n4. **적용하기**를 누르면 1개당 소요량(예: 60g)이 자동 계산되어 목록에 추가됩니다.\n\n* 계산된 소요량은 재료 목록에 반영되며, 최종적으로 "변경사항 저장"을 눌러야 저장됩니다.',
    'Calculator',
    20
);
