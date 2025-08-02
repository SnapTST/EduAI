
import { Login } from '@/components/common/Login';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Login />
      </main>
      <Footer />
    </>
  );
}
