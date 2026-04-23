import { IconButton, Tooltip } from "@mui/material";

type Props = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  children: React.ReactNode;
};

export default function ActionIcon({
  title,
  onClick,
  disabled,
  color,
  children,
}: Props) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            color: color || "inherit",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.5 : 1,

            "&:hover": {
              transform: "scale(1.1) translateY(-1px)",
              boxShadow: disabled
                ? "none"
                : "0 2px 6px rgba(0,0,0,0.15)",
            },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}