import React from "react"; // necessário para o React.Fragment funcionar
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from "@mui/material";
import ClienteDrawer from "../components/ClienteDrawer";
import EditClienteDialog from "../components/EditClienteDialog";
import ActionIcon from "../components/ActionIcon";
import ConfirmDialog from "../components/ConfirmDialog";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import LockOutlineTwoToneIcon from "@mui/icons-material/LockOutlineTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import WarningAmberTwoToneIcon from "@mui/icons-material/WarningAmberTwoTone";
import Notificacao from "../components/Notificacao";
import { useState, useEffect } from "react";
import type { Cliente } from "../types/cliente"; // ✅ importa o tipo oficial
import TabelaVazia from "../components/TabelaVazia";
import PeopleOffTwoToneIcon from "@mui/icons-material/PeopleOffTwoTone";


function Clientes() {
  // 📌 LISTA
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const dados = localStorage.getItem("clientes");
    return dados ? JSON.parse(dados) : [];
  });
  // 📌 NOTIFICAÇÃO — controla a barrinha de aviso
  const [notificacao, setNotificacao] = useState<{
    mensagem: string;
    tipo: "erro" | "aviso" | "sucesso";
    aberto: boolean;
  }>({ mensagem: "", tipo: "erro", aberto: false });

  // função auxiliar para abrir a notificação com menos repetição
  function notificar(mensagem: string, tipo: "erro" | "aviso" | "sucesso") {
    setNotificacao({ mensagem, tipo, aberto: true });
  }
  // 📌 DRAWER
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 📌 EXPANSÃO DE LINHA — guarda o id do cliente expandido (null = nenhum)
  const [clienteExpandido, setClienteExpandido] = useState<string | null>(null);

  // ✏️ edição
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteParaConfirmar, setClienteParaConfirmar] =
    useState<Cliente | null>(null);

  // ❗ exclusão
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  // 💾 salvar no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }, [clientes]);

  function abrirDrawer() {
    setDrawerOpen(true);
  }

  // 💾 salvar edição
  function salvarEdicao() {
    if (!clienteEditando) return;
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteEditando.id ? clienteEditando : c)),
    );
    setClienteEditando(null);
  }

  // 🔒 bloquear / desbloquear
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
        {/* 🟢 HEADER */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Cadastro de Clientes</Typography>
          <Button variant="contained" onClick={abrirDrawer}>
            Novo Cliente
          </Button>
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
  {clientes.length === 0 ? (
    // se não há clientes, mostra o estado vazio
    <TableRow>
      <TableCell colSpan={3}>
        <TabelaVazia
          icone={<PeopleOffTwoToneIcon sx={{ fontSize: 64, opacity: 0.3 }} />}
          mensagem="Nenhum cliente cadastrado ainda."
          textoBotao="Novo Cliente"
          onAcao={abrirDrawer} // já temos essa função, só reutilizamos!
        />
      </TableCell>
    </TableRow>
  ) : (
    // senão, mostra as linhas normais
    clientes.map((c) => (
      <React.Fragment key={c.id}>
        {/* ... resto do código não muda */}
      </React.Fragment>
    ))
  )}
</TableBody>
          </Table>
        </TableContainer>

        {/* ✏️ CONFIRMAR EDIÇÃO */}
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

        {/* ❗ CONFIRMAR EXCLUSÃO */}
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

        {/* 📋 DRAWER DE CADASTRO */}
        <ClienteDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSave={(novo) => {
            const existe = clientes.some(
              (c) => c.nome.toLowerCase() === novo.nome.toLowerCase(),
            );

            if (existe) {
              notificar("Cliente já existe", "erro");
              return;
            }

            setClientes((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                nome: novo.nome,
                juros: novo.juros,
                telefone: novo.telefone,
                endereco: novo.endereco,
                travado: true,
              },
            ]);
          }}
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

export default Clientes;
