import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./vercel";

export default async (req: VercelRequest, res: VercelResponse) => {
  return new Promise((resolve, reject) => {
    app(req, res);
    res.on("finish", resolve);
    res.on("error", reject);
  });
};
