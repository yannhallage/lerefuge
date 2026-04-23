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

    function getImageUrl(item) {
        if (!item) {
            return FALLBACK_IMAGE;
        }

        if (typeof item.image === "string" && item.image.trim()) {
            return item.image.trim();
        }

        if (Array.isArray(item.image) && item.image.length) {
            var first = item.image[0];
            if (typeof first === "string" && first.trim()) {
                return first.trim();
            }
            if (first && typeof first.url === "string" && first.url.trim()) {
                return first.url.trim();
            }
        }

        if (typeof item.url === "string" && item.url.trim()) {
            return item.url.trim();
        }

        return FALLBACK_IMAGE;
    }

    function getTitle(item, index) {
        return item.titre || item.title || item.nom || item.name || ("Galerie " + (index + 1));
    }

    function buildItem(item, index) {
        var imageUrl = escapeHtml(getImageUrl(item));
        var title = escapeHtml(getTitle(item, index));

        return [
            "<div class='col-md-4 item'>",
            "  <div class='de-image-hover'>",
            "    <a href='" + imageUrl + "' class='image-popup'>",
            "      <span class='dih-title-wrap'>",
            "        <span class='dih-title'>" + title + "</span>",
            "      </span>",
            "      <span class='dih-overlay'></span>",
            "      <img src='" + imageUrl + "' class='lazy img-fluid' alt='" + title + "'>",
            "    </a>",
            "  </div>",
            "</div>"
        ].join("");
    }

    function renderMessage(container, message) {
        container.innerHTML = "<div class='col-12 text-center'><p>" + escapeHtml(message) + "</p></div>";
    }

    function initImagePopup() {
        if (typeof window.jQuery !== "function") {
            return;
        }

        var $ = window.jQuery;
        if (typeof $.fn.magnificPopup !== "function") {
            return;
        }

        $(".image-popup").magnificPopup({
            type: "image",
            gallery: {
                enabled: true
            }
        });
    }

    async function initGalleryList() {
        var container = document.getElementById("gallery-list");
        if (!container) {
            return;
        }

        renderMessage(container, "Chargement de la galerie...");

        try {
            if (!window.GalerieApi || typeof window.GalerieApi.fetchAllGaleries !== "function") {
                throw new Error("Module GalerieApi indisponible");
            }

            var galeries = await window.GalerieApi.fetchAllGaleries();
            if (!galeries.length) {
                renderMessage(container, "Aucune image disponible pour le moment.");
                return;
            }

            container.innerHTML = galeries.map(buildItem).join("");
            initImagePopup();
        } catch (error) {
            console.error("Erreur de chargement de la galerie", error);
            renderMessage(container, "Impossible de charger la galerie pour le moment.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initGalleryList();
    });
})(window, document);
