-- Migration: Remove full_name column if it exists, add phone column if needed

-- Remove full_name column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS full_name;

-- Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Ensure greeting_messages has the fields required by the frontend
CREATE TABLE IF NOT EXISTS greeting_messages (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT UNSIGNED NOT NULL,
	title VARCHAR(255) NOT NULL,
	trigger_keyword VARCHAR(255) NOT NULL,
	reply_message TEXT NOT NULL,
	is_active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY unique_user_trigger_keyword (user_id, trigger_keyword),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE greeting_messages ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Greeting Message' AFTER user_id;
ALTER TABLE greeting_messages MODIFY COLUMN trigger_keyword VARCHAR(255) NOT NULL;
ALTER TABLE greeting_messages MODIFY COLUMN reply_message TEXT NOT NULL;
ALTER TABLE greeting_messages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Drop any legacy unique index that enforces global uniqueness on trigger_keyword only
SET @single_trigger_unique_index := (
	SELECT index_name
	FROM information_schema.statistics
	WHERE table_schema = DATABASE()
		AND table_name = 'greeting_messages'
		AND non_unique = 0
	GROUP BY index_name
	HAVING COUNT(*) = 1
		AND SUM(column_name = 'trigger_keyword') = 1
	LIMIT 1
);

SET @drop_single_trigger_unique_sql := IF(
	@single_trigger_unique_index IS NOT NULL,
	CONCAT('ALTER TABLE greeting_messages DROP INDEX `', @single_trigger_unique_index, '`'),
	'SELECT 1'
);

PREPARE stmt FROM @drop_single_trigger_unique_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure per-user uniqueness exists
SET @has_unique_user_trigger_keyword := (
	SELECT COUNT(*)
	FROM information_schema.statistics
	WHERE table_schema = DATABASE()
		AND table_name = 'greeting_messages'
		AND index_name = 'unique_user_trigger_keyword'
);

SET @add_unique_user_trigger_sql := IF(
	@has_unique_user_trigger_keyword = 0,
	'ALTER TABLE greeting_messages ADD UNIQUE KEY unique_user_trigger_keyword (user_id, trigger_keyword)',
	'SELECT 1'
);

PREPARE stmt FROM @add_unique_user_trigger_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure message_logs can store sender display name without requiring a contacts table
ALTER TABLE message_logs ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255) AFTER sender_number;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT UNSIGNED NOT NULL,
	token_hash CHAR(64) NOT NULL UNIQUE,
	expires_at TIMESTAMP NOT NULL,
	is_used BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_password_reset_user_id (user_id),
	INDEX idx_password_reset_expires_at (expires_at),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Display table structure to verify
DESCRIBE users;
