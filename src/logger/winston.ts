import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "@/config";

const {
  LOG_INFO_FILE_NAME,
  LOG_INFO_DATE_PATTERN,
  LOG_INFO_DIRNAME,
  LOG_INFO_ZIPPED_ARCHIVE,
  LOG_INFO_MAX_FILES,
  
  LOG_ERROR_FILE_NAME,
  LOG_ERROR_DATE_PATTERN,
  LOG_ERROR_DIRNAME,
  LOG_ERROR_ZIPPED_ARCHIVE,
  LOG_ERROR_MAX_FILES,
} = config;

export const infoLogger = winston.createLogger({
  level: "info",
  transports: [
    new DailyRotateFile({
      filename: LOG_INFO_FILE_NAME,
      datePattern: LOG_INFO_DATE_PATTERN,
      dirname: LOG_INFO_DIRNAME,
      zippedArchive: LOG_INFO_ZIPPED_ARCHIVE,
      maxFiles: LOG_INFO_MAX_FILES,
    }),
  ],
});

export const errorLogger = winston.createLogger({
  level: "error",
  transports: [
    new DailyRotateFile({
      filename: LOG_ERROR_FILE_NAME,
      datePattern: LOG_ERROR_DATE_PATTERN,
      dirname: LOG_ERROR_DIRNAME,
      zippedArchive: LOG_ERROR_ZIPPED_ARCHIVE,
      maxFiles: LOG_ERROR_MAX_FILES,
    }),
  ],
});
