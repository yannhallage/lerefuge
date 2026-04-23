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

    function getImageUrl(item) {
        if (!item) {
            return "images/offer/1.jpg";
        }
        if (typeof item.image === "string" && item.image.trim()) {
            return item.image.trim();
        }
        return "images/offer/1.jpg";
    }

    function formatPrice(value) {
        var number = Number(value);
        if (!Number.isFinite(number)) {
            return "Prix indisponible";
        }
        return number.toLocaleString("fr-FR") + " FCFA";
    }

    function buildOfferCard(item, index) {
        var title = escapeHtml(item.nom || ("Plat " + (index + 1)));
        var price = escapeHtml(formatPrice(item.prix));
        var image = escapeHtml(getImageUrl(item));

        return [
            "<div class='col-lg-4 col-md-6'>",
            "  <div class='d-items'>",
            "    <div class='card-image-1 de-offer'>",
            "      <div class='d-text'>",
            "        <div class='d-inner'>",
            "          <h3>" + title + "</h3>",
            "          <h5 class='d-tag'>" + price + "</h5>",
            "        </div>",
            "      </div>",
            "      <img src='" + image + "' class='img-fluid' alt='" + title + "'>",
            "    </div>",
            "  </div>",
            "</div>"
        ].join("");
    }

    function renderMessage(container, message) {
        container.innerHTML = "<div class='col-12 text-center'><p>" + escapeHtml(message) + "</p></div>";
    }

    async function initOffers() {
        var container = document.getElementById("offer-list");
        if (!container) {
            return;
        }

        renderMessage(container, "Chargement des offres...");

        try {
            if (!window.RestaurationApi || typeof window.RestaurationApi.fetchAllRestauration !== "function") {
                throw new Error("Module RestaurationApi indisponible");
            }

            var items = await window.RestaurationApi.fetchAllRestauration();
            if (!items.length) {
                renderMessage(container, "Aucune offre disponible pour le moment.");
                return;
            }

            container.innerHTML = items.map(buildOfferCard).join("");
        } catch (error) {
            console.error("Erreur de chargement des offres", error);
            renderMessage(container, "Impossible de charger les offres pour le moment.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initOffers();
    });
})(window, document);
