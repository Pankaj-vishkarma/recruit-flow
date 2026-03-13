"use client";

import { useEffect, useRef } from "react";

export default function GalaxyBackground() {

    const canvasRef = useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const STAR_COUNT = 600;
        const stars = [];

        function createStars() {
            stars.length = 0;

            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.8,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: Math.random() * 0.8 + 0.2
                });
            }
        }

        createStars();

        function animate() {

            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);

            stars.forEach((star) => {

                star.x += star.speedX;
                star.y += star.speedY;

                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }

                if (star.x > width) star.x = 0;
                if (star.x < 0) star.x = width;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();

            });

            requestAnimationFrame(animate);

        }

        animate();

        function resize() {

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width;
            canvas.height = height;

            createStars();

        }

        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
        };

    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
        />
    );

}