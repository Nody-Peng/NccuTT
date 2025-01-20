import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // ✅ 取得 Cookie 儲存區
    const cookieStore = await cookies();

    // ✅ 清除認證的 Cookie
    cookieStore.delete("next-auth.session-token");

    // ✅ 回傳成功訊息
    return NextResponse.json(
      { message: "登出成功" },
      { status: 200 }
    );
  } catch (error) {
    console.error("登出錯誤:", error);
    return NextResponse.json(
      { error: "登出失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
