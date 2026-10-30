import { api } from "@/lib/api/api";

export const getUsers = () => {
  return api.get("/admin/users", { auth: true });
};
