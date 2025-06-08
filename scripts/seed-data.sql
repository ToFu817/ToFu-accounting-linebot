-- 插入測試用戶
INSERT INTO users (line_user_id, display_name) VALUES 
('U1234567890abcdef', '測試用戶A'),
('U0987654321fedcba', '測試用戶B')
ON CONFLICT (line_user_id) DO NOTHING;

-- 插入測試支出記錄
INSERT INTO expenses (user_id, category, amount, description, transaction_date, source) VALUES 
(1, '餐飲', 120.00, '午餐', '2024-01-15', 'manual'),
(1, '交通', 85.00, '捷運', '2024-01-15', 'linepay'),
(1, '購物', 1500.00, '衣服', '2024-01-14', 'manual'),
(1, '餐飲', 200.00, '晚餐', '2024-01-14', 'linepay'),
(2, '餐飲', 95.00, '早餐', '2024-01-15', 'manual');

-- 插入測試收入記錄
INSERT INTO incomes (user_id, category, amount, description, income_date) VALUES 
(1, 'salary', 45000.00, '月薪', '2024-01-01'),
(1, 'stock', 2500.00, '股息', '2024-01-10'),
(2, 'salary', 38000.00, '月薪', '2024-01-01');

-- 插入測試資產記錄
INSERT INTO assets (user_id, asset_type, asset_name, amount, record_date) VALUES 
(1, 'cash', '現金', 15000.00, '2024-01-15'),
(1, 'bank', '台新銀行', 65000.00, '2024-01-15'),
(1, 'bank', '聯邦銀行', 48000.00, '2024-01-15'),
(1, 'bank', '國泰銀行', 32000.00, '2024-01-15'),
(1, 'bank', '永豐銀行', 35000.00, '2024-01-15'),
(1, 'credit_card', '台新信用卡', -15000.00, '2024-01-15'),
(1, 'credit_card', '國泰信用卡', -10000.00, '2024-01-15');

-- 插入銀行設定
INSERT INTO bank_settings (user_id, bank_name, account_type) VALUES 
(1, '台新銀行', 'savings'),
(1, '聯邦銀行', 'savings'),
(1, '國泰銀行', 'savings'),
(1, '永豐銀行', 'savings'),
(1, '台新信用卡', 'credit'),
(1, '國泰信用卡', 'credit');

-- 插入提醒設定
INSERT INTO reminder_settings (user_id, reminder_day, reminder_time) VALUES 
(1, 1, '09:00:00'),
(2, 1, '10:00:00');

-- 插入股票記錄
INSERT INTO stock_records (user_id, stock_name, current_value, cost_value, record_date) VALUES 
(1, '台積電', 85000.00, 80000.00, '2024-01-15'),
(1, '鴻海', 35000.00, 30000.00, '2024-01-15');
