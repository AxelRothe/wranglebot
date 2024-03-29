import CopyTool from "../build/core/media/CopyTool.js";
import CancelToken from "../build/core/media/CancelToken.js";

const copyTool = new CopyTool({
  paranoid: true,
  overwrite: true,
  chunkSize: 10,
});

const callback = (result) => {
  console.log("speed", result);
};
let t1 = Date.now();

let cancelToken = new CancelToken(() => {
  copyTool.abort();
});

// setTimeout(() => {
//   cancelToken.abort();
// }, 500);

// copyTool
//   .source("/Volumes/NVME/example/F003/F003C016_190925_MN99.mxf")
//   // .source("/Volumes/NVME/example/M001/M001C001_161207_R00H.mov")
//   .destinations([
//     //"/volumes/Data/__test/backup5/example-task-03/F003C003_190925_MN99.mxf",
//     "/volumes/NVME/__test/backup6/example-task-03/F003C016_190925_MN99.mxf",
//   ])
//   .copy(callback)
//   .then((result) => {
//     console.log(JSON.stringify(result, null, 2));
//     console.log("done", Date.now() - t1);
//   });

copyTool.hashFile("/Volumes/NVME/example/F003/F003C016_190925_MN99.mxf", callback).then((result) => {
  console.log(result);
});
