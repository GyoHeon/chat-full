import { auth } from "@/controllers/auth.controller";
import Elysia from "elysia";

export const route = (app: Elysia) => app.use(auth);
