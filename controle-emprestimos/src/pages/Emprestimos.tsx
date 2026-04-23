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

import { useState, useEffect } from "react";
import type { Emprestimo } from "../types/emprestimo";
import type { Cliente } from "../types/cliente";

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
      return alert("Preencha tudo");
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
              slotProps={{ inputLabel: { shrink: true } }}
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
              {lista.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{getNomeCliente(e.clienteId)}</TableCell>
                  <TableCell>R$ {e.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(e.vencimento).toLocaleDateString("pt-BR")}
                  </TableCell>

                  {/* AÇÕES */}
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
                          e.travado
                            ? "Desbloqueie para alterar"
                            : e.pago
                              ? "Desfazer pagamento"
                              : "Marcar como pago"
                        }
                        disabled={e.travado}
                        onClick={() => setIdParaPagar(e.id)}
                        color={e.pago ? "green" : "#fbc02d"}
                      >
                        {e.pago ? (
                          <CheckCircleTwoToneIcon />
                        ) : (
                          <PaidTwoToneIcon />
                        )}
                      </ActionIcon>

                      <ActionIcon
                        title={
                          e.travado
                            ? "Desbloqueie para excluir"
                            : "Excluir empréstimo"
                        }
                        disabled={e.travado}
                        onClick={() => setIdParaExcluir(e.id)}
                        color="#d32f2f"
                      >
                        <DeleteTwoToneIcon />
                      </ActionIcon>
                    </Box>
                  </TableCell>

                  {/* LOCK */}
                  <TableCell align="center">
                    <ActionIcon
                      title={e.travado ? "Desbloquear" : "Bloquear"}
                      onClick={() => toggleLock(e.id)}
                      color={e.travado ? "gray" : "orange"}
                    >
                      {e.travado ? (
                        <LockOutlineTwoToneIcon />
                      ) : (
                        <LockOpenTwoToneIcon />
                      )}
                    </ActionIcon>
                  </TableCell>
                </TableRow>
              ))}
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
      </Container>
    </Box>
  );
}

export default Emprestimos;
