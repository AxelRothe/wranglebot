const path = require("path");

function getVolumePath(filePath) {
  const root = path.parse(filePath).root;
  if (process.platform === "darwin" && root === "/") {
    return `/${path.parse(filePath).dir.split(path.sep)[1]}/${path.parse(filePath).dir.split(path.sep)[2]}`;
  }
  if (process.platform === "linux" && root === "/") {
    return `/media/${process.env.USER}/${path.parse(filePath).dir.split(path.sep)[3]}`;
  }
  return root;
}

const filePath = "/Volumes/Data/Projekte/Florian/Cam_A-Florian_422HQ_Grading_Clip.mov";

console.log(path.parse(filePath).dir.split(path.sep));
console.log(getVolumePath(filePath));
