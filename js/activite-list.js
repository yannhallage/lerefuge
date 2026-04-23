(function (window, document) {
    "use strict";

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getTitle(item, index) {
        return item.nom || item.titre || item.title || item.name || ("Activite " + (index + 1));
    }

    function getImageUrl(item) {
        if (!item) {
            return "";
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

        return "";
    }

    function getImageTitle(item, index) {
        return item.nom || item.titre || item.title || item.name || ("Image activite " + (index + 1));
    }

    function renderMessage(container, message) {
        container.innerHTML = "<div class='col-12 text-center'><p>" + escapeHtml(message) + "</p></div>";
    }

    function buildListItem(item, index) {
        var title = escapeHtml(getTitle(item, index));
        return "<li>" + title + "</li>";
    }

    function buildGalleryItem(item, index) {
        var title = escapeHtml(getImageTitle(item, index));
        var imageUrl = escapeHtml(getImageUrl(item));

        return [
            "<div class='col-md-4 item'>",
            "  <div class='de-image-hover'>",
            "    <a href='" + imageUrl + "' class='image-popup'>",
            "      <span class='dih-title-wrap'><span class='dih-title'>" + title + "</span></span>",
            "      <span class='dih-overlay'></span>",
            "      <img src='" + imageUrl + "' class='lazy img-fluid' alt='" + title + "'>",
            "    </a>",
            "  </div>",
            "</div>"
        ].join("");
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

    async function initActivites() {
        var listContainer = document.getElementById("activity-list");
        var galleryContainer = document.getElementById("activity-gallery");
        if (!listContainer || !galleryContainer) {
            return;
        }

        listContainer.innerHTML = "<li>Chargement des activites...</li>";
        renderMessage(galleryContainer, "Chargement de la galerie des activites...");

        try {
            if (!window.ActiviteApi || typeof window.ActiviteApi.fetchAllActivites !== "function") {
                throw new Error("Module ActiviteApi indisponible");
            }

            var activites = await window.ActiviteApi.fetchAllActivites();
            var images = [];
            if (typeof window.ActiviteApi.fetchAllActiviteImages === "function") {
                images = await window.ActiviteApi.fetchAllActiviteImages();
            }
            var imagesAvecUrl = images.filter(function (item) {
                return !!getImageUrl(item);
            });
            if (!activites.length) {
                listContainer.innerHTML = "<li>Aucune activite disponible pour le moment.</li>";
                renderMessage(galleryContainer, "Aucune image disponible pour le moment.");
                return;
            }

            listContainer.innerHTML = activites.map(buildListItem).join("");
            if (!imagesAvecUrl.length) {
                renderMessage(galleryContainer, "Aucune image disponible pour le moment.");
                return;
            }

            galleryContainer.innerHTML = imagesAvecUrl.map(buildGalleryItem).join("");
            initImagePopup();
        } catch (error) {
            console.error("Erreur de chargement des activites", error);
            listContainer.innerHTML = "<li>Impossible de charger les activites pour le moment.</li>";
            renderMessage(galleryContainer, "Impossible de charger la galerie pour le moment.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initActivites();
    });
})(window, document);
