interface LoadingSpinnerProps {
    size: string;
    color: string;
}

function LoadingSpinner({ size, color }:LoadingSpinnerProps) {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${color}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;