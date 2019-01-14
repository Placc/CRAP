#!/bin/sh

export DB_NAME=test
./resetdb_trillian.sh --verbose --force -h mysql;
./resetdb_ils.sh --verbose --force -h ilsdb;

export DB_NAME=development
./resetdb_trillian.sh --verbose --force -h mysql;
./resetdb_ils.sh --verbose --force -h ilsdb;

export DB_NAME=production
./resetdb_trillian.sh --verbose --force -h mysql;
./resetdb_ils.sh --verbose --force -h ilsdb;