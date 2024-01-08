import { t } from "elysia";

export const t_user = {
  body: t.Object({
    id: t.String(),
    password: t.String(),
    name: t.String(),
    email: t.String(),
    picture: t.String(),
  }),
};

export const t_patchUser = {
  body: t.Object({
    name: t.String(),
    picture: t.String(),
    user: t.Object({
      id: t.String(),
    }),
  }),
};

export const t_postRefresh = {
  body: t.Object({
    refreshToken: t.String(),
  }),
};
