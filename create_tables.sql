-- SQL schema for the Restaurant project (MySQL)
-- Run this in your MySQL server (adjust database name as needed)

CREATE DATABASE IF NOT EXISTS `restaurant` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `restaurant`;

-- Users: clients and admins
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role ENUM('client','admin') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menu items (optional)
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders table: each order references a client and stores items as JSON
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  items JSON NOT NULL, -- example: [{"id":1, "name":"Rice", "quantity":2, "price":3.5}, ...]
  total DECIMAL(10,2) NOT NULL,
  status ENUM('received','preparing','complete','cancelled') NOT NULL DEFAULT 'received',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional detailed order items table if you want normalized structure
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT,
  name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Example seed (create an admin user, adjust id/password_hash accordingly)
INSERT INTO users (id, name, email, password_hash, role)
VALUES ('admin-1', 'Administrator', 'admin@example.com', 'PLACEHOLDER_HASH', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Example sample order (using JSON for items)
INSERT INTO orders (client_id, items, total, status)
VALUES ('client-1', JSON_ARRAY(JSON_OBJECT('name','Sample Rice','quantity',2,'price',3.5)), 7.00, 'received');
