import {
  Box,
  Button,
  Container,
  TextField,
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
import EditClienteDialog from "../components/EditClienteDialog";
import ActionIcon from "../components/ActionIcon";
import ConfirmDialog from "../components/ConfirmDialog";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import LockOutlineTwoToneIcon from "@mui/icons-material/LockOutlineTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import WarningAmberTwoToneIcon from "@mui/icons-material/WarningAmberTwoTone";

import { useState, useEffect } from "react";

type Cliente = {
  id: string;
  nome: string;
  juros: number;
  travado: boolean;
};

function Clientes() {
  // 📌 LISTA
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const dados = localStorage.getItem("clientes");
    return dados ? JSON.parse(dados) : [];
  });

  // 📌 FORM
  const [nome, setNome] = useState("");
  const [juros, setJuros] = useState("");

  // ✏️ edição
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const [clienteParaConfirmar, setClienteParaConfirmar] =
    useState<Cliente | null>(null);

  // ❗ exclusão
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  // 💾 salvar
  useEffect(() => {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }, [clientes]);

  // ➕ adicionar
  function adicionarCliente() {
    if (!nome.trim() || !juros) return;

    const existe = clientes.some(
      (c) => c.nome.toLowerCase() === nome.toLowerCase(),
    );

    if (existe) return alert("Cliente já existe");

    setClientes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nome,
        juros: Number(juros),
        travado: true,
      },
    ]);

    setNome("");
    setJuros("");
  }

  // 💾 salvar edição
  function salvarEdicao() {
    if (!clienteEditando) return;

    setClientes((prev) =>
      prev.map((c) => (c.id === clienteEditando.id ? clienteEditando : c)),
    );

    setClienteEditando(null);
  }

  // 🔒 lock
  function toggleLock(id: string) {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, travado: !c.travado } : c)),
    );
  }

  // ❌ excluir
  function confirmarExclusao() {
    if (!idParaExcluir) return;

    setClientes((prev) => prev.filter((c) => c.id !== idParaExcluir));

    setIdParaExcluir(null);
  }

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", p: 3 }}>
      <Container>
        {/* 🟢 FORM */}
        <Box sx={{ mb: 3, p: 3, bgcolor: "white", borderRadius: 2 }}>
          <Typography variant="h6">Cadastro de Clientes</Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
  label="Nome"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
  sx={{ minWidth: 200 }}
/>
<Box sx={{ minWidth: 120 }}>
            <NumericField
  label="Juros (%)"
  value={juros}
  onChange={(v) => setJuros(v as string)}
/>
</Box>
            <Button variant="contained" onClick={adicionarCliente}>
              Salvar
            </Button>
          </Box>
        </Box>

        {/* 📋 TABELA */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Juros</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {clientes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.nome}</TableCell>
                  <TableCell>{c.juros}%</TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: 110,
                        mx: "auto",
                      }}
                    >
                      {/* 🔧 EDITAR + EXCLUIR */}
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ActionIcon
                          title="Editar cliente"
                          disabled={c.travado}
                          onClick={() => setClienteParaConfirmar(c)}
                          color="#fbc02d"
                        >
                          <EditTwoToneIcon />
                        </ActionIcon>

                        <ActionIcon
                          title="Excluir cliente"
                          disabled={c.travado}
                          onClick={() => setIdParaExcluir(c.id)}
                          color="#d32f2f"
                        >
                          <DeleteTwoToneIcon />
                        </ActionIcon>
                      </Box>

                      {/* 🔒 LOCK */}
                      <ActionIcon
                        title={c.travado ? "Desbloquear" : "Bloquear"}
                        onClick={() => toggleLock(c.id)}
                        color={c.travado ? "gray" : "orange"}
                      >
                        {c.travado ? (
                          <LockOutlineTwoToneIcon />
                        ) : (
                          <LockOpenTwoToneIcon />
                        )}
                      </ActionIcon>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ✏️ EDITAR */}
        <ConfirmDialog
          open={!!clienteParaConfirmar}
          onClose={() => setClienteParaConfirmar(null)}
          onConfirm={() => {
            setClienteEditando(clienteParaConfirmar);
            setClienteParaConfirmar(null);
          }}
          title="Confirmar edição"
          description="Você está prestes a"
          highlightText="editar"
          color="#fbc02d"
          icon={<WarningAmberTwoToneIcon sx={{ color: "#fbc02d" }} />}
        />
        <EditClienteDialog
          open={!!clienteEditando}
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onChange={(clienteAtualizado) =>
            setClienteEditando(clienteAtualizado)
          }
          onSave={salvarEdicao}
        />

        {/* ❗ EXCLUIR */}
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

export default Clientes;
