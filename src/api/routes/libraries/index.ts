import tasksGetMany from "./tasks-get-many";
import tasksDelete from "./tasks-delete";
import tasksGetOne from "./tasks-get-one";
import tasksGetMetafiles from "./tasks-get-metafiles";
import tasksPost from "./tasks-post";
import tasksPostGenerate from "./tasks-post-generate";
import tasksPostRun from "./tasks-post-run";
import tasksPostStop from "./tasks-post-stop";
import libraryDeleteOne from "./library-delete-one";
import libraryGetMany from "./library-get-many";
import libraryGetOne from "./library-get-one";
import libraryPostDrops from "./library-post-drops";
import libraryPostLoad from "./library-post-load";
import libraryPostOne from "./library-post-one";
import libraryPostScan from "./library-post-scan";
import libraryPostUnload from "./library-post-unload";
import libraryPutFolders from "./library-put-folders";
import libraryPutOne from "./library-put-one";
import metacopyDelete from "./metacopy-delete";
import metacopyGetMany from "./metacopy-get-many";
import metacopyGetOne from "./metacopy-get-one";
import metafilesDelete from "./metafiles-delete";
import metafilesExport from "./metafiles-export";
import metafilesGetMany from "./metafiles-get-many";
import metafilesGetOne from "./metafiles-get-one";
import metafilesPut from "./metafiles-put";
import metafilesAnalyse from "./metafiles-analyse";
import openFolder from "./open-folder";
import thumbnailsGet from "./thumbnails-get";
import thumbnailsPostMany from "./thumbnails-post-many";
import thumbnailsPostOne from "./thumbnails-post-one";
import transactionsGet from "./transactions-get";
import transcodeDelete from "./transcode-delete";
import transcodeGet from "./transcode-get";
import transcodePostOne from "./transcode-post-one";
import transcodePostRun from "./transcode-post-run";
import transcodePostStop from "./transcode-post-stop";
import transcodeStatus from "./transcode-status";

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
  metafilesAnalyse,
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
];
