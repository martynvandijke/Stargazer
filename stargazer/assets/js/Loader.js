

class Loader {
    constructor() {
    }

    _toBase64(data) {
        var buffer = "", l = 0, w = 10240;
        for (; l < data.byteLength / w; ++l) buffer += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        buffer += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return buffer;
    }

    readFile(event, finish, config) {
        var reader = new FileReader();

        var file = event.target.files[0];

        if (!file.name.endsWith('json')) {
            // read table content
            reader.onload = e => {
                var buffer = this._toBase64(e.target.result);
                var workbook = XLSX.read(btoa(buffer), { type: 'base64' });
                var sheets = { sheetName: workbook.SheetNames, data: [] };
                for (var i = 0; i < workbook.SheetNames.length; i++) {
                    var sheetName = workbook.SheetNames[i];
                    var sheet = workbook.Sheets[sheetName];
                    var sheetArray = XLSX.utils.sheet_to_json(sheet, { header: 1, raw:true });
                    sheets.data[sheetName] = sheetArray;
                }
                // parsing sheets
                // by poping up spreadsheet 
                config(sheets);

                //finish([]);
            }
            reader.readAsArrayBuffer(file);
        } else {
            reader.onload = e => {
                finish(JSON.parse(e.target.result));
            }
            reader.readAsText(event.target.files[0]);
        }
    }

    saveFile(workbench) {
        var blob = new Blob([JSON.stringify(workbench)], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "workbench.json");
    }


}

module.exports = Loader;