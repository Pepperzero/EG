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
    // Opt-in: components with the custom attribute data-scroll-release="true"
    // become a normally scrolling list (see initOpusScrollList below).
    // All other sliders keep the original Swiper setup.
    if (this.dataset.scrollRelease === "true") {
      initOpusScrollList(this);
      return;
    }

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

// Opus scrolling list (replaces the vertical swiper on opted-in components):
// - projects are a normal list scrolling with the page, so no scroll hijacking
// - each project's text sits next to its image and only shows while that image
//   covers the middle of the screen (fades in from the right and back out to
//   the right, same 1.1s timing as the old swiper)
// - images drift slightly inside their frame (parallax)
function initOpusScrollList(component) {
  const list = component.querySelector(".swiper");
  const itemsWrap = list && list.querySelector(".swiper-wrapper");
  if (!itemsWrap) return;

  injectOpusListCss();

  // Drop the Swiper classes so neither Swiper's nor the Webflow swiper styles apply
  list.classList.remove("swiper");
  list.classList.add("opus-list");
  itemsWrap.classList.remove("swiper-wrapper");
  const items = [...itemsWrap.children];
  items.forEach((item) => {
    item.classList.remove("swiper-slide");
    item.classList.add("opus-item");
  });
  const imgs = items.map((item) => item.querySelector(".opus_img"));

  const PARALLAX = 0.15; // the image is 130% of its frame, so it can move ±15%
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = -1;

  function setCurrent(i) {
    if (i === current) return;
    if (items[current]) items[current].classList.remove("is-current");
    current = i;
    items[i].classList.add("is-current");
  }

  function update() {
    const vh = window.innerHeight;
    const mid = vh / 2;
    let active = 0;
    items.forEach((item, j) => {
      const r = item.getBoundingClientRect();
      // current = the last project whose top has passed the middle of the screen
      if (r.top <= mid) active = j;
      if (reduceMotion || !imgs[j] || r.bottom < -100 || r.top > vh + 100) return;
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / (mid + r.height / 2)));
      imgs[j].style.transform = `translate3d(0, ${(-p * PARALLAX * r.height).toFixed(1)}px, 0)`;
    });
    setCurrent(active);
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
}

function injectOpusListCss() {
  if (document.getElementById("opus-list-css")) return;
  const C = '.opus_swiper_component[data-scroll-release="true"]';
  const EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
  const style = document.createElement("style");
  style.id = "opus-list-css";
  // Images are 70svh tall; the 15svh bottom padding ((100 - 70) / 2) lets the
  // last project reach the middle of the screen.
  style.textContent = `
${C} { height: auto !important; overflow: visible !important; }
${C} .opus-list { position: relative; width: 100%; height: auto; overflow: visible; padding-bottom: 15svh; }
${C} .w-dyn-items { display: block; }
${C} .opus-item { width: 100%; height: 70svh; margin-bottom: 8px; }
${C} .opus-item .container_flex { height: 100%; }
${C} .opus_img { will-change: transform; }
${C} .txt_content { opacity: 0; transform: translateX(5%); pointer-events: none;
  transition: opacity 1.1s ${EASE}, transform 1.1s ${EASE}; }
${C} .is-current .txt_content { opacity: 1; transform: translateX(0); pointer-events: auto; }
@media (prefers-reduced-motion: reduce) {
  ${C} .txt_content { transform: none !important; transition: opacity 0.3s linear !important; }
}`;
  document.head.appendChild(style);
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

//////////// Extra nav: arrow direction + arrow click
// (moved here from the CodeSandbox preview script, which loads unreliably)
(() => {
  const box = document.querySelector(".extra-nav_category");
  const collection = document.querySelector("#collection");
  if (!box || !collection) return;

  ScrollTrigger.create({
    trigger: collection,
    start: "top 50%",
    onEnter: () => box.classList.add("is-up"),
    onLeaveBack: () => box.classList.remove("is-up"),
  });

  // The arrow (href="#") does whatever the visible label does,
  // so Webflow's native smooth anchor scroll handles both.
  box.querySelector(".extra-nav_arrow_link")?.addEventListener("click", (e) => {
    e.preventDefault();
    const isUp = box.classList.contains("is-up");
    box.querySelector(isUp ? "#scroll-up" : "#scroll-down")?.click();
  });
})();

//////////// Back arrow: return to the list the project was opened from,
//////////// at the same scroll position
(() => {
  const KEY = "eg-return";
  const read = () => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  };
  const write = (value) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(value));
    } catch (e) {}
  };
  const isProjectPage = location.pathname.startsWith("/projects/");
  const saved = read();

  if (!isProjectPage) {
    // Remember where the visitor was when opening a project from this page
    document.addEventListener(
      "click",
      (e) => {
        const link = e.target.closest("a[href]");
        if (link && link.host === location.host && link.pathname.startsWith("/projects/")) {
          write({ path: location.pathname, y: window.scrollY });
        }
      },
      true
    );

    // Coming back via the arrow: jump to the saved position (only once)
    if (saved && saved.restore && saved.path === location.pathname) {
      write({ path: saved.path, y: saved.y });
      let userScrolled = false;
      ["wheel", "touchstart", "keydown"].forEach((type) =>
        window.addEventListener(type, () => (userScrolled = true), { once: true, passive: true })
      );
      window.scrollTo(0, saved.y);
      // images/fonts can shift the layout while loading: re-apply unless the visitor already scrolled
      window.addEventListener("load", () => {
        if (!userScrolled) window.scrollTo(0, saved.y);
      });
    }
  } else {
    // Project page: the back arrow returns to the remembered page
    const back = document.querySelector(".navbar_arrow_back_wrap");
    if (back && saved && saved.path) {
      back.addEventListener("click", (e) => {
        if (back.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        write({ path: saved.path, y: saved.y, restore: true });
        window.location = saved.path;
      });
    }
  }
})();
