import { HTTPStatusName } from "elysia/utils";

type TSendError = {
  error: unknown;
  set: { status?: number | HTTPStatusName };
  status?: number;
  clientMessage?: string;
  log: string;
};

export const sendError = ({
  error,
  set,
  status = 500,
  log,
  clientMessage = "Internal server error",
}: TSendError) => {
  console.error(error, log);

  set.status = status;

  return { message: clientMessage };
};
