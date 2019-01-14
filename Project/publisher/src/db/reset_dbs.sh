#!/bin/sh

export DB_USER=root
export DB_PASSWORD=\"publisher_db_pwd\"

export DB_NAME=test
/app/publisher/src/db/resetdb_publisher.sh --verbose --force -h publisherdb;

export DB_NAME=development
/app/publisher/src/db/resetdb_publisher.sh --verbose --force -h publisherdb;

export DB_NAME=production
/app/publisher/src/db/resetdb_publisher.sh --verbose --force -h publisherdb;