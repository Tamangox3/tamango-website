import lottie from 'lottie-web';

export function loadLottieAnimation(containerId: string, animationPath: string): void {
	const animationContainer = document.getElementById(containerId);
	console.log('animationContainer', animationContainer);
	if (animationContainer) {
		lottie.loadAnimation({
			container: animationContainer,
			renderer: 'svg',
			loop: true,
			autoplay: true,
			path: animationPath,
		});
	}
}
