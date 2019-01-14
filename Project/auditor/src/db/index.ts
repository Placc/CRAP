import * as DB from "mysql";
import { stringify } from "common/util/funs";
import {
  PublisherCertificate,
  AuditionCertificate,
  RegisteredCert
} from "common/certs/types";
import { head, isEmpty, isNil } from "lodash";

export class CertDatabase {
  private db;

  constructor() {
    this.connect();
  }

  private connect() {
    this.db = DB.createConnection({
      host: process.env.CA_DB_HOST || "auditordb",
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

  public async latestVersion(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.db.query(
        "SELECT MAX(CertVersion) AS CertVersion FROM PublisherCerts",
        (error, results) => {
          if (error) {
            reject(error);
            return;
          }

          if (isEmpty(results) || isNil(head<any>(results)!.CertVersion)) {
            resolve(0);
          } else {
            resolve(head<any>(results).CertVersion);
          }
        }
      );
    });
  }

  public async getPublisherCert(
    version?: number
  ): Promise<RegisteredCert<PublisherCertificate> | undefined> {
    const versionSelector = version || (await this.latestVersion());

    return new Promise<RegisteredCert<PublisherCertificate>>(
      (resolve, reject) => {
        this.db.query(
          "SELECT PublisherCert FROM PublisherCerts WHERE CertVersion = ?",
          [versionSelector],
          (error, results) => {
            if (error || !results) {
              reject(error);
              return;
            }

            if (results.length > 0) {
              const certJson = head<any>(results)!.PublisherCert as string;
              const certificate = JSON.parse(certJson);

              resolve(certificate);
              return;
            }
            resolve();
          }
        );
      }
    );
  }

  public async setPublisherCert(
    cert: RegisteredCert<PublisherCertificate>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.query(
        "INSERT INTO PublisherCerts VALUES (?, ?)",
        [cert.version, stringify(cert)],
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

  public async getAuditionCert(
    url: string,
    version?: number
  ): Promise<RegisteredCert<AuditionCertificate> | undefined> {
    return new Promise<RegisteredCert<AuditionCertificate>>(
      (resolve, reject) => {
        this.db.query(
          "SELECT AuditCert FROM AuditCerts WHERE AppUrl = ? AND (id = (SELECT MAX(id) FROM AuditCerts) OR CertVersion = ?)",
          [url, `${version}`],
          (error, results) => {
            if (error || !results) {
              reject(error);
              return;
            }

            if (results.length > 0) {
              const certJson = head<any>(results)!.AuditCert as string;
              const certificate = JSON.parse(certJson);

              resolve(certificate);
              return;
            }
            resolve();
          }
        );
      }
    );
  }

  public async setAuditionCert(
    url: string,
    cert: RegisteredCert<AuditionCertificate> | undefined
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.query(
        "INSERT INTO AuditCerts VALUES (NULL, ?, ?, ?)",
        [
          url,
          cert ? `${cert.applicationVersion}` : "NULL",
          cert ? stringify(cert) : "NULL"
        ],
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

  public async exists(
    applicationUrl: string,
    version?: number
  ): Promise<boolean> {
    const cert = await this.getAuditionCert(applicationUrl, version);
    return !isNil(cert);
  }
}
