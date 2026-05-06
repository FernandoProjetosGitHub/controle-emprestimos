import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import MonetizationOnTwoToneIcon from "@mui/icons-material/MonetizationOnTwoTone";
import ReportProblemTwoToneIcon from "@mui/icons-material/ReportProblemTwoTone";
import FileDownloadTwoToneIcon from "@mui/icons-material/FileDownloadTwoTone";
import UploadFileTwoToneIcon from "@mui/icons-material/UploadFileTwoTone";
import RestoreTwoToneIcon from "@mui/icons-material/RestoreTwoTone";
import LockTwoToneIcon from "@mui/icons-material/LockTwoTone";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import VisibilityOffTwoToneIcon from "@mui/icons-material/VisibilityOffTwoTone";
import PriceCheckTwoToneIcon from "@mui/icons-material/PriceCheckTwoTone";
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
  descricao: string;
  valor: number;
  quantidade: number;
  cor: string;
  fundo: string;
  icone: ReactNode;
  acao?: "juros";
};

type AcaoSegura = "exportar" | "importar" | "restaurar";

type JurosPorCliente = {
  clienteId: string;
  nome: string;
  quantidade: number;
  total: number;
  principalEstimado: number;
  jurosEstimados: number;
};

const senhaSeguranca = "1234";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function GraficoResumo({
  item,
  maiorValor,
  mostrarValores,
  onClick,
}: {
  item: ResumoGrafico;
  maiorValor: number;
  mostrarValores: boolean;
  onClick?: () => void;
}) {
  const percentual = maiorValor > 0 ? Math.round((item.valor / maiorValor) * 100) : 0;
  const clicavel = !!onClick;

  return (
    <Paper
      role={clicavel ? "button" : undefined}
      tabIndex={clicavel ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!clicavel) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        cursor: clicavel ? "pointer" : "default",
        transition: "border-color 160ms ease, transform 160ms ease",
        "&:hover": clicavel
          ? {
              borderColor: item.cor,
              transform: "translateY(-2px)",
            }
          : undefined,
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
            {mostrarValores ? moeda.format(item.valor) : "R$ ******"}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
        {item.descricao}
      </Typography>

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
        {item.quantidade} emprestimo{item.quantidade === 1 ? "" : "s"}
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
  const [acaoSegura, setAcaoSegura] = useState<AcaoSegura | null>(null);
  const [senha, setSenha] = useState("");
  const [mostrarValores, setMostrarValores] = useState(true);
  const [modalJurosAberto, setModalJurosAberto] = useState(false);

  const hoje = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  const clientesPorId = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.id, cliente])),
    [clientes],
  );

  const jurosPorCliente = useMemo<JurosPorCliente[]>(() => {
    const acumulado = new Map<string, JurosPorCliente>();

    emprestimos
      .filter((emprestimo) => !emprestimo.pago)
      .forEach((emprestimo) => {
        const cliente = clientesPorId.get(emprestimo.clienteId);
        if (!cliente) return;

        const taxa = Number(cliente.juros) || 0;
        const principalEstimado =
          taxa > 0 ? emprestimo.valor / (1 + taxa / 100) : emprestimo.valor;
        const jurosEstimados = Math.max(emprestimo.valor - principalEstimado, 0);
        const registro = acumulado.get(cliente.id) ?? {
          clienteId: cliente.id,
          nome: cliente.nome,
          quantidade: 0,
          total: 0,
          principalEstimado: 0,
          jurosEstimados: 0,
        };

        registro.quantidade += 1;
        registro.total += emprestimo.valor;
        registro.principalEstimado += principalEstimado;
        registro.jurosEstimados += jurosEstimados;
        acumulado.set(cliente.id, registro);
      });

    return [...acumulado.values()].sort(
      (a, b) => b.jurosEstimados - a.jurosEstimados,
    );
  }, [clientesPorId, emprestimos]);

  const totalJurosEstimados = useMemo(
    () => jurosPorCliente.reduce((acc, item) => acc + item.jurosEstimados, 0),
    [jurosPorCliente],
  );

  function valorVisivel(valor: number) {
    return mostrarValores ? moeda.format(valor) : "R$ ******";
  }

  function notificar(mensagem: string, tipo: "erro" | "aviso" | "sucesso") {
    setNotificacao({ mensagem, tipo, aberto: true });
  }

  function fecharConfirmacaoSegura() {
    setAcaoSegura(null);
    setSenha("");
  }

  function confirmarAcaoSegura() {
    if (senha !== senhaSeguranca) {
      notificar("Senha de seguranca incorreta.", "erro");
      return;
    }

    if (acaoSegura === "exportar") {
      exportBackup();
      notificar("Backup exportado com sucesso.", "sucesso");
    }

    if (acaoSegura === "importar") {
      inputRef.current?.click();
    }

    if (acaoSegura === "restaurar") {
      restaurarArquivados();
    }

    fecharConfirmacaoSegura();
  }

  const mensagemAcaoSegura = {
    exportar: "Exportar uma copia dos dados locais para um arquivo JSON.",
    importar: "Importar um backup JSON e substituir os dados locais atuais.",
    restaurar: "Restaurar registros arquivados para as listas principais.",
  } satisfies Record<AcaoSegura, string>;

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
      notificar("Nao foi possivel importar este arquivo.", "erro");
    } finally {
      event.target.value = "";
    }
  }

  function restaurarArquivados() {
    const clientesRestaurados = restoreArchivedItems<Cliente>("clientes");
    const emprestimosRestaurados = restoreArchivedItems<Emprestimo>("emprestimos");

    recarregarDados();

    if (clientesRestaurados + emprestimosRestaurados === 0) {
      notificar("Nao ha registros arquivados para restaurar.", "aviso");
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
        descricao: "Soma de todos os emprestimos cadastrados, pagos ou em aberto.",
        valor: total,
        quantidade: emprestimos.length,
        cor: colors.petroleum,
        fundo: colors.petroleumLight,
        icone: <AccountBalanceWalletTwoToneIcon />,
      },
      {
        titulo: "Total de valores a receber",
        descricao: "Quanto ainda esta em aberto para recebimento dos clientes.",
        valor: totalAReceber,
        quantidade: emAberto.length,
        cor: colors.success,
        fundo: colors.successLight,
        icone: <MonetizationOnTwoToneIcon />,
      },
      {
        titulo: "Total de vencidos",
        descricao: "Parte em aberto com data de vencimento anterior a hoje.",
        valor: totalVencidos,
        quantidade: vencidos.length,
        cor: colors.error,
        fundo: colors.errorLight,
        icone: <ReportProblemTwoToneIcon />,
      },
      {
        titulo: "Juros estimados",
        descricao: "Estimativa dos juros embutidos nos emprestimos ativos.",
        valor: totalJurosEstimados,
        quantidade: emAberto.length,
        cor: colors.warning,
        fundo: colors.warningLight,
        icone: <PriceCheckTwoToneIcon />,
        acao: "juros",
      },
    ];
  }, [emprestimos, hoje, totalJurosEstimados]);

  const maiorValor = Math.max(...graficos.map((grafico) => grafico.valor), 0);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 1.5, sm: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            mb: 3,
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Resumo</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Visao financeira dos emprestimos cadastrados, separando total,
                valores em aberto, atrasos e juros estimados.
              </Typography>
            </Box>
            <IconButton
              aria-label={mostrarValores ? "Esconder valores" : "Mostrar valores"}
              onClick={() => setMostrarValores((value) => !value)}
              sx={{
                bgcolor: colors.petroleumLight,
                color: colors.petroleum,
                "&:hover": { bgcolor: colors.petroleumLight },
              }}
            >
              {mostrarValores ? <VisibilityOffTwoToneIcon /> : <VisibilityTwoToneIcon />}
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {graficos.map((item) => (
            <Grid key={item.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
              <GraficoResumo
                item={item}
                maiorValor={maiorValor}
                mostrarValores={mostrarValores}
                onClick={
                  item.acao === "juros"
                    ? () => setModalJurosAberto(true)
                    : undefined
                }
              />
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mt: 3, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
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
                {clientes.length} clientes, {emprestimos.length} emprestimos e{" "}
                {clientesArquivados.length + emprestimosArquivados.length} arquivados.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<FileDownloadTwoToneIcon />}
                onClick={() => setAcaoSegura("exportar")}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Exportar backup
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadFileTwoToneIcon />}
                onClick={() => setAcaoSegura("importar")}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Importar backup
              </Button>
              <Button
                variant="contained"
                startIcon={<RestoreTwoToneIcon />}
                onClick={() => setAcaoSegura("restaurar")}
                sx={{ width: { xs: "100%", sm: "auto" } }}
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

        <Dialog
          open={!!acaoSegura}
          onClose={fecharConfirmacaoSegura}
          fullWidth
          maxWidth="xs"
          slotProps={{
            paper: {
              sx: { borderRadius: 2, mx: 1.5 },
            },
          }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockTwoToneIcon sx={{ color: colors.warning }} />
            Confirmar acao
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {acaoSegura ? mensagemAcaoSegura[acaoSegura] : ""}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Senha de seguranca"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") confirmarAcaoSegura();
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={fecharConfirmacaoSegura}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={confirmarAcaoSegura}
              sx={{
                bgcolor: colors.warning,
                color: colors.petroleumDark,
                "&:hover": {
                  bgcolor: colors.warning,
                  filter: "brightness(0.95)",
                },
              }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={modalJurosAberto}
          onClose={() => setModalJurosAberto(false)}
          fullWidth
          maxWidth="md"
          slotProps={{
            paper: {
              sx: { borderRadius: 2, mx: 1.5 },
            },
          }}
        >
          <DialogTitle>Juros por cliente ativo</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Estimativa calculada pelos juros cadastrados em cada cliente e pelos
              emprestimos ainda nao pagos. Use como referencia operacional.
            </Typography>

            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Ativos</TableCell>
                    <TableCell align="right">Principal estimado</TableCell>
                    <TableCell align="right">Juros estimados</TableCell>
                    <TableCell align="right">Total a receber</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jurosPorCliente.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhum cliente com emprestimo ativo no momento.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jurosPorCliente.map((item) => (
                      <TableRow key={item.clienteId} hover>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell align="right">{item.quantidade}</TableCell>
                        <TableCell align="right">
                          {valorVisivel(item.principalEstimado)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: colors.warning, fontWeight: 700 }}>
                          {valorVisivel(item.jurosEstimados)}
                        </TableCell>
                        <TableCell align="right">{valorVisivel(item.total)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="contained" onClick={() => setModalJurosAberto(false)}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

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
