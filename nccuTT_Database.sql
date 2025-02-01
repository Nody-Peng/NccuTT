-- 建立資料庫
CREATE DATABASE IF NOT EXISTS TableTennis;
USE TableTennis;

-- 建立 Users 表
CREATE TABLE IF NOT EXISTS Users (
    user_id VARCHAR(255) DEFAULT (UUID()) PRIMARY KEY,  -- 使用 UUID 作為主鍵
    name VARCHAR(100) NOT NULL,                         -- 使用者名稱
    email VARCHAR(100) NOT NULL UNIQUE,                 -- Email 唯一限制
    password VARCHAR(255) DEFAULT NULL,                 -- 密碼 (Google OAuth 為 NULL)
    profile_picture VARCHAR(255) DEFAULT 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',  -- 預設大頭貼
    is_organizer BOOLEAN DEFAULT FALSE,                 -- 是否為主辦單位
    is_applying BOOLEAN DEFAULT FALSE,					-- 是否正在申請加入主辦單位
    google_id VARCHAR(255) DEFAULT NULL,               -- Google OAuth ID
    provider VARCHAR(50) DEFAULT NULL,                 -- 登入方式 (google/credentials)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 建立時間
    last_login TIMESTAMP DEFAULT NULL                  -- 最後登入時間
);

-- 忘記密碼
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES Users(email)
);

-- 建立 Tournaments 表
CREATE TABLE IF NOT EXISTS Tournaments (
    tournament_id INT AUTO_INCREMENT,           -- 比賽編號，自動遞增
    user_id VARCHAR(255) NOT NULL,              -- 主辦者 ID (來自 Users 表)
    name VARCHAR(100) NOT NULL,                 -- 比賽名稱
    location VARCHAR(100) NOT NULL,             -- 比賽地點
    enroll_date DATE NOT NULL,					-- 報名截止日期
    start_date DATE NOT NULL,                   -- 比賽開始日期
    end_date DATE NOT NULL,                     -- 比賽結束日期
    description TEXT,                           -- 比賽描述
    num_of_table INT NOT NULL,
    status ENUM('報名中', '進行中', '已結束') DEFAULT '報名中', -- 比賽狀態，預設為 '報名中'
    PRIMARY KEY (tournament_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)  -- 外鍵連接到 Users 表
        ON DELETE CASCADE                       -- 如果主辦者被刪除，相關比賽也會被刪除
        ON UPDATE CASCADE                       -- 如果主辦者 ID 被更新，會同步更新
);

-- 建立 Tournament_Participants 表
CREATE TABLE IF NOT EXISTS Tournament_Participants (
    register_id INT AUTO_INCREMENT PRIMARY KEY, -- Auto-increment primary key
    user_id VARCHAR(255) NOT NULL, -- Reference to Users table
    name VARCHAR(255) NOT NULL, -- Name of the participant
    email VARCHAR(255) NOT NULL, -- Email of the participant
    gender ENUM('男', '女') DEFAULT NULL,
    phone VARCHAR(10) NOT NULL, -- Phone number of the participant
    tournament_id INT NOT NULL, -- Reference to Tournaments table
    division ENUM('大專組', '社會組','裁判組') NOT NULL, -- Division
    category ENUM('個人賽', '團體賽') DEFAULT NULL, -- Category
    team_name VARCHAR(100) DEFAULT NULL, -- Team name
    event_type ENUM('男子單打', '女子單打', '男子雙打', '女子雙打', '混合雙打', '男子團體', '女子團體', '混合團體') DEFAULT NULL, -- Event type
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id),
    CONSTRAINT chk_phone_format CHECK (phone REGEXP '^09[0-9]{8}$'), -- Phone number format validation
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'), -- Email format validation
    -- 以下為裁判組特殊條件
    CONSTRAINT chk_category_for_division CHECK (
        division = '裁判組' OR category IS NOT NULL
    ),
    CONSTRAINT chk_event_type_for_division CHECK (
        division = '裁判組' OR event_type IS NOT NULL
    )
);

-- 修改 Team_Members 表
CREATE TABLE IF NOT EXISTS Team_Members (
    member_id INT AUTO_INCREMENT PRIMARY KEY, -- 自動遞增的主鍵
    register_id INT NOT NULL, -- 參考 Tournament_Participants 的 register_id
    member_name VARCHAR(255) NOT NULL, -- 隊員名稱
    FOREIGN KEY (register_id) REFERENCES Tournament_Participants(register_id) 
        ON DELETE CASCADE -- 刪除 Tournament_Participants 中的記錄時，會自動刪除 Team_Members 中的對應記錄
        ON UPDATE CASCADE -- 更新 Tournament_Participants 中的 register_id 時，會自動更新 Team_Members 中的 register_id
);

