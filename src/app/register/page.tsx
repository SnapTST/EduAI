
import { Register } from '@/components/common/Register';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Register />
      </main>
      <Footer />
    </>
  );
}
