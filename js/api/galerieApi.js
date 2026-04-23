(function (window) {
    "use strict";

    function normalizePath(path) {
        var normalized = path || "/api/galerie";
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

    function getGalerieEndpoint() {
        if (!window.AppConfig || !window.AppConfig.apiBaseUrl) {
            throw new Error("Configuration API manquante: window.AppConfig.apiBaseUrl");
        }

        var galeriePath = normalizePath(window.AppConfig.galeriePath);
        var baseUrl = window.AppConfig.apiBaseUrl.replace(/\/$/, "");
        return baseUrl + galeriePath;
    }

    async function parseJsonResponse(response, endpoint) {
        if (!response || !response.ok) {
            var status = response ? response.status : "inconnu";
            throw new Error("Erreur API galerie (" + endpoint + "): " + status);
        }
        return response.json();
    }

    async function fetchAllGaleries() {
        var endpoint = getGalerieEndpoint();
        var response = await fetchJson(endpoint);
        var payload = await parseJsonResponse(response, endpoint);

        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && Array.isArray(payload.data)) {
            return payload.data;
        }

        throw new Error("Format de reponse galerie invalide");
    }

    window.GalerieApi = {
        fetchAllGaleries: fetchAllGaleries
    };
})(window);
