const Button = ({
  children,
  type = "button",
  onClick,
  loading = false,
  variant = "primary",
}) => {
  const baseStyle =
    "w-full py-2 rounded-lg font-semibold transition duration-200";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${baseStyle} ${variants[variant]} ${
        loading && "opacity-70 cursor-not-allowed"
      }`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
