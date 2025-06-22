interface CustomPageLoaderProps  { title: string };
const CustomPageLoader = ({ title }: CustomPageLoaderProps) => {
  return (
    <div id="page-loader-container">
      <div className="wave">
        <h2>{title}</h2>
        <h2>{title}</h2>
      </div>
    </div>
  );
};

export default CustomPageLoader;
