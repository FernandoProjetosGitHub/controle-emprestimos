import type { Cliente } from "./cliente"; // ← importa a oficial
export type { Cliente };                  // ← repassa pra quem importar daqui

export type Emprestimo = {
  id: string;
  clienteId: string;
  valor: number;
  dataEmprestimo: string;
  vencimento: string;
  pago: boolean;
  travado: boolean;
};