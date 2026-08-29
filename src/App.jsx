import { useState, useEffect, useMemo } from "react";
import { Plus, X, PiggyBank, TrendingUp, TrendingDown, Download, Sparkles, LogOut, Mail, Lock, User } from "lucide-react";
import { supabase } from "./supabaseClient";

const DEFAULT_EXPENSE_CATS = [
  { id: "food", ml: "ഭക്ഷണം", en: "Food", color: "#FF6584" },
  { id: "travel", ml: "യാത്ര", en: "Travel", color: "#38BDF8" },
  { id: "bills", ml: "ബില്ലുകൾ", en: "Bills", color: "#FFB020" },
  { id: "shopping", ml: "ഷോപ്പിംഗ്", en: "Shopping", color: "#7C5CFC" },
  { id: "health", ml: "ആരോഗ്യം", en: "Health", color: "#F472B6" },
  { id: "other", ml: "മറ്റുള്ളവ", en: "Other", color: "#94A3B8" },
];

const DEFAULT_INCOME_CATS = [
  { id: "salary", ml: "ശമ്പളം", en: "Salary", color: "#2DD4A7" },
  { id: "business", ml: "ബിസിനസ്സ്", en: "Business", color: "#22C55E" },
  { id: "gift", ml: "സമ്മാനം", en: "Gift", color: "#FB923C" },
  { id: "other-income", ml: "മറ്റുള്ളവ", en: "Other", color: "#94A3B8" },
];

const PALETTE = ["#FF6584", "#2DD4A7", "#FFB020", "#7C5CFC", "#38BDF8", "#F472B6", "#FB923C", "#22C55E"];

