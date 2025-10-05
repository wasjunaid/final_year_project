import React from "react";

interface ICardProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function Card({ children, className = "", style }: ICardProps) {
  return (
    <div
      className={`${className} flex flex-col gap-3 justify-center m-2 p-8 bg-white rounded-md shadow-md`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Card;
