CREATE TABLE IF NOT EXISTS "accounts" (
    "id" text NOT NULL,
    "userId" text NOT NULL DEFAULT NULL,
    "type" text NOT NULL DEFAULT NULL,
    "provider" text NOT NULL DEFAULT NULL,
    "providerAccountId" text NOT NULL DEFAULT NULL,
    "refresh_token" text DEFAULT NULL,
    "access_token" text DEFAULT NULL,
    "expires_at" number DEFAULT NULL,
    "token_type" text DEFAULT NULL,
    "scope" text DEFAULT NULL,
    "id_token" text DEFAULT NULL,
    "session_state" text DEFAULT NULL,
    "oauth_token_secret" text DEFAULT NULL,
    "oauth_token" text DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL DEFAULT NULL,
    "expires" datetime NOT NULL DEFAULT NULL,
    PRIMARY KEY (sessionToken)
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" text NOT NULL DEFAULT '',
    "name" text DEFAULT NULL,
    "email" text DEFAULT NULL,
    "emailVerified" datetime DEFAULT NULL,
    "image" text DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" text NOT NULL,
    "token" text NOT NULL DEFAULT NULL,
    "expires" datetime NOT NULL DEFAULT NULL,
    PRIMARY KEY (token)
);


-- Webhook 日志表，用于存储接收到的 webhook 数据
CREATE TABLE IF NOT EXISTS "webhook_logs" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webhook_type text NOT NULL DEFAULT 'wallet', -- webhook 类型
    raw_body text NOT NULL, -- 完整的 JSON body
    headers text, -- 请求头信息 (JSON格式)
    method text NOT NULL DEFAULT 'POST', -- HTTP 方法
    ip_address text, -- 请求来源 IP
    user_agent text, -- User-Agent
    processed_at datetime, -- 处理时间
    status text NOT NULL DEFAULT 'pending', -- pending, processed, failed
    error_message text, -- 错误信息
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
