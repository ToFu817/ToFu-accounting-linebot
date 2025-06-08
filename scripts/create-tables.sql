-- 創建用戶表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建支出記錄表
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'manual', -- manual, linepay, auto
    line_pay_transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建收入記錄表
CREATE TABLE IF NOT EXISTS incomes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(100) NOT NULL, -- salary, stock, other
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    income_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建資產記錄表
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    asset_type VARCHAR(50) NOT NULL, -- cash, bank, stock, credit_card, etc.
    asset_name VARCHAR(100) NOT NULL, -- 台新銀行, 國泰銀行, etc.
    amount DECIMAL(12,2) NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建銀行設定表
CREATE TABLE IF NOT EXISTS bank_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bank_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- savings, credit, investment
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建提醒設定表
CREATE TABLE IF NOT EXISTS reminder_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reminder_day INTEGER NOT NULL, -- 每月第幾天提醒 (1-31)
    reminder_time TIME NOT NULL, -- 提醒時間
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建股票記錄表
CREATE TABLE IF NOT EXISTS stock_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    stock_name VARCHAR(100) NOT NULL,
    current_value DECIMAL(12,2) NOT NULL,
    cost_value DECIMAL(12,2) NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON incomes(user_id, income_date);
CREATE INDEX IF NOT EXISTS idx_assets_user_date ON assets(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_stock_records_user_date ON stock_records(user_id, record_date);
