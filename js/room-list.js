(function (window, document) {
    "use strict";

    var FALLBACK_IMAGE = "https://res.cloudinary.com/dpls5pv5x/image/upload/q_auto/f_auto/v1776356674/ajv2iz9ci5xzwjdywoqg.webp";

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function toNumber(value) {
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function firstImage(logement) {
        if (!logement) {
            return FALLBACK_IMAGE;
        }

        if (Array.isArray(logement.image) && logement.image.length) {
            var firstArrayImage = logement.image[0];
            if (typeof firstArrayImage === "string" && firstArrayImage.trim()) {
                return firstArrayImage.trim();
            }
        }

        if (typeof logement.image === "string" && logement.image.trim()) {
            return logement.image.trim();
        }

        if (Array.isArray(logement.images) && logement.images.length) {
            var first = logement.images[0];
            if (typeof first === "string" && first.trim()) {
                return first.trim();
            }
            if (first && typeof first.url === "string" && first.url.trim()) {
                return first.url.trim();
            }
        }

        return FALLBACK_IMAGE;
    }

    function getTitle(logement) {
        return logement.nom_logement || logement.nom || logement.titre || logement.title || "Logement";
    }

    function getDescription(logement) {
        if (Array.isArray(logement.specification) && logement.specification.length) {
            return logement.specification.slice(0, 3).join(" - ");
        }
        return logement.description || logement.desc || "Logement confortable pour un sejour paisible.";
    }

    function getCapacity(logement) {
        var values = [logement.nbre_personne, logement.capacite, logement.capacity, logement.nbPersonnes, logement.personnes];
        for (var i = 0; i < values.length; i += 1) {
            var numeric = toNumber(values[i]);
            if (numeric !== null) {
                return numeric;
            }
        }
        return 2;
    }

    function getSurface(logement) {
        var values = [logement.aire_chambre, logement.superficie, logement.surface, logement.area, logement.dimension];
        for (var i = 0; i < values.length; i += 1) {
            var numeric = toNumber(values[i]);
            if (numeric !== null) {
                return numeric;
            }
        }
        return 30;
    }

    function getPrice(logement) {
        var values = [logement.prix, logement.price, logement.tarif];
        for (var i = 0; i < values.length; i += 1) {
            var numeric = toNumber(values[i]);
            if (numeric !== null) {
                return numeric;
            }
        }
        return null;
    }

    function formatPrice(value) {
        var numeric = toNumber(value);
        if (numeric === null) {
            return "";
        }
        return numeric.toLocaleString("fr-FR");
    }

    function buildCard(logement) {
        var title = escapeHtml(getTitle(logement));
        var description = escapeHtml(getDescription(logement));
        var image = escapeHtml(firstImage(logement));
        var logementId = escapeHtml(logement.logement_id || "");
        var detailsUrl = logementId ? "room-single.html?id=" + logementId : "room-single.html";
        var capacity = escapeHtml(getCapacity(logement));
        var surface = escapeHtml(getSurface(logement));
        var price = getPrice(logement);
        var detailsText = price !== null ? "Consulter - " + escapeHtml(formatPrice(price)) + " FCFA" : "Consulter";

        return [
            "<div class='col-lg-4'>",
            "  <div class='de-room'>",
            "    <div class='d-image'>",
            "      <div class='d-label'>Disponible</div>",
            "      <div class='d-details'>",
            "        <span class='d-meta-1'><img src='images/ui/user.svg' alt=''>" + capacity + " personnes</span>",
            "        <span class='d-meta-2'><img src='images/ui/floorplan.svg' alt=''>" + surface + " m2</span>",
            "      </div>",
            "      <a href='" + detailsUrl + "'>",
            "        <img src='" + image + "' class='img-fluid' alt='" + title + "'>",
            "      </a>",
            "    </div>",
            "    <div class='d-text'>",
            "      <h3>" + title + "</h3>",
            "      <p>" + description + "</p>",
            "      <a href='" + detailsUrl + "' class='btn-line'><span>" + detailsText + "</span></a>",
            "    </div>",
            "  </div>",
            "</div>"
        ].join("");
    }

    function renderMessage(container, message) {
        container.innerHTML = "<div class='col-12 text-center'><p>" + escapeHtml(message) + "</p></div>";
    }

    async function initRoomList() {
        var container = document.getElementById("room-list");
        if (!container) {
            return;
        }

        renderMessage(container, "Chargement des logements...");

        try {
            if (!window.LogementApi || typeof window.LogementApi.fetchAllLogements !== "function") {
                throw new Error("Module LogementApi indisponible");
            }

            var logements = await window.LogementApi.fetchAllLogements();
            if (!logements.length) {
                renderMessage(container, "Aucun logement disponible pour le moment.");
                return;
            }

            container.innerHTML = logements.map(buildCard).join("");
        } catch (error) {
            console.error("Erreur de chargement des logements", error);
            renderMessage(container, "Impossible de charger les logements pour le moment.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initRoomList();
    });
})(window, document);
