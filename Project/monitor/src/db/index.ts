import * as DB from "mysql";
import { ILSInfo } from "common/participants/types";
import { CertificateType } from "common/certs/types";
import { stringify } from "common/util/funs";
import { isNil, head, isEmpty } from "lodash";
import { MapRootV1 } from "common/trillian/types";
import { parseMapRoot } from "common/trillian/parse";

export class TreeRootDatabase {
  private db;

  constructor() {
    this.connect();
  }

  private connect() {
    this.db = DB.createConnection({
      host: process.env.CA_DB_HOST || "monitordb",
      port: process.env.CA_DB_PORT || "3306",
      user: process.env.DB_USER || "development",
      password: "zaphod",
      database: process.env.DB_DATABASE || "development"
    });
    this.db.connect(err => {
      if (err) {
        setTimeout(() => this.connect(), 2000);
      }
    });

    this.db.on("error", err => {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        this.connect();
      } else {
        throw err;
      }
    });
  }

  public async latestRevision(
    ils: ILSInfo,
    certType: CertificateType
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.db.query(
        "SELECT MAX(Revision) AS RootRevision FROM TreeRoots WHERE IlsId = ? AND CertType = ?",
        [ils.url, certType],
        (error, results) => {
          if (error) {
            reject(error);
            return;
          }

          if (isEmpty(results) || isNil(head<any>(results)!.RootRevision)) {
            resolve(0);
          } else {
            resolve(head<any>(results).RootRevision);
          }
        }
      );
    });
  }

  public async getILSes(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.db.query("SELECT IlsId FROM TreeRoots", (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        if (results.length > 0) {
          const urls = results.map(r => r.IlsId);

          resolve(urls);
          return;
        }
        resolve();
      });
    });
  }

  public async set(
    ils: ILSInfo,
    certType: CertificateType,
    root: MapRootV1
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.query(
        "REPLACE INTO TreeRoots VALUES (?,?,?,?)",
        [`${ils.url}`, parseInt(root.Revision), `${certType}`, stringify(root)],
        error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      );
    });
  }

  public async get(
    ils: ILSInfo,
    certType: CertificateType,
    revision?: string
  ): Promise<MapRootV1 | undefined> {
    const versionSelector =
      revision || (await this.latestRevision(ils, certType));

    return new Promise<MapRootV1 | undefined>((resolve, reject) => {
      this.db.query(
        "SELECT TreeRoot FROM TreeRoots WHERE IlsId = ? AND CertType = ? AND Revision = ? LIMIT 1",
        [`${ils.url}`, `${certType}`, versionSelector],
        (error, results) => {
          if (error) {
            reject(error);
            return;
          }

          if (results.length > 0) {
            const rootJson = head<any>(results)!.TreeRoot as string;
            const mapRoot = parseMapRoot(rootJson);

            resolve(mapRoot);
            return;
          }
          resolve();
        }
      );
    });
  }

  public async exists(
    ils: ILSInfo,
    certType: CertificateType
  ): Promise<boolean> {
    const root = await this.get(ils, certType);
    return !isNil(root);
  }
}
