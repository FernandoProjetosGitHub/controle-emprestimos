import type { Emprestimo } from "../types/emprestimo";

export const VALOR_ATRASO_DIARIO = 30;
const MILISSEGUNDOS_POR_DIA = 86_400_000;

export function getHojeReferencia() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

export function getDiasEmAtraso(vencimento: string, hoje = getHojeReferencia()) {
  const dataVencimento = new Date(`${vencimento}T00:00:00`);
  const dias = Math.floor(
    (hoje.getTime() - dataVencimento.getTime()) / MILISSEGUNDOS_POR_DIA,
  );
  return Math.max(dias, 0);
}

export function getValorAtualizadoEmprestimo(
  emprestimo: Emprestimo,
  hoje = getHojeReferencia(),
) {
  const diasEmAtraso = getDiasEmAtraso(emprestimo.vencimento, hoje);
  if (diasEmAtraso === 0) return emprestimo.valor;

  return emprestimo.valor + VALOR_ATRASO_DIARIO * diasEmAtraso;
}

export function getJurosAtrasoEmprestimo(
  emprestimo: Emprestimo,
  hoje = getHojeReferencia(),
) {
  return Math.max(getValorAtualizadoEmprestimo(emprestimo, hoje) - emprestimo.valor, 0);
}

export function getTotalPagoEmprestimo(emprestimo: Emprestimo) {
  if (emprestimo.pago && (!emprestimo.pagamentos || emprestimo.pagamentos.length === 0)) {
    return getValorAtualizadoEmprestimo(emprestimo);
  }

  return (emprestimo.pagamentos ?? []).reduce(
    (acc, pagamento) => acc + pagamento.valor,
    0,
  );
}

export function getSaldoEmprestimo(emprestimo: Emprestimo, hoje = getHojeReferencia()) {
  if (emprestimo.pago && (!emprestimo.pagamentos || emprestimo.pagamentos.length === 0)) {
    return 0;
  }

  return Math.max(
    getValorAtualizadoEmprestimo(emprestimo, hoje) - getTotalPagoEmprestimo(emprestimo),
    0,
  );
}

export function isEmprestimoQuitado(emprestimo: Emprestimo, hoje = getHojeReferencia()) {
  return getSaldoEmprestimo(emprestimo, hoje) <= 0.005;
}

export function getValorBaseRestante(emprestimo: Emprestimo) {
  return Math.max(emprestimo.valor - getTotalPagoEmprestimo(emprestimo), 0);
}
