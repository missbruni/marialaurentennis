import { Loader2 } from 'lucide-react';
import { Typography } from './ui/typography';

type LoaderProps = { message?: string };
const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-tennis-green" />
        <Typography.P>{message || 'Loading...'}</Typography.P>
      </div>
    </div>
  );
};
export default Loader;
