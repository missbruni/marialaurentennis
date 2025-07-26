import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvailabilitiesData } from '@/lib/data';
import type { SerializedAvailability } from '@/types/availability';
import { deserializeAvailabilities } from '@/lib/serialize';
import React from 'react';

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

  const refreshAvailabilities = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    refetch();
  }, [queryClient, refetch]);

  return {
    refreshAvailabilities,
    availabilities,
    isLoading,
    error
  };
}
