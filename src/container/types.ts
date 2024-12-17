export type TRouterMethod = {
  method: "GET" | "POST";
  path?: string;
  isAbsolute?: boolean;
  name: string | Symbol;
}