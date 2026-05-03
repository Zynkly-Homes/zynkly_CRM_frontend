export const scrollToTop = () => {
  const mainScroller =
    document.querySelector("main") as HTMLElement ||
    document.querySelector(".h-screen.overflow-y-auto") as HTMLElement ||
    document.body;

  if (mainScroller) {
    mainScroller.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export const scrollToTop2 = () => {
  const mainScroller =
    (document.querySelector(".h-screen.overflow-y-auto") as HTMLElement) ||
    (document.querySelector("main") as HTMLElement) ||
    document.documentElement ||
    document.body;

  if (mainScroller) {
    mainScroller.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};
