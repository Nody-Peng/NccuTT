import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function createAdminAccount() {
  try {
    // ✅ 連接 MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ✅ 檢查是否已存在 Admin 帳號
    const [existingUser] = await connection.execute(
      "SELECT * FROM Users WHERE email = ?",
      ["admin@admin.admin"]
    );

    if ((existingUser as any[]).length > 0) {
      console.log("✅ Admin 帳號已存在");
    } else {
      // ✅ 加密密碼
      const hashedPassword = await bcrypt.hash("nccuTT", 10);

      // ✅ 插入 Admin 帳號
      await connection.execute(
        `INSERT INTO Users (user_id, name, email, password, profile_picture, is_organizer, google_id, provider, created_at, last_login)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          "Admin", // name
          "admin@admin.admin", // email
          hashedPassword, // password
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", // profile_picture
          1, // is_organizer
          null, // google_id
          "credentials", // provider
        ]
      );

      console.log("🚀 Admin 帳號已創建");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ 創建 Admin 帳號時發生錯誤：", error);
  }
}
