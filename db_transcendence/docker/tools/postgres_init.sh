#!/bin/bash

# Specify the path to your file
file_path="/var/lib/postgresql/data/pg_hba.conf"

# Use sed to replace "trust" with "m5a" in the file
sed -i 's/trust/md5/g' "$file_path"