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

    function formatPrice(value) {
        var numeric = toNumber(value);
        return numeric === null ? "-" : numeric.toLocaleString("fr-FR");
    }

    function getRoomIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    function getImages(logement) {
        if (Array.isArray(logement.image) && logement.image.length) {
            return logement.image.filter(function (item) {
                return typeof item === "string" && item.trim();
            });
        }
        if (typeof logement.image === "string" && logement.image.trim()) {
            return [logement.image.trim()];
        }
        return [FALLBACK_IMAGE];
    }

    function getCapacity(logement) {
        var values = [logement.nbre_personne, logement.capacite, logement.capacity, logement.nbPersonnes, logement.personnes];
        for (var i = 0; i < values.length; i += 1) {
            var numeric = toNumber(values[i]);
            if (numeric !== null) {
                return numeric;
            }
        }
        return "-";
    }

    function getSurface(logement) {
        var values = [logement.aire_chambre, logement.superficie, logement.surface, logement.area, logement.dimension];
        for (var i = 0; i < values.length; i += 1) {
            var numeric = toNumber(values[i]);
            if (numeric !== null) {
                return numeric;
            }
        }
        return "-";
    }

    function setText(id, value) {
        var node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function updateBookingLinks(roomName) {
        var links = document.querySelectorAll("a[href='booking.html']");
        if (!links.length) {
            return;
        }

        var encodedRoom = encodeURIComponent(roomName || "");
        var targetHref = "booking.html?room=" + encodedRoom;

        links.forEach(function (link) {
            link.setAttribute("href", targetHref);
        });
    }

    function renderSpecs(specification) {
        var node = document.getElementById("room-single-specs");
        if (!node) {
            return;
        }

        if (!Array.isArray(specification) || !specification.length) {
            node.innerHTML = "<li>Equipements non renseignes</li>";
            return;
        }

        node.innerHTML = specification.map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
        }).join("");
    }

    function buildCarouselHtml(images, title) {
        return images.map(function (url) {
            var safeUrl = escapeHtml(url);
            return [
                "<div class='item'>",
                "  <div class='picframe'>",
                "    <a class='image-popup-gallery' href='" + safeUrl + "'>",
                "      <span class='overlay'>",
                "        <span class='pf_title'><i class='icon_search'></i></span>",
                "        <span class='pf_caption'>" + escapeHtml(title) + "</span>",
                "      </span>",
                "    </a>",
                "    <img src='" + safeUrl + "' alt='" + escapeHtml(title) + "'>",
                "  </div>",
                "</div>"
            ].join("");
        }).join("");
    }

    function renderCarousel(images, title) {
        var carouselNode = document.getElementById("carousel-rooms");
        if (!carouselNode) {
            return;
        }

        var html = buildCarouselHtml(images, title);
        carouselNode.innerHTML = html;

        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.owlCarousel) {
            var $carousel = window.jQuery("#carousel-rooms");
            var owl2Instance = $carousel.data("owl.carousel");
            var owl1Instance = $carousel.data("owlCarousel");

            // Reinitialise proprement pour eviter les items empiles.
            if (owl2Instance) {
                $carousel.trigger("destroy.owl.carousel");
                $carousel.removeClass("owl-loaded owl-hidden");
                $carousel.find(".owl-stage-outer").children().unwrap();
            } else if (owl1Instance && typeof owl1Instance.destroy === "function") {
                owl1Instance.destroy();
                $carousel.removeClass("owl-carousel owl-theme");
                carouselNode.className = "owl-carousel owl-theme";
            }

            $carousel.owlCarousel({
                items: 1,
                singleItem: true,
                autoPlay: true,
                autoplay: true,
                navigation: false,
                nav: false,
                pagination: true,
                dots: true,
                loop: true
            });

            var $left = window.jQuery(".d-arrow-left");
            var $right = window.jQuery(".d-arrow-right");
            $left.off("click.roomSingle").on("click.roomSingle", function () {
                if ($carousel.data("owl.carousel")) {
                    $carousel.trigger("prev.owl.carousel");
                } else {
                    $carousel.trigger("owl.prev");
                }
            });
            $right.off("click.roomSingle").on("click.roomSingle", function () {
                if ($carousel.data("owl.carousel")) {
                    $carousel.trigger("next.owl.carousel");
                } else {
                    $carousel.trigger("owl.next");
                }
            });
        }
    }

    function updateBackground(firstImage) {
        var background = document.getElementById("background");
        if (!background) {
            return;
        }
        background.setAttribute("data-bgimage", "url(" + firstImage + ") fixed");
        background.style.backgroundImage = "url('" + firstImage + "')";
    }

    function renderLogement(logement) {
        var title = logement.nom_logement || "Logement";
        var images = getImages(logement);
        var description = Array.isArray(logement.specification) && logement.specification.length
            ? "Profitez de: " + logement.specification.slice(0, 4).join(", ") + "."
            : "Logement confortable pour un sejour paisible.";

        document.title = title + " - Le Refuge du Bandama";
        setText("room-single-title", title);
        setText("room-single-category", "Detail logement");
        setText("room-single-capacity", String(getCapacity(logement)));
        setText("room-single-surface", String(getSurface(logement)));
        setText("room-single-price", formatPrice(logement.prix));
        setText("room-single-description", description);
        renderSpecs(logement.specification);
        renderCarousel(images, title);
        updateBackground(images[0]);
        updateBookingLinks(title);
    }

    function renderError(message) {
        setText("room-single-title", "Logement indisponible");
        setText("room-single-description", message);
        renderSpecs([]);
    }

    async function initRoomSingle() {
        var id = getRoomIdFromUrl();
        if (!id) {
            renderError("Aucun identifiant de logement dans l'URL.");
            return;
        }

        try {
            if (!window.LogementApi || typeof window.LogementApi.fetchOneLogement !== "function") {
                throw new Error("Module LogementApi indisponible");
            }
            var logement = await window.LogementApi.fetchOneLogement(id);
            renderLogement(logement);
        } catch (error) {
            console.error("Erreur de chargement du logement", error);
            renderError("Impossible de charger ce logement pour le moment.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        initRoomSingle();
    });
})(window, document);
