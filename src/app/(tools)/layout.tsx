import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
