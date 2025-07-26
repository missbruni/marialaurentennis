import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvailabilitiesData } from '@/lib/data';
import type { SerializedAvailability } from '@/types/availability';
import { deserializeAvailabilities } from '@/lib/serialize';

interface UseAvailabilitiesOptions {
  initialData?: SerializedAvailability[];
}

export function useAvailabilities(options: UseAvailabilitiesOptions = {}) {
  const queryClient = useQueryClient();

  const {
    data: availabilities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['availabilities'],
    queryFn: getAvailabilitiesData,
    initialData: options.initialData ? deserializeAvailabilities(options.initialData) : undefined
  });

  const refreshAvailabilities = () => {
    queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    refetch();
  };

  return {
    refreshAvailabilities,
    availabilities,
    isLoading,
    error
  };
}
