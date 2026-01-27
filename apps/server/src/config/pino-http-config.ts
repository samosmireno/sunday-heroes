import { Options } from "pino-http";

const pinoHttpConfig: Options = {
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url.split("?")[0],
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customLogLevel(_, res, err) {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: {
    ignore: (req) =>
      req.url ? ["/health", "/metrics"].includes(req.url.split("?")[0]) : false,
  },
};

export default pinoHttpConfig;
