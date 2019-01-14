import { LogRootV1, MapRootV1 } from "common/trillian/types";
import * as LosslessJSON from "lossless-json";
import * as request from "request";
import { SignedLogRoot, SignedMapRoot } from "common/trillian/api/trillian_pb";
import { isEmpty } from "lodash";
import { stringify } from "common/util/funs";

export const deserializeMapRoot = (
  signedMapRoot: SignedMapRoot
): Promise<MapRootV1> => {
  return new Promise<MapRootV1>((resolve, reject) => {
    const bytes = signedMapRoot.getMapRoot_asU8();

    const host = process.env.TLS_SERVER_HOST || "tls-server";
    const port = process.env.TLS_SERVER_PORT || 8082;
    const params = {
      url: `http://${host}:${port}/?type=MAP&bytes=${Buffer.from(
        bytes
      ).toString("hex")}`,
      timeout: 60 * 60 * 1000
    };

    request.get(params, (error, _, body) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        const json = LosslessJSON.parse(body);

        const mapRoot: MapRootV1 = {
          Revision: json.V1.Revision.toString(),
          TimestampNanos: json.V1.TimestampNanos.toString(),
          RootHash: new Uint8Array(Buffer.from(json.V1.RootHash, "base64")),
          LogRoot: deserializeLogRootMetadata(
            new Uint8Array(Buffer.from(json.V1.Metadata, "base64"))
          ),
          Signature: signedMapRoot.getSignature_asU8()
        };

        resolve(mapRoot);
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const deserializeLogRootMetadata = (metadata: Uint8Array): LogRootV1 => {
  const json = Buffer.from(metadata).toString("utf8");

  if (isEmpty(json)) {
    return {
      Metadata: new Uint8Array(0),
      Revision: "0",
      RootHash: new Uint8Array(0),
      Signature: new Uint8Array(0),
      TimestampNanos: "0",
      TreeSize: "0"
    };
  }
  return LosslessJSON.parse(json);
};

export const serializeLogRootMetadata = (logRoot: LogRootV1): Uint8Array => {
  return new Uint8Array(Buffer.from(stringify(logRoot), "utf8"));
};

export const deserializeLogRoot = (
  signedLogRoot: SignedLogRoot
): Promise<LogRootV1> => {
  return new Promise<LogRootV1>((resolve, reject) => {
    const bytes = signedLogRoot.getLogRoot_asU8();

    const host = process.env.TLS_SERVER_HOST || "tls-server";
    const port = process.env.TLS_SERVER_PORT || 8082;
    const params = {
      url: `http://${host}:${port}/?type=LOG&bytes=${Buffer.from(
        bytes
      ).toString("hex")}`,
      timeout: 60 * 60 * 1000
    };

    request.get(params, (error, _, body) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        const json = LosslessJSON.parse(body);
        const logRoot: LogRootV1 = {
          Revision: json.V1.Revision.toString(),
          TreeSize: json.V1.TreeSize.toString(),
          TimestampNanos: json.V1.TimestampNanos.toString(),
          RootHash: new Uint8Array(Buffer.from(json.V1.RootHash, "base64")),
          Metadata: new Uint8Array(Buffer.from(json.V1.Metadata, "base64")),
          Signature: signedLogRoot.getLogRootSignature_asU8()
        };

        resolve(logRoot);
      } catch (err) {
        reject(err);
      }
    });
  });
};
