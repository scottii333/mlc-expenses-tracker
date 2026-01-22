import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { encryptEmail, hashEmail, normalizeEmail } from "@/lib/emailCrypto";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionJwt,
} from "@/lib/session";

type SignupBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

async function ensureUsersTable() {
  // gen_random_uuid() needs pgcrypto extension; Supabase usually has it enabled.
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
    const body = (await req.json()) as SignupBody;

    const email = body.email ? normalizeEmail(body.email) : "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await ensureUsersTable();

    const email_hash = hashEmail(email);

    // 1) check if email exists
    const exists = await pool.query(
      "SELECT id FROM public.users WHERE email_hash = $1 LIMIT 1",
      [email_hash],
    );

    if (exists.rowCount && exists.rows[0]) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    // 2) insert user
    const password_hash = await bcrypt.hash(password, 12);
    const { email_enc, email_iv, email_tag } = encryptEmail(email);

    const first_name = body.firstName?.trim() || null;
    const last_name = body.lastName?.trim() || null;

    const inserted = await pool.query(
      `
      INSERT INTO public.users
        (email_hash, email_enc, email_iv, email_tag, password_hash, first_name, last_name)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, created_at
      `,
      [
        email_hash,
        email_enc,
        email_iv,
        email_tag,
        password_hash,
        first_name,
        last_name,
      ],
    );

    const user = inserted.rows[0];

    // 3) create session jwt + cookie
    const token = await signSessionJwt({
      sub: user.id,
      email_hash,
      role: "user",
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    return NextResponse.json(
      {
        message: "Signup successful",
        user: { id: user.id, created_at: user.created_at },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
