import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import NumericField from "../components/NumericField";
import ActionIcon from "../components/ActionIcon";
import ConfirmDialog from "../components/ConfirmDialog";
import Notificacao from "../components/Notificacao";
import TabelaVazia from "../components/TabelaVazia";
import LockOutlineTwoToneIcon from "@mui/icons-material/LockOutlineTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import PaidTwoToneIcon from "@mui/icons-material/PaidTwoTone";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";
import ReplayTwoToneIcon from "@mui/icons-material/ReplayTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import WarningAmberTwoToneIcon from "@mui/icons-material/WarningAmberTwoTone";
import MoneyOffTwoToneIcon from "@mui/icons-material/MoneyOffTwoTone";
import type { Emprestimo } from "../types/emprestimo";
import type { Cliente } from "../types/cliente";
import { colors } from "../theme";
import { archiveItem, getStorageEventName, loadList, saveList } from "../utils/storage";
import {
  getDiasEmAtraso,
  getHojeReferencia,
  getValorAtualizadoEmprestimo,
} from "../utils/emprestimos";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type FiltroStatus = "todos" | "emDia" | "pago" | "atrasado";
type StatusEmprestimo = "pago" | "atrasado" | "emDia";

const statusConfig = {
  pago: {
    label: "Pago",
    color: colors.success,
    background: "rgba(30, 122, 90, 0.12)",
  },
  atrasado: {
    label: "Atrasado",
    color: colors.error,
    background: "rgba(184, 58, 58, 0.13)",
  },
  emDia: {
    label: "Em andamento",
    color: colors.petroleum,
    background: "rgba(18, 48, 71, 0.11)",
  },
} satisfies Record<StatusEmprestimo, { label: string; color: string; background: string }>;

const filtros = [
  { label: "Todos", value: "todos" },
  { label: "Pagos", value: "pago" },
  { label: "Atrasados", value: "atrasado" },
  { label: "Em andamento", value: "emDia" },
] satisfies { label: string; value: FiltroStatus }[];

const opcoesParcelas = Array.from({ length: 12 }, (_, index) => index + 1);

function getDataHojeInput() {
  return new Date().toISOString().split("T")[0];
}

function normalizarDataInput(value: string) {
  return value.includes("T") ? value.split("T")[0] : value;
}

function formatarData(value: string) {
  return new Date(`${normalizarDataInput(value)}T00:00:00`).toLocaleDateString("pt-BR");
}

function adicionarMeses(data: string, meses: number) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const destino = new Date(ano, mes - 1 + meses, 1);
  const ultimoDia = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate();
  destino.setDate(Math.min(dia, ultimoDia));
  return destino.toISOString().split("T")[0];
}

function getHoje() {
  return getHojeReferencia();
}

function getStatusEmprestimo(emprestimo: Emprestimo): StatusEmprestimo {
  if (emprestimo.pago) return "pago";

  const vencimento = new Date(`${emprestimo.vencimento}T00:00:00`);
  return vencimento < getHoje() ? "atrasado" : "emDia";
}

