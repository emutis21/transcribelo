export const { VITE_API_HOST: API_HOST, VITE_NODE_ENV: NODE_ENV = "development" } = import.meta.env;

export const envConfig = {
  env: NODE_ENV,
  apiHost: API_HOST,
  isProduction: NODE_ENV === "production",
};
