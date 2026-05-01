import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import type { Cliente } from "../types/cliente";
import { colors } from "../theme";
import { formatTelefone } from "../utils/format";

type Props = {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onChange: (cliente: Cliente) => void;
  onSave: () => void;
};

export default function EditClienteDialog({
  open,
  cliente,
  onClose,
  onChange,
  onSave,
}: Props) {
  if (!cliente) return null;

  const nomeInvalido = !cliente.nome.trim();
  const jurosInvalido = Number.isNaN(cliente.juros) || cliente.juros < 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: 2, mx: 1.5 },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <EditTwoToneIcon sx={{ color: colors.petroleum }} />
        Editar cliente
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nome"
            fullWidth
            value={cliente.nome}
            onChange={(e) => onChange({ ...cliente, nome: e.target.value })}
            error={nomeInvalido}
            helperText={nomeInvalido ? "Informe o nome do cliente" : ""}
          />

          <TextField
            label="Juros (%)"
            type="number"
            fullWidth
            value={cliente.juros}
            onChange={(e) =>
              onChange({ ...cliente, juros: Number(e.target.value) })
            }
            error={jurosInvalido}
            helperText={jurosInvalido ? "Informe uma taxa válida" : ""}
            slotProps={{
              htmlInput: {
                min: 0,
                step: 0.01,
              },
            }}
          />

          <TextField
            label="Telefone"
            fullWidth
            value={cliente.telefone ?? ""}
            onChange={(e) =>
              onChange({ ...cliente, telefone: formatTelefone(e.target.value) })
            }
          />

          <TextField
            label="Endereço"
            fullWidth
            value={cliente.endereco ?? ""}
            onChange={(e) => onChange({ ...cliente, endereco: e.target.value })}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={nomeInvalido || jurosInvalido}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
