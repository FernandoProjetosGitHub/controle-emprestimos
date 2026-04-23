export type Cliente = {
  id: string;
  nome: string;
  telefone?: string;
};

export type Emprestimo = {
  id: string;
  clienteId: string;
  valor: number;
  dataEmprestimo: string;
  vencimento: string;
  pago: boolean;
  travado: boolean; // 👈 NOVO
};