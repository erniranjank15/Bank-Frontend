const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
          ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
