import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import WarningAmberTwoToneIcon from "@mui/icons-material/WarningAmberTwoTone";
import NumericField from "./NumericField";
import type { Cliente } from "../types/cliente";

type Props = {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onChange: (cliente: Cliente) => void; // 👈 DIGITAÇÃO
  onSave: () => void; // 👈 SALVAR FINAL
};

export default function EditClienteDialog({
  open,
  cliente,
  onClose,
  onChange,
  onSave,
}: Props) {
  if (!cliente) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: 3, maxWidth: 320 },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", gap: 1 }}>
        <WarningAmberTwoToneIcon sx={{ color: "#fbc02d" }} />
        Editar cliente
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
    
    <TextField
      label="Nome"
      fullWidth
      value={cliente?.nome || ""}
      onChange={(e) =>
        onChange({ ...cliente!, nome: e.target.value })
      }
    />

    <NumericField
      label="Juros (%)"
      value={cliente?.juros ?? ""}
      onChange={(v) =>
        onChange({
          ...cliente!,
          juros: v as number,
        })
      }
    />

  </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>

        <Button
          variant="contained"
          sx={{
            bgcolor: "#fbc02d",
            color: "#000",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#f9a825",
              transform: "scale(1.05)",
            },
          }}
          onClick={onSave}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
