"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_get_many_1 = __importDefault(require("./tasks-get-many"));
const tasks_delete_1 = __importDefault(require("./tasks-delete"));
const tasks_get_one_1 = __importDefault(require("./tasks-get-one"));
const tasks_get_metafiles_1 = __importDefault(require("./tasks-get-metafiles"));
const tasks_post_1 = __importDefault(require("./tasks-post"));
const tasks_post_run_1 = __importDefault(require("./tasks-post-run"));
const tasks_post_stop_1 = __importDefault(require("./tasks-post-stop"));
const library_delete_one_1 = __importDefault(require("./library-delete-one"));
const library_get_many_1 = __importDefault(require("./library-get-many"));
const library_get_one_1 = __importDefault(require("./library-get-one"));
const library_post_drops_1 = __importDefault(require("./library-post-drops"));
const library_post_load_1 = __importDefault(require("./library-post-load"));
const library_post_one_1 = __importDefault(require("./library-post-one"));
const library_post_scan_1 = __importDefault(require("./library-post-scan"));
const library_post_unload_1 = __importDefault(require("./library-post-unload"));
const library_put_folders_1 = __importDefault(require("./library-put-folders"));
const library_put_one_1 = __importDefault(require("./library-put-one"));
const metacopy_delete_1 = __importDefault(require("./metacopy-delete"));
const metacopy_get_many_1 = __importDefault(require("./metacopy-get-many"));
const metacopy_get_one_1 = __importDefault(require("./metacopy-get-one"));
const metafiles_delete_1 = __importDefault(require("./metafiles-delete"));
const metafiles_export_1 = __importDefault(require("./metafiles-export"));
const metafiles_get_many_1 = __importDefault(require("./metafiles-get-many"));
const metafiles_get_one_1 = __importDefault(require("./metafiles-get-one"));
const metafiles_put_1 = __importDefault(require("./metafiles-put"));
const open_folder_1 = __importDefault(require("./open-folder"));
const thumbnails_get_1 = __importDefault(require("./thumbnails-get"));
const thumbnails_post_many_1 = __importDefault(require("./thumbnails-post-many"));
const thumbnails_post_one_1 = __importDefault(require("./thumbnails-post-one"));
const transactions_get_1 = __importDefault(require("./transactions-get"));
const transcode_delete_1 = __importDefault(require("./transcode-delete"));
const transcode_get_1 = __importDefault(require("./transcode-get"));
const transcode_post_one_1 = __importDefault(require("./transcode-post-one"));
const transcode_post_run_1 = __importDefault(require("./transcode-post-run"));
const transcode_post_stop_1 = __importDefault(require("./transcode-post-stop"));
const transcode_status_1 = __importDefault(require("./transcode-status"));
exports.default = [
    tasks_get_many_1.default,
    tasks_delete_1.default,
    tasks_get_one_1.default,
    tasks_get_metafiles_1.default,
    tasks_post_1.default,
    tasks_post_run_1.default,
    tasks_post_stop_1.default,
    library_delete_one_1.default,
    library_get_many_1.default,
    library_get_one_1.default,
    library_post_drops_1.default,
    library_post_load_1.default,
    library_post_one_1.default,
    library_post_scan_1.default,
    library_post_unload_1.default,
    library_put_folders_1.default,
    library_put_one_1.default,
    metacopy_delete_1.default,
    metacopy_get_many_1.default,
    metacopy_get_one_1.default,
    metafiles_delete_1.default,
    metafiles_export_1.default,
    metafiles_get_many_1.default,
    metafiles_get_one_1.default,
    metafiles_put_1.default,
    open_folder_1.default,
    thumbnails_get_1.default,
    thumbnails_post_many_1.default,
    thumbnails_post_one_1.default,
    transactions_get_1.default,
    transcode_delete_1.default,
    transcode_get_1.default,
    transcode_post_one_1.default,
    transcode_post_run_1.default,
    transcode_post_stop_1.default,
    transcode_status_1.default
];
//# sourceMappingURL=index.js.map