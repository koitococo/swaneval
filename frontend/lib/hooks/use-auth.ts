import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { TokenResponse, User } from "@/lib/types";

export function useLogin() {
  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await api.post<TokenResponse>("/auth/login", data);
      return res.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: {
      username: string;
      email: string;
      password: string;
      role?: string;
    }) => {
      const res = await api.post<User>("/auth/register", data);
      return res.data;
    },
  });
}

export function useMe() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get<User>("/auth/me");
      return res.data;
    },
  });
}
