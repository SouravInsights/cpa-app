import { Footer, Header, UserOps } from "@/components";

export default function UserOpsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 justify-between p-24">
      <Header />
      <UserOps />
      <Footer />
    </main>
  );
}
