import Link from "next/link";
import LogoutButton from "./logout-button";

type HeaderProps = {
  userEmail: string;
};

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
      <Link href="/dashboard" className="text-lg font-semibold">
        Notes
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground/70">{userEmail}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