function Emprestimos() {
  const [lista, setLista] = useState<Emprestimo[]>(() => {
    return loadList<Emprestimo>("emprestimos").map((emprestimo) => ({
          ...emprestimo,
          travado: emprestimo.travado ?? true,
        }));
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    return loadList<Cliente>("clientes");
  });

  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [valor, setValor] = useState("");
  const [dataEmprestimo, setDataEmprestimo] = useState(getDataHojeInput);
  const [vencimento, setVencimento] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  const [idParaPagar, setIdParaPagar] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{
    mensagem: string;
    tipo: "erro" | "aviso" | "sucesso";
    aberto: boolean;
  }>({ mensagem: "", tipo: "erro", aberto: false });

  const emprestimoSelecionado = lista.find(
    (emprestimo) => emprestimo.id === idParaPagar,
  );
  const pagamentoDialogColor = emprestimoSelecionado?.pago
    ? colors.warning
    : colors.success;
  const vencimentoFinalPrevisto = vencimento
    ? adicionarMeses(vencimento, parcelas - 1)
    : "";

  useEffect(() => {
    saveList("emprestimos", lista);
  }, [lista]);

  useEffect(() => {
    function handleStorageChanged(event: Event) {
      if ((event as CustomEvent).detail?.origin !== "external") return;
      setLista(
        loadList<Emprestimo>("emprestimos").map((emprestimo) => ({
          ...emprestimo,
          travado: emprestimo.travado ?? true,
        })),
      );
      setClientes(loadList<Cliente>("clientes"));
    }

    window.addEventListener(getStorageEventName(), handleStorageChanged);

    return () => {
      window.removeEventListener(getStorageEventName(), handleStorageChanged);
    };
  }, []);

  function notificar(mensagem: string, tipo: "erro" | "aviso" | "sucesso") {
    setNotificacao({ mensagem, tipo, aberto: true });
  }

  function toggleLock(id: string) {
    setLista((prev) =>
      prev.map((emprestimo) =>
        emprestimo.id === id
          ? { ...emprestimo, travado: !emprestimo.travado }
          : emprestimo,
      ),
    );
  }

  function adicionarEmprestimo() {
    if (!clienteSelecionado) {
      return notificar("Selecione um cliente antes de salvar.", "aviso");
    }

    if (!valor) {
      return notificar("Informe o valor do emprestimo.", "aviso");
    }

    if (!dataEmprestimo) {
      return notificar("Informe a data em que a pessoa pegou o emprestimo.", "aviso");
    }

    if (!vencimento) {
      return notificar("Informe a data do primeiro vencimento.", "aviso");
    }

    const cliente = clientes.find((item) => item.id === clienteSelecionado);
    const juros = cliente?.juros ?? 0;
    const base = Number(valor) / 100;
    const final = base + (base * juros) / 100;

    const valorParcela = final / parcelas;
    const novos: Emprestimo[] = Array.from({ length: parcelas }, (_, index) => ({
      id: crypto.randomUUID(),
      clienteId: clienteSelecionado,
      valor: valorParcela,
      dataEmprestimo,
      vencimento: adicionarMeses(vencimento, index),
      parcelaAtual: index + 1,
      parcelasTotal: parcelas,
      pago: false,
      travado: true,
    }));

    setLista((prev) => [...prev, ...novos]);
    setValor("");
    setDataEmprestimo(getDataHojeInput());
    setVencimento("");
    setParcelas(1);
    setClienteSelecionado("");
    notificar(
      parcelas > 1
        ? `Empréstimo parcelado em ${parcelas}x registrado com sucesso!`
        : "Empréstimo registrado com sucesso!",
      "sucesso",
    );
  }

  function confirmarPagamento() {
    if (!idParaPagar) return;

    setLista((prev) =>
      prev.map((emprestimo) =>
        emprestimo.id === idParaPagar
          ? { ...emprestimo, pago: !emprestimo.pago }
          : emprestimo,
      ),
    );
    setIdParaPagar(null);
  }

  function confirmarExclusao() {
    if (!idParaExcluir) return;

    const emprestimo = lista.find((item) => item.id === idParaExcluir);
    if (emprestimo) archiveItem("emprestimos", emprestimo);

    setLista((prev) =>
      prev.filter((emprestimo) => emprestimo.id !== idParaExcluir),
    );
    setIdParaExcluir(null);
    notificar("Empréstimo arquivado com sucesso!", "sucesso");
  }

  function getNomeCliente(id: string) {
    const cliente = clientes.find((item) => item.id === id);
    return cliente ? cliente.nome : "Desconhecido";
  }

  const contadores = lista.reduce(
    (acc, emprestimo) => {
      acc[getStatusEmprestimo(emprestimo)] += 1;
      return acc;
    },
    { pago: 0, atrasado: 0, emDia: 0 },
  );

  const listaFiltrada = lista.filter((emprestimo) => {
    return filtroStatus === "todos" || getStatusEmprestimo(emprestimo) === filtroStatus;
  });

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
          <Typography variant="h6">Novo Empréstimo</Typography>
          <Typography variant="body2" color="text.secondary">
            Registre valores, vencimentos e acompanhe pagamentos.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 220 } }}>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={clienteSelecionado}
                label="Cliente"
                onChange={(e) => setClienteSelecionado(e.target.value)}
              >
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} ({cliente.juros}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <NumericField
              label="Valor"
              value={valor}
              onChange={setValor}
              sx={{ width: { xs: "100%", sm: "20ch" } }}
            />

            <TextField
              label="Data do emprestimo"
              type="date"
              value={dataEmprestimo}
              onChange={(e) => setDataEmprestimo(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            />

            <TextField
              label="Primeiro vencimento"
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            />

            <FormControl sx={{ minWidth: { xs: "100%", sm: 150 } }}>
              <InputLabel>Parcelas</InputLabel>
              <Select
                value={parcelas}
                label="Parcelas"
                onChange={(e) => setParcelas(Number(e.target.value))}
              >
                {opcoesParcelas.map((quantidade) => (
                  <MenuItem key={quantidade} value={quantidade}>
                    {quantidade}x mensal
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {vencimentoFinalPrevisto && (
              <Box
                sx={{
                  alignSelf: "center",
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: colors.petroleumLight,
                  color: colors.petroleum,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Typography variant="caption" sx={{ display: "block", color: colors.muted }}>
                  Vencimento final
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatarData(vencimentoFinalPrevisto)}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={adicionarEmprestimo}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Salvar
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 230 }, bgcolor: "background.paper" }}
          >
            <InputLabel>Status do empréstimo</InputLabel>
            <Select
              value={filtroStatus}
              label="Status do empréstimo"
              onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
            >
              {filtros.map((filtro) => (
                <MenuItem key={filtro.value} value={filtro.value}>
                  {filtro.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {listaFiltrada.length} de {lista.length} empréstimos
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${contadores.emDia} em andamento`}
            sx={{ bgcolor: statusConfig.emDia.background, color: statusConfig.emDia.color }}
          />
          <Chip
            label={`${contadores.pago} pagos`}
            sx={{ bgcolor: statusConfig.pago.background, color: statusConfig.pago.color }}
          />
          <Chip
            label={`${contadores.atrasado} atrasados`}
            sx={{
              bgcolor: statusConfig.atrasado.background,
              color: statusConfig.atrasado.color,
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ bgcolor: "#fff", overflowX: "auto" }}>
          <Table sx={{ bgcolor: "#fff", minWidth: 1020 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Parcela</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data do emprestimo</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell align="center">Ações</TableCell>
                <TableCell align="center">Bloqueio</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {listaFiltrada.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <TabelaVazia
                      icone={<MoneyOffTwoToneIcon sx={{ fontSize: 64 }} />}
                      mensagem={
                        lista.length === 0
                          ? "Nenhum empréstimo registrado ainda."
                          : "Nenhum empréstimo encontrado para este filtro."
                      }
                      textoBotao="Registrar Empréstimo"
                      onAcao={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                listaFiltrada.map((emprestimo) => {
                  const status = getStatusEmprestimo(emprestimo);
                  const config = statusConfig[status];
                  const valorAtualizado = getValorAtualizadoEmprestimo(emprestimo);
                  const diasEmAtraso = getDiasEmAtraso(emprestimo.vencimento);

                  return (
                    <TableRow
                      key={emprestimo.id}
                      hover
                      sx={{
                        bgcolor: config.background,
                        borderLeft: `4px solid ${config.color}`,
                        "&:hover": {
                          bgcolor: config.background,
                          filter: "brightness(0.985)",
                        },
                      }}
                    >
                      <TableCell>{getNomeCliente(emprestimo.clienteId)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {moeda.format(valorAtualizado)}
                        </Typography>
                        {diasEmAtraso > 0 && !emprestimo.pago && (
                          <Typography variant="caption" color="text.secondary">
                            Base {moeda.format(emprestimo.valor)} + 8% ao dia
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {emprestimo.parcelasTotal && emprestimo.parcelasTotal > 1
                          ? `${emprestimo.parcelaAtual}/${emprestimo.parcelasTotal}`
                          : "A vista"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.7)",
                            color: config.color,
                            fontWeight: 700,
                            border: `1px solid ${config.color}33`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {formatarData(emprestimo.dataEmprestimo)}
                      </TableCell>
                      <TableCell>
                        {formatarData(emprestimo.vencimento)}
                      </TableCell>

                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <ActionIcon
                            title={
                              emprestimo.travado
                                ? "Desbloqueie para alterar"
                                : emprestimo.pago
                                  ? "Desfazer pagamento"
                                  : "Marcar como pago"
                            }
                            disabled={emprestimo.travado}
                            onClick={() => setIdParaPagar(emprestimo.id)}
                            color={colors.warning}
                          >
                            {emprestimo.pago ? (
                              <ReplayTwoToneIcon />
                            ) : (
                              <PaidTwoToneIcon />
                            )}
                          </ActionIcon>

                          <ActionIcon
                            title={
                              emprestimo.travado
                                ? "Desbloqueie para arquivar"
                                : "Arquivar empréstimo"
                            }
                            disabled={emprestimo.travado}
                            onClick={() => setIdParaExcluir(emprestimo.id)}
                            color={colors.error}
                          >
                            <DeleteTwoToneIcon />
                          </ActionIcon>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <ActionIcon
                          title={emprestimo.travado ? "Desbloquear" : "Bloquear"}
                          onClick={() => toggleLock(emprestimo.id)}
                          color={emprestimo.travado ? colors.muted : colors.warning}
                        >
                          {emprestimo.travado ? (
                            <LockOutlineTwoToneIcon />
                          ) : (
                            <LockOpenTwoToneIcon />
                          )}
                        </ActionIcon>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <ConfirmDialog
          open={!!idParaPagar}
          onClose={() => setIdParaPagar(null)}
          onConfirm={confirmarPagamento}
          title="Confirmar ação"
          description="Você está prestes a"
          highlightText={
            emprestimoSelecionado?.pago
              ? "reverter pagamento"
              : "marcar como pago"
          }
          color={pagamentoDialogColor}
          icon={
            emprestimoSelecionado?.pago ? (
              <ReplayTwoToneIcon sx={{ color: pagamentoDialogColor }} />
            ) : (
              <CheckCircleTwoToneIcon sx={{ color: pagamentoDialogColor }} />
            )
          }
        />

        <ConfirmDialog
          open={!!idParaExcluir}
          onClose={() => setIdParaExcluir(null)}
          onConfirm={confirmarExclusao}
          title="Confirmar arquivamento"
          description="O registro sairá da lista principal, mas ficará salvo no arquivo local. Deseja"
          highlightText="arquivar"
          color={colors.error}
          icon={<WarningAmberTwoToneIcon sx={{ color: colors.error }} />}
        />

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

export default Emprestimos;
