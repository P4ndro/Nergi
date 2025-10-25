import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddCrop from "./pages/AddCrop";
import MyCrops from "./pages/MyCrops";
import NotFound from "./pages/NotFound";

// ✅ One shared query client instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ✅ Tooltip context should wrap the whole UI */}
      <TooltipProvider>
        {/* ✅ Toast components mounted once, globally */}
        <Toaster />
        <Sonner />

        {/* ✅ Main App Router */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-crop" element={<AddCrop />} />
            <Route path="/my-crops" element={<MyCrops />} />

            {/* ✅ Always leave catch-all route last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
