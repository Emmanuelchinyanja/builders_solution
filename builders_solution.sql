-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 22, 2025 at 02:33 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `builders_solution`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_process_sale` (IN `p_customer_id` INT, IN `p_staff_id` INT, IN `p_payment_method` VARCHAR(20), IN `p_payment_phone` VARCHAR(20), OUT `p_order_number` VARCHAR(20), OUT `p_token_code` VARCHAR(8))   BEGIN
    DECLARE v_transaction_id INT;
    DECLARE v_order_num VARCHAR(20);
    DECLARE v_token VARCHAR(8);
    
    -- Generate order number
    SET v_order_num = CONCAT('ORD', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    
    -- Insert transaction
    INSERT INTO sales_transactions (order_number, customer_id, staff_id, total_amount, payment_method, payment_phone, status)
    VALUES (v_order_num, p_customer_id, p_staff_id, 0, p_payment_method, p_payment_phone, 'paid');
    
    SET v_transaction_id = LAST_INSERT_ID();
    
    -- Generate token
    SET v_token = UPPER(CONCAT(
        CHAR(65 + FLOOR(RAND() * 26)),
        CHAR(65 + FLOOR(RAND() * 26)),
        CHAR(65 + FLOOR(RAND() * 26)),
        FLOOR(RAND() * 10),
        FLOOR(RAND() * 10),
        FLOOR(RAND() * 10),
        FLOOR(RAND() * 10),
        FLOOR(RAND() * 10)
    ));
    
    -- Insert token
    INSERT INTO payment_tokens (token_code, transaction_id, customer_id, expires_at)
    VALUES (v_token, v_transaction_id, p_customer_id, DATE_ADD(NOW(), INTERVAL 14 DAY));
    
    SET p_order_number = v_order_num;
    SET p_token_code = v_token;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_stock` (IN `p_product_id` INT, IN `p_quantity` INT, IN `p_movement_type` VARCHAR(20), IN `p_user_id` INT)   BEGIN
    -- Update product stock
    IF p_movement_type IN ('sale', 'adjustment') THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - p_quantity,
            updated_at = NOW()
        WHERE product_id = p_product_id;
    ELSE
        UPDATE products 
        SET stock_quantity = stock_quantity + p_quantity,
            updated_at = NOW()
        WHERE product_id = p_product_id;
    END IF;
    
    -- Record movement
    INSERT INTO stock_movements (product_id, movement_type, quantity, performed_by)
    VALUES (p_product_id, p_movement_type, p_quantity, p_user_id);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `audit_trail`
--

