import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { InvitationResponse } from "@repo/shared-types";

export function useInvitation(token: string | undefined) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/invitations/${token}/validate`,
      );
      return response.data as InvitationResponse;
    },
    enabled: !!token,
    retry: false,
  });
}
