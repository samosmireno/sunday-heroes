import { useQuery } from "@tanstack/react-query";
import { READ_ONLY_CODE, StatusResponse } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";

/**
 * Whether this is the frozen copy of the app left behind at Cut-over. The
 * server decides at boot, so one answer per page load is enough. Until it
 * arrives, and if it never does, the app behaves as it always has.
 */
export function useReadOnly(): boolean {
  const { data } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await axiosInstance.get<StatusResponse>(
        `${config.server}/api/status`,
      );
      return response.data;
    },
    staleTime: Infinity,
    retry: false,
  });

  return data?.readOnly === true;
}

/** The 503 the server answers every write with while the app is read-only. */
export function isReadOnlyError(error: unknown): boolean {
  const response = (
    error as { response?: { status?: number; data?: { code?: unknown } } }
  )?.response;
  return response?.status === 503 && response.data?.code === READ_ONLY_CODE;
}
