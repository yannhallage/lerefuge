(function (window) {
    "use strict";

    function normalizePath(path) {
        var normalized = path || "/restauration";
        if (normalized.charAt(0) !== "/") {
            normalized = "/" + normalized;
        }
        return normalized;
    }

    function withApiPrefix(path) {
        if (path.indexOf("/api/") === 0 || path === "/api") {
            return path;
        }
        return "/api" + path;
    }

    function getRestaurationEndpoint() {
        if (!window.AppConfig || !window.AppConfig.apiBaseUrl) {
            throw new Error("Configuration API manquante: window.AppConfig.apiBaseUrl");
        }

        var restaurationPath = normalizePath(window.AppConfig.restaurationPath);
        var baseUrl = window.AppConfig.apiBaseUrl.replace(/\/$/, "");
        return {
            primary: baseUrl + restaurationPath,
            fallback: baseUrl + withApiPrefix(restaurationPath)
        };
    }

    async function fetchJson(endpoint) {
        return fetch(endpoint, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        });
    }

    async function parseJsonResponse(response, endpoint) {
        if (!response || !response.ok) {
            var status = response ? response.status : "inconnu";
            throw new Error("Erreur API restauration (" + endpoint + "): " + status);
        }

        return response.json();
    }

    async function fetchAllRestauration() {
        var endpoints = getRestaurationEndpoint();
        var candidates = [endpoints.primary];
        if (endpoints.fallback !== endpoints.primary) {
            candidates.push(endpoints.fallback);
        }
        candidates = candidates.filter(function (value, index, arr) {
            return arr.indexOf(value) === index;
        });

        var response = null;
        var endpoint = "";

        for (var i = 0; i < candidates.length; i += 1) {
            endpoint = candidates[i];
            response = await fetchJson(endpoint);
            if (response.ok) {
                break;
            }
            if (response.status !== 404) {
                break;
            }
        }

        var payload = await parseJsonResponse(response, endpoint);
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && Array.isArray(payload.data)) {
            return payload.data;
        }
        throw new Error("Format de reponse restauration invalide");
    }

    window.RestaurationApi = {
        fetchAllRestauration: fetchAllRestauration
    };
})(window);
