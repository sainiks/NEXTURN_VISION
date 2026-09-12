"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  Briefcase, 
  GitBranch, 
  Calendar,
  CheckCircle,
  AlertCircle,
  KeyRound,
  History,
  Mail,
  ArrowLeft,
  Search,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Upload,
  Camera
} from "lucide-react";
import { Drive, RecruiterStep, PipelineEvent, PortalData, TopTalent } from "@/lib/content";
import { ALL_TEAM_CARDS, TeamMemberAccess, isVicePresident } from "@/lib/teamAccess";
import { ActivityLogEntry } from "@/lib/mailer";

interface SessionData {
  user: string;
  code: string;
  role: string;
  accessLevel: "ALPHA_1" | "BETA_2";
  department: string;
}

/* ── Hexagon Avatar Component matching /team ── */
function AdminHexAvatar({ member, size = "md" }: { member: TeamMemberAccess; size?: "sm" | "md" | "lg" }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = { sm: "w-20 h-20 md:w-24 md:h-24", md: "w-28 h-28 md:w-32 md:h-32", lg: "w-36 h-36 md:w-44 md:h-44" };
  const textSizes = { sm: "text-2xl md:text-3xl", md: "text-4xl", lg: "text-5xl md:text-6xl" };

  return (
    <div
      className={`${sizeClasses[size]} bg-[var(--color-foreground)] text-[var(--color-background)] flex items-center justify-center relative overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}
      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
    >
      {member.image && !imgError && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-md scale-110"
          style={{ backgroundImage: `url(${member.image})` }}
        />
      )}
      {member.image && !imgError ? (
        <Image
          src={member.image}
          alt={member.name}
          fill
          className={`${member.imageFit === "fill" ? "object-fill" : "object-cover"} relative z-10`}
          style={member.imageStyle || {}}
          sizes="250px"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`${textSizes[size]} font-black`}>{member.initials}</span>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Selection Flow States
  const [selectedMember, setSelectedMember] = useState<TeamMemberAccess | null>(null);
  const [code, setCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<"ALL" | "ALPHA_1" | "BETA_2">("ALL");

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"drives" | "process" | "pipeline" | "talents" | "logs">("drives");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Content states
  const [drives, setDrives] = useState<Drive[]>([]);
  const [processSteps, setProcessSteps] = useState<RecruiterStep[]>([]);
  const [pipelineEvents, setPipelineEvents] = useState<PipelineEvent[]>([]);
  const [topTalents, setTopTalents] = useState<TopTalent[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const isAlpha1 = session?.accessLevel === "ALPHA_1";
  const isBeta2 = session?.accessLevel === "BETA_2";
  const isVP = isVicePresident(session);

  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isClearingAllLogs, setIsClearingAllLogs] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // 1. Check session on mount
  useEffect(() => {
    checkAuth();
    fetchContent();
  }, []);

  // Guard: If non-Kunal user is on logs tab, force back to drives
  useEffect(() => {
    if (session && !isVicePresident(session) && activeTab === "logs") {
      setActiveTab("drives");
    }
  }, [session, activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.session) {
        const s: SessionData = {
          user: data.session.user,
          code: data.session.code,
          role: data.session.role,
          accessLevel: data.session.accessLevel,
          department: data.session.department,
        };
        setSession(s);
        if (isVicePresident(s)) {
          fetchLogs(s);
        } else {
          setActivityLogs([]);
        }
      } else {
        setSession(null);
        setActivityLogs([]);
      }
    } catch {
      setSession(null);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const json = await res.json();
      if (json.success && json.data) {
        const data: PortalData = json.data;
        setDrives(data.drives || []);
        setProcessSteps(data.recruiterProcess || []);
        setPipelineEvents(data.pipelineEvents || []);
        setTopTalents(data.topTalents || []);
      }
    } catch (err) {
      console.error("Failed to load portal data", err);
    }
  };

  const fetchLogs = async (currentSession?: SessionData | null) => {
    const s = currentSession !== undefined ? currentSession : session;
    if (!isVicePresident(s)) {
      setActivityLogs([]);
      return;
    }
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success && data.logs) {
        setActivityLogs(data.logs);
      } else {
        setActivityLogs([]);
      }
    } catch {
      setActivityLogs([]);
    }
  };

  const handleLogin = async (e: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    setAuthError("");
    const submissionCode = customCode || code;

    if (!selectedMember) {
      setAuthError("Please select your team card first.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: submissionCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Enforce that entered code belongs to selected team card
        if (data.session.code !== selectedMember.code && data.session.code !== "TECH-IITM-2026") {
          setAuthError(`Code mismatch: The entered code does not belong to ${selectedMember.name}. Please enter your matching code.`);
          return;
        }

        setSession(data.session);
        fetchContent();
        if (isVicePresident(data.session)) {
          fetchLogs(data.session);
        } else {
          setActivityLogs([]);
          if (activeTab === "logs") setActiveTab("drives");
        }
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch {
      setAuthError("Network error during authentication");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      setSelectedMember(null);
      setCode("");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      const res = await fetch("/api/test-email", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", data.message || "Test email sent to nexturn.kunal@gmail.com!");
      } else {
        showToast("error", data.message || "Failed to send test email.");
      }
      fetchLogs();
    } catch {
      showToast("error", "Network error while attempting to send test email.");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!isVP) {
      showToast("error", "Access Denied: Only Vice President Kunal Saini can delete security logs.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this security audit entry? This action is irreversible.")) {
      return;
    }

    setDeletingLogId(logId);
    try {
      const res = await fetch("/api/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", data.message || "Log entry deleted successfully.");
        setActivityLogs((prev) => prev.filter((l) => l.id !== logId));
      } else {
        showToast("error", data.error || "Failed to delete log entry.");
      }
    } catch {
      showToast("error", "Network error while deleting log.");
    } finally {
      setDeletingLogId(null);
    }
  };

  const handleClearAllLogs = async () => {
    if (!isVP) {
      showToast("error", "Access Denied: Only Vice President Kunal Saini can clear security logs.");
      return;
    }
    if (!window.confirm("WARNING: Are you sure you want to clear ALL security audit records? This cannot be undone.")) {
      return;
    }

    setIsClearingAllLogs(true);
    try {
      const res = await fetch("/api/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", data.message || "All security logs have been cleared.");
        setActivityLogs([]);
      } else {
        showToast("error", data.error || "Failed to clear logs.");
      }
    } catch {
      showToast("error", "Network error while clearing logs.");
    } finally {
      setIsClearingAllLogs(false);
    }
  };

  const getLogDaysRemaining = (log: ActivityLogEntry): number => {
    let timestamp = log.createdAt;
    if (!timestamp) {
      const match = log.id.match(/^LOG-(\d+)-/);
      if (match && match[1]) {
        timestamp = parseInt(match[1], 10);
      }
    }
    if (!timestamp && log.timestamp) {
      const parsed = Date.parse(log.timestamp.replace(" IST", ""));
      if (!isNaN(parsed)) timestamp = parsed;
    }
    if (!timestamp || isNaN(timestamp)) return 30;

    const ageMs = Date.now() - timestamp;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const remainingMs = thirtyDaysMs - ageMs;
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  };

  // Section Save Handlers (Strictly blocked for Beta-2)
  const saveSection = async (section: "drives" | "recruiterProcess" | "pipelineEvents" | "topTalents", payload: unknown) => {
    if (!isAlpha1) {
      showToast("error", "Access Denied: Beta-2 core members have read-only access. Nothing can be changed.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const labels: Record<string, string> = {
          drives: "Active Drives",
          recruiterProcess: "Recruiter Process",
          pipelineEvents: "Pipeline Events",
          topTalents: "Top 4 Talents",
        };
        showToast("success", `Updated ${labels[section] || section} successfully! Audit email dispatched to Vice President (nexturn.kunal@gmail.com).`);
        fetchLogs();
      } else {
        showToast("error", data.error || "Failed to save changes");
      }
    } catch {
      showToast("error", "Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- TOP TALENTS OPERATIONS ----------------
  const updateTalentField = (index: number, field: keyof TopTalent, value: string) => {
    if (!isAlpha1) return;
    const updated = [...topTalents];
    updated[index] = { ...updated[index], [field]: value };
    setTopTalents(updated);
  };

  const handleTalentImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAlpha1) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "Image file is too large. Please select an image under 10MB.");
      return;
    }

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slot", String(index + 1));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        updateTalentField(index, "pic", data.url);
        showToast("success", `Photo uploaded from device for Candidate 0${index + 1}! Click 'Save Top Talents' to publish.`);
      } else {
        showToast("error", data.error || "Failed to upload image from device.");
      }
    } catch {
      showToast("error", "Network error while uploading photo from device.");
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  // ---------------- DRIVE OPERATIONS ----------------
  const updateDriveField = (index: number, field: keyof Drive, value: string) => {
    if (!isAlpha1) return;
    const updated = [...drives];
    updated[index] = { ...updated[index], [field]: value };
    setDrives(updated);
  };

  const addDrive = () => {
    if (!isAlpha1) return;
    const nextId = drives.length > 0 ? Math.max(...drives.map((d) => d.id)) + 1 : 1;
    const newDrive: Drive = {
      id: nextId,
      role: "Software Development Engineer",
      company: "NEW COMPANY",
      ctc: "12 LPA",
      deadline: "30 OCT",
      portalUrl: "https://",
      status: "OPEN",
    };
    setDrives([newDrive, ...drives]);
  };

  const deleteDrive = (index: number) => {
    if (!isAlpha1) return;
    setDrives(drives.filter((_, i) => i !== index));
  };

  // ---------------- PROCESS OPERATIONS ----------------
  const updateProcessField = (index: number, field: keyof RecruiterStep, value: string) => {
    if (!isAlpha1) return;
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    setProcessSteps(updated);
  };

  const addProcessStep = () => {
    if (!isAlpha1) return;
    const nextNum = String(processSteps.length + 1).padStart(2, "0");
    const newStep: RecruiterStep = {
      phase: nextNum,
      title: "New Stage",
      desc: "Provide stage description here.",
    };
    setProcessSteps([...processSteps, newStep]);
  };

  const deleteProcessStep = (index: number) => {
    if (!isAlpha1) return;
    setProcessSteps(processSteps.filter((_, i) => i !== index));
  };

  // ---------------- PIPELINE OPERATIONS ----------------
  const updatePipelineField = (index: number, field: keyof PipelineEvent, value: string) => {
    if (!isAlpha1) return;
    const updated = [...pipelineEvents];
    updated[index] = { ...updated[index], [field]: value };
    setPipelineEvents(updated);
  };

  const addPipelineEvent = () => {
    if (!isAlpha1) return;
    const nextId = pipelineEvents.length > 0 ? Math.max(...pipelineEvents.map((e) => e.id)) + 1 : 1;
    const newEvent: PipelineEvent = {
      id: nextId,
      date: "OCT 30, 2026",
      status: "SCHEDULED",
      title: "New Campus Event",
      location: "IITM Main Auditorium",
      priority: "High",
      formUrl: "https://forms.google.com/",
    };
    setPipelineEvents([newEvent, ...pipelineEvents]);
  };

  const deletePipelineEvent = (index: number) => {
    if (!isAlpha1) return;
    setPipelineEvents(pipelineEvents.filter((_, i) => i !== index));
  };

  // Filter team cards
  const alphaCards = ALL_TEAM_CARDS.filter((c) => c.accessLevel === "ALPHA_1");
  const betaCards = ALL_TEAM_CARDS.filter((c) => c.accessLevel === "BETA_2");

  const filterMatches = (c: TeamMemberAccess) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.department.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterLevel === "ALPHA_1") return matchesSearch && c.accessLevel === "ALPHA_1";
    if (filterLevel === "BETA_2") return matchesSearch && c.accessLevel === "BETA_2";
    return matchesSearch;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] font-mono">
        INITIALIZING SECURITY CONSOLE...
      </div>
    );
  }

  // ---------------- UNSECURED: SELECT CARD & ENTER IDENTIFICATION CODE ----------------
  if (!session) {
    return (
      <main className="min-h-screen pt-28 pb-32 px-6 md:px-12 bg-[var(--color-background)] text-[var(--color-foreground)]">
        <div className="max-w-7xl mx-auto">
          {/* TOP NAV BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 brutalist-border-b pb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-6 h-6 text-[var(--color-accent)]" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] opacity-70">
                  NEXTURN CONNECT // CORE ACCESS GATEWAY
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
                CORE
              </h1>
              <p className="text-sm md:text-lg font-medium opacity-80 uppercase tracking-widest mt-2">
                Step 1: Select your team card • Step 2: Enter your card identification code
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1.5 bg-green-500/10 border-2 border-green-600 text-green-700 font-bold uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                Alpha-1 (Write)
              </span>
              <span className="px-3 py-1.5 bg-amber-500/10 border-2 border-amber-600 text-amber-700 font-bold uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-600" />
                Beta-2 (Read-Only)
              </span>
              <Link
                href="/"
                className="px-4 py-1.5 border-2 border-[var(--color-foreground)] font-bold uppercase hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors"
              >
                Exit ↗
              </Link>
            </div>
          </div>

          {/* STEP 1: ROSTER SELECTION VIEW */}
          {!selectedMember ? (
            <div className="flex flex-col gap-12">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-surface)] p-6 brutalist-border">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Active Team Roster</h2>
                    <p className="text-xs font-mono text-[var(--color-muted)]">
                      Click your profile card to unlock authentication.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input
                      type="text"
                      placeholder="SEARCH BY NAME OR ROLE..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono border-2 border-[var(--color-border)] bg-[var(--color-background)] uppercase focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div className="flex border-2 border-[var(--color-border)] text-xs font-mono">
                    <button
                      onClick={() => setFilterLevel("ALL")}
                      className={`px-3 py-2 uppercase font-bold transition-colors ${filterLevel === "ALL" ? "bg-[var(--color-foreground)] text-[var(--color-background)]" : "hover:bg-[var(--color-surface)]"}`}
                    >
                      ALL ({ALL_TEAM_CARDS.length})
                    </button>
                    <button
                      onClick={() => setFilterLevel("ALPHA_1")}
                      className={`px-3 py-2 uppercase font-bold transition-colors ${filterLevel === "ALPHA_1" ? "bg-green-600 text-white" : "hover:bg-[var(--color-surface)]"}`}
                    >
                      ALPHA-1 ({alphaCards.length})
                    </button>
                    <button
                      onClick={() => setFilterLevel("BETA_2")}
                      className={`px-3 py-2 uppercase font-bold transition-colors ${filterLevel === "BETA_2" ? "bg-amber-600 text-white" : "hover:bg-[var(--color-surface)]"}`}
                    >
                      BETA-2 ({betaCards.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* TIER 1: LEADERSHIP & TECH TEAM (ALPHA-1) */}
              {(filterLevel === "ALL" || filterLevel === "ALPHA_1") && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-green-600 text-white font-mono text-xs font-black uppercase tracking-wider">
                      TIER 01 // ALPHA-1 CLEARANCE
                    </span>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                      Executive Leadership & Tech Team
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {alphaCards.filter(filterMatches).map((member) => (
                      <div
                        key={member.code}
                        onClick={() => {
                          setSelectedMember(member);
                          setCode("");
                          setAuthError("");
                        }}
                        className="group relative brutalist-border bg-[var(--color-surface)] p-8 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0px_0px_var(--color-accent)] overflow-hidden"
                      >
                        {/* Corner crosshairs */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--color-accent)]" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--color-accent)]" />

                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-green-500/10 border border-green-500 text-green-700">
                              ALPHA-1 // COMMAND WRITE
                            </span>
                            <span className="font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity font-bold">
                              {member.initials}_
                            </span>
                          </div>

                          <div className="flex justify-center mb-6">
                            <AdminHexAvatar member={member} size="md" />
                          </div>

                          <h4 className="text-2xl font-black uppercase tracking-tight text-center mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                            {member.name}
                          </h4>
                          <p className="text-sm font-bold text-center uppercase tracking-widest text-[var(--color-accent)] mb-2">
                            {member.role}
                          </p>
                          <p className="text-xs font-mono text-center opacity-60 uppercase">
                            {member.department}
                          </p>
                        </div>

                        <div className="mt-8 pt-4 border-t-2 border-[var(--color-border)] flex items-center justify-between text-xs font-mono font-bold uppercase group-hover:text-[var(--color-accent)]">
                          <span>Authenticate Card</span>
                          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* TIER 2: CORE DEPARTMENT HEADS & SECRETARIAT (BETA-2) */}
              {(filterLevel === "ALL" || filterLevel === "BETA_2") && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-amber-600 text-white font-mono text-xs font-black uppercase tracking-wider">
                      TIER 02 // BETA-2 CLEARANCE
                    </span>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                      Core Members & Department Heads
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {betaCards.filter(filterMatches).map((member) => (
                      <div
                        key={member.code}
                        onClick={() => {
                          setSelectedMember(member);
                          setCode("");
                          setAuthError("");
                        }}
                        className="group relative brutalist-border bg-[var(--color-surface)] p-6 cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:-translate-x-1.5 hover:shadow-[6px_6px_0px_0px_#000]"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 border border-amber-500 text-amber-700">
                              BETA-2 // AUDIT
                            </span>
                            <span className="font-mono text-xs opacity-30 font-bold">
                              {member.initials}
                            </span>
                          </div>

                          <div className="flex justify-center mb-4">
                            <AdminHexAvatar member={member} size="sm" />
                          </div>

                          <h4 className="text-lg font-black uppercase tracking-tight text-center mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                            {member.name}
                          </h4>
                          <p className="text-xs font-bold text-center uppercase tracking-wider text-[var(--color-accent)] mb-1">
                            {member.role}
                          </p>
                          <p className="text-[11px] font-mono text-center opacity-60 uppercase line-clamp-1">
                            {member.department}
                          </p>
                        </div>

                        <div className="mt-6 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono font-bold uppercase opacity-70 group-hover:opacity-100">
                          <span>Select Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            /* STEP 2: SELECTED PROFILE SECURITY VERIFICATION MODAL */
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setCode("");
                    setAuthError("");
                  }}
                  className="px-4 py-2 border-2 border-[var(--color-foreground)] font-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Team Roster
                </button>
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold">
                  STEP 02 OF 02: VERIFY CODE
                </span>
              </div>

              <div className="brutalist-border bg-[var(--color-surface)] p-8 md:p-12 shadow-[10px_10px_0px_0px_var(--color-accent)]">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b-2 border-[var(--color-border)]">
                  <AdminHexAvatar member={selectedMember} size="lg" />

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <span className={`text-xs font-black uppercase px-3 py-1 text-white ${
                        selectedMember.accessLevel === "ALPHA_1" ? "bg-green-600" : "bg-amber-600"
                      }`}>
                        CLEARANCE: {selectedMember.accessLevel === "ALPHA_1" ? "ALPHA-1 (LEADERS & TECH)" : "BETA-2 (CORE MEMBER)"}
                      </span>
                      <span className="text-xs font-mono uppercase border-2 border-[var(--color-border)] px-2.5 py-0.5 font-bold">
                        {selectedMember.department}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-1">
                      {selectedMember.name}
                    </h2>
                    <p className="text-base md:text-lg font-bold text-[var(--color-accent)] uppercase tracking-wider">
                      {selectedMember.role}
                    </p>
                    <p className="text-xs font-mono text-[var(--color-muted)] mt-2">
                      {selectedMember.accessLevel === "ALPHA_1"
                        ? "✓ Full authorization: Active drives, recruiter pipeline, and Google Forms RSVP."
                        : "⚠ Audit mode: View-only access. Form edits and data changes are restricted."}
                    </p>
                  </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider">
                        Enter Identification Code for {selectedMember.name}
                      </label>
                      <Link
                        href="/team"
                        target="_blank"
                        className="text-[11px] font-mono text-[var(--color-accent)] underline hover:opacity-80"
                      >
                        View 3D Team Card ↗
                      </Link>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-5 h-5 absolute left-3.5 top-3.5 opacity-50" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE (e.g. NC-026-...)"
                        className="w-full bg-[var(--color-background)] border-3 border-[var(--color-border)] p-3.5 pl-12 text-lg font-mono font-black uppercase focus:outline-none focus:border-[var(--color-accent)] transition-colors tracking-widest"
                      />
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-2 font-mono">
                      Your code is located in the metadata block on the back of your card on the Team page.
                    </p>
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border-2 border-red-500 text-red-500 text-xs font-bold uppercase">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-2 brutalist-btn py-4 flex items-center justify-center gap-2 text-sm tracking-widest"
                  >
                    <Lock className="w-4 h-4" />
                    AUTHENTICATE AS {selectedMember.name.toUpperCase()}
                  </button>
                </form>

                {/* TESTING SHORTCUT */}
                <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs font-mono">
                  <span className="opacity-60">Verified Code for {selectedMember.name}:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCode(selectedMember.code);
                      handleLogin({ preventDefault: () => {} } as React.FormEvent, selectedMember.code);
                    }}
                    className="px-3 py-1.5 border border-[var(--color-accent)] bg-[var(--color-background)] hover:bg-[var(--color-accent)] hover:text-white transition-colors font-bold uppercase flex items-center gap-1.5"
                  >
                    Auto-Fill Code: {selectedMember.code} ↗
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ---------------- AUTHORIZED: DASHBOARD VIEW ----------------
  return (
    <main className="min-h-screen pt-28 pb-32 px-6 md:px-12 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="max-w-7xl mx-auto">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 brutalist-border-b pb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-xs font-black uppercase px-3 py-1 tracking-wider text-white ${
                isAlpha1 ? "bg-green-600" : "bg-amber-600"
              }`}>
                CLEARANCE: {isAlpha1 ? "ALPHA-1 (LEADERSHIP & TECH)" : "BETA-2 (CORE MEMBER)"}
              </span>
              <span className="border-2 border-[var(--color-border)] text-xs font-mono uppercase px-3 py-1 font-bold">
                CODE: {session.code}
              </span>
              <span className="border-2 border-[var(--color-border)] text-xs font-mono uppercase px-3 py-1 opacity-80">
                USER: {session.user} ({session.role})
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
              CORE Console
            </h1>
            <p className="text-sm font-mono text-[var(--color-muted)] mt-1">
              DEPARTMENT: {session.department} // {isAlpha1 ? "FULL READ/WRITE CLEARANCE" : "READ-ONLY AUDIT CLEARANCE"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 border-2 border-[var(--color-foreground)] font-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors"
            >
              Live Site <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase flex items-center gap-2 hover:bg-red-700 transition-colors shadow-[2px_2px_0px_0px_#000]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>

        {/* CLEARANCE WARNING BANNER FOR BETA-2 */}
        {isBeta2 && (
          <div className="mb-8 p-4 bg-amber-500/10 border-2 border-amber-500 text-amber-700 font-mono text-xs uppercase flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div>
                <strong>RESTRICTED AUDIT MODE (BETA-2):</strong> You have view-only access. Core members cannot make changes.
              </div>
            </div>
            <span className="bg-amber-600 text-white px-2 py-1 font-bold text-[10px]">
              MODIFICATIONS LOCKED
            </span>
          </div>
        )}

        {isAlpha1 && (
          <div className="mb-8 p-3 bg-green-500/10 border-2 border-green-500 text-green-700 font-mono text-xs uppercase flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-green-600" />
              <span><strong>ALPHA-1 CLEARANCE ACTIVE:</strong> Any modifications you save will be instantly emailed to Vice President (nexturn.kunal@gmail.com).</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-800">
              <Mail className="w-3.5 h-3.5" /> AUDIT DISPATCH ACTIVE
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {statusMessage && (
          <div
            className={`mb-8 p-4 border-2 flex items-center justify-between font-mono text-sm uppercase ${
              statusMessage.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-600"
                : "bg-red-500/10 border-red-500 text-red-500"
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              {statusMessage.text}
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-10 border-b-2 border-[var(--color-border)] pb-4">
          <button
            onClick={() => setActiveTab("drives")}
            className={`px-6 py-3 font-black uppercase text-sm md:text-base tracking-wider flex items-center gap-2 transition-all border-2 ${
              activeTab === "drives"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)] shadow-[4px_4px_0px_var(--color-accent)]"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Active Drives & Links ({drives.length})
          </button>

          <button
            onClick={() => setActiveTab("process")}
            className={`px-6 py-3 font-black uppercase text-sm md:text-base tracking-wider flex items-center gap-2 transition-all border-2 ${
              activeTab === "process"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)] shadow-[4px_4px_0px_var(--color-accent)]"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Recruiter Process ({processSteps.length})
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-6 py-3 font-black uppercase text-sm md:text-base tracking-wider flex items-center gap-2 transition-all border-2 ${
              activeTab === "pipeline"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)] shadow-[4px_4px_0px_var(--color-accent)]"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Pipeline & Forms ({pipelineEvents.length})
          </button>

          <button
            onClick={() => setActiveTab("talents")}
            className={`px-6 py-3 font-black uppercase text-sm md:text-base tracking-wider flex items-center gap-2 transition-all border-2 ${
              activeTab === "talents"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)] shadow-[4px_4px_0px_var(--color-accent)]"
                : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Top 4 Talents ({topTalents.length})
          </button>

          {isVP && (
            <button
              onClick={() => {
                setActiveTab("logs");
                fetchLogs();
              }}
              className={`px-6 py-3 font-black uppercase text-sm md:text-base tracking-wider flex items-center gap-2 transition-all border-2 ${
                activeTab === "logs"
                  ? "bg-[var(--color-foreground)] text-[var(--color-background)] border-[var(--color-foreground)] shadow-[4px_4px_0px_var(--color-accent)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
              }`}
            >
              <History className="w-4 h-4" />
              VP Audit Logs ({activityLogs.length})
            </button>
          )}
        </div>

        {/* ---------------- TAB 1: ACTIVE DRIVES ---------------- */}
        {activeTab === "drives" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--color-surface)] p-6 brutalist-border">
              <div>
                <h2 className="text-2xl font-black uppercase">Student Portal — Active Drives</h2>
                <p className="text-xs font-mono text-[var(--color-muted)] mt-1">
                  Manage active recruitment drives and attach candidate portal / application URLs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAlpha1 ? (
                  <>
                    <button
                      onClick={addDrive}
                      className="px-4 py-2 border-2 border-[var(--color-border)] font-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Drive
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={() => saveSection("drives", drives)}
                      className="px-6 py-2 brutalist-btn text-xs tracking-wider flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "SAVING & NOTIFYING..." : "SAVE DRIVES"}
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2 border-2 border-amber-500 bg-amber-500/10 text-amber-700 font-mono text-xs uppercase flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> READ-ONLY (BETA-2)
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {drives.map((drive, index) => (
                <div
                  key={drive.id}
                  className="brutalist-border p-6 bg-[var(--color-surface)] flex flex-col gap-4 shadow-[4px_4px_0px_0px_var(--color-border)]"
                >
                  <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                    <span className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase">
                      DRIVE_ID #{drive.id}
                    </span>
                    {isAlpha1 ? (
                      <button
                        onClick={() => deleteDrive(index)}
                        className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-xs font-bold uppercase transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Company</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={drive.company}
                        onChange={(e) => updateDriveField(index, "company", e.target.value)}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Role</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={drive.role}
                        onChange={(e) => updateDriveField(index, "role", e.target.value)}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">CTC (Package)</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={drive.ctc}
                        onChange={(e) => updateDriveField(index, "ctc", e.target.value)}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase text-[var(--color-accent)] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Deadline</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={drive.deadline}
                        onChange={(e) => updateDriveField(index, "deadline", e.target.value)}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        Portal / Application URL (Students will be directed here)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          disabled={!isAlpha1}
                          value={drive.portalUrl}
                          onChange={(e) => updateDriveField(index, "portalUrl", e.target.value)}
                          placeholder="https://company.com/careers/apply"
                          className="flex-1 border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-xs font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        {drive.portalUrl && (
                          <a
                            href={drive.portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 border-2 border-[var(--color-border)] text-xs font-bold uppercase flex items-center gap-1 hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                          >
                            Test ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold uppercase mb-1">Drive Status</label>
                      <select
                        disabled={!isAlpha1}
                        value={drive.status}
                        onChange={(e) => updateDriveField(index, "status", e.target.value as Drive["status"])}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-xs font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="OPEN">OPEN (Accepting Applications)</option>
                        <option value="UPCOMING">UPCOMING (Announced)</option>
                        <option value="CLOSED">CLOSED (Finished)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- TAB 2: RECRUITER PROCESS ---------------- */}
        {activeTab === "process" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--color-surface)] p-6 brutalist-border">
              <div>
                <h2 className="text-2xl font-black uppercase">Recruiter Section — The Process</h2>
                <p className="text-xs font-mono text-[var(--color-muted)] mt-1">
                  Customize the step-by-step recruitment journey displayed to prospective employers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAlpha1 ? (
                  <>
                    <button
                      onClick={addProcessStep}
                      className="px-4 py-2 border-2 border-[var(--color-border)] font-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Stage
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={() => saveSection("recruiterProcess", processSteps)}
                      className="px-6 py-2 brutalist-btn text-xs tracking-wider flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "SAVING & NOTIFYING..." : "SAVE PROCESS"}
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2 border-2 border-amber-500 bg-amber-500/10 text-amber-700 font-mono text-xs uppercase flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> READ-ONLY (BETA-2)
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="brutalist-border p-6 bg-[var(--color-surface)] flex flex-col gap-4 shadow-[4px_4px_0px_0px_var(--color-border)]"
                >
                  <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                    <span className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase">
                      STAGE INDEX #{index + 1}
                    </span>
                    {isAlpha1 ? (
                      <button
                        onClick={() => deleteProcessStep(index)}
                        className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-xs font-bold uppercase transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase mb-1">Phase No.</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={step.phase}
                        onChange={(e) => updateProcessField(index, "phase", e.target.value)}
                        placeholder="01"
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-lg font-black uppercase text-[var(--color-accent)] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase mb-1">Stage Title</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={step.title}
                        onChange={(e) => updateProcessField(index, "title", e.target.value)}
                        placeholder="Pre-Placement Talk"
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Stage Description</label>
                    <textarea
                      rows={3}
                      disabled={!isAlpha1}
                      value={step.desc}
                      onChange={(e) => updateProcessField(index, "desc", e.target.value)}
                      className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- TAB 3: PIPELINE & GOOGLE FORMS ---------------- */}
        {activeTab === "pipeline" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--color-surface)] p-6 brutalist-border">
              <div>
                <h2 className="text-2xl font-black uppercase">Pipeline Timeline & Google Forms</h2>
                <p className="text-xs font-mono text-[var(--color-muted)] mt-1">
                  Update mission events and link Google Forms to the &quot;Confirm Attendance&quot; RSVP action.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAlpha1 ? (
                  <>
                    <button
                      onClick={addPipelineEvent}
                      className="px-4 py-2 border-2 border-[var(--color-border)] font-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Event
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={() => saveSection("pipelineEvents", pipelineEvents)}
                      className="px-6 py-2 brutalist-btn text-xs tracking-wider flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "SAVING & NOTIFYING..." : "SAVE EVENTS"}
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2 border-2 border-amber-500 bg-amber-500/10 text-amber-700 font-mono text-xs uppercase flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> READ-ONLY (BETA-2)
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {pipelineEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="brutalist-border p-6 bg-[var(--color-surface)] flex flex-col gap-4 shadow-[4px_4px_0px_0px_var(--color-border)]"
                >
                  <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                    <span className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase">
                      EVENT #{event.id}
                    </span>
                    {isAlpha1 ? (
                      <button
                        onClick={() => deletePipelineEvent(index)}
                        className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-xs font-bold uppercase transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Date</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={event.date}
                        onChange={(e) => updatePipelineField(index, "date", e.target.value)}
                        placeholder="MAY 02, 2026"
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Status</label>
                      <select
                        disabled={!isAlpha1}
                        value={event.status}
                        onChange={(e) => updatePipelineField(index, "status", e.target.value)}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-xs font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                        <option value="LIVE">LIVE (Happening Now)</option>
                        <option value="CLOSED">CLOSED (Completed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Priority</label>
                      <select
                        disabled={!isAlpha1}
                        value={event.priority}
                        onChange={(e) => updatePipelineField(index, "priority", e.target.value)}
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-xs font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Event Title</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={event.title}
                        onChange={(e) => updatePipelineField(index, "title", e.target.value)}
                        placeholder="NEXTera 1.0 - Internship Drive"
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Location</label>
                      <input
                        type="text"
                        disabled={!isAlpha1}
                        value={event.location}
                        onChange={(e) => updatePipelineField(index, "location", e.target.value)}
                        placeholder="IITM Campus / Main Hall"
                        className="w-full border-2 border-[var(--color-border)] bg-[var(--color-background)] p-2.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* GOOGLE FORM INTEGRATION FIELD */}
                  <div className="p-4 bg-[var(--color-background)] border-2 border-dashed border-[var(--color-accent)] mt-2">
                    <label className="block text-xs font-mono font-bold uppercase text-[var(--color-accent)] mb-2">
                      ✦ GOOGLE FORM LINK FOR &quot;CONFIRM ATTENDANCE&quot; BUTTON:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        disabled={!isAlpha1}
                        value={event.formUrl || ""}
                        onChange={(e) => updatePipelineField(index, "formUrl", e.target.value)}
                        placeholder="https://forms.gle/yourGoogleFormId or https://docs.google.com/forms/..."
                        className="flex-1 border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 text-xs font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      {event.formUrl && (
                        <a
                          href={event.formUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase flex items-center gap-1 hover:opacity-90 transition-opacity"
                        >
                          Test Form ↗
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-[var(--color-muted)] mt-1.5">
                      When attendees click &quot;Confirm Attendance&quot; on this event, they will be sent directly to this Google Form.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- TAB: TOP 4 TALENTS ---------------- */}
        {activeTab === "talents" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--color-surface)] p-6 brutalist-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  <h2 className="text-2xl font-black uppercase">Home Page — Main 4 Top Talents</h2>
                </div>
                <p className="text-xs font-mono text-[var(--color-muted)] mt-1">
                  Alpha-1 operational control. Edit photo, full name, and course for the top 4 candidates featured on the home page.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAlpha1 ? (
                  <button
                    onClick={() => saveSection("topTalents", topTalents)}
                    disabled={isSaving}
                    className="px-6 py-3 bg-[var(--color-accent)] text-white border-2 border-[var(--color-border)] font-bold text-xs uppercase shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Top Talents"}
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/30 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Read-Only (Beta-2)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topTalents.slice(0, 4).map((talent, index) => (
                <div
                  key={talent.id || index}
                  className="brutalist-border p-6 bg-[var(--color-surface)] flex flex-col gap-5 shadow-[4px_4px_0px_0px_var(--color-border)] relative"
                >
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                    <span className="font-mono font-black text-xs uppercase px-2 py-0.5 bg-[var(--color-foreground)] text-[var(--color-background)]">
                      CANDIDATE 0{index + 1}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-muted)]">
                      Home Page Featured Slot #{index + 1}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Photo preview & device upload */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-48 flex-shrink-0">
                      <div className="w-36 h-36 sm:w-44 sm:h-44 bg-[var(--color-background)] border-2 border-[var(--color-foreground)] flex items-center justify-center overflow-hidden relative shadow-[3px_3px_0px_var(--color-border)]">
                        {talent.pic ? (
                          <img
                            src={talent.pic}
                            alt={talent.full_name || `Candidate 0${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[var(--color-muted)] font-mono text-xs text-center p-3">
                            <Camera className="w-8 h-8 mb-1.5 text-[var(--color-accent)] opacity-60" />
                            <span className="font-bold text-[11px]">NO PHOTO</span>
                          </div>
                        )}
                        {uploadingIndex === index && (
                          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white text-xs font-mono font-bold animate-pulse">
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>

                      {isAlpha1 && (
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="w-full text-center px-3 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] hover:bg-black hover:text-white border-2 border-[var(--color-border)] font-mono text-[11px] font-bold uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--color-border)]">
                            <Upload className="w-3.5 h-3.5" />
                            {uploadingIndex === index ? "Uploading..." : "Upload Pic"}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingIndex === index}
                              className="hidden"
                              onChange={(e) => handleTalentImageUpload(index, e)}
                            />
                          </label>
                          <span className="text-[10px] font-mono text-center text-[var(--color-muted)]">
                            Select from phone/laptop
                          </span>
                          {talent.pic && (
                            <button
                              type="button"
                              onClick={() => updateTalentField(index, "pic", "")}
                              className="w-full text-center py-0.5 text-red-600 hover:bg-red-500/10 border border-red-300/40 font-mono text-[10px] font-bold uppercase transition-colors"
                            >
                              Remove Pic
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full flex flex-col gap-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[var(--color-muted)] mb-1 block">
                          Full Name:
                        </label>
                        <input
                          type="text"
                          value={talent.full_name || ""}
                          disabled={!isAlpha1}
                          onChange={(e) => updateTalentField(index, "full_name", e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full p-2 bg-[var(--color-background)] border-2 border-[var(--color-border)] font-bold text-sm focus:border-[var(--color-accent)] outline-none disabled:opacity-70"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[var(--color-muted)] mb-1 block">
                          Company Name (Placed / Role Company):
                        </label>
                        <input
                          type="text"
                          value={talent.company || ""}
                          disabled={!isAlpha1}
                          onChange={(e) => updateTalentField(index, "company", e.target.value)}
                          placeholder="e.g. GOOGLE, MICROSOFT, ZOMATO"
                          className="w-full p-2 bg-[var(--color-background)] border-2 border-[var(--color-border)] font-black text-sm uppercase focus:border-[var(--color-accent)] outline-none disabled:opacity-70"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[var(--color-muted)] mb-1 block">
                          Course / Batch:
                        </label>
                        <input
                          type="text"
                          value={talent.course || ""}
                          disabled={!isAlpha1}
                          onChange={(e) => updateTalentField(index, "course", e.target.value)}
                          placeholder="e.g. B.Tech CSE 2026"
                          className="w-full p-2 bg-[var(--color-background)] border-2 border-[var(--color-border)] font-mono text-xs focus:border-[var(--color-accent)] outline-none disabled:opacity-70"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase font-bold text-[var(--color-muted)] mb-1 block">
                          Pic URL (or paste web link):
                        </label>
                        <input
                          type="text"
                          value={talent.pic || ""}
                          disabled={!isAlpha1}
                          onChange={(e) => updateTalentField(index, "pic", e.target.value)}
                          placeholder="https://... or /team/... or use Upload button"
                          className="w-full p-2 bg-[var(--color-background)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-muted)] focus:text-[var(--color-foreground)] focus:border-[var(--color-accent)] outline-none disabled:opacity-70"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- TAB 4: VP AUDIT LOGS & EMAIL DISPATCH (STRICTLY KUNAL ONLY) ---------------- */}
        {isVP && activeTab === "logs" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--color-surface)] p-6 brutalist-border">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="text-2xl font-black uppercase">Vice-President Security Audit Feed</h2>
                </div>
                <p className="text-xs font-mono text-[var(--color-muted)]">
                  Automated dispatch monitoring. All Alpha-1 operational changes trigger real-time notification to <strong>nexturn.kunal@gmail.com</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-700 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                    ⏳ 30-Day Auto-Retention Policy (Logs auto-purge after 30 days)
                  </span>
                  {isVP ? (
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-700 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      🛡 Vice-President Deletion Clearance: Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-500/10 border border-zinc-500/30 text-zinc-600 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      🔒 Manual Log Deletion Restricted to Vice-President
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail}
                  className="px-4 py-2 bg-[var(--color-accent)] text-white border-2 border-[var(--color-border)] font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {isSendingTestEmail ? "Sending Test..." : "Send Test Email"}
                </button>
                <button
                  onClick={() => fetchLogs()}
                  className="px-4 py-2 border-2 border-[var(--color-border)] font-mono font-bold text-xs uppercase hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)] transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh ({activityLogs.length})
                </button>
                {isVP && activityLogs.length > 0 && (
                  <button
                    onClick={handleClearAllLogs}
                    disabled={isClearingAllLogs}
                    className="px-3 py-2 bg-red-600 text-white border-2 border-[var(--color-border)] font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    title="Delete all security audit logs (Vice-President only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isClearingAllLogs ? "Purging..." : "Clear All"}
                  </button>
                )}
              </div>
            </div>

            {activityLogs.length === 0 ? (
              <div className="brutalist-border p-12 bg-[var(--color-surface)] text-center font-mono text-sm opacity-60">
                NO ALPHA-1 MODIFICATIONS RECORDED YET. ALL WRITE ACTIVITIES WILL BE LOGGED HERE AND EMAILED TO NEXTURN.KUNAL@GMAIL.COM.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activityLogs.map((log) => {
                  const daysRemaining = getLogDaysRemaining(log);
                  return (
                    <div
                      key={log.id}
                      className="brutalist-border p-6 bg-[var(--color-surface)] flex flex-col gap-3 shadow-[4px_4px_0px_0px_var(--color-border)]"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-[var(--color-accent)] text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5">
                            {log.actor.accessLevel}
                          </span>
                          <span className="font-bold text-sm uppercase">
                            {log.actor.name} ({log.actor.role})
                          </span>
                          <span className="font-mono text-xs opacity-60">
                            [{log.actor.code}]
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-muted)]">
                          <span>{log.timestamp}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            log.emailStatus === "SENT" ? "bg-green-500/20 text-green-700" : "bg-amber-500/20 text-amber-700"
                          }`}>
                            {log.emailStatus === "SENT" ? "✓ Sent to Kunal" : "✉ Queued in Audit Feed"}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-zinc-500/10 text-zinc-700 border border-zinc-500/20" title="Auto-purges 30 days after creation">
                            ⏳ Auto-purges in {daysRemaining}d
                          </span>
                          {isVP && (
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              disabled={deletingLogId === log.id}
                              title="Delete log (Vice-President authorization)"
                              className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-mono text-[10px] font-bold uppercase transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              {deletingLogId === log.id ? "..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="font-mono text-xs text-[var(--color-accent)] uppercase font-bold">
                        SECTION: {log.section}
                      </div>

                      <div className="p-3 bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono whitespace-pre-line leading-relaxed">
                        {log.summary}
                      </div>

                      {log.error && (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-800 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                          <span><strong>Delivery Note:</strong> {log.error}</span>
                        </div>
                      )}

                      <div className="text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Recipient: <strong>{log.recipient}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
