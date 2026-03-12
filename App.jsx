
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

// Load Supabase credentials from .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid) => {
    const { data } = await supabase.from("profiles").select("*, expert_profiles(*)").eq("id", uid).single();
    setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); };
  const refreshProfile = () => user && fetchProfile(user.id);

  return <AuthCtx.Provider value={{ user, profile, loading, signOut, refreshProfile }}>{children}</AuthCtx.Provider>;
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
function useRouter() {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (to) => { window.location.hash = to; };
  return { path, navigate };
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icons = {
  Logo: () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1a1a2e"/><path d="M8 12h16M8 16h10M8 20h12" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round"/><circle cx="22" cy="20" r="4" fill="#f7c94f"/><path d="M22 18.5v1.5l1 1" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  MessageCircle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Clock: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Trophy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 21 12 17 16 21"/><path d="M5 3H19"/><path d="M5 3C5 11 12 15 12 15S19 11 19 3"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const domainColors = {
  "#EF4444": { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  "#8B5CF6": { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)" },
  "#3B82F6": { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  "#10B981": { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  "#F59E0B": { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  "#6366F1": { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)" },
  "#EC4899": { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)" },
  "#14B8A6": { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.3)" },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      background: type === "error" ? "#ef4444" : "#10b981",
      color:"#fff", padding:"12px 20px", borderRadius:10,
      fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:500,
      boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideUp 0.3s ease",
      display:"flex", alignItems:"center", gap:10, maxWidth:360,
    }}>
      <span>{type === "error" ? "⚠️" : "✓"}</span> {msg}
      <button onClick={onClose} style={{marginLeft:"auto", background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:16}}>×</button>
    </div>
  );
}

function Spinner() {
  return <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
    <div style={{ width:36, height:36, border:"3px solid rgba(79,142,247,0.2)", borderTopColor:"#4f8ef7", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
  </div>;
}

function Badge({ text, color = "#4f8ef7" }) {
  return <span style={{
    background: `${color}22`, color, border:`1px solid ${color}44`,
    borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:600,
    fontFamily:"'DM Sans', sans-serif"
  }}>{text}</span>;
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Navbar({ navigate, path }) {
  const { user, profile, signOut } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const unread = notifs.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      setNotifs(data || []);
    };
    load();
    const ch = supabase.channel("notifs-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifs(p => [payload.new, ...p]);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [user]);

  const markRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  };

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background:"rgba(12,12,20,0.92)", backdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      padding:"0 24px", height:64, display:"flex", alignItems:"center", gap:16,
    }}>
      <button onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer" }}>
        <Icons.Logo />
        <span style={{ fontFamily:"'Clash Display', 'DM Sans', sans-serif", fontWeight:700, fontSize:20, color:"#fff", letterSpacing:-0.5 }}>AskExpert</span>
      </button>
      <div style={{ flex:1 }}/>
      <button onClick={() => navigate("/questions")} style={{ ...navBtn, color: path.startsWith("/questions") ? "#4f8ef7" : "#aaa" }}>Questions</button>
      <button onClick={() => navigate("/experts")} style={{ ...navBtn, color: path.startsWith("/experts") ? "#4f8ef7" : "#aaa" }}>Experts</button>
      {!user ? (
        <>
          <button onClick={() => navigate("/login")} style={outlineBtn}>Sign In</button>
          <button onClick={() => navigate("/signup")} style={primaryBtn}>Get Started</button>
        </>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {profile?.role === "user" && (
            <button onClick={() => navigate("/ask")} style={{...primaryBtn, display:"flex", alignItems:"center", gap:6}}>
              <Icons.Plus /><span>Ask</span>
            </button>
          )}
          {/* Notifications */}
          <div style={{ position:"relative" }}>
            <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markRead(); }} style={{
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, width:38, height:38, cursor:"pointer", color:"#ddd",
              display:"flex", alignItems:"center", justifyContent:"center", position:"relative"
            }}>
              <Icons.Bell />
              {unread > 0 && <span style={{ position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background:"#ef4444" }}/>}
            </button>
            {showNotifs && (
              <div style={{
                position:"absolute", right:0, top:46, width:340, background:"#161625",
                border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, boxShadow:"0 20px 60px rgba(0,0,0,0.5)", overflow:"hidden",
              }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontFamily:"'DM Sans', sans-serif", fontWeight:600, color:"#fff", fontSize:14 }}>Notifications</div>
                {notifs.length === 0 ? <div style={{ padding:24, textAlign:"center", color:"#666", fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>No notifications yet</div> :
                  notifs.slice(0, 8).map(n => (
                    <div key={n.id} onClick={() => { setShowNotifs(false); if (n.link) navigate(n.link); }} style={{
                      padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)",
                      background: n.is_read ? "transparent" : "rgba(79,142,247,0.06)",
                      cursor:"pointer", transition:"background 0.2s",
                    }}>
                      <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, color:"#e0e0e0", fontWeight:500 }}>{n.title}</div>
                      <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:"#666", marginTop:2 }}>{n.message}</div>
                      <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color:"#444", marginTop:4 }}>{timeAgo(n.created_at)}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          {/* Avatar menu */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg, #4f8ef7, #7c3aed)",
              border:"2px solid rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff",
              fontFamily:"'DM Sans', sans-serif", fontWeight:700, fontSize:15,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </button>
            {showMenu && (
              <div style={{ position:"absolute", right:0, top:46, width:200, background:"#161625", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, boxShadow:"0 20px 60px rgba(0,0,0,0.5)", overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, color:"#fff", fontWeight:600 }}>{profile?.full_name || "User"}</div>
                  <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:"#666" }}>{profile?.role}</div>
                </div>
                {[
                  { label: "Dashboard", path: "/dashboard" },
                  ...(profile?.role === "admin" ? [{ label: "Admin Panel", path: "/admin" }] : []),
                  ...(profile?.role !== "expert" && profile?.role !== "admin" ? [{ label: "Become an Expert", path: "/apply" }] : []),
                ].map(item => (
                  <button key={item.path} onClick={() => { setShowMenu(false); navigate(item.path); }} style={{ ...dropItem }}>{item.label}</button>
                ))}
                <button onClick={() => { setShowMenu(false); signOut(); navigate("/"); }} style={{ ...dropItem, color:"#ef4444", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <Icons.Logout /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

const navBtn = { background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans', sans-serif", fontWeight:500, fontSize:14, padding:"6px 12px", borderRadius:8, transition:"color 0.2s" };
const primaryBtn = { background:"linear-gradient(135deg, #4f8ef7, #6366f1)", color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontFamily:"'DM Sans', sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" };
const outlineBtn = { background:"transparent", color:"#ddd", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"7px 18px", fontFamily:"'DM Sans', sans-serif", fontWeight:500, fontSize:14, cursor:"pointer" };
const dropItem = { display:"flex", alignItems:"center", gap:8, width:"100%", padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:"#ccc", fontFamily:"'DM Sans', sans-serif", fontSize:13, textAlign:"left", transition:"background 0.2s" };

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
  const [domains, setDomains] = useState([]);
  const [stats, setStats] = useState({ questions:0, answers:0, experts:0 });
  const [recentQ, setRecentQ] = useState([]);

  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => setDomains(data || []));
    Promise.all([
      supabase.from("questions").select("id", { count:"exact", head:true }),
      supabase.from("answers").select("id", { count:"exact", head:true }),
      supabase.from("expert_profiles").select("id", { count:"exact", head:true }).eq("status", "approved"),
    ]).then(([q, a, e]) => setStats({ questions: q.count||0, answers: a.count||0, experts: e.count||0 }));
    supabase.from("questions").select("*, profiles(full_name), domains(name,icon,color)").order("created_at", { ascending:false }).limit(5).then(({ data }) => setRecentQ(data || []));
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif" }}>
      {/* Hero */}
      <div style={{ background:"radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.2) 0%, transparent 60%), linear-gradient(180deg, #0c0c14 0%, #0c0c14 100%)", padding:"80px 24px 60px", textAlign:"center" }}>
        <div style={{ display:"inline-block", background:"rgba(79,142,247,0.12)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"6px 16px", color:"#4f8ef7", fontSize:13, fontWeight:600, marginBottom:24 }}>
          ✦ Real-time Expert Answers
        </div>
        <h1 style={{ fontSize:"clamp(36px,6vw,72px)", fontFamily:"'Clash Display','DM Sans',sans-serif", fontWeight:700, color:"#fff", margin:"0 0 16px", letterSpacing:-2, lineHeight:1.1 }}>
          Ask. Experts Answer.<br/><span style={{ background:"linear-gradient(135deg, #4f8ef7, #a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>In Real Time.</span>
        </h1>
        <p style={{ fontSize:18, color:"#888", maxWidth:500, margin:"0 auto 36px", lineHeight:1.7 }}>
          Connect with verified experts across medicine, law, finance, tech & more. Get trusted answers fast.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigate("/ask")} style={{ ...primaryBtn, padding:"14px 32px", fontSize:16, borderRadius:12 }}>Ask a Question</button>
          <button onClick={() => navigate("/experts")} style={{ ...outlineBtn, padding:"14px 32px", fontSize:16, borderRadius:12 }}>Browse Experts</button>
        </div>
        <div style={{ display:"flex", gap:40, justifyContent:"center", marginTop:48 }}>
          {[["questions", "Questions Asked"], ["answers", "Answers Given"], ["experts", "Verified Experts"]].map(([k, label]) => (
            <div key={k}>
              <div style={{ fontSize:"clamp(24px,4vw,36px)", fontWeight:700, color:"#fff" }}>{stats[k].toLocaleString()}</div>
              <div style={{ fontSize:13, color:"#666" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Domains */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"60px 24px" }}>
        <h2 style={{ fontSize:28, fontWeight:700, color:"#fff", marginBottom:8, textAlign:"center" }}>Expert Domains</h2>
        <p style={{ color:"#666", textAlign:"center", marginBottom:36 }}>Find experts across every field</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
          {domains.map(d => {
            const c = domainColors[d.color] || { bg:"rgba(79,142,247,0.1)", border:"rgba(79,142,247,0.2)" };
            return (
              <button key={d.id} onClick={() => navigate(`/questions?domain=${d.slug}`)} style={{
                background:c.bg, border:`1px solid ${c.border}`, borderRadius:14, padding:"20px 24px",
                textAlign:"left", cursor:"pointer", transition:"transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 30px ${c.border}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{d.icon}</div>
                <div style={{ fontWeight:700, color:"#fff", fontSize:16 }}>{d.name}</div>
                <div style={{ color:"#777", fontSize:13, marginTop:4 }}>{d.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Questions */}
      {recentQ.length > 0 && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 60px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <h2 style={{ fontSize:24, fontWeight:700, color:"#fff", margin:0 }}>Recent Questions</h2>
            <button onClick={() => navigate("/questions")} style={{ ...outlineBtn, display:"flex", alignItems:"center", gap:4 }}>View All <Icons.ChevronRight /></button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {recentQ.map(q => <QuestionCard key={q.id} q={q} navigate={navigate}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, navigate }) {
  const c = q.domains?.color ? domainColors[q.domains.color] : { bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)" };
  return (
    <div onClick={() => navigate(`/questions/${q.id}`)} style={{
      background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12,
      padding:"16px 20px", cursor:"pointer", transition:"background 0.2s, border-color 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background="rgba(79,142,247,0.05)"; e.currentTarget.style.borderColor="rgba(79,142,247,0.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
            {q.domains && <span style={{ background:c.bg, color:q.domains.color, border:`1px solid ${c.border}`, borderRadius:5, padding:"2px 8px", fontSize:12, fontWeight:600 }}>{q.domains.icon} {q.domains.name}</span>}
            <span style={{ background: q.status==="answered" ? "rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color:q.status==="answered"?"#10b981":"#f59e0b", border:`1px solid ${q.status==="answered"?"rgba(16,185,129,0.2)":"rgba(245,158,11,0.2)"}`, borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
              {q.status === "answered" ? "✓ Answered" : "● Open"}
            </span>
          </div>
          <div style={{ fontWeight:600, color:"#e8e8e8", fontSize:15, marginBottom:6 }}>{q.title}</div>
          <div style={{ color:"#666", fontSize:13 }}>{q.body?.substring(0, 120)}{q.body?.length > 120 ? "..." : ""}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, minWidth:60 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:q.answer_count>0?"#10b981":"#555", fontWeight:700, fontSize:18 }}>{q.answer_count}</div>
            <div style={{ color:"#555", fontSize:11 }}>answers</div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:16, marginTop:10, color:"#555", fontSize:12, alignItems:"center" }}>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><Icons.User />{q.profiles?.full_name || "Anonymous"}</span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><Icons.Clock />{timeAgo(q.created_at)}</span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><Icons.Eye />{q.views || 0} views</span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><Icons.MessageCircle />{q.answer_count}</span>
      </div>
    </div>
  );
}

// ─── QUESTIONS PAGE ────────────────────────────────────────────────────────────
function QuestionsPage({ navigate }) {
  const [questions, setQuestions] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ domain: "", status: "", search: "" });

  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => setDomains(data || []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const domainSlug = params.get("domain");
    if (domainSlug) setFilter(f => ({ ...f, domain: domainSlug }));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("questions").select("*, profiles(full_name), domains(name, icon, color)").order("created_at", { ascending: false });
      if (filter.domain) {
        const d = domains.find(d => d.slug === filter.domain);
        if (d) query = query.eq("domain_id", d.id);
      }
      if (filter.status) query = query.eq("status", filter.status);
      if (filter.search) query = query.ilike("title", `%${filter.search}%`);
      const { data } = await query.limit(50);
      setQuestions(data || []);
      setLoading(false);
    };
    if (domains.length > 0 || !filter.domain) load();
  }, [filter, domains]);

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ color:"#fff", fontWeight:700, fontSize:28, margin:0 }}>All Questions</h1>
          <p style={{ color:"#666", margin:"4px 0 0", fontSize:14 }}>{questions.length} questions found</p>
        </div>
        <button onClick={() => navigate("/ask")} style={{ ...primaryBtn, display:"flex", alignItems:"center", gap:6 }}><Icons.Plus /> Ask Question</button>
      </div>
      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Icons.Search />
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Search questions..." style={{ ...inputStyle, paddingLeft:36, width:"100%", boxSizing:"border-box" }}/>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#555", pointerEvents:"none" }}><Icons.Search /></span>
        </div>
        <select value={filter.domain} onChange={e => setFilter(f => ({ ...f, domain: e.target.value }))} style={inputStyle}>
          <option value="">All Domains</option>
          {domains.map(d => <option key={d.id} value={d.slug}>{d.icon} {d.name}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="answered">Answered</option>
        </select>
      </div>
      {loading ? <Spinner /> : questions.length === 0 ?
        <div style={{ textAlign:"center", padding:60, color:"#555" }}>No questions found. Be the first to ask!</div> :
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {questions.map(q => <QuestionCard key={q.id} q={q} navigate={navigate} />)}
        </div>
      }
    </div>
  );
}

// ─── QUESTION DETAIL ──────────────────────────────────────────────────────────
function QuestionDetailPage({ id, navigate }) {
  const { user, profile } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [{ data: q }, { data: a }] = await Promise.all([
      supabase.from("questions").select("*, profiles(full_name), domains(name, icon, color)").eq("id", id).single(),
      supabase.from("answers").select("*, profiles(full_name, expert_profiles(qualifications, domain_id, domains(name)))").eq("question_id", id).order("created_at"),
    ]);
    setQuestion(q); setAnswers(a || []); setLoading(false);
    if (q) await supabase.from("questions").update({ views: (q.views || 0) + 1 }).eq("id", id);
  }, [id]);

  useEffect(() => {
    load();
    const ch = supabase.channel("q-" + id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "answers", filter: `question_id=eq.${id}` }, () => load())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [id, load]);

  const submitAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("answers").insert({ question_id: id, expert_id: user.id, body: answerText.trim() });
    if (error) setToast({ msg: error.message, type:"error" });
    else { setAnswerText(""); setToast({ msg:"Answer posted!", type:"success" }); }
    setSubmitting(false);
  };

  if (loading) return <Spinner />;
  if (!question) return <div style={{ textAlign:"center", padding:60, color:"#666" }}>Question not found.</div>;

  const dc = question.domains?.color ? domainColors[question.domains.color] : { bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)" };
  const isExpert = profile?.role === "expert" && profile?.expert_profiles?.status === "approved";

  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <button onClick={() => navigate("/questions")} style={{ ...outlineBtn, marginBottom:24, display:"flex", alignItems:"center", gap:6, fontSize:13 }}>← Back to Questions</button>

      {/* Question */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28, marginBottom:24 }}>
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
          {question.domains && <span style={{ background:dc.bg, color:question.domains.color, border:`1px solid ${dc.border}`, borderRadius:6, padding:"3px 10px", fontSize:13, fontWeight:600 }}>{question.domains.icon} {question.domains.name}</span>}
          <span style={{ background:question.status==="answered"?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color:question.status==="answered"?"#10b981":"#f59e0b", borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:600, border:`1px solid ${question.status==="answered"?"rgba(16,185,129,0.2)":"rgba(245,158,11,0.2)"}` }}>
            {question.status === "answered" ? "✓ Answered" : "● Open"}
          </span>
        </div>
        <h1 style={{ color:"#fff", fontWeight:700, fontSize:24, margin:"0 0 16px" }}>{question.title}</h1>
        <p style={{ color:"#ccc", lineHeight:1.8, margin:"0 0 20px", fontSize:15 }}>{question.body}</p>
        <div style={{ display:"flex", gap:16, color:"#555", fontSize:13, flexWrap:"wrap" }}>
          <span><Icons.User style={{display:"inline"}}/> {question.profiles?.full_name || "Anonymous"}</span>
          <span><Icons.Clock style={{display:"inline"}}/> {timeAgo(question.created_at)}</span>
          <span><Icons.Eye style={{display:"inline"}}/> {question.views || 0} views</span>
        </div>
      </div>

      {/* Answers */}
      <h2 style={{ color:"#fff", fontWeight:700, fontSize:20, marginBottom:16 }}>{answers.length} Answer{answers.length !== 1 ? "s" : ""}</h2>
      {answers.map(a => (
        <div key={a.id} style={{ background:"rgba(79,142,247,0.04)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:14, padding:24, marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg, #4f8ef7, #7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16 }}>
              {a.profiles?.full_name?.[0]?.toUpperCase() || "E"}
            </div>
            <div>
              <div style={{ color:"#fff", fontWeight:600 }}>{a.profiles?.full_name || "Expert"}</div>
              <div style={{ color:"#4f8ef7", fontSize:12 }}>✓ Verified Expert · {a.profiles?.expert_profiles?.qualifications || ""}</div>
            </div>
            <div style={{ marginLeft:"auto", color:"#555", fontSize:12 }}>{timeAgo(a.created_at)}</div>
          </div>
          <p style={{ color:"#ccc", lineHeight:1.8, margin:0, fontSize:15, whiteSpace:"pre-wrap" }}>{a.body}</p>
        </div>
      ))}
      {answers.length === 0 && <div style={{ textAlign:"center", padding:32, color:"#555", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12 }}>No answers yet. Be the first expert to answer!</div>}

      {/* Answer form */}
      {isExpert && (
        <div style={{ marginTop:28 }}>
          <h3 style={{ color:"#fff", fontWeight:600, marginBottom:12 }}>Post Your Answer</h3>
          <textarea value={answerText} onChange={e => setAnswerText(e.target.value)}
            placeholder="Write a detailed, helpful answer..." rows={6}
            style={{ ...inputStyle, width:"100%", boxSizing:"border-box", resize:"vertical", height:140 }}/>
          <button onClick={submitAnswer} disabled={submitting || !answerText.trim()} style={{ ...primaryBtn, marginTop:10, display:"flex", alignItems:"center", gap:6, opacity:submitting||!answerText.trim()?0.5:1 }}>
            <Icons.Send />{submitting ? "Posting..." : "Post Answer"}
          </button>
        </div>
      )}
      {!user && <div style={{ marginTop:24, textAlign:"center", padding:20, background:"rgba(79,142,247,0.06)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:12 }}>
        <button onClick={() => navigate("/login")} style={primaryBtn}>Sign in to answer</button>
      </div>}
    </div>
  );
}

// ─── ASK QUESTION ─────────────────────────────────────────────────────────────
function AskPage({ navigate }) {
  const { user, profile } = useAuth();
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState({ title:"", body:"", domain_id:"" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { supabase.from("domains").select("*").then(({ data }) => setDomains(data || [])); }, []);

  if (!user) return <div style={{ textAlign:"center", padding:80, fontFamily:"'DM Sans', sans-serif", color:"#888" }}>Please <button onClick={() => navigate("/login")} style={primaryBtn}>sign in</button> to ask a question.</div>;

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.domain_id) return setToast({ msg:"Please fill all fields", type:"error" });
    setLoading(true);
    const { data, error } = await supabase.from("questions").insert({ ...form, user_id: user.id }).select().single();
    if (error) setToast({ msg: error.message, type:"error" });
    else navigate(`/questions/${data.id}`);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <h1 style={{ color:"#fff", fontWeight:700, fontSize:28, marginBottom:6 }}>Ask a Question</h1>
      <p style={{ color:"#666", marginBottom:32 }}>Get answers from verified domain experts</p>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28 }}>
        <label style={labelStyle}>Question Title *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="What is your question? Be specific..." style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:20 }}/>
        <label style={labelStyle}>Domain *</label>
        <select value={form.domain_id} onChange={e => setForm(f => ({ ...f, domain_id: e.target.value }))}
          style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:20 }}>
          <option value="">Select a domain...</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
        </select>
        <label style={labelStyle}>Detailed Description *</label>
        <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="Provide context, background, what you've tried..." rows={6}
          style={{ ...inputStyle, width:"100%", boxSizing:"border-box", resize:"vertical", height:160, marginBottom:24 }}/>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={submit} disabled={loading} style={{ ...primaryBtn, padding:"12px 28px", fontSize:15, display:"flex", alignItems:"center", gap:6 }}>
            <Icons.Send />{loading ? "Posting..." : "Post Question"}
          </button>
          <button onClick={() => navigate("/questions")} style={outlineBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display:"block", color:"#aaa", fontSize:13, fontWeight:600, marginBottom:8, letterSpacing:0.3 };
const inputStyle = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"11px 14px", color:"#e0e0e0", fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:"none", transition:"border-color 0.2s" };

// ─── EXPERTS PAGE ─────────────────────────────────────────────────────────────
function ExpertsPage({ navigate }) {
  const [experts, setExperts] = useState([]);
  const [domains, setDomains] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => setDomains(data || []));
    supabase.from("expert_profiles").select("*, profiles(full_name, bio), domains(name, icon, color)").eq("status", "approved")
      .then(({ data }) => { setExperts(data || []); setLoading(false); });
  }, []);

  const filtered = experts.filter(e => !filter || e.domain_id === filter);

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      <h1 style={{ color:"#fff", fontWeight:700, fontSize:28, marginBottom:6 }}>Our Experts</h1>
      <p style={{ color:"#666", marginBottom:28 }}>Verified professionals ready to help</p>
      <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
        <button onClick={() => setFilter("")} style={{ ...filterBtn, background: !filter ? "rgba(79,142,247,0.2)":"transparent", color: !filter?"#4f8ef7":"#888", borderColor: !filter?"rgba(79,142,247,0.4)":"rgba(255,255,255,0.1)" }}>All</button>
        {domains.map(d => <button key={d.id} onClick={() => setFilter(d.id)} style={{ ...filterBtn, background: filter===d.id?"rgba(79,142,247,0.2)":"transparent", color:filter===d.id?"#4f8ef7":"#888", borderColor:filter===d.id?"rgba(79,142,247,0.4)":"rgba(255,255,255,0.1)" }}>{d.icon} {d.name}</button>)}
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <div style={{ textAlign:"center", padding:60, color:"#555" }}>No experts in this domain yet.</div> :
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {filtered.map(e => {
            const c = e.domains?.color ? domainColors[e.domains.color] : { bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)" };
            return (
              <div key={e.id} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:14, padding:22, transition:"border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e2 => { e2.currentTarget.style.borderColor="rgba(79,142,247,0.3)"; e2.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e2 => { e2.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e2.currentTarget.style.transform=""; }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg, #4f8ef7, #7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:20 }}>
                    {e.profiles?.full_name?.[0]?.toUpperCase() || "E"}
                  </div>
                  <div>
                    <div style={{ color:"#fff", fontWeight:700 }}>{e.profiles?.full_name || "Expert"}</div>
                    {e.domains && <span style={{ background:c.bg, color:e.domains.color, fontSize:11, padding:"1px 8px", borderRadius:4, border:`1px solid ${c.border}` }}>{e.domains.icon} {e.domains.name}</span>}
                  </div>
                </div>
                <div style={{ color:"#888", fontSize:13, marginBottom:10, lineHeight:1.5 }}>{e.profiles?.bio || e.qualifications || "Verified domain expert"}</div>
                <div style={{ display:"flex", gap:16, color:"#666", fontSize:12 }}>
                  <span><Icons.Trophy style={{display:"inline"}}/> {e.total_answers} answers</span>
                  <span>{e.years_experience}y exp</span>
                  {e.rating > 0 && <span style={{ color:"#f59e0b", display:"flex", alignItems:"center", gap:3 }}><Icons.Star /> {e.rating}</span>}
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
const filterBtn = { background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 14px", fontFamily:"'DM Sans', sans-serif", fontSize:13, cursor:"pointer", transition:"all 0.2s" };

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function AuthPage({ mode, navigate }) {
  const [form, setForm] = useState({ email:"", password:"", full_name:"", role:"user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true); setError("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) setError(error.message);
      else navigate("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.full_name } } });
      if (error) setError(error.message);
      else { navigate("/dashboard"); }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:40, width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Icons.Logo />
          <h1 style={{ color:"#fff", fontWeight:700, fontSize:24, margin:"12px 0 4px" }}>{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
          <p style={{ color:"#666", fontSize:14 }}>{mode === "login" ? "Sign in to AskExpert" : "Join AskExpert today"}</p>
        </div>
        {mode === "signup" && <>
          <label style={labelStyle}>Full Name</label>
          <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:16 }}/>
        </>}
        <label style={labelStyle}>Email</label>
        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="you@example.com" style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:16 }}/>
        <label style={labelStyle}>Password</label>
        <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="••••••••" style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:24 }}/>
        {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#ef4444", fontSize:13, marginBottom:16 }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ ...primaryBtn, width:"100%", padding:"13px", fontSize:15, borderRadius:10 }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <p style={{ textAlign:"center", color:"#666", fontSize:13, marginTop:20 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => navigate(mode === "login" ? "/signup" : "/login")} style={{ background:"none", border:"none", color:"#4f8ef7", cursor:"pointer", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600 }}>
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── APPLY AS EXPERT ──────────────────────────────────────────────────────────
function ApplyPage({ navigate }) {
  const { user, profile, refreshProfile } = useAuth();
  const [domains, setDomains] = useState([]);
  const [form, setForm] = useState({ domain_id:"", qualifications:"", years_experience:0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { supabase.from("domains").select("*").then(({ data }) => setDomains(data || [])); }, []);

  if (!user) return <div style={{ textAlign:"center", padding:80, fontFamily:"'DM Sans', sans-serif", color:"#888" }}>Please <button onClick={() => navigate("/login")} style={primaryBtn}>sign in</button> first.</div>;
  if (profile?.expert_profiles) return <div style={{ textAlign:"center", padding:80, fontFamily:"'DM Sans', sans-serif", color:"#888" }}>
    <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
    <h2 style={{ color:"#fff" }}>Application {profile.expert_profiles.status}</h2>
    <p style={{ color:"#666" }}>Your expert application is {profile.expert_profiles.status}. {profile.expert_profiles.status === "pending" ? "Please wait for admin review." : ""}</p>
  </div>;

  const submit = async () => {
    if (!form.domain_id || !form.qualifications) return setToast({ msg:"Please fill all fields", type:"error" });
    setLoading(true);
    const { error } = await supabase.from("expert_profiles").insert({ ...form, user_id: user.id, years_experience: parseInt(form.years_experience) });
    if (error) setToast({ msg: error.message, type:"error" });
    else { setToast({ msg:"Application submitted! Awaiting admin review.", type:"success" }); refreshProfile(); setTimeout(() => navigate("/dashboard"), 2000); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:620, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <h1 style={{ color:"#fff", fontWeight:700, fontSize:28, marginBottom:6 }}>Apply as Expert</h1>
      <p style={{ color:"#666", marginBottom:32 }}>Applications are reviewed by our admin team</p>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28 }}>
        <label style={labelStyle}>Domain *</label>
        <select value={form.domain_id} onChange={e => setForm(f => ({ ...f, domain_id: e.target.value }))} style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:20 }}>
          <option value="">Select your domain...</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
        </select>
        <label style={labelStyle}>Qualifications & Credentials *</label>
        <textarea value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} placeholder="Describe your qualifications, degrees, certifications..." rows={4} style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:20, resize:"vertical" }}/>
        <label style={labelStyle}>Years of Experience</label>
        <input type="number" min={0} max={60} value={form.years_experience} onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))} style={{ ...inputStyle, width:"100%", boxSizing:"border-box", marginBottom:24 }}/>
        <button onClick={submit} disabled={loading} style={{ ...primaryBtn, padding:"12px 28px", fontSize:15 }}>
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ navigate }) {
  const { user, profile } = useAuth();
  const [myQuestions, setMyQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("questions").select("*, domains(name, icon, color)").eq("user_id", user.id).order("created_at", { ascending:false }).limit(10),
      supabase.from("answers").select("*, questions(title, id)").eq("expert_id", user.id).order("created_at", { ascending:false }).limit(10),
    ]).then(([q, a]) => { setMyQuestions(q.data || []); setMyAnswers(a.data || []); setLoading(false); });
  }, [user]);

  if (!user) return <div style={{ textAlign:"center", padding:80, fontFamily:"'DM Sans', sans-serif", color:"#888" }}>Please <button onClick={() => navigate("/login")} style={primaryBtn}>sign in</button>.</div>;

  const ep = profile?.expert_profiles;

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:36 }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:"linear-gradient(135deg, #4f8ef7, #7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:24 }}>
          {profile?.full_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 style={{ color:"#fff", fontWeight:700, fontSize:24, margin:0 }}>Welcome, {profile?.full_name || "User"}</h1>
          <div style={{ display:"flex", gap:8, marginTop:6 }}>
            <Badge text={profile?.role?.toUpperCase() || "USER"} color={profile?.role==="expert"?"#10b981":profile?.role==="admin"?"#f59e0b":"#4f8ef7"}/>
            {ep && <Badge text={ep.status?.toUpperCase()} color={ep.status==="approved"?"#10b981":ep.status==="pending"?"#f59e0b":"#ef4444"}/>}
          </div>
        </div>
      </div>

      {ep?.status === "pending" && (
        <div style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:16, marginBottom:24 }}>
          <div style={{ color:"#f59e0b", fontWeight:600 }}>⏳ Expert Application Under Review</div>
          <div style={{ color:"#888", fontSize:13, marginTop:4 }}>Your application is being reviewed by our admin team. You'll be notified once approved.</div>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h2 style={{ color:"#fff", fontWeight:600, fontSize:18, margin:0 }}>My Questions ({myQuestions.length})</h2>
              <button onClick={() => navigate("/ask")} style={{ ...primaryBtn, fontSize:12, padding:"6px 12px" }}>+ Ask</button>
            </div>
            {myQuestions.length === 0 ? <div style={{ color:"#555", fontSize:13, padding:16, background:"rgba(255,255,255,0.02)", borderRadius:10 }}>No questions yet.</div> :
              myQuestions.map(q => (
                <div key={q.id} onClick={() => navigate(`/questions/${q.id}`)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 16px", marginBottom:8, cursor:"pointer" }}>
                  <div style={{ color:"#e0e0e0", fontSize:14, fontWeight:500 }}>{q.title}</div>
                  <div style={{ display:"flex", gap:12, marginTop:6, color:"#555", fontSize:12 }}>
                    <span>{q.domains?.icon} {q.domains?.name}</span>
                    <span style={{ color: q.status==="answered"?"#10b981":"#f59e0b" }}>{q.status}</span>
                    <span>{q.answer_count} answers</span>
                  </div>
                </div>
              ))
            }
          </div>
          <div>
            <h2 style={{ color:"#fff", fontWeight:600, fontSize:18, margin:"0 0 14px" }}>My Answers ({myAnswers.length})</h2>
            {myAnswers.length === 0 ? <div style={{ color:"#555", fontSize:13, padding:16, background:"rgba(255,255,255,0.02)", borderRadius:10 }}>No answers yet.</div> :
              myAnswers.map(a => (
                <div key={a.id} onClick={() => navigate(`/questions/${a.questions?.id}`)} style={{ background:"rgba(79,142,247,0.04)", border:"1px solid rgba(79,142,247,0.1)", borderRadius:10, padding:"12px 16px", marginBottom:8, cursor:"pointer" }}>
                  <div style={{ color:"#e0e0e0", fontSize:14, fontWeight:500 }}>{a.questions?.title}</div>
                  <div style={{ color:"#555", fontSize:12, marginTop:4 }}>{a.body?.substring(0, 80)}...</div>
                  <div style={{ color:"#555", fontSize:11, marginTop:4 }}>{timeAgo(a.created_at)}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ navigate }) {
  const { profile } = useAuth();
  const [pending, setPending] = useState([]);
  const [allExperts, setAllExperts] = useState([]);
  const [tab, setTab] = useState("pending");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("expert_profiles").select("*, profiles(full_name, email), domains(name, icon)").eq("status", "pending"),
      supabase.from("expert_profiles").select("*, profiles(full_name, email), domains(name, icon)").neq("status", "pending"),
    ]);
    setPending(p || []); setAllExperts(a || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (profile?.role !== "admin") return <div style={{ textAlign:"center", padding:80, color:"#666", fontFamily:"'DM Sans', sans-serif" }}>Access Denied. Admins only.</div>;

  const approve = async (id, userId) => {
    await supabase.from("expert_profiles").update({ status:"approved", approved_by:profile.id, approved_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("profiles").update({ role:"expert" }).eq("id", userId);
    await supabase.from("notifications").insert({ user_id:userId, type:"expert_approved", title:"Application Approved! 🎉", message:"You are now a verified expert on AskExpert. Start answering questions!", link:"/dashboard" });
    setToast({ msg:"Expert approved!", type:"success" }); load();
  };

  const reject = async (id, userId) => {
    await supabase.from("expert_profiles").update({ status:"rejected" }).eq("id", id);
    await supabase.from("notifications").insert({ user_id:userId, type:"expert_rejected", title:"Application Update", message:"Your expert application was not approved at this time.", link:"/apply" });
    setToast({ msg:"Application rejected.", type:"error" }); load();
  };

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px", fontFamily:"'DM Sans', sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
        <Icons.Shield />
        <h1 style={{ color:"#fff", fontWeight:700, fontSize:28, margin:0 }}>Admin Panel</h1>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {["pending", "all"].map(t => <button key={t} onClick={() => setTab(t)} style={{ ...filterBtn, background:tab===t?"rgba(79,142,247,0.2)":"transparent", color:tab===t?"#4f8ef7":"#888", borderColor:tab===t?"rgba(79,142,247,0.3)":"rgba(255,255,255,0.1)" }}>
          {t === "pending" ? `Pending Applications (${pending.length})` : `All Experts (${allExperts.length})`}
        </button>)}
      </div>

      {tab === "pending" && (pending.length === 0 ?
        <div style={{ textAlign:"center", padding:60, color:"#555" }}>No pending applications.</div> :
        pending.map(ep => (
          <div key={ep.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:24, marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#fff", fontWeight:600, fontSize:16 }}>{ep.profiles?.full_name}</div>
                <div style={{ color:"#888", fontSize:13 }}>{ep.profiles?.email}</div>
                <div style={{ color:"#4f8ef7", fontSize:13, marginTop:4 }}>{ep.domains?.icon} {ep.domains?.name} · {ep.years_experience}y exp</div>
                <div style={{ color:"#aaa", fontSize:13, marginTop:8, lineHeight:1.6 }}><strong style={{ color:"#666" }}>Qualifications:</strong> {ep.qualifications}</div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <button onClick={() => approve(ep.id, ep.user_id)} style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", color:"#10b981", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontFamily:"'DM Sans', sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                  <Icons.Check /> Approve
                </button>
                <button onClick={() => reject(ep.id, ep.user_id)} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontFamily:"'DM Sans', sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                  <Icons.X /> Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {tab === "all" && (allExperts.length === 0 ?
        <div style={{ textAlign:"center", padding:60, color:"#555" }}>No experts yet.</div> :
        allExperts.map(ep => (
          <div key={ep.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px 20px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <span style={{ color:"#e0e0e0", fontWeight:600 }}>{ep.profiles?.full_name}</span>
              <span style={{ color:"#666", fontSize:13, marginLeft:12 }}>{ep.domains?.icon} {ep.domains?.name}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:"#666", fontSize:12 }}>{ep.total_answers} answers</span>
              <Badge text={ep.status?.toUpperCase()} color={ep.status==="approved"?"#10b981":ep.status==="rejected"?"#ef4444":"#f59e0b"}/>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { path, navigate } = useRouter();

  const render = () => {
    const cleanPath = path.split("?")[0];
    if (cleanPath === "/" || cleanPath === "") return <HomePage navigate={navigate}/>;
    if (cleanPath === "/questions") return <QuestionsPage navigate={navigate}/>;
    if (cleanPath.startsWith("/questions/")) return <QuestionDetailPage id={cleanPath.split("/questions/")[1]} navigate={navigate}/>;
    if (cleanPath === "/ask") return <AskPage navigate={navigate}/>;
    if (cleanPath === "/experts") return <ExpertsPage navigate={navigate}/>;
    if (cleanPath === "/login") return <AuthPage mode="login" navigate={navigate}/>;
    if (cleanPath === "/signup") return <AuthPage mode="signup" navigate={navigate}/>;
    if (cleanPath === "/dashboard") return <DashboardPage navigate={navigate}/>;
    if (cleanPath === "/apply") return <ApplyPage navigate={navigate}/>;
    if (cleanPath === "/admin") return <AdminPage navigate={navigate}/>;
    return <div style={{ textAlign:"center", padding:80, color:"#666", fontFamily:"'DM Sans', sans-serif" }}>404 – Page not found</div>;
  };

  return (
    <AuthProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0c14; min-height: 100vh; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(79,142,247,0.5) !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0c0c14; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
      `}</style>
      <div style={{ minHeight:"100vh" }}>
        <AppWithNav path={path} navigate={navigate} render={render} />
      </div>
    </AuthProvider>
  );
}

function AppWithNav({ path, navigate, render }) {
  return <>
    <Navbar navigate={navigate} path={path}/>
    <main>{render()}</main>
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"24px", textAlign:"center", color:"#444", fontSize:13, fontFamily:"'DM Sans', sans-serif", marginTop:60 }}>
      © {new Date().getFullYear()} AskExpert · Built with Supabase
    </footer>
  </>;
}
