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

let cancelToken = new CancelToken();

// setTimeout(() => {
//   cancelToken.abort();
// }, 500);
//
// cancelToken.on("abort", () => {
//   copyTool.abort();
// });

copyTool
  .source("/Volumes/NVME/example/F003/F003C003_190925_MN99.mxf")
  .destinations([
    "/volumes/Data/__test/backup5/example-task-03/F003C003_190925_MN99.mxf",
    "/volumes/NVME/__test/backup6/example-task-03/F003C003_190925_MN99.mxf",
  ])
  .copy(callback)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    console.log("done", Date.now() - t1);
  });