-- 修改 Judges 表
CREATE TABLE IF NOT EXISTS Judges (
    judge_id INT PRIMARY KEY, -- 對應 Tournament_Participants 的 register_id
    dietary_preference ENUM('葷食', '素食') NOT NULL, -- 飲食習慣，限制為 "葷食" 或 "素食"
    allergens VARCHAR(255), -- 過敏原（以逗號分隔）
    session_number INT DEFAULT 0, -- 參與的場次數量
    FOREIGN KEY (judge_id) REFERENCES Tournament_Participants(register_id) 
        ON DELETE CASCADE -- 刪除 Tournament_Participants 中的記錄時，會自動刪除 Judges 中的對應記錄
        ON UPDATE CASCADE -- 更新 Tournament_Participants 中的 register_id 時，會自動更新 Judges 中的 register_id
);

-- 建立 Sessions 表
CREATE TABLE IF NOT EXISTS Sessions (
    session_id INT PRIMARY KEY,
    session_time VARCHAR(255) NOT NULL -- 時間欄位，存儲字串格式的時間
);

-- 插入資料到 Sessions 表
INSERT INTO TableTennis.Sessions (session_id, session_time) VALUES
(1, '8:00-9:00'),
(2, '9:00-10:00'),
(3, '10:00-11:00'),
(4, '11:00-12:00'),
(5, '12:00-13:00'),
(6, '13:00-14:00'),
(7, '14:00-15:00'),
(8, '15:00-16:00'),
(9, '16:00-17:00'),
(10, '17:00-18:00');

-- 建立 Tournament_Sessions 表
CREATE TABLE IF NOT EXISTS Tournament_Sessions (
    tournament_session_id INT AUTO_INCREMENT PRIMARY KEY, -- 自動遞增的主鍵
    tournament_id INT NOT NULL, -- 參考 Tournaments 的 tournament_id
    competition_date DATE NOT NULL,
    session_id INT NOT NULL, -- Session 的唯一標識符
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id), -- 外鍵約束
	FOREIGN KEY (session_id) REFERENCES Sessions(session_id) -- 外鍵約束
);

-- 建立 Venues 表
CREATE TABLE IF NOT EXISTS Venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY, -- Auto-incrementing primary key
    tournament_id INT NOT NULL, -- References Tournaments' tournament_id
    venue VARCHAR(255) NOT NULL, -- References Tournaments' location
    FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id)
);

-- 建立 Venue_Tables 表
CREATE TABLE IF NOT EXISTS Venue_Tables (
    table_id INT AUTO_INCREMENT PRIMARY KEY, -- 自動遞增的主鍵
    venue_id INT NOT NULL, -- 參考 Venues 的 venue_id
    table_number INT NOT NULL, -- 桌號
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) -- venue_id 外鍵約束
);

-- 建立 Matches 表
CREATE TABLE IF NOT EXISTS Matches (
  match_id INT AUTO_INCREMENT PRIMARY KEY,                         
  tournament_id INT NOT NULL,                                      
  division ENUM('大專組', '社會組','裁判組') NOT NULL, 
  event_type ENUM('男子單打', '女子單打', '男子雙打', '女子雙打', '混合雙打', '男子團體', '女子團體', '混合團體') DEFAULT NULL, 
  player1_id INT NOT NULL,                                         
  player2_id INT DEFAULT NULL,                                                  
  judge_id INT DEFAULT NULL,                                  
  table_id INT DEFAULT NULL,  -- 允許 NULL                                       
  venue_id INT DEFAULT NULL,  -- 允許 NULL                                      
  session_id INT DEFAULT NULL, -- 允許 NULL                                      
  is_published TINYINT(1) DEFAULT 0,
  match_duration VARCHAR(20),                                      
  status ENUM('未開始', '進行中', '已完成', '輪空') DEFAULT '未開始',      
  winner_id INT DEFAULT NULL,                                      
  score VARCHAR(50),                                               

  UNIQUE KEY unique_table_session (table_id, session_id),
  FOREIGN KEY (tournament_id) REFERENCES Tournaments(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (player1_id) REFERENCES Tournament_Participants(register_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (player2_id) REFERENCES Tournament_Participants(register_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (judge_id) REFERENCES Tournament_Participants(register_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (table_id) REFERENCES Venue_Tables(table_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (session_id) REFERENCES Tournament_Sessions(tournament_session_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES Tournament_Participants(register_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 建立觸發器 (after_match_insert)
DELIMITER $$

CREATE TRIGGER after_match_insert
AFTER INSERT ON Matches
FOR EACH ROW
BEGIN
    UPDATE Judges
    SET session_number = session_number + 1
    WHERE judge_id = NEW.judge_id;
END$$

DELIMITER ;

-- 建立觸發器 (after_match_delete)
DELIMITER $$

CREATE TRIGGER after_match_delete
AFTER DELETE ON Matches
FOR EACH ROW
BEGIN
    UPDATE Judges
    SET session_number = session_number - 1
    WHERE judge_id = OLD.judge_id;
END$$

DELIMITER ;