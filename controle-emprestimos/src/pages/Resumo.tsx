import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import MonetizationOnTwoToneIcon from "@mui/icons-material/MonetizationOnTwoTone";
import ReportProblemTwoToneIcon from "@mui/icons-material/ReportProblemTwoTone";
import FileDownloadTwoToneIcon from "@mui/icons-material/FileDownloadTwoTone";
import UploadFileTwoToneIcon from "@mui/icons-material/UploadFileTwoTone";
import RestoreTwoToneIcon from "@mui/icons-material/RestoreTwoTone";
import Notificacao from "../components/Notificacao";
import type { Cliente } from "../types/cliente";
import type { Emprestimo } from "../types/emprestimo";
import { colors } from "../theme";
import {
  exportBackup,
  importBackup,
  loadArchivedList,
  loadList,
  restoreArchivedItems,
} from "../utils/storage";

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>(() =>
    loadList<Emprestimo>("emprestimos"),
  );
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    loadList<Cliente>("clientes"),
  );
  const [clientesArquivados, setClientesArquivados] = useState<Cliente[]>(() =>
    loadArchivedList<Cliente>("clientes"),
  );
  const [emprestimosArquivados, setEmprestimosArquivados] = useState<Emprestimo[]>(
    () => loadArchivedList<Emprestimo>("emprestimos"),
  );
  const [notificacao, setNotificacao] = useState<{
    mensagem: string;
    tipo: "erro" | "aviso" | "sucesso";
    aberto: boolean;
  }>({ mensagem: "", tipo: "sucesso", aberto: false });

  const hoje = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  function notificar(mensagem: string, tipo: "erro" | "aviso" | "sucesso") {
    setNotificacao({ mensagem, tipo, aberto: true });
  }

  function recarregarDados() {
    setEmprestimos(loadList<Emprestimo>("emprestimos"));
    setClientes(loadList<Cliente>("clientes"));
    setClientesArquivados(loadArchivedList<Cliente>("clientes"));
    setEmprestimosArquivados(loadArchivedList<Emprestimo>("emprestimos"));
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importBackup(file);
      recarregarDados();
      notificar("Backup importado com sucesso.", "sucesso");
    } catch {
      notificar("Não foi possível importar este arquivo.", "erro");
    } finally {
      event.target.value = "";
    }
  }

  function restaurarArquivados() {
    const clientesRestaurados = restoreArchivedItems<Cliente>("clientes");
    const emprestimosRestaurados = restoreArchivedItems<Emprestimo>("emprestimos");

    recarregarDados();

    if (clientesRestaurados + emprestimosRestaurados === 0) {
      notificar("Não há registros arquivados para restaurar.", "aviso");
      return;
    }

    notificar("Registros arquivados restaurados com sucesso.", "sucesso");
  }

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

        <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="h6">Dados locais</Typography>
              <Typography variant="body2" color="text.secondary">
                {clientes.length} clientes, {emprestimos.length} empréstimos e{" "}
                {clientesArquivados.length + emprestimosArquivados.length} arquivados.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadTwoToneIcon />}
                onClick={exportBackup}
              >
                Exportar backup
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadFileTwoToneIcon />}
                onClick={() => inputRef.current?.click()}
              >
                Importar backup
              </Button>
              <Button
                variant="contained"
                startIcon={<RestoreTwoToneIcon />}
                onClick={restaurarArquivados}
              >
                Restaurar arquivados
              </Button>
            </Box>
          </Box>

          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImport}
          />
        </Paper>

        <Notificacao
          mensagem={notificacao.mensagem}
          aberto={notificacao.aberto}
          tipo={notificacao.tipo}
          onFechar={() =>
            setNotificacao((prev) => ({ ...prev, aberto: false }))
          }
        />
      </Container>
    </Box>
  );
}

export default Resumo;
