CREATE TABLE IF NOT EXISTS Trees(
    ContentType     ENUM('0', '1', '2') NOT NULL,
    TreeType        ENUM('1', '2') NOT NULL,
    TreeId          VARCHAR(255) NOT NULL,
    PublicKey       BLOB NOT NULL,
    PRIMARY KEY (TreeId)
);