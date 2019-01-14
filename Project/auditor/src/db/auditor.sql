CREATE TABLE IF NOT EXISTS PublisherCerts(
    CertVersion     INT NOT NULL,
    PublisherCert   TEXT NOT NULL,
    PRIMARY KEY(CertVersion)
);

CREATE TABLE IF NOT EXISTS AuditCerts(
    id              MEDIUMINT NOT NULL,
    AppUrl          VARCHAR(289) NOT NULL,
    CertVersion     VARCHAR(255),
    AuditCert       TEXT,
    PRIMARY KEY(id, AppUrl)
);

DELIMITER $$
CREATE TRIGGER IncId BEFORE INSERT ON AuditCerts
FOR EACH ROW BEGIN
    SET NEW.id = (
       SELECT IFNULL(MAX(id), 0) + 1
       FROM AuditCerts
       WHERE AppUrl  = NEW.AppUrl
    );
END $$
DELIMITER ;