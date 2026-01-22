import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/session";

type ExpenseInsertBody = {
  category?: string;
  description?: string;
  amount?: number;
  date?: string; // YYYY-MM-DD
};

async function ensureExpensesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.expenses (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      category text NOT NULL,
      description text NOT NULL,
      amount numeric(12,2) NOT NULL,
      date date NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses(user_id);
    CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON public.expenses(user_id, date DESC);
  `);
}

async function requireUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const payload = await verifySessionJwt(token);
    const userId = String(payload.sub || "");
    if (!userId) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }
    return { userId };
  } catch {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

function isValidYYYYMMDD(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  await ensureExpensesTable();

  const result = await pool.query(
    `
    SELECT id, category, description, amount::float8 as amount, to_char(date, 'YYYY-MM-DD') as date
    FROM public.expenses
    WHERE user_id = $1
    ORDER BY date DESC, id DESC
    `,
    [auth.userId],
  );

  return NextResponse.json({ expenses: result.rows }, { status: 200 });
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  await ensureExpensesTable();

  const body = (await req.json()) as ExpenseInsertBody;

  const category = body.category?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const amount =
    typeof body.amount === "number" ? body.amount : Number(body.amount);
  const date = body.date?.trim() ?? "";

  if (!category || !description || !date || !Number.isFinite(amount)) {
    return NextResponse.json(
      { error: "category, description, amount, and date are required" },
      { status: 400 },
    );
  }

  if (!isValidYYYYMMDD(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const inserted = await pool.query(
    `
    INSERT INTO public.expenses (user_id, category, description, amount, date)
    VALUES ($1, $2, $3, $4, $5::date)
    RETURNING id, category, description, amount::float8 as amount, to_char(date,'YYYY-MM-DD') as date
    `,
    [auth.userId, category, description, amount, date],
  );

  return NextResponse.json({ expense: inserted.rows[0] }, { status: 201 });
}
