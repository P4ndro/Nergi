import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">{t("nf_title")}</p>
          <Link to="/" className="text-primary underline hover:opacity-80">
            {t("nf_home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
