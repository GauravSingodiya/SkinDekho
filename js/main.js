import { loginUser, registerUser } from "./auth.js";

(function ($) {
  "use strict";

  /* ==========================
     Spinner
  ========================== */
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  /* ==========================
     Fixed Navbar
  ========================== */
  $(window).scroll(function () {
    if ($(window).width() < 992) {
      if ($(this).scrollTop() > 55) {
        $(".fixed-top").addClass("shadow");
      } else {
        $(".fixed-top").removeClass("shadow");
      }
    } else {
      if ($(this).scrollTop() > 55) {
        $(".fixed-top").addClass("shadow").css("top", -55);
      } else {
        $(".fixed-top").removeClass("shadow").css("top", 0);
      }
    }
  });

  /* ==========================
     Back to Top Button
  ========================== */
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  /* ==========================
     Vegetable Carousel
  ========================== */
  $(".vegetable-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: true,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 },
    },
  });

  /* ==========================
     Modal Video
  ========================== */
  $(document).ready(function () {
    let videoSrc = "";

    $(".btn-play").click(function () {
      videoSrc = $(this).data("src");
    });

    $("#videoModal").on("shown.bs.modal", function () {
      $("#video").attr(
        "src",
        videoSrc + "?autoplay=1&modestbranding=1&showinfo=0"
      );
    });

    $("#videoModal").on("hide.bs.modal", function () {
      $("#video").attr("src", videoSrc);
    });
  });

  /* ==========================
     LOGIN FORM
  ========================== */
  $("#loginForm").on("submit", async function (e) {
    e.preventDefault();

    const email = $(this).find("[name='email']").val();
    const password = $(this).find("[name='password']").val();

    try {
      const res = await loginUser(email, password);
      console.log("Login Success:", res);

      alert("Login successful ✅");
      $("#authModal").modal("hide");

      // Optional: save token
      // localStorage.setItem("token", res.token);
    } catch (err) {
      alert(err.message || "Login failed");
    }
  });

  /* ==========================
     SIGNUP FORM
  ========================== */
  $("#signupForm").on("submit", async function (e) {
    e.preventDefault();

    const payload = {
      firstName: $(this).find("[name='firstName']").val(),
      lastName: $(this).find("[name='lastName']").val(),
      email: $(this).find("[name='email']").val(),
      phoneNumber: $(this).find("[name='phoneNumber']").val(),
      password: $(this).find("[name='password']").val(),
    };
    console.log('payload---', payload);
    try {
      const res = await registerUser(payload);
      console.log("Signup Success:", res);

      alert("Signup successful 🎉");
      $("#authModal").modal("hide");
      this.reset();
    } catch (err) {
      console.log(err, "err");
      alert(err.message || "Signup failed");
    }
  });
})(jQuery);
