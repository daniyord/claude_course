import Link from "next/link";
import LogoutButton from "./logout-button";

type HeaderProps = {
  userEmail: string;
};

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
      <Link
        href="/dashboard"
        aria-label="NextNotes home"
        className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-md bg-foreground text-sm font-bold text-background"
        >
          N
        </span>
        NextNotes
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground/70">{userEmail}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
