function ErrorSvg() {
  return (
    <svg
      className="h-16 w-16 text-red-500 mb-4"
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
        fill="#ffeaea"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 9l-6 6m0-6l6 6"
      />
    </svg>
  );
}

export default ErrorSvg;
