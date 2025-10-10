export class BaseController {

    /**
     * Filtre les paramètres et les champs valides en fonction de la table, des verrous et des exceptions.
     *
     * Cette fonction prend un objet de paramètres, vérifie leur préfixe (`p:` pour paramètre, `f:` pour champ (field)),
     * valide leur présence dans `tableColumns`, et exclut ceux qui sont verrouillés sauf s'ils font partie des exceptions.
     *
     * @async
     * @static
     * @param {Object} params - Objet contenant les paramètres à filtrer. Les clés doivent être préfixées par `p:` ou `f:`.
     * @param {Array<string>|Promise<Array<string>>} tableColumns - Liste des colonnes valides de la table ou une promesse qui retourne cette liste.
     * @param {Array<string>} lockedParams - Liste des noms de paramètres qui sont verrouillés.
     * @param {Array<string>} lockedFields - Liste des noms de champs qui sont verrouillés.
     * @param {Array<string>} [exceptions=[]] - Liste des clés à exclure du filtrage de verrouillage.
     *
     * @throws {Error} Lance une erreur si `params` n'est pas un objet.
     *
     * @returns {Promise<{filtredParams: Object, filtredFields: Array<string>}>} 
     *          Un objet contenant :
     *            - `filtredParams`: objet des paramètres valides (préfixés `p:`) non verrouillés ou en exception.
     *            - `filtredFields`: tableau des champs valides (préfixés `f:`) non verrouillés ou en exception, sans doublons.
     *
     * @example
     * const params = { "p:name": "Alice", "f:age": 30, "p:lockedParam": "test" };
     * const tableColumns = ["name", "age"];
     * const lockedParams = ["lockedParam"];
     * const lockedFields = [];
     * const exceptions = ["lockedParam"];
     * 
     * const result = await MyClass.filterValidParams(params, tableColumns, lockedParams, lockedFields, exceptions);
     * console.log(result);
     * // {
     * //   filtredParams: { name: "Alice", lockedParam: "test" },
     * //   filtredFields: ["age"]
     * // }
     */
    static async filterValidParams(params, tableColumns, lockedParams, lockedFields, typeReturne = { params: 'objet', fields: 'liste' }, exceptions = []) {
        if (!params || typeof params !== 'object') {
            throw new Error('Invalid params: expected an object');
        }

        if (tableColumns instanceof Promise) { // Gestion asynchrone de tableColumns
            tableColumns = await tableColumns;
        }

        const filtredParams = {};
        const filtredFields = {};

        for (const [key, value] of Object.entries(params)) {
            const match = key.match(/^(p|f):(.*)$/);
            if (!match) continue;

            const [, prefix, cleanKey] = match;
            const isField = prefix === 'f';
            const isParam = prefix === 'p';

            if (!tableColumns.includes(cleanKey)) continue;

            const isLocked =
            (isParam && lockedParams.includes(cleanKey)) ||
            (isField && lockedFields.includes(cleanKey));

            if (isLocked && !exceptions.includes(cleanKey)) continue;

            // On stocke les params et fields avec leur valeur
            if (isParam) {
            filtredParams[cleanKey] = value;
            } else if (isField) {
            filtredFields[cleanKey] = value;
            }
        }

        // Gestion du format de retour selon typeReturne
        const resultParams =
            typeReturne.params === 'liste' ? Object.keys(filtredParams) : filtredParams;

        const resultFields =
            typeReturne.fields === 'liste' ? Object.keys(filtredFields) : filtredFields;

        return {
            filtredParams: resultParams,
            filtredFields: resultFields
        };
    }


    ///////////////////////////////////////////
    /**
     * Extrait proprement les paramètres pertinents d'une requête Express
     * selon la méthode HTTP.
     * 
     * @param {import('express').Request} req - L'objet requête Express.
     * @param {import('express').Response} res - L'objet réponse Express.
     * @returns {Object} - Les paramètres pertinents de la requête.
     */
    static extractParams(req, res) {
        console.log('Requête reçue :', req.method, '\n url :', req.url);
        const { method, body, query, params } = req;
        let data = {};

        switch (req.method.toUpperCase()) {
            case 'GET':
                data = req.query; // Pour GET : on privilégie la query string
                break;

            case 'POST':
            case 'PUT':
            case 'PATCH':
                // Pour POST/PUT/PATCH : le body est prioritaire
                data = (req.body && Object.keys(req.body).length) ? req.body : req.query;
                break;

            case 'DELETE':
                data = (req.body && Object.keys(req.body).length) ? req.body : req.query;
                break;

            default:
                // Cas fallback pour toute autre méthode
                data = (req.body && Object.keys(req.body).length) ? req.body : req.query;
                break;
        }

        // Fusion intelligente avec les params de route
        const finalParams = { ...req.params, ...data }; // (ex: /user/:id -> req.params.id)
        console.log('Params reçus :', finalParams);

        return finalParams;
    }

}