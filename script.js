const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const sampleVideos = document.querySelectorAll(".sample-video");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

menuToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

const pauseVideo = (video) => {
  if (!video.paused) {
    video.pause();
  }
};

const playVideo = (video) => {
  const playPromise = video.play();

  if (playPromise) {
    playPromise.catch(() => {
      video.controls = true;
    });
  }
};

const updateActiveSampleVideo = () => {
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  let activeVideo = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  sampleVideos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    const isVisible = rect.bottom > window.innerHeight * 0.18 && rect.top < window.innerHeight * 0.82;

    if (!isVisible) {
      pauseVideo(video);
      return;
    }

    const videoCenterX = rect.left + rect.width / 2;
    const videoCenterY = rect.top + rect.height / 2;
    const distance = Math.hypot(viewportCenterX - videoCenterX, viewportCenterY - videoCenterY);

    if (distance < closestDistance) {
      closestDistance = distance;
      activeVideo = video;
    }
  });

  sampleVideos.forEach((video) => {
    if (video === activeVideo) {
      playVideo(video);
    } else {
      pauseVideo(video);
    }
  });
};

const videoObserver = new IntersectionObserver(updateActiveSampleVideo, {
  rootMargin: "-18% 0px -18% 0px",
  threshold: [0, 0.25, 0.5, 0.75, 1]
});

sampleVideos.forEach((video) => videoObserver.observe(video));
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("scroll", updateActiveSampleVideo, { passive: true });
document.querySelector(".sample-feed")?.addEventListener("scroll", updateActiveSampleVideo, { passive: true });
window.addEventListener("resize", updateActiveSampleVideo);
window.addEventListener("load", updateActiveSampleVideo);
