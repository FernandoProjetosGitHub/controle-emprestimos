import { IconButton, Tooltip } from "@mui/material";
import type { MouseEvent, ReactNode } from "react";

type Props = {
  title: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  color?: string;
  children: ReactNode;
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
              transform: disabled ? "none" : "scale(1.08) translateY(-1px)",
              boxShadow: disabled
                ? "none"
                : "0 2px 6px rgba(18,48,71,0.18)",
            },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
