
$(function () {
    $("#contact_form").submit(function (e) {
        e.preventDefault();

        var hasBookingFields = $("#date-picker").length > 0 && $("#room-type").length > 0;
        var date = $("#date-picker").val();
        var adults = $(".guests-n-rooms .col-md-4").eq(0).find("input").val();
        var children = $(".guests-n-rooms .col-md-4").eq(1).find("input").val();
        var rooms = $("#room-count").val();
        var roomType = $("#room-type").val();
        var name = $("#name").val();
        var email = $("#email").val();
        var phone = $("#phone").val();
        var messageText = $("#message").val();

        var message = "";

        if (hasBookingFields) {
            message =
                "Bonjour, je souhaite faire une reservation au Refuge du Bandama.\n\n" +
                "Date: " + (date || "-") + "\n" +
                "Adultes: " + (adults || "-") + "\n" +
                "Enfants: " + (children || "-") + "\n" +
                "Chambres: " + (rooms || "-") + "\n" +
                "Type de chambre: " + (roomType || "-") + "\n\n" +
                "Nom: " + (name || "-") + "\n" +
                "Email: " + (email || "-") + "\n" +
                "Telephone: " + (phone || "-") + "\n" +
                "Message: " + (messageText || "-");
        } else {
            message =
                "Bonjour, je vous contacte depuis le formulaire du site.\n\n" +
                "Nom: " + (name || "-") + "\n" +
                "Email: " + (email || "-") + "\n" +
                "Telephone: " + (phone || "-") + "\n" +
                "Message: " + (messageText || "-");
        }

        const phoneNumber = "+2250748354479";
        const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");
    });
});
