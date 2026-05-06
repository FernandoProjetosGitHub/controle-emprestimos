import type { Emprestimo } from "../types/emprestimo";

const JUROS_ATRASO_DIARIO = 0.08;
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
  if (emprestimo.pago) return emprestimo.valor;

  const diasEmAtraso = getDiasEmAtraso(emprestimo.vencimento, hoje);
  if (diasEmAtraso === 0) return emprestimo.valor;

  return emprestimo.valor * (1 + JUROS_ATRASO_DIARIO) ** diasEmAtraso;
}

export function getJurosAtrasoEmprestimo(
  emprestimo: Emprestimo,
  hoje = getHojeReferencia(),
) {
  return Math.max(getValorAtualizadoEmprestimo(emprestimo, hoje) - emprestimo.valor, 0);
}
