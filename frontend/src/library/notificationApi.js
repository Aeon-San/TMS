import axios from "axios";
import { createApiBase } from "./baseUrl.js";

const notificationApi = axios.create({
    baseURL: createApiBase("/api/notifications"),
    withCredentials: true,
});

export default notificationApi;
