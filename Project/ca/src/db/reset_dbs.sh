#!/bin/sh

export DB_USER=root
export DB_PASSWORD=\"ca_db_pwd\"

export DB_NAME=test
/app/ca/src/db/resetdb_ca.sh --verbose --force -h cadb;

export DB_NAME=development
/app/ca/src/db/resetdb_ca.sh --verbose --force -h cadb;

export DB_NAME=production
/app/ca/src/db/resetdb_ca.sh --verbose --force -h cadb;