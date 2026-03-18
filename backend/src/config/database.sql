-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS whatsapp_greeting;

USE whatsapp_greeting;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create greetings table (for storing greeting messages)
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


-- Create WhatsApp session table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  whatsapp_number VARCHAR(20),
  status VARCHAR(20) DEFAULT 'disconnected',
  session_data TEXT NULL,
  last_connected TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_session (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sender_number VARCHAR(20),
  sender_name VARCHAR(255),
    message_text TEXT,
    direction ENUM('incoming','outgoing'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If the table already exists without the unique key, add it:
-- ALTER TABLE whatsapp_sessions ADD UNIQUE KEY unique_user_session (user_id);