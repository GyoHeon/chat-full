export const gravatar = (id: string) => {
  const md5 = new Bun.CryptoHasher("md5").update(id).digest("hex");

  return `https://gravatar.com/avatar/${md5}?s=200&d=retro`;
};

export const comparePassword = async (
  inputPassword: string,
  dbPassword: string
) => {
  if (!inputPassword) return false;

  return await Bun.password.verify(inputPassword, dbPassword);
};
