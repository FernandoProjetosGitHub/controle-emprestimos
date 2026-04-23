import { TextField } from "@mui/material";

type Props = {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
};

export default function NumericField({ label, value, onChange }: Props) {
  return (
    <TextField
      label={label}
      type="number"
      value={value === "" ? "" : value}
      onChange={(e) => {
        const v = e.target.value;

        onChange(v === "" ? "" : Number(v));
      }}
      fullWidth
    />
  );
}