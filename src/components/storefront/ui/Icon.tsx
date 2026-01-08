"use client";

interface IconProps {
  name: string;
  className?: string;
  onClick?: () => void;
}

export function Icon({ name, className = "", onClick }: IconProps) {
  return (
    <span
      className={`material-icons-outlined ${className}`}
      onClick={onClick}
      style={{ verticalAlign: "middle", lineHeight: 1 }}
    >
      {name}
    </span>
  );
}
