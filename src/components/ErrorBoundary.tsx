import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "@/i18n";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
}

/** Shows a friendly reload screen instead of a blank page if something crashes while rendering. */
class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">{i18n.t("error_boundary_title")}</h1>
          <p className="text-muted-foreground">{i18n.t("error_boundary_body")}</p>
          <Button onClick={() => window.location.reload()}>{i18n.t("error_boundary_reload")}</Button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
