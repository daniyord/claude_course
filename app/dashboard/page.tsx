import { requireUser } from "@/lib/auth";
import Header from "../_components/header";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Header userEmail={user.email} />
      <main className="p-6">Dashboard page</main>
    </div>
  );
}
