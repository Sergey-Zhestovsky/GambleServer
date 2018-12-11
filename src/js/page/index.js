GlowingNodes({
    wrapper: ".intro",
    canvas: "canvas"
});

$(window).on("scroll", () => {
	let paralax = window.scrollY / 2
	$(".container.pattern-background").css("background-position-y", `${paralax}px`);
})