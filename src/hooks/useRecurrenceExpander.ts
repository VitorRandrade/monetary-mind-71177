// Hook para expandir recorrências em transações previstas
// Gera transações no ledger até o horizonte configurado

import { useEffect, useCallback } from "react";
import { useFinancialData, useRecurrences, useTransactions } from "./useFinancialData";
import { Transaction, Recurrence } from "@/types/financial";
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, format } from "date-fns";

export function useRecurrenceExpander() {
  const { recurrences, activeRecurrences } = useRecurrences();
  const { transactions, createTransaction } = useTransactions();
  
  // Limites de segurança para evitar expansão infinita
  const HORIZONTE_PADRAO = 90; // dias
  const MAX_OCCURRENCES = 12; // ✅ FASE 2: Reduzido de 24 para 12
  const MAX_MONTHS_AHEAD = 3; // ✅ FASE 2: Reduzido de 12 para 3 meses
  const VALID_FREQUENCIES = ['semanal', 'mensal', 'anual'] as const;

  const calculateNextOccurrence = useCallback((rec: Recurrence, fromDate: Date): Date | null => {
    const current = new Date(fromDate);
    
    // Validar frequência suportada
    if (!VALID_FREQUENCIES.includes(rec.frequencia as any)) {
      console.warn(`Frequência não suportada: ${rec.frequencia}`);
      return null;
    }
    
    switch (rec.frequencia) {
      case "semanal":
        return addWeeks(current, 1);
      case "mensal":
        return addMonths(current, 1);
      case "anual":
        return addYears(current, 1);
      default:
        return null;
    }
  }, []);

  const expandRecurrence = useCallback(async (rec: Recurrence) => {
    // Validações de segurança
    if (rec.is_paused || rec.is_deleted) {
      console.debug(`Recorrência ${rec.id} pausada ou deletada, pulando`);
      return;
    }

    // Validar categoria obrigatória
    if (!rec.subcategoria_id && !rec.categoria_id) {
      console.warn(`Recorrência ${rec.id} sem categoria, pulando`);
      return;
    }

    const hoje = new Date();
    const horizonte = addDays(hoje, HORIZONTE_PADRAO);
    const maxDate = addMonths(hoje, MAX_MONTHS_AHEAD);
    const finalHorizonte = horizonte < maxDate ? horizonte : maxDate;
    
    // Buscar transações existentes dessa recorrência
    const existingTransactions = transactions.filter(
      t => t.origem === `recorrencia:${rec.id}` && t.status === "previsto"
    );

    let currentDate = new Date(rec.proxima_ocorrencia || rec.data_inicio);
    const dataFim = rec.data_fim ? new Date(rec.data_fim) : null;
    
    // ✅ FASE 2: Log de debug para monitoramento
    console.debug(`Expandindo recorrência ${rec.id}: ${rec.descricao}`, {
      dataInicio: currentDate.toISOString(),
      horizonte: finalHorizonte.toISOString(),
      maxDate: maxDate.toISOString(),
      frequencia: rec.frequencia,
      transacoesExistentes: existingTransactions.length
    });
    let occurrenceCount = 0;

    // Gerar previstos até o horizonte COM LIMITES
    while (
      isBefore(currentDate, finalHorizonte) && 
      occurrenceCount < MAX_OCCURRENCES
    ) {
      // Verificar data fim da recorrência
      if (dataFim && isAfter(currentDate, dataFim)) {
        break;
      }

      // Verificar se já existe transação para essa data
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const exists = existingTransactions.some(
        t => t.data_vencimento === dateStr || t.data_transacao === dateStr
      );

      if (!exists) {
        // Criar transação prevista
        try {
          const payload: any = {
            tipo: rec.tipo === "credito" ? "credito" : "debito",
            valor: parseFloat(String(rec.valor)),
            descricao: rec.descricao,
            data_transacao: dateStr,
            data_vencimento: dateStr,
            conta_id: rec.conta_id,
            origem: `recorrencia:${rec.id}`,
            referencia: rec.id,
            status: "previsto",
          };
          
          // Priorizar subcategoria_id, fallback para categoria_id
          if (rec.subcategoria_id) {
            payload.subcategoria_id = rec.subcategoria_id;
          } else if (rec.categoria_id) {
            payload.categoria_id = rec.categoria_id;
          }
          
          await createTransaction(payload);
          occurrenceCount++;
        } catch (error) {
          console.error(`Erro ao expandir recorrência ${rec.id}:`, error);
          break; // Para de expandir se houver erro
        }
      }

      const nextDate = calculateNextOccurrence(rec, currentDate);
      if (!nextDate) {
        console.warn(`Não foi possível calcular próxima ocorrência para ${rec.id}`);
        break;
      }
      currentDate = nextDate;
    }

    if (occurrenceCount > 0) {
      console.debug(`Expandidas ${occurrenceCount} ocorrências para recorrência ${rec.id}`);
    }
  }, [transactions, createTransaction, calculateNextOccurrence, HORIZONTE_PADRAO, MAX_OCCURRENCES, MAX_MONTHS_AHEAD]);

  const expandAllRecurrences = useCallback(async () => {
    for (const rec of activeRecurrences) {
      await expandRecurrence(rec);
    }
  }, [activeRecurrences, expandRecurrence]);

  return {
    expandRecurrence,
    expandAllRecurrences,
  };
}
