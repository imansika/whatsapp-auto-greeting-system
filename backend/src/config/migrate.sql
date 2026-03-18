-- Migration: Remove full_name column if it exists, add phone column if needed

-- Remove full_name column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS full_name;

-- Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Ensure greeting_messages has the fields required by the frontend
CREATE TABLE IF NOT EXISTS greeting_messages (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	title VARCHAR(255) NOT NULL,
	trigger_keyword TEXT,
	reply_message TEXT NOT NULL,
	is_active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE greeting_messages ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Greeting Message' AFTER user_id;
ALTER TABLE greeting_messages MODIFY COLUMN trigger_keyword TEXT;
ALTER TABLE greeting_messages MODIFY COLUMN reply_message TEXT NOT NULL;
ALTER TABLE greeting_messages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Ensure message_logs can store sender display name without requiring a contacts table
ALTER TABLE message_logs ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255) AFTER sender_number;

-- Display table structure to verify
DESCRIBE users;
