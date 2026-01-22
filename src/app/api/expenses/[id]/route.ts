import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionJwt } from "@/lib/session";

type ExpenseUpdateBody = {
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  await ensureExpensesTable();

  const { id } = await params;
  const expenseId = Number(id);
  if (!Number.isFinite(expenseId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as ExpenseUpdateBody;

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

  const updated = await pool.query(
    `
    UPDATE public.expenses
    SET category = $1,
        description = $2,
        amount = $3,
        date = $4::date,
        updated_at = now()
    WHERE id = $5 AND user_id = $6
    RETURNING id, category, description, amount::float8 as amount, to_char(date,'YYYY-MM-DD') as date
    `,
    [category, description, amount, date, expenseId, auth.userId],
  );

  if (!updated.rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ expense: updated.rows[0] }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  await ensureExpensesTable();

  const { id } = await params;
  const expenseId = Number(id);
  if (!Number.isFinite(expenseId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const deleted = await pool.query(
    `DELETE FROM public.expenses WHERE id = $1 AND user_id = $2`,
    [expenseId, auth.userId],
  );

  if (!deleted.rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
