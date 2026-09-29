import { requireUser } from "@/lib/auth";
import Header from "../../_components/header";

export default async function NotePage() {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Header userEmail={user.email} />
      <main className="p-6">Note editor page</main>
    </div>
  );
}
