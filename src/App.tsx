import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import { NovoModal } from "@/components/NovoModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Contas from "./pages/Contas";
import Transacoes from "./pages/Transacoes";
import Cartoes from "./pages/Cartoes";
import ComprasCartao from "./pages/ComprasCartao";
import Categorias from "./pages/Categorias";
import Parcelas from "./pages/Parcelas";
import Projecao from "./pages/Projecao";
import Relatorios from "./pages/Relatorios";
import Alertas from "./pages/Alertas";
import Configuracoes from "./pages/Configuracoes";
import Inventario from "./pages/Inventario";
import NotFound from "./pages/NotFound";

// QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const isMobile = useIsMobile();
  const [novoModalOpen, setNovoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className={`flex-1 ${isMobile ? 'pb-16' : ''}`}>
        {!isMobile && (
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Opus One Ecom Financeiro</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setNovoModalOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo
              </Button>
              <PrivacyToggle />
              <ThemeToggle />
            </div>
          </header>
        )}
        <NovoModal open={novoModalOpen} onOpenChange={setNovoModalOpen} />
        <main className={`flex-1 overflow-auto ${isMobile ? 'p-4' : ''}`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/contas" element={<Contas />} />
            <Route path="/transacoes" element={<Transacoes />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/compras-cartao" element={<ComprasCartao />} />
            <Route path="/parcelas" element={<Parcelas />} />
            <Route path="/projecao" element={<Projecao />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </SidebarInset>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
