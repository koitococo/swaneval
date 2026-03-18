import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Criterion } from "@/lib/types";

export function useCriteria() {
  return useQuery({
    queryKey: ["criteria"],
    queryFn: async () => {
      const res = await api.get<Criterion[]>("/criteria");
      return res.data;
    },
  });
}

export function useCreateCriterion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; type: string; config_json: string }) => {
      const res = await api.post<Criterion>("/criteria", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}

export function useDeleteCriterion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/criteria/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}

export function useTestCriterion() {
  return useMutation({
    mutationFn: async (data: {
      criterion_id: string;
      prompt: string;
      expected: string;
      actual: string;
    }) => {
      const res = await api.post<{ score: number; criterion: string; type: string }>(
        "/criteria/test",
        data
      );
      return res.data;
    },
  });
}
