import tasksGetMany from "./tasks-get-many.js";
import tasksDelete from "./tasks-delete.js";
import tasksGetOne from "./tasks-get-one.js";
import tasksGetMetafiles from "./tasks-get-metafiles.js";
import tasksPost from "./tasks-post.js";
import tasksPostGenerate from "./tasks-post-generate.js";
import tasksPostRun from "./tasks-post-run.js";
import tasksPostStop from "./tasks-post-stop.js";
import libraryDeleteOne from "./library-delete-one.js";
import libraryGetMany from "./library-get-many.js";
import libraryGetOne from "./library-get-one.js";
import libraryPostDrops from "./library-post-drops.js";
import libraryPostLoad from "./library-post-load.js";
import libraryPostOne from "./library-post-one.js";
import libraryPostScan from "./library-post-scan.js";
import libraryPostUnload from "./library-post-unload.js";
import libraryPutFolders from "./library-put-folders.js";
import libraryPutOne from "./library-put-one.js";
import metacopyDelete from "./metacopy-delete.js";
import metacopyGetMany from "./metacopy-get-many.js";
import metacopyGetOne from "./metacopy-get-one.js";
import metafilesDelete from "./metafiles-delete.js";
import metafilesExport from "./metafiles-export.js";
import metafilesGetMany from "./metafiles-get-many.js";
import metafilesGetOne from "./metafiles-get-one.js";
import metafilesPut from "./metafiles-put.js";
import metafilesAnalyseOne from "./metafiles-analyse-one.js";
import metafilesAnalyseMany from "./metafiles-analyse-many.js";
import openFolder from "./open-folder.js";
import thumbnailsGet from "./thumbnails-get.js";
import thumbnailsPostMany from "./thumbnails-post-many.js";
import thumbnailsPostOne from "./thumbnails-post-one.js";
import transactionsGet from "./transactions-get.js";
import transcodeDelete from "./transcode-delete.js";
import transcodeGet from "./transcode-get.js";
import transcodePostOne from "./transcode-post-one.js";
import transcodePostRun from "./transcode-post-run.js";
import transcodePostStop from "./transcode-post-stop.js";
import transcodeStatus from "./transcode-status.js";
import status from "./status.js";

export default [
  tasksGetMany,
  tasksDelete,
  tasksGetOne,
  tasksGetMetafiles,
  tasksPost,
  tasksPostGenerate,
  tasksPostRun,
  tasksPostStop,
  libraryDeleteOne,
  libraryGetMany,
  libraryGetOne,
  libraryPostDrops,
  libraryPostLoad,
  libraryPostOne,
  libraryPostScan,
  libraryPostUnload,
  libraryPutFolders,
  libraryPutOne,
  metacopyDelete,
  metacopyGetMany,
  metacopyGetOne,
  metafilesDelete,
  metafilesExport,
  metafilesGetMany,
  metafilesGetOne,
  metafilesPut,
  metafilesAnalyseOne,
  metafilesAnalyseMany,
  openFolder,
  thumbnailsGet,
  thumbnailsPostMany,
  thumbnailsPostOne,
  transactionsGet,
  transcodeDelete,
  transcodeGet,
  transcodePostOne,
  transcodePostRun,
  transcodePostStop,
  transcodeStatus,
  status,
];
