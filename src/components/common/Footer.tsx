import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-card/80 border-t mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
        <Logo />
        <p className="text-sm text-muted-foreground text-center sm:text-right">
          &copy; {new Date().getFullYear()} EduAI Scholar. Free Forever.
        </p>
      </div>
    </footer>
  );
}
