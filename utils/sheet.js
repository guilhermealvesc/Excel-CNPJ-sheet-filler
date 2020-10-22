const xlsx = require('xlsx');
const receitaCNPJ = require('../api/receitaws');

const readsheet = (sheetName = "") => {
    try {
        const workbook = xlsx.readFile('./spreadsheet/' + sheetName + '.xlsx');
        const sheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet];
        return xlsx.utils.sheet_to_json(worksheet);
    } catch (e) {
        return e;
    }
}

const writesheet = (jsonwk, sheetName) => {
    try {
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(jsonwk);
        xlsx.utils.book_append_sheet(wb, ws, 'Planilha 1');
        xlsx.writeFile(wb, './spreadsheet/' + sheetName + 'prog.xlsx');
        return true;
    } catch (e) {
        return false;
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const query = async (jsonws, row) => {
    console.log(`Consulting item ${row + 1} with CPNJ -> ${jsonws[row].CNPJ}!`);
    const obj = await receitaCNPJ(jsonws[row].CNPJ);
    if (obj.error) return {
        obj,
        jsonws
    };
    jsonws[row]['Empresa'] = obj.nome;
    jsonws[row].CIDADE = obj.municipio;
    jsonws[row].ESTADO = obj.uf;
    jsonws[row].ENDERECO = obj.logradouro;
    jsonws[row].NUMERO = obj.numero;
    jsonws[row].TELEFONE = obj.telefone;
    jsonws[row].EMAIL = obj.email.toUpperCase();
    jsonws[row].SITUAÇÃO = obj.situacao;
    jsonws[row].CAPITAL_SOCIAL = obj.capital_social;
    for (let i = 1; i <= obj.qsa.length; i++) {
        jsonws[row]['NOME' + i] = obj.qsa[i - 1].nome;
        jsonws[row]['QUALIFICAÇÃO' + i] = obj.qsa[i - 1].qual;
    }
    console.log(`Empresa: ${jsonws[row]['Empresa']}`);
    console.log(`CIDADE: ${jsonws[row].CIDADE}`);
    console.log(`ESTADO: ${jsonws[row].ESTADO}`);
    console.log(`ENDERECO: ${jsonws[row].ENDERECO}`);
    console.log(`NUMERO: ${jsonws[row].NUMERO}`);
    console.log(`TELEFONE: ${jsonws[row].TELEFONE}`);
    console.log(`EMAIL: ${jsonws[row].EMAIL}`);
    console.log(`SITUAÇÃO: ${jsonws[row].SITUAÇÃO}`);
    console.log(`CAPITAL_SOCIAL: ${jsonws[row].CAPITAL_SOCIAL}`);
    for (let i = 1; i <= obj.qsa.length; i++) {
        console.log(`NOME${i}: ${jsonws[row]['NOME' + i]}`);
        console.log(`QUALIFICAÇÃO${i}: ${jsonws[row]['QUALIFICAÇÃO' + i]}`);
    }
    console.log("\n");
    return {
        obj,
        jsonws
    };
}


const altersheet = async jsonws => {
    try {
        let res, time;
        for (let i = 0; i < jsonws.length; i++) {
            if(jsonws[i]['Empresa']) 
                continue; 
            res = await query(jsonws, i);
            if (res.obj.error && !res.obj.cnpj) {
                //Api error
                throw {
                    error: res.obj,
                    jsonws
                };
            } else if (res.obj.cnpj != undefined) {
                //Cnpj invalid error
                console.log('Error message: ' + res.obj.message);
                console.log('Ignoring item ' + (i + 1) + '!');
            }
            jsonws = res.jsonws;
            if(i != jsonws.length - 1)
                time = 20500;
            else 
                time = 0;
            await Promise.resolve(timeout(time));
        }
        return jsonws;
    } catch (e) {
        return e;
    }
}

module.exports = {
    readsheet,
    writesheet,
    altersheet
};