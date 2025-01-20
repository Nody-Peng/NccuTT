# 誰敢跟我桌隊

---

作者: 彭宗淳、林佳瑢
![誰敢跟我桌隊](https://github.com/Nody-Peng/NccuTT/blob/main/frontend/public/nccuTT_home.png?raw=true)

# 系統簡介

---

- 「誰敢跟我桌隊」是一個專為桌球賽事設計的管理系統，旨在提供主辦方與參賽方一個高效的平台來完成比賽報名、賽程發布以及賽程安排。此外，系統中設有一個 Admin 管理員角色，負責擁有最高權限，可用於管理用戶的權限與系統內的操作權限。

- 此系統以 React 作為前端框架，搭配 Next.js 作為伺服器端處理，並使用 MySQL 作為後端資料庫來儲存和管理賽事相關數據。

### 系統功能

- 報名管理：讓參賽方快速完成比賽報名。
- 賽程發布：主辦方可在平台上輕鬆發布賽程。
- 賽程安排：提供便捷工具協助主辦方進行賽程規劃。
- Admin 管理員功能：
  1. 管理使用者帳戶與權限。
  2. 調整賽事參數與平台設置。

# 環境建置

---

### 環境變數建置

- 請於 frontend 資料夾底下建立一個名為.env.local 的 flie。
  ![本地端環境變數](https://github.com/Nody-Peng/NccuTT/blob/main/pictures/local%E7%92%B0%E5%A2%83%E8%AE%8A%E6%95%B8.jpg?raw=true)

- 再來以下是環境變數的設定內容

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
HOST=http://localhost:3000/
NEXTAUTH_SECRET=LJ5OllM5pZUCmfdjiXOQ5L0cTlExwm6sOOLngOwkE9c=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=TableTennis
EMAIL_USER=your-email-address
EMAIL_PASS=your-email-password
```

1. GOOGLE_CLIENT_ID

   - 用途：Google OAuth 的客戶端 ID，用於整合 Google 登入功能。
   - 格式：類似於 xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com。
   - 如何獲取：在 Google Cloud Console 中創建 OAuth 憑證後獲取。

2. GOOGLE_CLIENT_SECRET

   - 用途：Google OAuth 的密鑰，用於驗證與 Google 的通訊。
   - 格式：類似於隨機字符串，如 GOCSPX-xxxxxxxxxxxxxxxxxxxxx。
   - 如何獲取：與 GOOGLE_CLIENT_ID 一起生成。

3. HOST

   - 用途：定義應用程式的主機位址，例如本地開發時的 http://localhost:3000 或部署後的實際域名（如 https://example.com）。
   - 格式：應為完整的 URL，包括協議（http 或 https）和端口（如果需要）。

4. NEXTAUTH_SECRET

   - 用途：用於加密 NextAuth 的敏感資料（如 JWT 和會話資料）。
   - 格式：應為一個強隨機生成的字符串。
   - 如何生成：可以使用 Node.js：

   ```
   openssl rand -base64 32
   ```

5. MYSQL_HOST

   - 用途：定義 MySQL 資料庫的主機位址。
   - 格式：
     - 本地開發時：localhost。
     - 部署到伺服器時：伺服器的 IP 位址（如 192.168.1.1）。

6. MYSQL_PORT

   - 用途：指定 MySQL 資料庫的連接端口。
   - 預設值：3306，MySQL 的預設端口。

7. MYSQL_USER

   - 用途：用於連接資料庫的使用者名稱。
   - 格式：資料庫的用戶名（例如 root 或自定義用戶）。

8. MYSQL_PASSWORD

   - 用途：用於連接資料庫的密碼。
   - 格式：與 MYSQL_USER 對應的密碼。

9. MYSQL_DATABASE

   - 用途：資料庫名稱，用於指定需要操作的數據存儲。
   - 格式：應與資料庫中的名稱完全匹配，例如 TableTennis。

10. EMAIL_USER

    - 用途：用於發送電子郵件的帳號，在此系統中用於發送「忘記密碼」的驗證信。
    - 格式：電子郵件地址，例如 example@gmail.com。

11. EMAIL_PASS

    - 用途：電子郵件的應用程式密碼，用於授權發送郵件。
    - 格式：應用程式密碼，不能是電子郵件的普通登入密碼。
    - 如何獲取：如果使用 Gmail，需啟用「兩步驟驗證」並生成應用程式密碼。

---

## 前端頁面設置

#### 需求

```
* node.js version: v20.18.0
* Next.js version: v15.1.4
* react version: v19.0.0
* pnpm version: v9.15.1
```

#### 步驟

1. **安裝 pnpm 套件管理工具** 確保您已全域安裝 pnpm，執行以下命令：

   ```
   npm install -g pnpm
   ```

   確認安裝成功：

   ```
   pnpm --version
   ```

2. **安裝前端依賴** 進入專案的 `frontend` 資料夾，然後執行以下指令安裝所有依賴：

   ```
   cd frontend
   pnpm install
   ```

   安裝完成後，您就已完成前端設置!

---

## 後端 MySQL 設置

1.  **啟動 MySQL Workbench**

    - 安裝 MySQL Workbench 8.0 CE 並啟動。
    - 創建一個新的專案連線，並設定以下參數：
      - 使用者 (User)：root
      - 端口 (Port)：3306
      - 密碼：請與 .env 中的 MYSQL_PASSWORD 保持一致。

2.  **導入資料庫結構**

    - 將專案中的 nccuTT_Database.sql 檔案導入 MySQL：
      - 打開 MySQL Workbench，點擊「File → Open SQL Script」，選擇 nccuTT_Database.sql。
      - 點擊「執行」按鈕執行該 SQL 腳本。
    - 確保執行成功並生成所有必要的資料表。

3.  **驗證資料庫連線**

    - 確保資料庫服務正在運行。
    - 可透過終端檢查：
      ```
      mysql -u root -p -P 3306
      ```
    - 如果資料庫無法正常運行，檢查 MySQL 的啟動狀態，並確認 .env 文件中的資料庫參數正確。

---

## 啟動專案

完成上述步驟後，按以下方式啟動專案：

1. **啟動前端伺服器** 進入 `frontend` 資料夾，執行：

   ```
   pnpm run dev
   ```

   成功啟動後，您可以在瀏覽器中訪問：

   ```
   http://localhost:3000/
   ```

2. **預設管理員帳號** 系統啟動後，系統會自動建立一個 **最高管理員帳號**，您可以用以下資訊登入：

   - 帳號：`admin@admin.admin`
   - 密碼：`nccuTT`

---
