#
# Wazuh app - Database backend
# Copyright (C) 2018 Wazuh, Inc.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# Find more information about this on the LICENSE file.
#
import logging
import sys
import os
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
# sys.path.insert(0, os.path.join(os.path.dirname(__file__), "."))
import tailer

_APPNAME = 'SplunkAppForWazuh'

loggers = {}


class log():
    def __init__(self):
        """
        Setup a logger for the REST handler.
        """

        global loggers

        if loggers.get('splunk.appserver.%s.controllers.logs' % _APPNAME):
            self.logger = loggers.get(
                'splunk.appserver.%s.controllers.logs' % _APPNAME)
        else:
            self.logger = logging.getLogger(
                'splunk.appserver.%s.controllers.logs' % _APPNAME)
            try:
                # Prevent the log messages from being duplicated in the python.log file
                self.logger.propagate = False
                self.logger.setLevel(logging.DEBUG)
                self.file_handler = logging.handlers.RotatingFileHandler(make_splunkhome_path(
                    ['var', 'log', 'splunk', 'SplunkAppForWazuh.log']), maxBytes=100000000, backupCount=50)
                self.formatter = logging.Formatter(
                    '{ "date": "%(asctime)s" , "level": "%(levelname)s" , "message": "%(message)s" }')
                self.file_handler.setFormatter(self.formatter)
                self.logger.addHandler(self.file_handler)
                loggers['splunk.appserver.%s.controllers.logs' %
                        _APPNAME] = self.logger
            except Exception as e:
                self.error('[log.py][constructor] %s' % (e))
                raise e

    def error(self, msg):
        self.logger.error(msg)

    def info(self, msg):
        self.logger.info(msg)

    def get_last_log_lines(self, lines):
        try:
            current_tail = tailer.tail(open(
                "/opt/splunk/var/log/splunk/SplunkAppForWazuh.log"), lines)
            result = list(reversed(current_tail))
        except Exception as e:
            self.error('[log.py][get_last_log_lines] %s' % (e))
            raise e
        return result
