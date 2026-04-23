(function (window) {
    "use strict";

    async function fetchJson(endpoint) {
        var response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        return response;
    }

    function normalizePath(path) {
        var normalized = path || "/accueil/featured";
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

    async function fetchAccueilFeaturedSlides() {
        if (!window.AppConfig || !window.AppConfig.apiBaseUrl) {
            throw new Error("Configuration API manquante: window.AppConfig.apiBaseUrl");
        }

        var accueilPath = normalizePath(window.AppConfig.accueilPath);
        var baseUrl = window.AppConfig.apiBaseUrl.replace(/\/$/, "");
        var endpoints = [baseUrl + accueilPath, baseUrl + withApiPrefix(accueilPath)];
        var response = null;
        var endpoint = "";

        for (var i = 0; i < endpoints.length; i += 1) {
            endpoint = endpoints[i];
            response = await fetchJson(endpoint);
            if (response.ok) {
                break;
            }
            if (response.status !== 404) {
                break;
            }
        }

        if (!response || !response.ok) {
            var status = response ? response.status : "inconnu";
            throw new Error("Erreur API accueil (" + endpoint + "): " + status);
        }

        var payload = await response.json();
        if (!payload || !Array.isArray(payload.data)) {
            throw new Error("Format de reponse API invalide");
        }

        return payload.data.filter(function (item) {
            return item && item.image && item.isFeatured === true;
        });
    }

    window.AccueilApi = {
        fetchAccueilFeaturedSlides: fetchAccueilFeaturedSlides
    };
})(window);
