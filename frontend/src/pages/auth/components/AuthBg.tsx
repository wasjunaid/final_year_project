import bgImg from "../../../assets/images/landing-hero-section.png";

interface IAuthBgProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function AuthBg({ children, className = "", style }: IAuthBgProps) {
  return (
    <div
      className={`
        ${className}
        h-screen 
        bg-cover 
        bg-center 
        flex 
        justify-center 
        items-center 
      `}
      style={{ backgroundImage: `url(${bgImg})`, ...style }}
    >
      {children}
    </div>
  );
}

export default AuthBg;
