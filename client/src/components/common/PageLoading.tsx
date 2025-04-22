import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  message?: string;
  fullPage?: boolean;
}

export default function PageLoading({ message, fullPage = false }: PageLoadingProps) {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading', 'Loading...');

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <div className="text-center p-6 max-w-sm mx-auto">
          <LoadingSpinner size="xl" color="primary" showText={false} />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{displayMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" color="primary" showText={false} />
      <p className="mt-4 text-base text-gray-600 dark:text-gray-400">{displayMessage}</p>
    </div>
  );
}
