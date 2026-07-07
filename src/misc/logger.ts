import * as fs from "node:fs";
import * as util from "node:util"

const fifoPath = "/tmp/logs.fifo"
export const logger = {
  stream: fs.createWriteStream(fifoPath,{
    flags:"w",
    encoding:"utf-8"
  }),

  log(...args: any[]) {
    this.stream.write(util.format(...args) + "\n");
  },
};
