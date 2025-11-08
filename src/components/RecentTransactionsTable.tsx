import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { useCategories } from "@/hooks/useFinancialData";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { ValueDisplay } from "./ValueDisplay";
import type { Transaction } from "@/types/financial";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function RecentTransactionsTable({ 
  transactions, 
  limit = 5 
}: RecentTransactionsTableProps) {
  const { categories } = useCategories();
  const { isValuesCensored } = usePrivacy();
  
  const recentTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(a.data_transacao || 0);
      const dateB = new Date(b.data_transacao || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "-";
    const category = categories.find(c => c.id === categoryId);
    return category?.nome || "-";
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      "pendente": { label: "Pendente", variant: "warning" as const },
      "pago": { label: "Pago", variant: "success" as const },
      "vencido": { label: "Vencido", variant: "destructive" as const },
      "confirmado": { label: "Confirmado", variant: "success" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status || "Pendente", 
      variant: "secondary" as const 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "credito" ? (
      <Badge variant="success">Receita</Badge>
    ) : (
      <Badge variant="destructive">Despesa</Badge>
    );
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum lançamento encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Data
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Tipo
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Valor
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Categoria
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Subcategoria
            </th>
          </tr>
        </thead>
        <tbody>
          {recentTransactions.map((transaction) => (
            <tr 
              key={transaction.id} 
              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
            >
              <td className="py-3 px-4 text-sm">
                {transaction.data_transacao 
                  ? format(new Date(transaction.data_transacao), "dd. MMM. yyyy", { locale: ptBR })
                  : "-"
                }
              </td>
              <td className="py-3 px-4">
                {getTipoBadge(transaction.tipo)}
              </td>
              <td className="py-3 px-4 text-right font-semibold">
                <ValueDisplay 
                  value={formatCurrency(
                    typeof transaction.valor === 'string' 
                      ? parseFloat(transaction.valor) 
                      : transaction.valor
                  )} 
                />
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="py-3 px-4 text-sm">
                {getCategoryName(transaction.categoria_id)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {getCategoryName(transaction.subcategoria_id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
