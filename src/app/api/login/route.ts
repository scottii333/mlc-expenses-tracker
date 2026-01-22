import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { hashEmail, normalizeEmail } from "@/lib/emailCrypto";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionJwt,
} from "@/lib/session";

type LoginBody = {
  email?: string;
  password?: string;
};

function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isGmail(email: string) {
  return email.trim().toLowerCase().endsWith("@gmail.com");
}

async function ensureUsersTable() {
  // Keep same schema as signup (safe if already exists)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email_hash text NOT NULL UNIQUE,
      email_enc text NOT NULL,
      email_iv text NOT NULL,
      email_tag text NOT NULL,
      password_hash text NOT NULL,
      first_name text,
      last_name text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;

    const email = body.email ? normalizeEmail(body.email) : "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!isValidEmailFormat(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Gmail-only rule (same as signup)
    if (!isGmail(email)) {
      return NextResponse.json(
        { error: "Only Gmail addresses (@gmail.com) are allowed" },
        { status: 400 },
      );
    }

    await ensureUsersTable();

    const email_hash = hashEmail(email);

    // Find user by email_hash
    const found = await pool.query(
      "SELECT id, password_hash FROM public.users WHERE email_hash = $1 LIMIT 1",
      [email_hash],
    );

    if (!found.rowCount) {
      // Don’t reveal whether the email exists
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = found.rows[0] as { id: string; password_hash: string };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create session jwt + cookie
    const token = await signSessionJwt({
      sub: user.id,
      email_hash,
      role: "user",
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
