-- 插入測試用戶
INSERT INTO users (line_user_id, display_name) VALUES 
('test_user_1', '測試用戶1'),
('test_user_2', '測試用戶2')
ON CONFLICT (line_user_id) DO NOTHING;

-- 插入測試資產數據
INSERT INTO assets (user_id, category, amount, asset_type) VALUES 
(1, '現金', 15000, 'asset'),
(1, '台新銀行', 65000, 'asset'),
(1, '聯邦銀行', 48000, 'asset'),
(1, '股票現值', 120000, 'asset'),
(1, '信用卡債', 25000, 'debt')
ON CONFLICT DO NOTHING;

-- 插入測試支出數據
INSERT INTO expenses (user_id, category, amount, description, transaction_date) VALUES 
(1, '餐飲', 8500, '各種餐費', '2024-01-15'),
(1, '交通', 3200, '捷運、公車', '2024-01-14'),
(1, '購物', 6800, '日用品', '2024-01-13'),
(1, '娛樂', 2400, '電影、遊戲', '2024-01-12'),
(1, '其他', 4780, '雜項支出', '2024-01-11')
ON CONFLICT DO NOTHING;

-- 插入測試收入數據
INSERT INTO incomes (user_id, category, amount, income_date) VALUES 
(1, '薪資', 45000, '2024-01-01'),
(1, '股票收益', 5000, '2024-01-10'),
(1, '其他收入', 2000, '2024-01-15')
ON CONFLICT DO NOTHING;
