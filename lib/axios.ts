import Axios, { InternalAxiosRequestConfig } from "axios";
import { variables } from "@/constants";
import deviceId from "./device-id";

const axios = Axios.create({ baseURL: variables.ACTIVE.server, timeout: 20000 });
export const api = Axios.create({ baseURL: variables.ACTIVE.server, timeout: 20000 });

// Every request says which browser it comes from (see device-id.ts)
function withDeviceId(config: InternalAxiosRequestConfig) {
	const id = deviceId();
	if (id) config.headers.set("X-Device-ID", id);
	return config;
}
axios.interceptors.request.use(withDeviceId);
api.interceptors.request.use(withDeviceId);

export default axios;
