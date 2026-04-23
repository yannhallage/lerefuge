(function (window) {
    "use strict";

    function normalizePath(path) {
        var normalized = path || "/api/logement";
        if (normalized.charAt(0) !== "/") {
            normalized = "/" + normalized;
        }
        return normalized;
    }

    async function fetchJson(endpoint) {
        return fetch(endpoint, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        });
    }

    function getLogementBaseEndpoint() {
        if (!window.AppConfig || !window.AppConfig.apiBaseUrl) {
            throw new Error("Configuration API manquante: window.AppConfig.apiBaseUrl");
        }

        var logementPath = normalizePath(window.AppConfig.logementPath);
        var baseUrl = window.AppConfig.apiBaseUrl.replace(/\/$/, "");
        return baseUrl + logementPath;
    }

    async function parseJsonResponse(response, endpoint) {
        if (!response || !response.ok) {
            var status = response ? response.status : "inconnu";
            throw new Error("Erreur API logement (" + endpoint + "): " + status);
        }

        return response.json();
    }

    async function fetchAllLogements() {
        var endpoint = getLogementBaseEndpoint();
        var response = await fetchJson(endpoint);
        var payload = await parseJsonResponse(response, endpoint);

        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && Array.isArray(payload.data)) {
            return payload.data;
        }

        throw new Error("Format de reponse logement invalide");
    }

    async function fetchOneLogement(id) {
        if (!id) {
            throw new Error("ID logement manquant");
        }

        var endpoint = getLogementBaseEndpoint() + "/" + encodeURIComponent(id);
        var response = await fetchJson(endpoint);
        var payload = await parseJsonResponse(response, endpoint);

        if (payload && payload.data && !Array.isArray(payload.data)) {
            return payload.data;
        }
        if (payload && !Array.isArray(payload) && !payload.data) {
            return payload;
        }
        if (Array.isArray(payload) && payload.length > 0) {
            return payload[0];
        }
        if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
            return payload.data[0];
        }
        throw new Error("Format de reponse logement detail invalide");
    }

    window.LogementApi = {
        fetchAllLogements: fetchAllLogements,
        fetchOneLogement: fetchOneLogement
    };
})(window);
