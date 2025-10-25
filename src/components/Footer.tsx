import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  // Assumption: Using generic contact details; update as needed
  const email = "hello@nergi.app";
  const phone = "+995 555 123 456";
  const office = "Tbilisi, Georgia";

  return (
    <footer className="border-t border-border bg-card/50 py-10 mt-10">
      <div className="container mx-auto px-12 md:px-16 xl:px-24">
        <div className="flex flex-col items-center justify-center gap-5 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </a>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </a>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{office}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
