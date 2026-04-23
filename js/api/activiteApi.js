(function (window) {
    "use strict";

    function normalizePath(path) {
        var normalized = path || "/activites";
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

    function getActiviteEndpoint() {
        if (!window.AppConfig || !window.AppConfig.apiBaseUrl) {
            throw new Error("Configuration API manquante: window.AppConfig.apiBaseUrl");
        }

        var activitePath = normalizePath(window.AppConfig.activitePath);
        var baseUrl = window.AppConfig.apiBaseUrl.replace(/\/$/, "");
        return {
            primary: baseUrl + activitePath,
            fallback: baseUrl + withApiPrefix(activitePath)
        };
    }

    function getActiviteImageEndpoint() {
        if (!window.AppConfig || !window.AppConfig.apiBaseUrl) {
            throw new Error("Configuration API manquante: window.AppConfig.apiBaseUrl");
        }

        var activiteImagePath = normalizePath(window.AppConfig.activiteImagePath || "/activites/images");
        var baseUrl = window.AppConfig.apiBaseUrl.replace(/\/$/, "");
        return {
            primary: baseUrl + activiteImagePath,
            fallback: baseUrl + withApiPrefix(activiteImagePath)
        };
    }

    function withApiPrefix(path) {
        if (path.indexOf("/api/") === 0 || path === "/api") {
            return path;
        }
        return "/api" + path;
    }

    async function parseJsonResponse(response, endpoint) {
        if (!response || !response.ok) {
            var status = response ? response.status : "inconnu";
            throw new Error("Erreur API activite (" + endpoint + "): " + status);
        }

        return response.json();
    }

    async function fetchAllActivites() {
        var endpoints = getActiviteEndpoint();
        var candidates = [endpoints.primary];
        if (endpoints.fallback !== endpoints.primary) {
            candidates.push(endpoints.fallback);
        }
        // Compatibilite: essaie aussi la variante singulier/pluriel si necessaire.
        if (endpoints.primary.indexOf("/activite") !== -1) {
            candidates.push(endpoints.primary.replace("/activite", "/activites"));
        } else if (endpoints.primary.indexOf("/activites") !== -1) {
            candidates.push(endpoints.primary.replace("/activites", "/activite"));
        }
        if (endpoints.fallback.indexOf("/activite") !== -1) {
            candidates.push(endpoints.fallback.replace("/activite", "/activites"));
        } else if (endpoints.fallback.indexOf("/activites") !== -1) {
            candidates.push(endpoints.fallback.replace("/activites", "/activite"));
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

        throw new Error("Format de reponse activite invalide");
    }

    async function fetchAllActiviteImages() {
        var endpoints = getActiviteImageEndpoint();
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
        throw new Error("Format de reponse images activite invalide");
    }

    window.ActiviteApi = {
        fetchAllActivites: fetchAllActivites,
        fetchAllActiviteImages: fetchAllActiviteImages
    };
})(window);
