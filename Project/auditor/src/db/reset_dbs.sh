#!/bin/sh

export DB_USER=root
export DB_PASSWORD=\"auditor_db_pwd\"

export DB_NAME=test
/app/auditor/src/db/resetdb_auditor.sh --verbose --force -h auditordb;

export DB_NAME=development
/app/auditor/src/db/resetdb_auditor.sh --verbose --force -h auditordb;

export DB_NAME=production
/app/auditor/src/db/resetdb_auditor.sh --verbose --force -h auditordb;