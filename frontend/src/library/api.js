import axios from "axios";
import { createApiBase } from "./baseUrl.js";

const API = axios.create({
    baseURL: createApiBase("/api/auth"),
    withCredentials: true,
})

export default API;
