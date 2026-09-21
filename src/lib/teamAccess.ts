import type { CSSProperties } from "react";

export type AccessLevel = "ALPHA_1" | "BETA_2";

export interface TeamMemberAccess {
  code: string;
  name: string;
  role: string;
  accessLevel: AccessLevel;
  department: string;
  initials: string;
  image: string;
  imageFit?: "fill";
  imageStyle?: CSSProperties;
}

export function isVicePresident(user: { role?: string; code?: string } | null | undefined): boolean {
  if (!user) return false;
  if (user.code === "NC-026-KS-2") return true;
  if (user.role && user.role.toLowerCase().includes("vice president")) return true;
  return false;
}

export const ALL_TEAM_CARDS: TeamMemberAccess[] = [
  // --- LEADERS & TECH TEAM (ALPHA-1) ---
  {
    code: "NC-026-KS-2",
    name: "Kunal Saini",
    role: "Vice President",
    accessLevel: "ALPHA_1",
    department: "Executive Leadership",
    initials: "KS",
    image: "/team/kunal_saini.png",
    imageStyle: { objectPosition: "center 25%" },
  },
  {
    code: "NC-026-SK-1",
    name: "Siddhartha Khanna",
    role: "President",
    accessLevel: "ALPHA_1",
    department: "Executive Leadership",
    initials: "SK",
    image: "/team/siddhartha_khanna.png",
    imageStyle: { objectPosition: "center 20%" },
  },
  {
    code: "NC-026-K-11",
    name: "Kanha",
    role: "Tech Head",
    accessLevel: "ALPHA_1",
    department: "Tech Department",
    initials: "K",
    image: "/team/Kanha.png",
    imageStyle: { objectPosition: "center 24%" },
  },
  {
    code: "NC-026-GS-12",
    name: "Gaurav Singh",
    role: "Tech Co-Head",
    accessLevel: "ALPHA_1",
    department: "Tech Department",
    initials: "GS",
    image: "/team/Gaurav_Singh.png",
  },

  // --- CORE MEMBERS (BETA-2 READ-ONLY) ---
  {
    code: "NC-026-MD-1",
    name: "Mitashi Dogra",
    role: "General Secretary",
    accessLevel: "BETA_2",
    department: "Core Secretariat",
    initials: "MD",
    image: "/team/mitashi_dogra.png",
    imageStyle: { objectPosition: "center 25%" },
  },
  {
    code: "NC-026-CY-2",
    name: "Chetan Yadav",
    role: "CR Head",
    accessLevel: "BETA_2",
    department: "Corporate Relations",
    initials: "CY",
    image: "/team/Chetan_Yadav.png",
    imageFit: "fill",
  },
  {
    code: "NC-026-KV-3",
    name: "Kakul Verma",
    role: "CR Co-Head",
    accessLevel: "BETA_2",
    department: "Corporate Relations",
    initials: "KV",
    image: "/team/Kakul_verma.png",
    imageStyle: { objectPosition: "center 38%" },
  },
  {
    code: "NC-026-GS-4",
    name: "Garima Sinha",
    role: "Marketing Head",
    accessLevel: "BETA_2",
    department: "Marketing",
    initials: "GS",
    image: "/team/garima_sinha.png",
    imageStyle: { objectPosition: "center 22%" },
  },
  {
    code: "NC-026-HJ-5",
    name: "Harshita Jindal",
    role: "Marketing Co-Head",
    accessLevel: "BETA_2",
    department: "Marketing",
    initials: "HJ",
    image: "/team/Harshita_Jindal.png",
  },
  {
    code: "NC-026-PSR-6",
    name: "Poornima Singh Rana",
    role: "Management Head",
    accessLevel: "BETA_2",
    department: "Management",
    initials: "PSR",
    image: "/team/Poornima_Singh_Rana.png",
    imageFit: "fill",
  },
  {
    code: "NC-026-DS-7",
    name: "Dakshay Sachdeva",
    role: "Management Co-Head",
    accessLevel: "BETA_2",
    department: "Management",
    initials: "DS",
    image: "/team/Dakshay_Sachdeva.png",
  },
  {
    code: "NC-026-SS-8",
    name: "Suhani Saxena",
    role: "Social Media Head",
    accessLevel: "BETA_2",
    department: "Social Media",
    initials: "SS",
    image: "/team/Suhani_Saxena.png",
  },
  {
    code: "NC-026-KR-9",
    name: "Kshitiz Rohilla",
    role: "Social Media Co-Head",
    accessLevel: "BETA_2",
    department: "Social Media",
    initials: "KR",
    image: "/team/Kshitiz_Rohilla.png",
  },
];

export const TEAM_MEMBERS_REGISTRY: Record<string, TeamMemberAccess> = {};
ALL_TEAM_CARDS.forEach((member) => {
  TEAM_MEMBERS_REGISTRY[member.code] = member;
});

// Additional alias mappings
TEAM_MEMBERS_REGISTRY["NC-026-KS-10"] = {
  ...TEAM_MEMBERS_REGISTRY["NC-026-KS-2"],
  code: "NC-026-KS-10",
};
TEAM_MEMBERS_REGISTRY["NC-026-K-5"] = {
  ...TEAM_MEMBERS_REGISTRY["NC-026-K-11"],
  code: "NC-026-K-5",
};
if (TEAM_MEMBERS_REGISTRY["NC-026-CY-2"]) {
  TEAM_MEMBERS_REGISTRY["NC-026-CPY-2"] = {
    ...TEAM_MEMBERS_REGISTRY["NC-026-CY-2"],
    code: "NC-026-CPY-2",
  };
}

export function lookupMemberByCode(rawCode: string): TeamMemberAccess | null {
  if (!rawCode) return null;
  const clean = rawCode.trim().toUpperCase();

  if (TEAM_MEMBERS_REGISTRY[clean]) {
    return TEAM_MEMBERS_REGISTRY[clean];
  }

  // Master override check
  if (clean === "TECH-IITM-2026") {
    return {
      code: "TECH-IITM-2026",
      name: "Lead Tech Administrator",
      role: "System Tech Lead",
      accessLevel: "ALPHA_1",
      department: "Nexturn System Ops",
      initials: "TA",
      image: "/team/kunal_saini.png",
    };
  }

  return null;
}

export function getMemberAccessLevel(name: string, role: string): AccessLevel {
  const isLeader = role.toLowerCase().includes("president");
  const isTech = role.toLowerCase().includes("tech head") || role.toLowerCase().includes("tech co-head");
  if (isLeader || isTech) {
    return "ALPHA_1";
  }
  return "BETA_2";
}
