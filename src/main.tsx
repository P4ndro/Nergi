import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LocaleProvider } from "./context/LocaleContext";

createRoot(document.getElementById("root")!).render(
	<LocaleProvider>
		<App />
	</LocaleProvider>
);
