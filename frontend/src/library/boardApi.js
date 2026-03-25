import axios from "axios";
import { createApiBase } from "./baseUrl.js";

const boardApi = axios.create({
    baseURL: createApiBase("/api/board"),
    withCredentials: true,
});

export default boardApi;
