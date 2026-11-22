import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamCard } from "../TeamView";
import { memberCards } from "../members";

type MemberPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return memberCards.map(({ member }) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: MemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = memberCards.find(({ member }) => member.slug === slug);
  return card ? { title: `${card.member.name} | Nexturn Core ID` } : {};
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { slug } = await params;
  const card = memberCards.find(({ member }) => member.slug === slug);
  if (!card) notFound();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 px-3 pt-28 pb-12">
      <h1 className="text-center text-sm font-black uppercase tracking-widest">Nexturn Core · Digital ID</h1>
      <TeamCard member={card.member} i={card.index} />
      <p className="text-center text-sm"><span className="motion-reduce:hidden">Drag sideways or </span>tap the signature to flip the card.</p>
      <Link href="/team" className="text-sm font-bold underline underline-offset-4">View the full team</Link>
    </main>
  );
}
