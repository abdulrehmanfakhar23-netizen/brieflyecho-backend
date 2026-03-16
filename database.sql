-- Run this in MySQL Workbench or CLI
CREATE DATABASE IF NOT EXISTS brieflyecho;
USE brieflyecho;

CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO news (title, category, content, image_url) VALUES
('Welcome to BrieflyEcho!', 'General', 'This is your first news post. Start sharing news with the world!', NULL),
('Breaking: Tech Giants Announce AI Collaboration', 'Technology', 'Major tech companies have joined forces to develop next-generation AI tools that will reshape industries worldwide.', NULL);
