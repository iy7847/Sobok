-- 01_update_guides.sql
-- 지출 관리(Expenses) 및 수익 시뮬레이션(Profit) 페이지의 가이드 내용을 업데이트합니다.
-- 기존 내용은 DELETE 후 INSERT 하는 방식으로 갱신합니다.

-- 1. 기존 가이드 삭제 (Expenses & Profit)
DELETE FROM "HelpGuides" WHERE page_id IN ('expenses', 'profit_analysis');

-- 2. 새로운 가이드 추가

-- [지출 관리 (Expenses)]
-- 이제 '월간 손익 결산' 기능이 통합되었음을 강조합니다.
INSERT INTO "HelpGuides" (page_id, section_id, title, content, icon_name, display_order) VALUES
('expenses', 'overview', '월간 손익 결산 (New)', '이제 지출 관리에서 **이번 달 실제 순수익**을 바로 확인할 수 있습니다.\n주문 관리에서 집계된 [총 매출]과 이곳에 입력한 [총 지출]을 자동으로 합산하여 보여줍니다.', 'Sparkles', 1),
('expenses', 'how_to', '사용 방법', '가게 운영에 사용된 모든 비용(재료비, 월세, 공과금 등)을 빠짐없이 입력하세요.\n영수증을 모아두었다가 한 번에 입력하거나, 고정비를 설정하여 매달 자동으로 생성할 수도 있습니다.', 'Receipt', 2),
('expenses', 'tips', '정확한 계산 팁', '매출은 [주문 관리]의 완료된 주문을 기준으로 합니다.\n따라서 주문 현황을 꼼꼼히 업데이트해주셔야 정확한 손익 결산이 가능합니다.', 'CheckCircle', 3);

-- [수익 시뮬레이션 (Profit)]
-- 이 페이지가 '예측(Simulation)' 용도임을 명확히 합니다.
INSERT INTO "HelpGuides" (page_id, section_id, title, content, icon_name, display_order) VALUES
('profit_analysis', 'intro', '수익 시뮬레이션', '이곳은 **미래 전략을 세우기 위한 예측 공간**입니다.\n현재 설정된 BOM(표준 원가)을 기준으로, "가격을 올리면?", "목표 매출을 달성하려면?"과 같은 가정을 테스트해볼 수 있습니다.', 'TrendingUp', 1),
('profit_analysis', 'warning', '주의사항', '이 페이지의 수익은 **이론적인 예측치**이며, 실제 통장 잔고와는 다를 수 있습니다.\n정확한 실제 수익은 [지출 관리] 메뉴의 월간 결산을 참고해주세요.', 'AlertTriangle', 2),
('profit_analysis', 'usage', '활용 가이드', '1. **목표 역산**: 목표 수익을 달성하기 위해 하루에 얼마나 팔아야 할지 계산해보세요.\n2. **가격 조정**: 판매가를 변경했을 때 마진율이 어떻게 변하는지 시뮬레이션 해보세요.', 'Target', 3);