CREATE TABLE `audit_trail` (
  `audit_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_feedback`
--

CREATE TABLE `customer_feedback` (
  `feedback_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `feedback_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `response` text DEFAULT NULL,
  `responded_by` int(11) DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_orders`
--

CREATE TABLE `inventory_orders` (
  `order_id` int(11) NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `expected_delivery` date DEFAULT NULL,
  `actual_delivery` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','in_transit','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_order_items`
--

CREATE TABLE `inventory_order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_tokens`
--

CREATE TABLE `payment_tokens` (
  `token_id` int(11) NOT NULL,
  `token_code` varchar(8) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `used_at` datetime DEFAULT NULL,
  `used_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) NOT NULL DEFAULT 10,
  `icon` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `category`, `description`, `price`, `stock_quantity`, `low_stock_alert`, `icon`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'Cement 50kg', 'cement', 'High quality cement for construction', '45000.00', 200, 50, '🏗️', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(2, 'Red Bricks', 'bricks', 'Standard red building bricks', '350.00', 5000, 1000, '🧱', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(3, 'Roofing Sheets', 'roofing', 'Galvanized iron roofing sheets', '25000.00', 150, 30, '🏠', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(4, 'Timber 4x2', 'timber', '4x2 treated timber', '8000.00', 80, 20, '🪵', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(5, 'White Paint 20L', 'paint', 'Interior/exterior white paint', '35000.00', 45, 10, '🎨', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(6, 'Hammer', 'tools', 'Claw hammer with wooden handle', '15000.00', 30, 5, '🔨', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(7, 'Nails 1kg', 'tools', 'Assorted nails 1kg pack', '5000.00', 100, 20, '📌', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1),
(8, 'Sand per trip', 'cement', 'River sand for construction', '80000.00', 25, 5, '⛱️', '2025-12-22 13:29:57', '2025-12-22 13:29:57', 1);

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `quotation_id` int(11) NOT NULL,
  `quotation_number` varchar(20) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('draft','sent','accepted','rejected','expired') NOT NULL DEFAULT 'draft',
  `valid_until` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_items`
--

CREATE TABLE `quotation_items` (
  `quotation_item_id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_transactions`
--

CREATE TABLE `sales_transactions` (
  `transaction_id` int(11) NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','mobile','bank','airtel','tnm','card') NOT NULL,
  `payment_phone` varchar(20) DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','paid','completed','cancelled') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `sale_item_id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `sale_items`
--
DELIMITER $$
CREATE TRIGGER `tr_update_transaction_total` AFTER INSERT ON `sale_items` FOR EACH ROW BEGIN
    UPDATE sales_transactions
    SET total_amount = (
        SELECT SUM(subtotal)
        FROM sale_items
        WHERE transaction_id = NEW.transaction_id
    )
    WHERE transaction_id = NEW.transaction_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `movement_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('sale','purchase','adjustment','return') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `performed_by` int(11) NOT NULL,
  `movement_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `supplier_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `products_supplied` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `supplier_name`, `contact_person`, `phone`, `email`, `address`, `products_supplied`, `created_at`, `is_active`) VALUES
(1, 'ABC Building Supplies', 'John Banda', '+265888123456', 'abc@suppliers.com', 'Area 23, Lilongwe', 'Cement, Bricks', '2025-12-22 13:29:57', 1),
(2, 'Quality Roofing Ltd', 'Mary Phiri', '+265999234567', 'quality@roofing.com', 'Industrial Area, Blantyre', 'Roofing Sheets', '2025-12-22 13:29:57', 1),
(3, 'Timber Traders', 'Peter Mwale', '+265888345678', 'timber@traders.com', 'Mzuzu', 'Timber, Wood Products', '2025-12-22 13:29:57', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','staff','manager','auditor') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `phone`, `role`, `created_at`, `last_login`, `is_active`) VALUES
(1, 'customer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Banda', 'john@example.com', '+265888123456', 'customer', '2025-12-22 13:29:57', NULL, 1),
(2, 'staff', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary Phiri', 'mary@builders.com', '+265999234567', 'staff', '2025-12-22 13:29:57', NULL, 1),
(3, 'manager', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Peter Mwale', 'peter@builders.com', '+265888345678', 'manager', '2025-12-22 13:29:57', NULL, 1),
(4, 'auditor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grace Tembo', 'grace@builders.com', '+265999456789', 'auditor', '2025-12-22 13:29:57', NULL, 1);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `tr_audit_user_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_trail (user_id, action, table_name, record_id, old_value, new_value)
    VALUES (NEW.user_id, 'UPDATE', 'users', NEW.user_id, 
            JSON_OBJECT('username', OLD.username, 'role', OLD.role),
            JSON_OBJECT('username', NEW.username, 'role', NEW.role));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_active_tokens`
-- (See below for the actual view)
--
CREATE TABLE `v_active_tokens` (
`token_code` varchar(8)
,`created_at` timestamp
,`expires_at` datetime
,`customer_name` varchar(100)
,`customer_phone` varchar(20)
,`order_number` varchar(20)
,`total_amount` decimal(10,2)
,`status` enum('pending','paid','completed','cancelled')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_customer_orders`
-- (See below for the actual view)
--
CREATE TABLE `v_customer_orders` (
`transaction_id` int(11)
,`order_number` varchar(20)
,`customer_name` varchar(100)
,`customer_phone` varchar(20)
,`total_amount` decimal(10,2)
,`payment_method` enum('cash','mobile','bank','airtel','tnm','card')
,`status` enum('pending','paid','completed','cancelled')
,`transaction_date` timestamp
,`token_code` varchar(8)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_daily_sales`
-- (See below for the actual view)
--
CREATE TABLE `v_daily_sales` (
`sale_date` date
,`total_transactions` bigint(21)
,`total_sales` decimal(32,2)
,`payment_method` enum('cash','mobile','bank','airtel','tnm','card')
,`status` enum('pending','paid','completed','cancelled')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_low_stock_products`
-- (See below for the actual view)
--
CREATE TABLE `v_low_stock_products` (
`product_id` int(11)
,`product_name` varchar(100)
,`category` varchar(50)
,`stock_quantity` int(11)
,`low_stock_alert` int(11)
,`price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Structure for view `v_active_tokens`
--
DROP TABLE IF EXISTS `v_active_tokens`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_active_tokens`  AS SELECT `pt`.`token_code` AS `token_code`, `pt`.`created_at` AS `created_at`, `pt`.`expires_at` AS `expires_at`, `u`.`full_name` AS `customer_name`, `u`.`phone` AS `customer_phone`, `st`.`order_number` AS `order_number`, `st`.`total_amount` AS `total_amount`, `st`.`status` AS `status` FROM ((`payment_tokens` `pt` join `users` `u` on(`pt`.`customer_id` = `u`.`user_id`)) join `sales_transactions` `st` on(`pt`.`transaction_id` = `st`.`transaction_id`)) WHERE `pt`.`is_used` = 0 AND `pt`.`expires_at` > current_timestamp()  ;

-- --------------------------------------------------------

--
-- Structure for view `v_customer_orders`
--
DROP TABLE IF EXISTS `v_customer_orders`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_customer_orders`  AS SELECT `st`.`transaction_id` AS `transaction_id`, `st`.`order_number` AS `order_number`, `u`.`full_name` AS `customer_name`, `u`.`phone` AS `customer_phone`, `st`.`total_amount` AS `total_amount`, `st`.`payment_method` AS `payment_method`, `st`.`status` AS `status`, `st`.`transaction_date` AS `transaction_date`, `pt`.`token_code` AS `token_code` FROM ((`sales_transactions` `st` join `users` `u` on(`st`.`customer_id` = `u`.`user_id`)) left join `payment_tokens` `pt` on(`st`.`transaction_id` = `pt`.`transaction_id`)) WHERE `u`.`role` = 'customer''customer'  ;

-- --------------------------------------------------------

--
-- Structure for view `v_daily_sales`
--
DROP TABLE IF EXISTS `v_daily_sales`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_daily_sales`  AS SELECT cast(`sales_transactions`.`transaction_date` as date) AS `sale_date`, count(0) AS `total_transactions`, sum(`sales_transactions`.`total_amount`) AS `total_sales`, `sales_transactions`.`payment_method` AS `payment_method`, `sales_transactions`.`status` AS `status` FROM `sales_transactions` GROUP BY cast(`sales_transactions`.`transaction_date` as date), `sales_transactions`.`payment_method`, `sales_transactions`.`status``status`  ;

-- --------------------------------------------------------

--
-- Structure for view `v_low_stock_products`
--
DROP TABLE IF EXISTS `v_low_stock_products`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_low_stock_products`  AS SELECT `products`.`product_id` AS `product_id`, `products`.`product_name` AS `product_name`, `products`.`category` AS `category`, `products`.`stock_quantity` AS `stock_quantity`, `products`.`low_stock_alert` AS `low_stock_alert`, `products`.`price` AS `price` FROM `products` WHERE `products`.`stock_quantity` <= `products`.`low_stock_alert` AND `products`.`is_active` = 11  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `customer_feedback`
--
ALTER TABLE `customer_feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `responded_by` (`responded_by`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_feedback_date` (`feedback_date`);

--
-- Indexes for table `inventory_orders`
--
ALTER TABLE `inventory_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `manager_id` (`manager_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_order_date` (`order_date`);

--
-- Indexes for table `inventory_order_items`
--
ALTER TABLE `inventory_order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `payment_tokens`
--
ALTER TABLE `payment_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `token_code` (`token_code`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `used_by` (`used_by`),
  ADD KEY `idx_token_code` (`token_code`),
  ADD KEY `idx_expires` (`expires_at`),
  ADD KEY `idx_used` (`is_used`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_stock` (`stock_quantity`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`quotation_id`),
  ADD UNIQUE KEY `quotation_number` (`quotation_number`),
  ADD KEY `idx_quotation_number` (`quotation_number`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`quotation_item_id`),
  ADD KEY `idx_quotation` (`quotation_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`sale_item_id`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `performed_by` (`performed_by`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_movement_date` (`movement_date`),
  ADD KEY `idx_movement_type` (`movement_type`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`),
  ADD KEY `idx_supplier_name` (`supplier_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_trail`
--
ALTER TABLE `audit_trail`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_feedback`
--
ALTER TABLE `customer_feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_orders`
--
ALTER TABLE `inventory_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_order_items`
--
ALTER TABLE `inventory_order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_tokens`
--
ALTER TABLE `payment_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `quotation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotation_items`
--
ALTER TABLE `quotation_items`
  MODIFY `quotation_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `sale_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `movement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD CONSTRAINT `audit_trail_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_feedback`
--
ALTER TABLE `customer_feedback`
  ADD CONSTRAINT `customer_feedback_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_feedback_ibfk_2` FOREIGN KEY (`responded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_orders`
--
ALTER TABLE `inventory_orders`
  ADD CONSTRAINT `inventory_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  ADD CONSTRAINT `inventory_orders_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `inventory_order_items`
--
ALTER TABLE `inventory_order_items`
  ADD CONSTRAINT `inventory_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `inventory_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `payment_tokens`
--
ALTER TABLE `payment_tokens`
  ADD CONSTRAINT `payment_tokens_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transactions` (`transaction_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_tokens_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_tokens_ibfk_3` FOREIGN KEY (`used_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD CONSTRAINT `quotation_items_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`quotation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotation_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  ADD CONSTRAINT `sales_transactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_transactions_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transactions` (`transaction_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
