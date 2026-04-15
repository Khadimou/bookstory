"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginDashboard(formData: FormData) {
  const pwd = formData.get("pwd") as string;
  if (pwd === process.env.DASHBOARD_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("dashboard_auth", pwd, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 heures
      path: "/",
    });
    redirect("/dashboard");
  }
  redirect("/dashboard?error=1");
}
