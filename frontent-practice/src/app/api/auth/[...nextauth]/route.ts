import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// ✅ 建立 MySQL 連線池（效能最佳化）
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const authOptions = {
  providers: [
    // ✅ Google OAuth 登入
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,  // 防止帳號衝突
    }),

    // ✅ Email + 密碼登入
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("請填寫完整的電子郵件和密碼");
        }

        const connection = await pool.getConnection();

        try {
          // 查詢使用者
          const [rows] = await connection.execute(
            "SELECT * FROM Users WHERE email = ?",
            [credentials.email]
          );

          if (rows.length === 0) {
            throw new Error("該電子郵件尚未註冊");
          }

          const user = rows[0];

          // ✅ 檢查密碼（Google 用戶不檢查）
          if (user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
              throw new Error("密碼錯誤");
            }
          } else {
            throw new Error("請使用 Google 登入");
          }

          return {
            id: user.user_id,
            name: user.name,
            email: user.email,
            image: user.profile_picture,
          };
        } finally {
          connection.release();
        }
      }
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // ✅ Google 登入：同步資料庫用戶資料
    async signIn({ user, account }) {
      const connection = await pool.getConnection();

      try {
        const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if (account?.provider === "google") {
          // 查詢是否已有此用戶
          const [existingUsers] = await connection.execute(
            "SELECT * FROM Users WHERE email = ?",
            [user.email]
          );

          if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            // ✅ 更新 Google ID 與頭像
            await connection.execute(
              `UPDATE Users 
               SET google_id = ?, profile_picture = COALESCE(?, profile_picture), last_login = NOW()
               WHERE user_id = ?`,
              [account.providerAccountId, user.image, existingUser.user_id]
            );

            user.id = existingUser.user_id;  // 確保 user_id 正確
          } else {
            // ✅ 新增 Google 用戶
            const [result] = await connection.execute(
              `INSERT INTO Users (
                user_id, name, email, password, profile_picture, google_id,
                created_at, last_login, provider, is_organizer
              ) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW(), 'google', 0)`,
              [
                user.name,
                user.email,
                null,  // Google 用戶無密碼
                user.image,
                account.providerAccountId
              ]
            );

            // ✅ 取回剛新增的 user_id
            const [newUser] = await connection.execute(
              "SELECT user_id FROM Users WHERE email = ?",
              [user.email]
            );
            user.id = newUser[0].user_id;
          }
        }

        return true;
      } catch (error) {
        console.error("Google 登入錯誤:", error);
        return false;
      } finally {
        connection.release();
      }
    },

    // ✅ 將 user_id 儲存在 JWT
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.id;  // 把 user_id 放入 token
      }
      return token;
    },

    // ✅ 將 user_id 傳遞到前端 session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.user_id;  // 把 user_id 放進 session
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",  // 自訂登入頁面
    error: "/error",   // 自訂錯誤頁面
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
