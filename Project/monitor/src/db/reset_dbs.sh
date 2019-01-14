#!/bin/sh

export DB_USER=root
export DB_PASSWORD=\"monitor_db_pwd\"

export DB_NAME=test
/app/monitor/src/db/resetdb_monitor.sh --verbose --force -h monitordb;

export DB_NAME=development
/app/monitor/src/db/resetdb_monitor.sh --verbose --force -h monitordb;

export DB_NAME=production
/app/monitor/src/db/resetdb_monitor.sh --verbose --force -h monitordb;