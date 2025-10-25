import { useLocale } from "@/context/LocaleContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLocale();

  return (
    <footer className="border-t border-border bg-card/50 py-8 mt-10">
      <div className="container mx-auto px-12 md:px-16 xl:px-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm">
        <p className="text-muted-foreground max-w-xl">{t("home.footer.copy")}</p>
        <nav className="flex items-center gap-4 text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">{t("nav.home")}</Link>
          <span className="h-4 w-px bg-border" />
          <Link to="/pricing" className="hover:text-foreground transition-colors">{t("nav.pricing")}</Link>
          <span className="h-4 w-px bg-border" />
          <Link to="/about" className="hover:text-foreground transition-colors">{t("nav.about")}</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
