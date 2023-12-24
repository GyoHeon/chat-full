export type TSignUp = {
  body: {
    id: string;
    password: string;
    name: string;
    picture?: string;
  };
} & Request;