const MONTH_NAMES_ML = [
  "ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ",
  "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}
function formatRupee(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u0d00-\u0d7f]+/g, "-")
      .replace(/(^-|-$)/g, "") || "cat-" + Date.now().toString(36)
  );
}

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setInfo("");
    if (!email.trim() || !password) {
      setError("Email, password എന്നിവ നിർബന്ധമാണ്.");
      return;
    }
    if (password.length < 6) {
      setError("Password കുറഞ്ഞത് 6 characters വേണം.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() || email.split("@")[0] } },
        });
        if (signErr) throw signErr;
        if (data.session) {
          onAuthed();
        } else {
          setInfo("Account ഉണ്ടാക്കി! Email verify ചെയ്യാൻ ഒരു link അയച്ചിട്ടുണ്ട് — verify ചെയ്ത ശേഷം login ചെയ്യൂ.");
        }
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (loginErr) throw loginErr;
        onAuthed();
      }
    } catch (err) {
      setError(err.message || "എന്തോ പിഴവ് സംഭവിച്ചു.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input, select { font-family: inherit; }
        input:focus, button:focus-visible { outline: 3px solid #7C5CFC; outline-offset: 2px; }
        ::placeholder { color: #B9AEDC; }
        button { cursor: pointer; }
      `}</style>
      <div style={styles.blobA} aria-hidden="true" />
      <div style={styles.blobB} aria-hidden="true" />
      <div style={{ ...styles.formCard, maxWidth: 380, width: "100%", margin: "60px auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={styles.logoBubble}>
            <PiggyBank size={22} strokeWidth={2.2} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ ...styles.title, fontSize: 24 }}>പൈസ ബഡ്ഡി</h1>
            <p style={styles.subtitle}>{mode === "login" ? "നിങ്ങളുടെ account-ലേക്ക് login ചെയ്യൂ" : "പുതിയ account ഉണ്ടാക്കൂ"}</p>
          </div>
        </div>

        <div style={{ ...styles.typeToggleRow, marginBottom: 16 }}>
          <button
            onClick={() => { setMode("login"); setError(""); setInfo(""); }}
            style={{ ...styles.typeToggle, ...(mode === "login" ? { background: "#7C5CFC", color: "#fff", borderColor: "#7C5CFC" } : {}) }}
          >
            Login
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
            style={{ ...styles.typeToggle, ...(mode === "signup" ? { background: "#2DD4A7", color: "#fff", borderColor: "#2DD4A7" } : {}) }}
          >
            Sign up
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "signup" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={15} color="#8A7FB0" style={{ flexShrink: 0 }} />
              <input type="text" placeholder="നിങ്ങളുടെ പേര്" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={15} color="#8A7FB0" style={{ flexShrink: 0 }} />
            <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={15} color="#8A7FB0" style={{ flexShrink: 0 }} />
            <input
              type="password"
              placeholder="Password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={styles.input}
            />
          </div>

          {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E0345A", fontWeight: 600 }}>{error}</p>}
          {info && <p style={{ margin: 0, fontSize: 12.5, color: "#0F9D74", fontWeight: 600 }}>{info}</p>}

          <button
            onClick={submit}
            disabled={busy}
            style={{
              ...styles.addBtn,
              width: "100%",
              borderRadius: 999,
              padding: "12px 0",
              background: mode === "login" ? "#7C5CFC" : "#2DD4A7",
              fontWeight: 700,
              fontSize: 14,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "ദയവായി കാത്തിരിക്കൂ..." : mode === "login" ? "Login" : "Account ഉണ്ടാക്കൂ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingScreen({ session, status, onRefresh }) {
  const [txRef, setTxRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(status === "pending");
  const [error, setError] = useState("");

  async function submitProof() {
    setError("");
    setBusy(true);
    try {
      const { error: err } = await supabase.from("access_requests").insert({
        user_id: session.user.id,
        email: session.user.email,
        transaction_ref: txRef.trim() || null,
      });
      if (err) throw err;
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "എന്തോ പിഴവ്. വീണ്ടും ശ്രമിക്കൂ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input { font-family: inherit; }
        input:focus, button:focus-visible { outline: 3px solid #7C5CFC; outline-offset: 2px; }
        button { cursor: pointer; }
      `}</style>
      <div style={styles.blobA} aria-hidden="true" />
      <div style={styles.blobB} aria-hidden="true" />
      <div style={{ ...styles.formCard, maxWidth: 420, width: "100%", margin: "40px auto", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10 }}>
          <div style={styles.logoBubble}>
            <PiggyBank size={22} strokeWidth={2.2} color="#FFFFFF" />
          </div>
          <h1 style={{ ...styles.title, fontSize: 22 }}>പൈസ ബഡ്ഡി</h1>
        </div>

        {submitted ? (
          <>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#7C5CFC", margin: "8px 0 4px" }}>
              ⏳ Approval-നായി കാത്തിരിക്കുന്നു
            </p>
            <p style={{ fontSize: 13, color: "#6B6088", lineHeight: 1.7, margin: "0 0 16px" }}>
              Payment കിട്ടിയെന്ന് confirm ആയാൽ ഉടനെ access തരും. താഴെയുള്ള button-ൽ ക്ലിക്ക് ചെയ്ത് status check ചെയ്യാം.
            </p>
            <button onClick={onRefresh} style={{ ...styles.addBtn, width: "100%", borderRadius: 999, padding: "11px 0", background: "#7C5CFC", fontWeight: 700 }}>
              വീണ്ടും check ചെയ്യുക
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: "#6B6088", lineHeight: 1.7, margin: "8px 0 16px" }}>
              App access കിട്ടാൻ താഴെയുള്ള QR scan ചെയ്ത് pay ചെയ്യൂ. Payment ചെയ്ത ശേഷം transaction ID (optional) ചേർത്ത് submit ചെയ്യൂ — admin confirm ചെയ്താൽ ഉടനെ access കിട്ടും.
            </p>
            <img
              src="/payment-qr.jpeg"
              alt="Payment QR code"
              style={{ width: "100%", maxWidth: 260, borderRadius: 16, boxShadow: "0 4px 18px rgba(43,38,64,0.12)", margin: "0 auto 14px" }}
            />
            <input
              type="text"
              placeholder="Transaction ID (optional)"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              style={{ ...styles.input, marginBottom: 10, textAlign: "center" }}
            />
            {error && <p style={{ fontSize: 12.5, color: "#E0345A", fontWeight: 600, margin: "0 0 10px" }}>{error}</p>}
            <button
              onClick={submitProof}
              disabled={busy}
              style={{ ...styles.addBtn, width: "100%", borderRadius: 999, padding: "11px 0", background: "#2DD4A7", fontWeight: 700, opacity: busy ? 0.7 : 1 }}
            >
              {busy ? "Submit ചെയ്യുന്നു..." : "Payment ചെയ്തു, Submit ചെയ്യൂ"}
            </button>
            <p style={{ fontSize: 11.5, color: "#9A8FC2", marginTop: 14 }}>
              സംശയങ്ങൾക്ക്: aniltt2012@gmail.com
            </p>
          </>
        )}

        <button
          onClick={() => supabase.auth.signOut()}
          style={{ background: "none", border: "none", color: "#9A8FC2", fontSize: 12, marginTop: 18, textDecoration: "underline" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function PaisaBuddy() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out, object = signed in
  const [entries, setEntries] = useState([]);
  const [budget, setBudget] = useState(15000);
  const [customCats, setCustomCats] = useState({ expense: [], income: [] });
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);

  const [entryType, setEntryType] = useState("expense");
  const [form, setForm] = useState({ date: todayISO(), category: "food", note: "", amount: "" });
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const [budgetDraft, setBudgetDraft] = useState("15000");
  const [editingBudget, setEditingBudget] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState("checking"); // 'checking' | 'approved' | 'pending' | 'none'

  const selectedMonth = useMemo(() => monthKey(todayISO()), []);

  // Track auth session, and re-check whenever it changes (login/logout/token refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Check payment-approval status for this user
  async function refreshApproval(uid) {
    setApprovalStatus("checking");
    try {
      const { data, error } = await supabase
        .from("access_requests")
        .select("status")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        setApprovalStatus("none");
      } else if (data.some((r) => r.status === "approved")) {
        setApprovalStatus("approved");
      } else {
        setApprovalStatus("pending");
      }
    } catch (err) {
      setApprovalStatus("none");
    }
  }

  useEffect(() => {
    if (!session) return;
    refreshApproval(session.user.id);
  }, [session]);

  // Load this user's data from Supabase once logged in AND approved
  useEffect(() => {
    if (!session || approvalStatus !== "approved") {
      setLoaded(false);
      return;
    }
    (async () => {
      try {
        const uid = session.user.id;
        const [{ data: exp, error: expErr }, { data: bud }, { data: cats }] = await Promise.all([
          supabase.from("expenses").select("*").eq("user_id", uid).order("date", { ascending: false }),
          supabase.from("budgets").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("custom_categories").select("*").eq("user_id", uid),
        ]);
        if (expErr) throw expErr;
        setEntries(
          (exp || []).map((r) => ({
            id: r.id,
            type: r.type,
            date: r.date,
            category: r.category,
            note: r.note || "",
            amount: Number(r.amount),
          }))
        );
        if (bud) {
          setBudget(Number(bud.amount));
          setBudgetDraft(String(bud.amount));
        }
        const grouped = { expense: [], income: [] };
        (cats || []).forEach((c) => {
          grouped[c.type]?.push({ id: c.cat_id, ml: c.ml, en: c.en, color: c.color });
        });
        setCustomCats(grouped);
        setStorageError(false);
      } catch (err) {
        console.error(err);
        setStorageError(true);
      } finally {
        setLoaded(true);
      }
    })();
  }, [session, approvalStatus]);

  const categoriesFor = (type) =>
    type === "income" ? [...DEFAULT_INCOME_CATS, ...customCats.income] : [...DEFAULT_EXPENSE_CATS, ...customCats.expense];

  function categoryMeta(type, id) {
    const list = categoriesFor(type);
    return list.find((c) => c.id === id) || list[list.length - 1];
  }

  async function saveBudget() {
    const val = Number(budgetDraft) || 0;
    setBudget(val);
    setEditingBudget(false);
    try {
      const uid = session.user.id;
      const { error } = await supabase.from("budgets").upsert({ user_id: uid, amount: val });
      if (error) throw error;
    } catch (err) {
      setStorageError(true);
    }
  }

  function switchType(type) {
    setEntryType(type);
    const defaultCat = categoriesFor(type)[0];
    setForm((f) => ({ ...f, category: defaultCat ? defaultCat.id : "" }));
    setAddingCategory(false);
    setNewCatName("");
  }

  function handleCategorySelect(value) {
    if (value === "__add_new__") {
      setAddingCategory(true);
      setNewCatName("");
      return;
    }
    setForm((f) => ({ ...f, category: value }));
  }

  async function confirmNewCategory() {
    const name = newCatName.trim();
    if (!name) {
      setAddingCategory(false);
      return;
    }
    const id = slugify(name);
    const existing = categoriesFor(entryType).find((c) => c.id === id);
    if (existing) {
      setForm((f) => ({ ...f, category: existing.id }));
      setAddingCategory(false);
      setNewCatName("");
      return;
    }
    const usedCount = categoriesFor(entryType).length;
    const newCat = { id, ml: name, en: name, color: PALETTE[usedCount % PALETTE.length] };
    setCustomCats((prev) => ({ ...prev, [entryType]: [...prev[entryType], newCat] }));
    setForm((f) => ({ ...f, category: id }));
    setAddingCategory(false);
    setNewCatName("");
    try {
      const uid = session.user.id;
      const { error } = await supabase.from("custom_categories").insert({
        user_id: uid,
        type: entryType,
        cat_id: id,
        ml: name,
        en: name,
        color: newCat.color,
      });
      if (error) throw error;
    } catch (err) {
      setStorageError(true);
    }
  }

  async function addEntry() {
    const amt = Number(form.amount);
    if (!amt || amt <= 0 || !form.date || !form.category) return;
    const localId = "temp-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const entry = {
      id: localId,
      type: entryType,
      date: form.date,
      category: form.category,
      note: form.note.trim(),
      amount: amt,
    };
    setEntries((prev) => [entry, ...prev]);
    setForm((f) => ({ ...f, note: "", amount: "" }));
    try {
      const uid = session.user.id;
      const { data, error } = await supabase
        .from("expenses")
        .insert({ user_id: uid, type: entry.type, date: entry.date, category: entry.category, note: entry.note, amount: entry.amount })
        .select()
        .single();
      if (error) throw error;
      // swap the temp local id for the real database id
      setEntries((prev) => prev.map((e) => (e.id === localId ? { ...e, id: data.id } : e)));
    } catch (err) {
      setStorageError(true);
    }
  }

  async function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      setStorageError(true);
    }
  }

  const monthEntries = useMemo(() => entries.filter((e) => monthKey(e.date) === selectedMonth), [entries, selectedMonth]);
  const monthExpense = useMemo(
    () => monthEntries.filter((e) => e.type !== "income").reduce((s, e) => s + e.amount, 0),
    [monthEntries]
  );
  const monthIncome = useMemo(
    () => monthEntries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0),
    [monthEntries]
  );
  const netBalance = monthIncome - monthExpense;

  function categoryTotalsFor(type) {
    const map = {};
    for (const e of monthEntries) {
      if ((e.type || "expense") !== type) continue;
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    const cats = categoriesFor(type);
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return cats
      .map((c) => ({ ...c, total: map[c.id] || 0 }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((c) => ({ ...c, pct: total ? (c.total / total) * 100 : 0 }));
  }
  const expenseCatTotals = useMemo(() => categoryTotalsFor("expense"), [monthEntries, customCats]);
  const incomeCatTotals = useMemo(() => categoryTotalsFor("income"), [monthEntries, customCats]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)), [entries]);

  const monthLabel = MONTH_NAMES_ML[Number(selectedMonth.split("-")[1]) - 1] + " " + selectedMonth.split("-")[0];
  const remaining = budget - monthExpense;
  const pctUsed = budget > 0 ? Math.min(100, (monthExpense / budget) * 100) : 0;
  const overBudget = remaining < 0;

  function exportCSV() {
    const header = "Date,Type,Category,Note,Amount\n";
    const rows = sortedEntries
      .map((e) => {
        const cat = categoryMeta(e.type || "expense", e.category);
        return `${e.date},${e.type === "income" ? "Income" : "Expense"},${cat.en},"${(e.note || "").replace(/"/g, '""')}",${e.amount}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paisa-buddy-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (session === undefined) {
    return (
      <div style={{ ...styles.page, alignItems: "center" }}>
        <p style={{ color: "#8A7FB0", fontWeight: 600 }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthed={() => {}} />;
  }

  if (approvalStatus === "checking") {
    return (
      <div style={{ ...styles.page, alignItems: "center" }}>
        <p style={{ color: "#8A7FB0", fontWeight: 600 }}>Loading...</p>
      </div>
    );
  }

  if (approvalStatus !== "approved") {
    return <PendingScreen session={session} status={approvalStatus} onRefresh={() => refreshApproval(session.user.id)} />;
  }

  const userLabel = session.user.user_metadata?.display_name || session.user.email;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Chettan+2:wght@500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input, select { font-family: inherit; }
        input:focus, select:focus, button:focus-visible {
          outline: 3px solid #7C5CFC;
          outline-offset: 2px;
        }
        ::placeholder { color: #B9AEDC; }
        .entry-row:hover .del-btn { opacity: 1; }
        .del-btn { opacity: 0; transition: opacity 0.15s ease; }
        .sticker { transition: transform 0.15s ease; }
        .entry-row:hover .sticker { transform: rotate(0deg) scale(1.04); }
        button { cursor: pointer; }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr 1fr !important; }
          .stat-grid { grid-template-columns: 1fr !important; }
          .app-title { font-size: 24px !important; }
        }
      `}</style>

      <div style={styles.blobA} aria-hidden="true" />
      <div style={styles.blobB} aria-hidden="true" />

      <div style={styles.sheet}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoBubble}>
              <PiggyBank size={22} strokeWidth={2.2} color="#FFFFFF" />
            </div>
            <div>
              <h1 className="app-title" style={styles.title}>പൈസ ബഡ്ഡി</h1>
              <p style={styles.subtitle}>{userLabel}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV} style={styles.exportBtn} title="CSV ആയി export ചെയ്യുക">
              <Download size={14} />
              <span>CSV</span>
            </button>
            <button onClick={() => supabase.auth.signOut()} style={{ ...styles.exportBtn, color: "#E0345A" }} title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Stat cards */}
        <section className="stat-grid" style={styles.statGrid}>
          <div style={{ ...styles.statCard, background: "#E8FBF5" }}>
            <div style={{ ...styles.statIcon, background: "#2DD4A7" }}>
              <TrendingUp size={16} color="#fff" />
            </div>
            <p style={styles.statLabel}>വരവ്</p>
            <p style={{ ...styles.statValue, color: "#0F9D74" }}>{formatRupee(monthIncome)}</p>
          </div>
          <div style={{ ...styles.statCard, background: "#FFEEF1" }}>
            <div style={{ ...styles.statIcon, background: "#FF6584" }}>
              <TrendingDown size={16} color="#fff" />
            </div>
            <p style={styles.statLabel}>ചെലവ്</p>
            <p style={{ ...styles.statValue, color: "#E0345A" }}>{formatRupee(monthExpense)}</p>
          </div>
          <div style={{ ...styles.statCard, background: "#F1ECFF" }}>
            <div style={{ ...styles.statIcon, background: "#7C5CFC" }}>
              <PiggyBank size={16} color="#fff" />
            </div>
            <p style={styles.statLabel}>ബാക്കി · {monthLabel}</p>
            <p style={{ ...styles.statValue, color: netBalance >= 0 ? "#5B3FD9" : "#E0345A" }}>{formatRupee(netBalance)}</p>
          </div>
        </section>

        {/* Budget card */}
        <section style={styles.budgetCard}>
          <div style={styles.budgetTop}>
            <span style={styles.budgetLabel}>🎯 മാസ ബഡ്ജറ്റ്</span>
            {editingBudget ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="number" value={budgetDraft} onChange={(e) => setBudgetDraft(e.target.value)} style={styles.budgetInput} autoFocus />
                <button onClick={saveBudget} style={styles.pillBtnSmall}>OK</button>
              </div>
            ) : (
              <button onClick={() => setEditingBudget(true)} style={styles.budgetValueBtn}>{formatRupee(budget)} ✎</button>
            )}
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${pctUsed}%`, background: overBudget ? "#FF6584" : "linear-gradient(90deg,#2DD4A7,#7C5CFC)" }} />
          </div>
          <p style={{ ...styles.remainingText, color: overBudget ? "#E0345A" : "#0F9D74" }}>
            {overBudget ? `😬 ബഡ്ജറ്റ് ${formatRupee(Math.abs(remaining))} കടന്നു` : `🎉 ${formatRupee(remaining)} ബാക്കിയുണ്ട്`}
          </p>

          {expenseCatTotals.length > 0 && (
            <div style={styles.categoryBars}>
              <p style={styles.miniHeading}>ചെലവ് categories</p>
              {expenseCatTotals.map((c) => <CategoryBarRow key={c.id} c={c} />)}
            </div>
          )}
          {incomeCatTotals.length > 0 && (
            <div style={styles.categoryBars}>
              <p style={styles.miniHeading}>വരവ് categories</p>
              {incomeCatTotals.map((c) => <CategoryBarRow key={c.id} c={c} />)}
            </div>
          )}
        </section>

        {/* Add entry */}
        <section style={styles.formCard}>
          <div style={styles.typeToggleRow}>
            <button onClick={() => switchType("expense")} style={{ ...styles.typeToggle, ...(entryType === "expense" ? { background: "#FF6584", color: "#fff", borderColor: "#FF6584" } : {}) }}>
              💸 ചെലവ്
            </button>
            <button onClick={() => switchType("income")} style={{ ...styles.typeToggle, ...(entryType === "income" ? { background: "#2DD4A7", color: "#fff", borderColor: "#2DD4A7" } : {}) }}>
              💰 വരവ്
            </button>
          </div>

          <div className="form-grid" style={styles.formGrid}>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={styles.input} />

            {addingCategory ? (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  placeholder="Category പേര്"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmNewCategory()}
                  style={{ ...styles.input, flex: 1 }}
                  autoFocus
                />
                <button onClick={confirmNewCategory} style={styles.pillBtnSmall}>Add</button>
                <button onClick={() => setAddingCategory(false)} style={{ ...styles.pillBtnSmall, background: "#B9AEDC" }}><X size={12} /></button>
              </div>
            ) : (
              <select value={form.category} onChange={(e) => handleCategorySelect(e.target.value)} style={styles.input}>
                {categoriesFor(entryType).map((c) => (
                  <option key={c.id} value={c.id}>{c.ml} · {c.en}</option>
                ))}
                <option value="__add_new__">+ പുതിയ category ചേർക്കുക</option>
              </select>
            )}

            <input type="text" placeholder="വിവരണം (optional)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} style={styles.input} />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                placeholder="₹ തുക"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
                style={{ ...styles.input, flex: 1 }}
              />
              <button onClick={addEntry} style={{ ...styles.addBtn, background: entryType === "income" ? "#2DD4A7" : "#FF6584" }} aria-label="Add entry">
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section>

        {/* Ledger */}
        <section style={styles.ledgerCard}>
          <p style={styles.sectionLabel}>എൻട്രികൾ ({entries.length})</p>
          {sortedEntries.length === 0 ? (
            <div style={styles.emptyState}>
              <PiggyBank size={26} color="#C9BFEA" />
              <p style={styles.emptyText}>ഇതുവരെ ഒരു എൻട്രിയും ചേർത്തിട്ടില്ല.<br />മുകളിൽ നിന്ന് ആദ്യ എൻട്രി ചേർക്കൂ!</p>
            </div>
          ) : (
            sortedEntries.map((e) => {
              const type = e.type || "expense";
              const cat = categoryMeta(type, e.category);
              const isIncome = type === "income";
              return (
                <div key={e.id} className="entry-row" style={styles.entryRow}>
                  <div style={styles.entryDate}>
                    {new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </div>
                  <div className="sticker" style={{ ...styles.stickerChip, background: cat.color }}>{cat.ml}</div>
                  <div style={styles.entryNote}>{e.note || "—"}</div>
                  <div style={{ ...styles.entryAmount, color: isIncome ? "#0F9D74" : "#2B2640" }}>
                    {isIncome ? "+" : "−"}{formatRupee(e.amount)}
                  </div>
                  <button className="del-btn" onClick={() => removeEntry(e.id)} style={styles.delBtn} aria-label="Delete entry">
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </section>

        {storageError && <p style={styles.storageWarning}>⚠ Data save ചെയ്യുന്നതിൽ പ്രശ്നം. Refresh ചെയ്ത് വീണ്ടും ശ്രമിക്കുക.</p>}
      </div>
    </div>
  );
}

function CategoryBarRow({ c }) {
  return (
    <div style={styles.categoryBarRow}>
      <span style={{ ...styles.categoryDot, background: c.color }} />
      <span style={styles.categoryName}>{c.ml}</span>
      <div style={styles.categoryBarTrack}>
        <div style={{ ...styles.categoryBarFill, width: `${c.pct}%`, background: c.color }} />
      </div>
      <span style={styles.categoryAmt}>{formatRupee(c.total)}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FAF7FF",
    padding: "32px 16px",
    fontFamily: "'Poppins', 'Noto Sans Malayalam', sans-serif",
    color: "#2B2640",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  blobA: {
    position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%",
    background: "radial-gradient(circle, #FFE29D 0%, rgba(255,226,157,0) 70%)", pointerEvents: "none",
  },
  blobB: {
    position: "absolute", bottom: -100, left: -100, width: 320, height: 320, borderRadius: "50%",
    background: "radial-gradient(circle, #C9E7FF 0%, rgba(201,231,255,0) 70%)", pointerEvents: "none",
  },
  sheet: { width: "100%", maxWidth: 760, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 16 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logoBubble: {
    width: 46, height: 46, borderRadius: 16, background: "linear-gradient(135deg,#7C5CFC,#FF6584)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    boxShadow: "0 6px 14px rgba(124,92,252,0.35)", transform: "rotate(-4deg)",
  },
  title: { fontFamily: "'Baloo Chettan 2', sans-serif", fontSize: 30, margin: 0, lineHeight: 1.1, color: "#2B2640", fontWeight: 700 },
  subtitle: { margin: "2px 0 0", fontSize: 12.5, color: "#8A7FB0", fontWeight: 500 },
  exportBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "none",
    borderRadius: 999, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, color: "#5B3FD9",
    boxShadow: "0 3px 10px rgba(91,63,217,0.15)",
  },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  statCard: { borderRadius: 20, padding: "16px 18px", boxShadow: "0 4px 14px rgba(43,38,64,0.06)" },
  statIcon: { width: 30, height: 30, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statLabel: { margin: 0, fontSize: 12, fontWeight: 600, color: "#6B6088" },
  statValue: { margin: "2px 0 0", fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  budgetCard: { background: "#fff", borderRadius: 24, padding: "20px 22px", boxShadow: "0 4px 18px rgba(43,38,64,0.07)" },
  budgetTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  budgetLabel: { fontSize: 13.5, fontWeight: 600, color: "#2B2640" },
  budgetValueBtn: { background: "#F1ECFF", border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 13, fontWeight: 700, color: "#5B3FD9" },
  budgetInput: { width: 90, padding: "5px 8px", border: "2px solid #E4DBFF", borderRadius: 10, fontSize: 13, background: "#FAF7FF", fontWeight: 600 },
  pillBtnSmall: { background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  progressTrack: { marginTop: 12, height: 10, borderRadius: 999, background: "#F1ECFF", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, transition: "width 0.3s ease" },
  remainingText: { margin: "8px 0 0", fontSize: 13, fontWeight: 700 },
  categoryBars: { marginTop: 18, display: "flex", flexDirection: "column", gap: 8 },
  miniHeading: { margin: "0 0 4px", fontSize: 11.5, letterSpacing: "0.03em", textTransform: "uppercase", color: "#9A8FC2", fontWeight: 700 },
  categoryBarRow: { display: "flex", alignItems: "center", gap: 8 },
  categoryDot: { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 },
  categoryName: { fontSize: 12.5, width: 100, flexShrink: 0, color: "#4A4160", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 },
  categoryBarTrack: { flex: 1, height: 8, background: "#F1ECFF", borderRadius: 999, overflow: "hidden" },
  categoryBarFill: { height: "100%", borderRadius: 999 },
  categoryAmt: { fontSize: 12, width: 76, textAlign: "right", flexShrink: 0, color: "#4A4160", fontWeight: 600 },
  formCard: { background: "#fff", borderRadius: 24, padding: "20px 22px", boxShadow: "0 4px 18px rgba(43,38,64,0.07)" },
  typeToggleRow: { display: "flex", gap: 8, marginBottom: 14 },
  typeToggle: {
    flex: 1, padding: "10px 0", borderRadius: 999, border: "2px solid #F1ECFF",
    background: "#FAF7FF", color: "#8A7FB0", fontSize: 13.5, fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr 1.1fr", gap: 10 },
  input: { background: "#FAF7FF", border: "2px solid #F1ECFF", borderRadius: 14, padding: "10px 12px", fontSize: 13.5, color: "#2B2640", width: "100%" },
  addBtn: { color: "#fff", border: "none", borderRadius: 14, width: 42, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(0,0,0,0.12)" },
  ledgerCard: { background: "#fff", borderRadius: 24, padding: "20px 22px 10px", boxShadow: "0 4px 18px rgba(43,38,64,0.07)" },
  sectionLabel: { margin: "0 0 12px", fontSize: 11.5, letterSpacing: "0.05em", textTransform: "uppercase", color: "#9A8FC2", fontWeight: 700 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "30px 0 34px", textAlign: "center" },
  emptyText: { margin: 0, fontSize: 13, color: "#9A8FC2", lineHeight: 1.6, fontWeight: 500 },
  entryRow: { display: "grid", gridTemplateColumns: "56px auto 1fr auto 22px", alignItems: "center", gap: 10, padding: "12px 2px", borderBottom: "2px dashed #F1ECFF" },
  entryDate: { fontSize: 11.5, color: "#9A8FC2", fontWeight: 600 },
  stickerChip: {
    fontSize: 11, padding: "4px 10px", borderRadius: 999, color: "#fff", fontWeight: 700,
    whiteSpace: "nowrap", justifySelf: "start", transform: "rotate(-2deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  },
  entryNote: { fontSize: 13, color: "#4A4160", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 },
  entryAmount: { fontSize: 13.5, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  delBtn: { background: "none", border: "none", color: "#FF6584", display: "flex", alignItems: "center", justifyContent: "center" },
  storageWarning: { margin: 0, fontSize: 12, color: "#E0345A", fontWeight: 600, textAlign: "center" },
};

