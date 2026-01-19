import { api } from "../../lib/api";

export type User = {
  userId: string;
  username: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  city?: string;
  bio?: string;
};

export type ProfileUpdate = {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  city?: string;
  bio?: string;
};

export async function login(username: string, password: string) {
  const res = await api<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  localStorage.setItem("token", res.token);
  return res;
}

export async function register(username: string, password: string) {
  const res = await api<{ token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  localStorage.setItem("token", res.token);
  return res;
}

export async function me() {
  return api<{ user: User }>("/me");
}

export async function updateMe(profile: ProfileUpdate) {
  return api<{ user: User }>("/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function logout() {
  localStorage.removeItem("token");
}
