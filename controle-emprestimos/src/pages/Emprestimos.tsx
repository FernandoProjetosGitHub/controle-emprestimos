import {
  Box,
  Button,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from "@mui/material";
import NumericField from "../components/NumericField";
import ActionIcon from "../components/ActionIcon";
import ConfirmDialog from "../components/ConfirmDialog";
import LockOutlineTwoToneIcon from "@mui/icons-material/LockOutlineTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import PaidTwoToneIcon from "@mui/icons-material/PaidTwoTone";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import WarningAmberTwoToneIcon from "@mui/icons-material/WarningAmberTwoTone";
import Notificacao from "../components/Notificacao";
import { useState, useEffect } from "react";
import type { Emprestimo } from "../types/emprestimo";
import type { Cliente } from "../types/cliente";
import TabelaVazia from "../components/TabelaVazia";
import MoneyOffTwoToneIcon from "@mui/icons-material/MoneyOffTwoTone";


function Emprestimos() {
  const [lista, setLista] = useState<Emprestimo[]>(() => {
    const dados = localStorage.getItem("emprestimos");

    return dados
      ? JSON.parse(dados).map((e: Emprestimo) => ({
        ...e,
        travado: e.travado ?? true,
      }))
      : [];
  });
  // 📌 NOTIFICAÇÃO
  const [notificacao, setNotificacao] = useState<{
    mensagem: string;
    tipo: "erro" | "aviso" | "sucesso";
    aberto: boolean;
  }>({ mensagem: "", tipo: "erro", aberto: false });

  function notificar(mensagem: string, tipo: "erro" | "aviso" | "sucesso") {
    setNotificacao({ mensagem, tipo, aberto: true });
  }
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  const [idParaPagar, setIdParaPagar] = useState<string | null>(null);
  const emprestimoSelecionado = lista.find((e) => e.id === idParaPagar);
  useEffect(() => {
    const dados = localStorage.getItem("clientes");
    if (dados) setClientes(JSON.parse(dados));
  }, []);

  useEffect(() => {
    localStorage.setItem("emprestimos", JSON.stringify(lista));
  }, [lista]);

  function toggleLock(id: string) {
    setLista((prev) =>
      prev.map((e) => (e.id === id ? { ...e, travado: !e.travado } : e)),
    );
  }

  function adicionarEmprestimo() {
    if (!valor || !vencimento || !clienteSelecionado) {
      return notificar("Preencha todos os campos antes de salvar", "aviso");
    }

    const cliente = clientes.find((c) => c.id === clienteSelecionado);
    const juros = cliente?.juros ?? 0;

    const base = Number(valor);
    const final = base + (base * juros) / 100;

    const novo: Emprestimo = {
      id: crypto.randomUUID(),
      clienteId: clienteSelecionado,
      valor: final,
      dataEmprestimo: new Date().toISOString(),
      vencimento,
      pago: false,
      travado: true,
    };

    setLista((prev) => [...prev, novo]);

    setValor("");
    setVencimento("");
    setClienteSelecionado("");
  }

  function confirmarPagamento() {
    if (!idParaPagar) return;

    setLista((prev) =>
      prev.map((e) => (e.id === idParaPagar ? { ...e, pago: !e.pago } : e)),
    );

    setIdParaPagar(null);
  }

  function confirmarExclusao() {
    if (!idParaExcluir) return;

    setLista((prev) => prev.filter((e) => e.id !== idParaExcluir));

    setIdParaExcluir(null);
  }

  function getNomeCliente(id: string) {
    const c = clientes.find((c) => c.id === id);
    return c ? c.nome : "Desconhecido";
  }

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", p: 3 }}>
      <Container>
        {/* FORM */}
        <Box sx={{ mb: 3, p: 3, bgcolor: "white", borderRadius: 2 }}>
          <Typography variant="h6">Novo Empréstimo</Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={clienteSelecionado}
                label="Cliente"
                onChange={(e) => setClienteSelecionado(e.target.value)}
              >
                {clientes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nome} ({c.juros}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <NumericField
              label="Valor"
              value={valor}
              onChange={(v) => setValor(v as string)}
            />

            <TextField
              label="Vencimento"
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  // datas anteriores a hoje ficam desabilitadas no calendário
                  min: new Date().toISOString().split("T")[0],
                },
              }}
            />

            <Button variant="contained" onClick={adicionarEmprestimo}>
              Salvar
            </Button>
          </Box>
        </Box>

        {/* TABELA */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell align="center">Ações</TableCell>
                <TableCell align="center">🔒</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {lista.length === 0 ? (
                // se não há empréstimos, mostra o estado vazio
                <TableRow>
                  <TableCell colSpan={5}>
                    {/* colSpan={5} porque a tabela de empréstimos tem 5 colunas */}
                    <TabelaVazia
                      icone={<MoneyOffTwoToneIcon sx={{ fontSize: 64, opacity: 0.3 }} />}
                      mensagem="Nenhum empréstimo registrado ainda."
                      textoBotao="Novo Empréstimo"
                      onAcao={() => {
                        // scroll suave até o formulário de novo empréstimo
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                // senão, mostra as linhas normais
                lista.map((e) => (
                  <TableRow key={e.id}>
                    {/* ... resto do código não muda */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG PAGAMENTO */}
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
          color="#2e7d32"
          icon={<CheckCircleTwoToneIcon sx={{ color: "#2e7d32" }} />}
        />

        {/* DIALOG EXCLUIR */}
        <ConfirmDialog
          open={!!idParaExcluir}
          onClose={() => setIdParaExcluir(null)}
          onConfirm={confirmarExclusao}
          title="Confirmar exclusão"
          description="Essa ação é irreversível. Deseja"
          highlightText="excluir"
          color="#d32f2f"
          icon={<WarningAmberTwoToneIcon sx={{ color: "#d32f2f" }} />}
        />
        {/* 🔔 NOTIFICAÇÃO */}
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
