var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RouteResult from "../../RouteResult.js";
export default {
    method: "post",
    url: "/library/:libraryName/metafiles/export",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryName = req.params.libraryName;
        const { files, path, reportName, format, template, credits } = req.body;
        const lib = yield bot.query.library.one(libraryName).fetch();
        const result = lib.query.metafiles
            .many({
            $ids: [...files],
        })
            .export.report({
            reportName: reportName,
            pathToExport: path,
            uniqueNames: true,
            format: format,
            template: template,
            credits: {
                owner: credits.owner || lib.drops.getCols()["owner"] || "Unknown",
                title: credits.title || "Clip Report",
            },
        });
        if (result) {
            return new RouteResult(200, {
                status: "success",
                message: `Exported ${files.length} files to ${path}`,
            });
        }
        else {
            throw new Error("Could not export report");
        }
    }),
};
//# sourceMappingURL=metafiles-export.js.map