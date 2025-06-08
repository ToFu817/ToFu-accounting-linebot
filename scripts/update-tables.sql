-- 更新支出記錄表，加入更多欄位
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 建立觸發器自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入一些測試資料
INSERT INTO users (line_user_id, display_name) 
VALUES ('test_user_123', '測試用戶') 
ON CONFLICT (line_user_id) DO NOTHING;

-- 取得測試用戶ID並插入測試支出記錄
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    SELECT id INTO test_user_id FROM users WHERE line_user_id = 'test_user_123';
    
    IF test_user_id IS NOT NULL THEN
        INSERT INTO expenses (user_id, category, amount, description, transaction_date)
        VALUES 
            (test_user_id, '午餐', 120, '便當', CURRENT_DATE),
            (test_user_id, '交通', 85, '捷運', CURRENT_DATE),
            (test_user_id, '購物', 467, '日用品', CURRENT_DATE - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
        
        INSERT INTO incomes (user_id, category, amount, income_date)
        VALUES 
            (test_user_id, 'salary', 45000, CURRENT_DATE - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
