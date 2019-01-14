CREATE TABLE IF NOT EXISTS PublisherCerts(
    CertVersion     INT NOT NULL,
    PublisherCert   TEXT NOT NULL,
    PRIMARY KEY(CertVersion)
);

CREATE TABLE IF NOT EXISTS AppCerts(
    id              MEDIUMINT NOT NULL,
    AppUrl          VARCHAR(289) NOT NULL,
    DeployVersion   VARCHAR(255),
    AppCert         TEXT,
    PRIMARY KEY(id, AppUrl)
);

DELIMITER $$
CREATE TRIGGER IncId BEFORE INSERT ON AppCerts
FOR EACH ROW BEGIN
    SET NEW.id = (
       SELECT IFNULL(MAX(id), 0) + 1
       FROM AppCerts
       WHERE AppUrl  = NEW.AppUrl
    );
END $$
DELIMITER ;