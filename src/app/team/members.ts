import type { CSSProperties } from "react";

export type Member = {
  slug: string;
  name: string;
  role: string;
  linkedin?: string;
  initials: string;
  image: string;
  imageFit?: "fill";
  imageStyle?: CSSProperties;
};

export const coreLeadership: Member[] = [
  { slug: "siddhartha-khanna", name: "Siddhartha Khanna", role: "President", linkedin: "https://www.linkedin.com/in/siddhartha-khanna-603635336", initials: "SK", image: "/team/siddhartha_khanna.png", imageStyle: { objectPosition: "center 20%" } },
  { slug: "kunal-saini", name: "Kunal Saini", role: "Vice President", linkedin: "https://www.linkedin.com/in/kunal-saini-b392a0167", initials: "KS", image: "/team/kunal_saini.png", imageStyle: { objectPosition: "center 25%" } },
];

export const coreMembers: Member[] = [
  { slug: "mitashi-dogra", name: "Mitashi Dogra", role: "General Secretary", linkedin: "https://www.linkedin.com/in/mitashi-dogra-a45511337", initials: "MD", image: "/team/mitashi_dogra.png", imageStyle: { objectPosition: "center 25%" } },
  { slug: "Unkown", name: "Unkown", role: "Unkown", linkedin: "", initials: "L", image: "", imageFit: "fill" },
  { slug: "kakul-verma", name: "Kakul Verma", role: "CR Co-Head", linkedin: "https://www.linkedin.com/in/kakul-9a3a80379", initials: "KV", image: "/team/Kakul_verma.png", imageStyle: { objectPosition: "center 38%" } },
  { slug: "garima-sinha", name: "Garima Sinha", role: "Marketing Head", linkedin: "https://www.linkedin.com/in/garima-sinha-278298372", initials: "GS", image: "/team/garima_sinha.png", imageStyle: { objectPosition: "center 22%" } },
  { slug: "harshita-jindal", name: "Harshita Jindal", role: "Marketing Co-Head", linkedin: "https://www.linkedin.com/in/harshita-jindal-444889364", initials: "HJ", image: "/team/Harshita_Jindal.png" },
  { slug: "poornima-singh-rana", name: "Poornima Singh Rana", role: "Management Head", linkedin: "https://www.linkedin.com/in/poornima-singh-rana-973539381", initials: "PSR", image: "/team/Poornima_Singh_Rana.png", imageFit: "fill" },
  { slug: "dakshay-sachdeva", name: "Dakshay Sachdeva", role: "Management Co-Head", linkedin: "https://www.linkedin.com/in/dakshay-sachdeva-716306363/", initials: "DS", image: "/team/Dakshay_Sachdeva.png" },
  { slug: "suhani-saxena", name: "Suhani Saxena", role: "Social Media Head", linkedin: "https://www.linkedin.com/in/suhani-saxena-9433b9309", initials: "SS", image: "/team/Suhani_Saxena.png" },
  { slug: "kshitiz-rohilla", name: "Kshitiz Rohilla", role: "Social Media Co-Head", linkedin: "https://www.linkedin.com/in/kshitiz-rohilla-a9ba5130b", initials: "KR", image: "/team/Kshitiz_Rohilla.png" },
  { slug: "kanha", name: "Kanha", role: "Tech Head", linkedin: "https://www.linkedin.com/in/kanha-sharmaaa", initials: "K", image: "/team/Kanha.png", imageStyle: { objectPosition: "center 24%" } },
  { slug: "gaurav-singh", name: "Gaurav Singh", role: "Tech Co-Head", linkedin: "https://www.linkedin.com/in/gaurav07singh/", initials: "GS", image: "/team/Gaurav_Singh.png" },
];

export const memberCards = [coreLeadership, coreMembers].flatMap((group) =>
  group.map((member, index) => ({ member, index })),
);


// { slug: "chetan-prakash-yadav", name: "Chetan Prakash Yadav", role: "CR Head", linkedin: "https://www.linkedin.com/in/chetanprakashyadav155", initials: "CPY", image: "/team/Chetan_Yadav.png", imageFit: "fill" }