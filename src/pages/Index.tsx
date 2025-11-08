import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MiniSparkline } from "@/components/MiniSparkline";
import { RecentTransactionsTable } from "@/components/RecentTransactionsTable";
import { StockSummaryTable } from "@/components/StockSummaryTable";
import NewTransactionModal from "@/components/NewTransactionModal";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { ValueDisplay } from "@/components/ValueDisplay";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

const Index = () => {
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { isValuesCensored } = usePrivacy();

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => {
    const balance = typeof account.saldo_inicial === 'string' ? 
      parseFloat(account.saldo_inicial) : account.saldo_inicial;
    return sum + (balance || 0);
  }, 0);

  // Filter current month transactions
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter(t => 
    t.data_transacao?.startsWith(currentMonth)
  );

  const monthlyIncome = monthTransactions
    .filter(t => t.tipo === 'credito')
    .reduce((sum, t) => {
      const value = typeof t.valor === 'string' ? parseFloat(t.valor) : t.valor;
      return sum + (value || 0);
    }, 0);

  const monthlyExpenses = monthTransactions
    .filter(t => t.tipo === 'debito')
    .reduce((sum, t) => {
      const value = typeof t.valor === 'string' ? parseFloat(t.valor) : t.valor;
      return sum + (value || 0);
    }, 0);

  // Generate last 30 days balance data for sparkline
  const last30DaysData = useMemo(() => {
    const data: number[] = [];
    let runningBalance = totalBalance;
    
    for (let i = 29; i >= 0; i--) {
      const dayTransactions = transactions.filter(t => {
        if (!t.data_transacao) return false;
        const transactionDate = new Date(t.data_transacao);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);
        return transactionDate.toDateString() === targetDate.toDateString();
      });
      
      const dayChange = dayTransactions.reduce((sum, t) => {
        const value = typeof t.valor === 'string' ? parseFloat(t.valor) : t.valor;
        return sum + (t.tipo === 'credito' ? value : -value);
      }, 0);
      
      runningBalance -= dayChange;
      data.push(runningBalance);
    }
    
    return data.reverse();
  }, [transactions, totalBalance]);

  // Pie chart data for cash flow preview
  const pieChartData = [
    { name: 'Receitas', value: monthlyIncome, color: 'hsl(var(--success))' },
    { name: 'Despesas', value: monthlyExpenses, color: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-foreground">Painel Principal</h1>
        <Button 
          onClick={() => setIsNewTransactionModalOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Top Cards - Saldo e Receitas x Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saldo Atual */}
        <Card className="p-6 bg-card border-border/50">
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Saldo Atual</h2>
            <div className="flex items-end justify-between">
              <div>
                <ValueDisplay 
                  value={formatCurrency(totalBalance)} 
                  className="text-4xl font-bold"
                />
              </div>
              <div className="h-16 w-32">
                <MiniSparkline data={last30DaysData} color="hsl(var(--primary))" />
              </div>
            </div>
          </div>
        </Card>

        {/* Receitas x Despesas */}
        <Card className="p-6 bg-card border-border/50">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Receitas x Despesas</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Receitas</span>
              </div>
              <ValueDisplay 
                value={formatCurrency(monthlyIncome)} 
                className="text-2xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Despesas</span>
              </div>
              <ValueDisplay 
                value={formatCurrency(monthlyExpenses)} 
                className="text-2xl font-bold"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Lançamentos Section */}
      <Card className="bg-card border-border/50">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Lançamentos</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsNewTransactionModalOpen(true)}
            >
              + Novo Lançamento
            </Button>
          </div>
        </div>
        <div className="p-6">
          <RecentTransactionsTable transactions={transactions} limit={10} />
        </div>
      </Card>

      {/* Bottom Grid - Estoque e Previsão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estoque */}
        <Card className="bg-card border-border/50">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold">Estoque</h2>
          </div>
          <div className="p-6">
            <StockSummaryTable />
          </div>
        </Card>

        {/* Previsão de Fluxo de Caixa */}
        <Card className="bg-card border-border/50">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold">Previsão de Fluxo de Caixa</h2>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <NewTransactionModal
        open={isNewTransactionModalOpen}
        onOpenChange={setIsNewTransactionModalOpen}
        onSuccess={() => {
          setIsNewTransactionModalOpen(false);
        }}
      />
    </div>
  );
};

export default Index;
