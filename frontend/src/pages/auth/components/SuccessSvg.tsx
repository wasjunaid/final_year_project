function SuccessSvg() {
  return (
    <svg
      className="h-16 w-16 text-green-500 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="#e6fffa"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2l4-4"
      />
    </svg>
  );
}

export default SuccessSvg;
