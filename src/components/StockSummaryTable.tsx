import { formatCurrency } from "@/lib/utils";
import { useEstoqueClient, useProdutosEstoque } from "@/hooks/useEstoque";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { ValueDisplay } from "./ValueDisplay";
import { Package } from "lucide-react";

export function StockSummaryTable() {
  const client = useEstoqueClient({ tenantId: "obsidian" });
  const { data: estoque } = useProdutosEstoque(client);
  const { isValuesCensored } = usePrivacy();
  
  // Pegar os top 5 itens por valor total
  const topItems = (Array.isArray(estoque) ? estoque : [])
    .map(item => ({
      ...item,
      valorTotal: (item.quantidade_disponivel || 0) * (item.preco_venda || 0)
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 5);

  if (topItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhum item em estoque</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Item
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Quantidade
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Valor Total
            </th>
          </tr>
        </thead>
        <tbody>
          {topItems.map((item) => (
            <tr 
              key={item.id} 
              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
            >
              <td className="py-3 px-4 text-sm font-medium">
                {item.nome}
              </td>
              <td className="py-3 px-4 text-right text-sm">
                {item.quantidade_disponivel}
              </td>
              <td className="py-3 px-4 text-right font-semibold">
                <ValueDisplay value={formatCurrency(item.valorTotal)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
