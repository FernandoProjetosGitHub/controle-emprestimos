import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  highlightText: string;
  color: string;
  icon: ReactNode;
};

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  highlightText,
  color,
  icon,
}: Props) {
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
        {icon}
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          <strong style={{ color }}>ATENÇÃO:</strong> {description}{" "}
          <strong style={{ color, textTransform: "uppercase" }}>
            {highlightText}
          </strong>
          .
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            bgcolor: color,
            "&:hover": {
              bgcolor: color,
              filter: "brightness(0.92)",
            },
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
