const { readsheet, altersheet, writesheet } = require('./utils/sheet');
const read = require('./utils/utils');

read.question("Type workbook's name: ", async answer => {
    const sheetName = answer;
    try {
        let res;
        let jsonws = readsheet(sheetName);
        if (jsonws.errno) {
            throw {
                error: {
                    message: `Workbook at ${jsonws.path} doesn't exist!`
                },
                jsonws: undefined
            }
        }
        res = await altersheet(jsonws);
        if (res.error) throw res;
        jsonws = res;
        if (!writesheet(jsonws, sheetName)) {
            throw {
                error: {
                    message: 'It was not possible to save the workbook!'
                },
                jsonws: undefined
            }
        }
        console.log("Workbook " + sheetName + "prog.xslx saved successfully!");
    } catch (e) {
        console.log('Error message: ' + e.error.message);
        if (e.jsonws) {
            console.log('Trying to save the workbook before the error occurred...');
            if (!writesheet(e.jsonws, 'backup'))
                console.log('It was not possible to save the workbook during the error!');
            else
                console.log("Workbook 'backup.xlsx' saved successfully!");
        }
    }
    read.close();
});