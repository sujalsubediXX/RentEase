export const ProductSkeleton = () => {
  return (
    <div className="animate-pulse border rounded-xl p-3">
      <div className="bg-gray-300 h-40 rounded-xl mb-3"></div>
      <div className="h-4 bg-gray-300 w-2/3 mb-2 rounded"></div>
      <div className="h-3 bg-gray-300 w-1/2 rounded"></div>
    </div>
  );
};