import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Box,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import MonetizationOnTwoToneIcon from "@mui/icons-material/MonetizationOnTwoTone";
import ReportProblemTwoToneIcon from "@mui/icons-material/ReportProblemTwoTone";
import type { Emprestimo } from "../types/emprestimo";
import { colors } from "../theme";
import { loadList } from "../utils/storage";

type ResumoGrafico = {
  titulo: string;
  valor: number;
  quantidade: number;
  cor: string;
  fundo: string;
  icone: ReactNode;
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function carregarEmprestimos() {
  return loadList<Emprestimo>("emprestimos");
}

function GraficoResumo({
  item,
  maiorValor,
}: {
  item: ResumoGrafico;
  maiorValor: number;
}) {
  const percentual = maiorValor > 0 ? Math.round((item.valor / maiorValor) * 100) : 0;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: item.fundo,
            color: item.cor,
            display: "grid",
            placeItems: "center",
          }}
        >
          {item.icone}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {item.titulo}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {moeda.format(item.valor)}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            Comparativo
          </Typography>
          <Typography variant="caption" sx={{ color: item.cor, fontWeight: 700 }}>
            {percentual}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentual}
          sx={{
            height: 12,
            borderRadius: 1,
            bgcolor: item.fundo,
            "& .MuiLinearProgress-bar": {
              bgcolor: item.cor,
              borderRadius: 1,
            },
          }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        {item.quantidade} empréstimo{item.quantidade === 1 ? "" : "s"}
      </Typography>
    </Paper>
  );
}

function Resumo() {
  const [emprestimos] = useState<Emprestimo[]>(carregarEmprestimos);

  const hoje = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  const graficos = useMemo<ResumoGrafico[]>(() => {
    const emAberto = emprestimos.filter((emprestimo) => !emprestimo.pago);
    const vencidos = emAberto.filter((emprestimo) => {
      const vencimento = new Date(`${emprestimo.vencimento}T00:00:00`);
      return vencimento < hoje;
    });

    const total = emprestimos.reduce((acc, emprestimo) => acc + emprestimo.valor, 0);
    const totalAReceber = emAberto.reduce(
      (acc, emprestimo) => acc + emprestimo.valor,
      0,
    );
    const totalVencidos = vencidos.reduce(
      (acc, emprestimo) => acc + emprestimo.valor,
      0,
    );

    return [
      {
        titulo: "Total de valores",
        valor: total,
        quantidade: emprestimos.length,
        cor: colors.petroleum,
        fundo: colors.petroleumLight,
        icone: <AccountBalanceWalletTwoToneIcon />,
      },
      {
        titulo: "Total de valores a receber",
        valor: totalAReceber,
        quantidade: emAberto.length,
        cor: colors.success,
        fundo: colors.successLight,
        icone: <MonetizationOnTwoToneIcon />,
      },
      {
        titulo: "Total de vencidos",
        valor: totalVencidos,
        quantidade: vencidos.length,
        cor: colors.error,
        fundo: colors.errorLight,
        icone: <ReportProblemTwoToneIcon />,
      },
    ];
  }, [emprestimos, hoje]);

  const maiorValor = Math.max(...graficos.map((grafico) => grafico.valor), 0);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: 3 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            mb: 3,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="h6">Resumo</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Visão geral dos valores registrados nos empréstimos.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {graficos.map((item) => (
            <Grid key={item.titulo} size={{ xs: 12, md: 4 }}>
              <GraficoResumo item={item} maiorValor={maiorValor} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Resumo;
