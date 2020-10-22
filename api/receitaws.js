const fetch = require('node-fetch');
const cnpjvalidate = require('@fnando/cnpj');
const token = 'token';

const receitaCNPJ = async (cnpj) => {
    try {
        if (!cnpjvalidate.isValid(cnpj)){
            throw {
                cnpj,
                error: true,
                message: `${cnpj} is an invalid CNPJ!`
            };
        }
        const stripedcnpj = cnpjvalidate.strip(cnpj);
        //Authenticated mode
        /* https://www.receitaws.com.br/v1/cnpj/[cnpj]/days/[days] */

        //Non-Authenticated mode
        /* https://www.receitaws.com.br/v1/cnpj/[cnpj] */
        const url = `https://www.receitaws.com.br/v1/cnpj/${stripedcnpj}`;
        const promise = new Promise((resolve, reject) => {
            fetch(url, /* {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            } */)
                .then(res => res.json())
                .then(data => resolve(data))
                .catch(data => reject(data));
        });
        const res = await promise;
        if (res.status === "ERROR") {
            throw {
                error: true,
                message: res.message
            };
        }
        const { nome, municipio, logradouro, numero, uf, telefone, email, situacao, capital_social, qsa } = await promise;
        return {
            nome,
            municipio,
            logradouro,
            numero,
            uf,
            telefone,
            email,
            situacao,
            capital_social,
            qsa
        }
    } catch (e) {
        return e;
    }

};

module.exports = receitaCNPJ;