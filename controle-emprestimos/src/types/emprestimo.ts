import type { Cliente } from "./cliente"; // ← importa a oficial
export type { Cliente };                  // ← repassa pra quem importar daqui

export type Emprestimo = {
  id: string;
  clienteId: string;
  valor: number;
  dataEmprestimo: string;
  vencimento: string;
  grupoId?: string;
  parcelaAtual?: number;
  parcelasTotal?: number;
  pagamentos?: PagamentoEmprestimo[];
  pago: boolean;
  travado: boolean;
};

export type TipoPagamentoEmprestimo = "total" | "semJuros" | "juros" | "parcial";

export type PagamentoEmprestimo = {
  id: string;
  valor: number;
  tipo: TipoPagamentoEmprestimo;
  data: string;
};
