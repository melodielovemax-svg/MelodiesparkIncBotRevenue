import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ChatDemo } from "@/components/ChatDemo";
import { ModelShowcase } from "@/components/ModelShowcase";
import { Web3Section } from "@/components/Web3Section";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="bg-mesh min-h-screen">
      <Header />
      <main>
        <Hero />
        <ChatDemo />
        <ModelShowcase />
        <Web3Section />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
