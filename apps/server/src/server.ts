import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./vercel";

export default async (req: VercelRequest, res: VercelResponse) => {
  // This is a simple proxy to forward the request to your Express app
  return new Promise((resolve, reject) => {
    app(req, res);
    // Resolve on response finish
    res.on("finish", resolve);
    res.on("error", reject);
  });
};
