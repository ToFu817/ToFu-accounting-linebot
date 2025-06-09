-- 建立用戶表（增強版）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  disclaimer_accepted BOOLEAN DEFAULT FALSE,
  setup_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立科目項目表
CREATE TABLE IF NOT EXISTS account_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL, -- 大分類：錢包、銀行存款等
  subcategory VARCHAR(255), -- 小分類：國泰證券、台新證券等
  name VARCHAR(255) NOT NULL, -- 科目名稱：現金、股票成本等
  amount DECIMAL(15,2) DEFAULT 0, -- 金額
  type VARCHAR(20) CHECK (type IN ('asset', 'liability', 'income', 'expense')) NOT NULL,
  subtype VARCHAR(50), -- 子類型：current, long_term, fixed, variable等
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立交易記錄表
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_item_id INTEGER REFERENCES account_items(id),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('income', 'expense', 'transfer')) NOT NULL,
  source VARCHAR(50) DEFAULT 'manual', -- manual, linepay, auto
  line_pay_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立月度快照表（用於計算未知支出）
CREATE TABLE IF NOT EXISTS monthly_snapshots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL, -- 月份（每月1號）
  total_assets DECIMAL(15,2) DEFAULT 0,
  total_liabilities DECIMAL(15,2) DEFAULT 0,
  net_assets DECIMAL(15,2) DEFAULT 0,
  monthly_income DECIMAL(15,2) DEFAULT 0,
  monthly_expenses DECIMAL(15,2) DEFAULT 0,
  unknown_expenses DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- 建立股票基金記錄表
CREATE TABLE IF NOT EXISTS investment_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_item_id INTEGER REFERENCES account_items(id),
  investment_type VARCHAR(20) CHECK (investment_type IN ('stock', 'fund')) NOT NULL,
  cost_amount DECIMAL(15,2) DEFAULT 0, -- 成本
  current_value DECIMAL(15,2) DEFAULT 0, -- 現值
  unrealized_gain_loss DECIMAL(15,2) GENERATED ALWAYS AS (current_value - cost_amount) STORED, -- 未實現損益
  record_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_account_items_user_type ON account_items(user_id, type);
CREATE INDEX IF NOT EXISTS idx_account_items_category ON account_items(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_item_id);
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_user_date ON monthly_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_investment_records_user_date ON investment_records(user_id, record_date);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_account_items_updated_at BEFORE UPDATE ON account_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入預設科目結構
INSERT INTO account_items (user_id, category, subcategory, name, type, sort_order) VALUES
-- 資產類
(1, '錢包', NULL, '現金', 'asset', 1),
(1, '錢包', NULL, '悠遊卡', 'asset', 2),
(1, '錢包', NULL, 'LINE PAY MONEY', 'asset', 3),
(1, '銀行存款', NULL, '郵局', 'asset', 4),
(1, '銀行存款', NULL, '台新', 'asset', 5),
(1, '銀行存款', NULL, '國泰', 'asset', 6),
(1, '存出保證金', NULL, '房屋押金', 'asset', 7),
(1, '股票及基金', '國泰證券', '股票成本', 'asset', 8),
(1, '股票及基金', '國泰證券', '股票現值', 'asset', 9),
(1, '股票及基金', '台新證券', '基金成本', 'asset', 10),
(1, '股票及基金', '台新證券', '基金現值', 'asset', 11),
(1, '應收股票款', NULL, '台新', 'asset', 12),
(1, '應收股票款', NULL, '國泰', 'asset', 13),

-- 負債類
(1, '流動負債', '應付信用卡款', '國泰', 'liability', 14),
(1, '流動負債', '應付信用卡款', '台新', 'liability', 15),
(1, '流動負債', '應付股票款', '台新', 'liability', 16),
(1, '流動負債', '應付股票款', '國泰', 'liability', 17),
(1, '流動負債', '欠款', '王X明', 'liability', 18),
(1, '流動負債', '欠款', '林X華', 'liability', 19),
(1, '長期負債', '貸款', '學貸', 'liability', 20),
(1, '長期負債', '貸款', '房貸', 'liability', 21),

-- 收入類
(1, '本月總收入', NULL, '薪資', 'income', 22),
(1, '本月總收入', NULL, '租金', 'income', 23),
(1, '本月總收入', NULL, '股票', 'income', 24),
(1, '本月總收入', NULL, '其他', 'income', 25),

-- 支出類
(1, '固定支出', NULL, '保險費', 'expense', 26),
(1, '固定支出', NULL, '房租', 'expense', 27),
(1, '固定支出', NULL, '電話費', 'expense', 28),
(1, '固定支出', NULL, '學貸', 'expense', 29),
(1, '變動支出', '已知變動支出', '伙食費', 'expense', 30),
(1, '變動支出', '已知變動支出', '購物花費', 'expense', 31),
(1, '變動支出', '已知變動支出', '出遊', 'expense', 32),
(1, '變動支出', '已知變動支出', '交際費', 'expense', 33),
(1, '變動支出', '已知變動支出', '股票及基金未實現損益', 'expense', 34),
(1, '變動支出', NULL, '未知支出', 'expense', 35)
ON CONFLICT DO NOTHING;
