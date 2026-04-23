(function (window, $) {
    "use strict";

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function buildSlideTitle(item) {
        var titre = escapeHtml(item.titre || "Bienvenue");
        return "<div class='slider-text'><h2 class='wow fadeInUp'>" + titre + "</h2><a class='btn-line wow fadeInUp' data-wow-delay='.3s' href='about.html'><span>Nos installations</span></a></div>";
    }

    function mapApiToSlides(items) {
        return items.map(function (item) {
            return {
                image: item.image,
                title: buildSlideTitle(item),
                thumb: "",
                url: ""
            };
        });
    }

    function getFallbackSlides() {
        return [
            {
                image: "https://res.cloudinary.com/dpls5pv5x/image/upload/q_auto/f_auto/v1776356904/e2hbjz26coogpuvm1rrr.png",
                title: "<div class='slider-text'><h2 class='wow fadeInUp'>Detente</h2><a class='btn-line wow fadeInUp' data-wow-delay='.3s' href='about.html'><span>Nos installations</span></a></div>",
                thumb: "",
                url: ""
            },
            {
                image: "https://res.cloudinary.com/dpls5pv5x/image/upload/q_auto/f_auto/v1776356714/vdejggo2sgjcr2lmn9zt.jpg",
                title: "<div class='slider-text'><h2 class='wow fadeInUp'>Comfort</h2><a class='btn-line wow fadeInUp' data-wow-delay='.3s' href='room-2-cols.html'><span>Choisir une chambre</span></a></div>",
                thumb: "",
                url: ""
            },
            {
                image: "https://res.cloudinary.com/dpls5pv5x/image/upload/q_auto/f_auto/v1776356720/vec4powfapnoqqtfoy3j.webp",
                title: "<div class='slider-text'><h2 class='wow fadeInUp'>Heureux</h2><a class='btn-line wow fadeInUp' data-wow-delay='.3s' href='about.html'><span>Nos installations</span></a></div>",
                thumb: "",
                url: ""
            }
        ];
    }

    function initSupersized(slides) {
        $.supersized({
            slide_interval: 5000,
            transition: 1,
            transition_speed: 500,
            slide_links: "blank",
            slides: slides,
            autoplay: 1,
            fit_always: 0,
            performance: 0,
            image_protect: 1
        });

        $("#pauseplay").toggle(
            function () {
                $(this).addClass("pause");
            },
            function () {
                $(this).removeClass("pause").addClass("play");
            }
        );

        $("#pauseplay").stop().fadeTo(150, 0.5);
        $("#pauseplay").hover(
            function () {
                $(this).stop().fadeTo(150, 1);
            },
            function () {
                $(this).stop().fadeTo(150, 0.5);
            }
        );
    }

    async function initHomeSlider() {
        var slides = getFallbackSlides();
        try {
            if (window.AccueilApi && typeof window.AccueilApi.fetchAccueilFeaturedSlides === "function") {
                var accueilItems = await window.AccueilApi.fetchAccueilFeaturedSlides();
                if (accueilItems.length) {
                    slides = mapApiToSlides(accueilItems);
                }
            }
        } catch (error) {
            console.error("Impossible de charger les slides via API, fallback local utilise.", error);
        }

        initSupersized(slides);
    }

    $(function () {
        initHomeSlider();
    });
})(window, jQuery);
