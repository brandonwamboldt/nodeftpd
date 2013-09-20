#!/bin/bash

if [ `echo '#include <security/pam_appl.h>' | cpp -H -o /dev/null 2>&1 | head -n1 | grep 'fatal error' | wc -l` == "1" ]; then
  echo "nodeftpd: Please install the libpam-dev package";
  exit 1;
fi
