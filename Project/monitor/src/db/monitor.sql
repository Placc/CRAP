CREATE TABLE IF NOT EXISTS TreeRoots(
    IlsId           VARCHAR(289) NOT NULL,
    Revision        INT NOT NULL,
    CertType        ENUM('PublisherCertificate', 'ApplicationCertificate', 'AuditionCertificate') NOT NULL,
    TreeRoot        TEXT NOT NULL,
    PRIMARY KEY (IlsId, CertType)
);