import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { WidgetChat } from "@/components/public/chat/widget-chat";

/** Ossature du site vitrine public (lk-corporate.com). */
export default function LayoutPublic({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-brand focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
      <WidgetChat />
    </>
  );
}
