import Axios from "axios";
import { variables } from "@/constants";
const axios = Axios.create({ baseURL: variables.ACTIVE.server, timeout: 20000 });
export const api = Axios.create({ baseURL: variables.ACTIVE.server, timeout: 20000 });
export default axios;

