import { TextField } from "@mui/material";

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  sx?: object;
};

const controlKeys = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Enter",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

function formatCurrency(value: string) {
  const numeric = value.replace(/\D/g, "");

  if (!numeric) return "";

  const number = Number(numeric) / 100;

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function NumericField({ label, placeholder, value, onChange, sx }: Props) {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={formatCurrency(value)}
      onKeyDown={(e) => {
        if (e.ctrlKey || e.metaKey || controlKeys.has(e.key) || /^\d$/.test(e.key)) {
          return;
        }

        e.preventDefault();
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, "");
        onChange(raw);
      }}
      sx={sx}
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
        },
      }}
    />
  );
}
