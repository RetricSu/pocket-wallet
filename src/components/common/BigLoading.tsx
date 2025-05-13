export interface BigLoadingProps {
  title: string;
  description: string;
}

export const BigLoading = ({ title, description }: BigLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800">{title}</h2>
        <p className="mt-2 text-sm text-center text-gray-600">{description}</p>
      </div>
    </div>
  );
};
