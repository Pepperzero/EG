//alert("it works")

//////////// Cursor animation
//When cursor enter and leave links and buttons
$("a, button").on("mouseenter", function () {
  $(".cursor_dot").addClass("is-smaller");
});
$("a, button").on("mouseleave", function () {
  $(".cursor_dot").removeClass("is-smaller");
});
//when we click on the page the cursor gets is-smaller
$("body").on("mousedown", function () {
  $(".cursor_dot").addClass("cursor-clicked");
});
$("body").on("mouseup", function () {
  $(".cursor_dot").removeClass("cursor-clicked");
});

////////// Navbar animation
//Set variables
let navButton = $(".my-nav_button");
let menuWrap = $(".menu_wrap");
let menuPanels = $(".menu_panel");
let menuLinks = $(".menu_panel .menu_panel_link");
let line = $(".menu-wrap_vertical-line");
let otherLink = $(".menu_other_wrap");
let menuBackground = $(".menu_bg");

//Create timeline
let showMainMenu = gsap.timeline({ paused: true });
showMainMenu.set(menuWrap, { display: "flex", justifyContent: "flex-start" });
showMainMenu.from(menuWrap, { opacity: 0 }, "<");
showMainMenu.from(menuLinks, { yPercent: 100, opacity: 0, stagger: 0.05 }, "<");
showMainMenu.from(
  line,
  { height: "0%", duration: 2, ease: "power4.inOut" },
  "<"
);
showMainMenu.from(otherLink, { yPercent: 100, opacity: 0 }, ">-0.8");

//Trigger timeline
navButton.on("click", function () {
  if (showMainMenu.progress() === 0) {
    showMainMenu.play();
  } else {
    showMainMenu.timeScale(2).reverse();
  }
});

menuBackground.on("click", function () {
  showMainMenu.timeScale(2).reverse();
});

$(document).on("keydown", function (e) {
  if (e.key === "Escape") showMainMenu.timeScale(2).reverse();
});

////////////Hide empty boxes and sections on opera project
$(".opera_gallery_list").each(function () {
  if ($(this).hasClass("w-dyn-hide")) {
    $(this).closest(".opera_gallery_wrapper").addClass("w-condition-invisible");
  }
});

$(".opera_credits_container").each(function () {
  var allInvisible = true;
  $(this)
    .find(".opera_info-block")
    .each(function () {
      if (!$(this).hasClass("w-condition-invisible")) {
        allInvisible = false;
        return false; // Exit the loop if any element does not have the class
      }
    });
  if (allInvisible) {
    $(this).closest(".section_opera_bottom-info").addClass("hide");
  }
});

///////////Swiper on Opus page
if (window.innerWidth > 480) {
  $(".opus_swiper_component").each(function (index) {
    const swiper = new Swiper($(this).find(".swiper")[0], {
      //swiper.disable(),
      direction: "vertical",
      loop: true,
      slidesPerView: 1.2,
      centeredSlides: true,
      spaceBetween: 8,
      speed: 1100,
      //grabCursor: true,
      mousewheel: true, //mouse wheel let you scroll slides
      parallax: true,
      //slideToClickedSlide: true,
      keyboard: {
        enabled: true,
      },
    });
  });
}

////////// Page transition
//when page gets loaded these animation start
//let pageTitle = $(".my-nav_button_logo.is-page-title");
let pageTitle = $(".nav_left");

let pageLoad = gsap.timeline({
  paused: true,
  //onComplete: animateWords,
  defaults: { duration: 2, ease: "power2.inOut" },
});

// Flag to track whether the function has been called
var functionCalled = false;
// Add an event listener for the progress event
pageLoad.eventCallback("onUpdate", function () {
  var progress = pageLoad.progress();

  // Check if the timeline progress is at 50%
  if (progress >= 0.4 && !functionCalled) {
    // Call your function here
    animateWords();
    // Set the flag to true to indicate that the function has been called
    //this will make the animateWords trigger only once
    functionCalled = true;
  }
});

pageLoad.to(pageTitle, { yPercent: -100, opacity: 1, duration: 1.1 });
//pageLoad.to(".loader", { xPercent: 100 }, "<");
pageLoad.to(".loader", { opacity: 0 }, "<");

pageLoad.play();

//Page leave timeline
let pageLeave = gsap.timeline({
  paused: true,
  defaults: { duration: 2, ease: "power2.inOut" },
});

//////////// Animation that happen when clicking on a nav link.
$(".menu_panel a, .arrow_svg_link-block, .container-flex.is-opus a").on(
  "click",
  function (e) {
    let destination = $(this).attr("href");

    // In-page anchors (e.g. "#collection") don't load a new page, so the
    // loader would fade in and never fade out. Let Webflow scroll normally.
    if (!destination || destination.startsWith("#")) return;
    // New-tab links and cmd/ctrl-clicks should keep the browser default too
    if (this.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();
    console.log(destination);

    //close menu
    showMainMenu.reverse();

    //page leave Animation
    //pageLeave.set(".loader", { xPercent: -100 });
    //pageLeave.to(".loader", { xPercent: 0 });
    pageLeave.set(".loader", { opacity: 0 });
    pageLeave.to(".loader", { opacity: 100 });
    pageLeave.to(
      pageTitle,
      {
        yPercent: 100,
        opacity: 0,
        duration: 1.1,
        onComplete: () => {
          window.location = destination;
        },
      },
      ">-1.5"
    );

    pageLeave.play();
  }
);

// On Back Button Tap
// Fix for back button on iphone breaking the load page animation
window.onpageshow = function (event) {
  if (event.persisted) window.location.reload();
};

////////// Text animation on scroll

// Split text into spans
let typeSplit = new SplitType("[text-split]", {
  //types: "words, chars",
  types: "words",
  tagName: "span",
});

// Link timelines to scroll position
function createScrollTrigger(triggerElement, timeline) {
  // Reset tl when scroll out of view past bottom of screen
  ScrollTrigger.create({
    trigger: triggerElement,
    start: "top bottom",
    onLeaveBack: () => {
      timeline.progress(0);
      timeline.pause();
    },
  });
  // Play tl when scrolled into view (95% from top of screen)
  ScrollTrigger.create({
    trigger: triggerElement,
    start: "top 95%",
    onEnter: () => timeline.play(),
  });
}

function animateWords() {
  $("[words-slide-from-right]").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.fromTo(
      $(this).find(".word"),
      {
        opacity: 0,
        y: "1em",
      },
      {
        opacity: 1,
        y: "0em",
        duration: 0.6,
        ease: "power1.out",
        delay: 0.2, // slight delay to start the animation
        stagger: { amount: 0.4 },
      }
    );
    createScrollTrigger($(this), tl);
  });
}

/*
function animateWords() {
  $("[words-slide-from-right]").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".word"), {
      opacity: 0,
      y: "1em",
      duration: 0.6,
      ease: "power1.out",
      delay: 0.2, // slight delay to start the animation
      stagger: { amount: 0.4 }
    });
    createScrollTrigger($(this), tl);
  });
}
*/

// Avoid flash of unstyled content
//gsap.set("[text-split]", { opacity: 1 });
