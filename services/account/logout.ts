import { variables } from "@/constants";
import axios from "@/lib/axios";

type Response = void;

export async function production(): Promise<Response> {
  await axios.post(`/v1/auth/logout`);
}

export async function development(): Promise<Response> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 2000);
  });
}

export default async function logoutAccount(): Promise<Response> {
  if (variables.SERVICE_ENV === "development") return development();

  return production();
}
