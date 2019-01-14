var fs = require("fs");

var FILE = "./node_modules/bytebuffer/dist/bytebuffer-node.js";

var data = fs.readFileSync(FILE);
var newText = "";

data
  .toString()
  .split("\r\n")
  .forEach(line => {
    newText =
      newText + "\r\n" + line.replace('memcpy = require("memcpy");', "");
  });

fs.writeFileSync(FILE, newText);
