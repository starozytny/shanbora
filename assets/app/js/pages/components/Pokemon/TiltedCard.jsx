import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const springValues = {
	damping: 30,
	stiffness: 100,
	mass: 2,
};

export default function TiltedCard({
									   containerHeight = "300px",
									   containerWidth = "100%",
									   imageHeight = "300px",
									   imageWidth = "300px",
									   scaleOnHover = 1.1,
									   rotateAmplitude = 14,
									   showMobileWarning = true,
										children
								   }) {
	const ref = useRef(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotateX = useSpring(useMotionValue(0), springValues);
	const rotateY = useSpring(useMotionValue(0), springValues);
	const scale = useSpring(1, springValues);
	const opacity = useSpring(0);
	const rotateFigcaption = useSpring(0, {
		stiffness: 350,
		damping: 30,
		mass: 1,
	});

	const [lastY, setLastY] = useState(0);

	function handleMouse(e) {
		if (!ref.current) return;

		const rect = ref.current.getBoundingClientRect();
		const offsetX = e.clientX - rect.left - rect.width / 2;
		const offsetY = e.clientY - rect.top - rect.height / 2;

		const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
		const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

		rotateX.set(rotationX);
		rotateY.set(rotationY);

		x.set(e.clientX - rect.left);
		y.set(e.clientY - rect.top);

		const velocityY = offsetY - lastY;
		rotateFigcaption.set(-velocityY * 0.6);
		setLastY(offsetY);
	}

	function handleMouseEnter() {
		scale.set(scaleOnHover);
		opacity.set(1);
	}

	function handleMouseLeave() {
		opacity.set(0);
		scale.set(1);
		rotateX.set(0);
		rotateY.set(0);
		rotateFigcaption.set(0);
	}

	return (
		<figure
			ref={ref}
			className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
			style={{
				height: containerHeight,
				width: containerWidth,
			}}
			onMouseMove={handleMouse}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{showMobileWarning && (
				<div className="absolute top-4 text-center text-sm block sm:hidden">
					This effect is not optimized for mobile. Check on desktop.
				</div>
			)}

			<motion.div
				className="relative [transform-style:preserve-3d]"
				style={{
					width: imageWidth,
					height: imageHeight,
					rotateX,
					rotateY,
					scale,
				}}
			>
				<motion.div
					className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"
					style={{
						width: imageWidth,
						height: imageHeight,
					}}
				>
					{children}
				</motion.div>
			</motion.div>
		</figure>
	);
}
