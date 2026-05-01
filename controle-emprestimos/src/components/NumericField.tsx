import { TextField } from "@mui/material";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  sx?: object;
};

function formatCurrency(value: string) {
  const numeric = value.replace(/\D/g, "");

  if (!numeric) return "";

  const number = Number(numeric) / 100;

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function NumericField({ label, value, onChange, sx }: Props) {
  return (
    <TextField
      label={label}
      value={formatCurrency(value)}
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
