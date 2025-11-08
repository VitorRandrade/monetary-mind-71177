import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar as CalendarIcon, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionFiltersProps {
  activeTab: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  dateRange: Date | undefined;
  onDateRangeChange: (date: Date | undefined) => void;
}

export function TransactionFilters({
  activeTab,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  dateRange,
  onDateRangeChange,
}: TransactionFiltersProps) {
  return (
    <>
      {/* Tab-specific message */}
      {activeTab === "payable" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-muted-foreground">
            Mostrando apenas <strong className="text-foreground">despesas pendentes</strong>
          </span>
        </div>
      )}
      {activeTab === "receivable" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">
            Mostrando apenas <strong className="text-foreground">receitas pendentes</strong>
          </span>
        </div>
      )}

      {/* Filter Card */}
      <Card className="border-primary/10">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Period Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">Período:</span>
              {[
                { label: 'Hoje', days: 0 },
                { label: 'Semana', days: 7 },
                { label: 'Mês', days: 30 },
                { label: 'Ano', days: 365 }
              ].map(period => {
                const periodDate = new Date();
                periodDate.setDate(periodDate.getDate() - period.days);
                const isActive = dateRange && dateRange.toDateString() === periodDate.toDateString();
                
                return (
                  <Badge
                    key={period.label}
                    variant={isActive ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => onDateRangeChange(period.days === 0 ? new Date() : periodDate)}
                  >
                    {period.label}
                  </Badge>
                );
              })}
              {dateRange && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-destructive/20 text-destructive border-destructive/50"
                  onClick={() => onDateRangeChange(undefined)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar
                </Badge>
              )}
            </div>

            {/* Search and Traditional Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por descrição, categoria..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Show type filter only on "all" and "completed" tabs */}
              {(activeTab === "all" || activeTab === "completed") && (
                <Select value={filterType} onValueChange={onFilterTypeChange}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="transfer">Transferências</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Show status filter only on "all" tab */}
              {activeTab === "all" && (
                <Select value={filterStatus} onValueChange={onFilterStatusChange}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange ? format(dateRange, "PPP", { locale: ptBR }) : "Selecionar Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange}
                    onSelect={onDateRangeChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
