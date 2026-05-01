import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
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
import ClienteDrawer from "../components/ClienteDrawer";
import EditClienteDialog from "../components/EditClienteDialog";
import ActionIcon from "../components/ActionIcon";
import ConfirmDialog from "../components/ConfirmDialog";
import Notificacao from "../components/Notificacao";
import TabelaVazia from "../components/TabelaVazia";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import LockOutlineTwoToneIcon from "@mui/icons-material/LockOutlineTwoTone";
import LockOpenTwoToneIcon from "@mui/icons-material/LockOpenTwoTone";
import WarningAmberTwoToneIcon from "@mui/icons-material/WarningAmberTwoTone";
import PersonOffTwoToneIcon from "@mui/icons-material/PersonOffTwoTone";
import type { Cliente } from "../types/cliente";
import { colors } from "../theme";
import { archiveItem, loadList, saveList } from "../utils/storage";

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    return loadList<Cliente>("clientes");
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clienteExpandido, setClienteExpandido] = useState<string | null>(null);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteParaConfirmar, setClienteParaConfirmar] = useState<Cliente | null>(null);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{
    mensagem: string;
    tipo: "erro" | "aviso" | "sucesso";
    aberto: boolean;
  }>({ mensagem: "", tipo: "erro", aberto: false });

  useEffect(() => {
    saveList("clientes", clientes);
  }, [clientes]);

  function notificar(mensagem: string, tipo: "erro" | "aviso" | "sucesso") {
    setNotificacao({ mensagem, tipo, aberto: true });
  }

  function salvarEdicao() {
    if (!clienteEditando) return;

    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === clienteEditando.id ? clienteEditando : cliente,
      ),
    );
    setClienteEditando(null);
    notificar("Cliente atualizado com sucesso!", "sucesso");
  }

  function toggleLock(id: string) {
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === id ? { ...cliente, travado: !cliente.travado } : cliente,
      ),
    );
  }

  function confirmarExclusao() {
    if (!idParaExcluir) return;

    const cliente = clientes.find((item) => item.id === idParaExcluir);
    if (cliente) archiveItem("clientes", cliente);

    setClientes((prev) => prev.filter((item) => item.id !== idParaExcluir));
    setIdParaExcluir(null);
    notificar("Cliente arquivado com sucesso!", "sucesso");
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const filtro = filtroCliente.trim().toLowerCase();
    if (!filtro) return true;

    return (
      cliente.nome.toLowerCase().includes(filtro) ||
      (cliente.telefone ?? "").toLowerCase().includes(filtro) ||
      (cliente.endereco ?? "").toLowerCase().includes(filtro)
    );
  });

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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h6">Cadastro de Clientes</Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie clientes, juros, telefone e endereço.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setDrawerOpen(true)}>
            Novo Cliente
          </Button>
        </Box>

        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            label="Filtrar clientes"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            placeholder="Nome, telefone ou endereço"
            sx={{ minWidth: { xs: "100%", sm: 320 }, bgcolor: "background.paper" }}
          />

          <Typography variant="body2" color="text.secondary">
            {clientesFiltrados.length} de {clientes.length} clientes
          </Typography>
        </Box>

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
              {clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <TabelaVazia
                      icone={<PersonOffTwoToneIcon sx={{ fontSize: 64 }} />}
                      mensagem={
                        clientes.length === 0
                          ? "Nenhum cliente cadastrado ainda."
                          : "Nenhum cliente encontrado para este filtro."
                      }
                      textoBotao="Novo Cliente"
                      onAcao={() => setDrawerOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <React.Fragment key={cliente.id}>
                    <TableRow
                      hover
                      onClick={() =>
                        setClienteExpandido(
                          clienteExpandido === cliente.id ? null : cliente.id,
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.juros}%</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: 116,
                            mx: "auto",
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <ActionIcon
                              title={
                                cliente.travado
                                  ? "Desbloqueie para editar"
                                  : "Editar cliente"
                              }
                              disabled={cliente.travado}
                              onClick={(event) => {
                                event.stopPropagation();
                                setClienteParaConfirmar(cliente);
                              }}
                              color={colors.warning}
                            >
                              <EditTwoToneIcon />
                            </ActionIcon>

                            <ActionIcon
                              title={
                                cliente.travado
                                  ? "Desbloqueie para arquivar"
                                  : "Arquivar cliente"
                              }
                              disabled={cliente.travado}
                              onClick={(event) => {
                                event.stopPropagation();
                                setIdParaExcluir(cliente.id);
                              }}
                              color={colors.error}
                            >
                              <DeleteTwoToneIcon />
                            </ActionIcon>
                          </Box>

                          <ActionIcon
                            title={cliente.travado ? "Desbloquear" : "Bloquear"}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleLock(cliente.id);
                            }}
                            color={cliente.travado ? colors.muted : colors.warning}
                          >
                            {cliente.travado ? (
                              <LockOutlineTwoToneIcon />
                            ) : (
                              <LockOpenTwoToneIcon />
                            )}
                          </ActionIcon>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {clienteExpandido === cliente.id && (
                      <TableRow sx={{ bgcolor: colors.petroleumLight }}>
                        <TableCell colSpan={3}>
                          <Box sx={{ display: "flex", gap: 4, py: 1, flexWrap: "wrap" }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Telefone
                              </Typography>
                              <Typography variant="body2">
                                {cliente.telefone || "Não informado"}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Endereço
                              </Typography>
                              <Typography variant="body2">
                                {cliente.endereco || "Não informado"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
          color={colors.warning}
          icon={<WarningAmberTwoToneIcon sx={{ color: colors.warning }} />}
        />

        <EditClienteDialog
          open={!!clienteEditando}
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onChange={(clienteAtualizado) => setClienteEditando(clienteAtualizado)}
          onSave={salvarEdicao}
        />

        <ConfirmDialog
          open={!!idParaExcluir}
          onClose={() => setIdParaExcluir(null)}
          onConfirm={confirmarExclusao}
          title="Confirmar arquivamento"
          description="O cliente sairá da lista principal, mas ficará salvo no arquivo local. Deseja"
          highlightText="arquivar"
          color={colors.error}
          icon={<WarningAmberTwoToneIcon sx={{ color: colors.error }} />}
        />

        <ClienteDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSave={(novo) => {
            const existe = clientes.some(
              (cliente) => cliente.nome.toLowerCase() === novo.nome.toLowerCase(),
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

            notificar("Cliente cadastrado com sucesso!", "sucesso");
          }}
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

export default Clientes;
