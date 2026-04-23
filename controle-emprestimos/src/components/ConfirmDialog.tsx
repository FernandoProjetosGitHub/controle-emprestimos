import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;

  title: string;
  description: string;

  highlightText: string;

  color: string; // cor principal (ex: red, green, yellow)
  icon: React.ReactNode;
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
  slotProps={{
    paper: {
      sx: { borderRadius: 3, maxWidth: 340 },
    },
  }}
>
      <DialogTitle sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {icon}
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2">
          <strong style={{ color }}>ATENÇÃO:</strong>{" "}
          {description}{" "}
          <strong
            style={{
              color,
              textTransform: "uppercase",
            }}
          >
            {highlightText}
          </strong>
          .
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onClose}>Cancelar</Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            bgcolor: color,
            fontWeight: "bold",
            "&:hover": {
              filter: "brightness(0.9)",
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