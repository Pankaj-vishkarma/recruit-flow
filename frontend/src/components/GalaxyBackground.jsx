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

        const STAR_COUNT = 450;
        const stars = [];

        function createStars() {

            stars.length = 0;

            for (let i = 0; i < STAR_COUNT; i++) {

                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5,
                    speed: Math.random() * 0.4 + 0.1,
                    opacity: Math.random() * 0.8 + 0.2
                });

            }
        }

        createStars();

        function drawBackground() {

            const gradient = ctx.createLinearGradient(0, 0, 0, height);

            gradient.addColorStop(0, "#020617");   // dark blue
            gradient.addColorStop(1, "#000000");   // black

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // nebula glow left
            const glow1 = ctx.createRadialGradient(
                width * 0.2,
                height * 0.3,
                0,
                width * 0.2,
                height * 0.3,
                400
            );

            glow1.addColorStop(0, "rgba(99,102,241,0.25)");
            glow1.addColorStop(1, "transparent");

            ctx.fillStyle = glow1;
            ctx.fillRect(0, 0, width, height);

            // nebula glow right
            const glow2 = ctx.createRadialGradient(
                width * 0.8,
                height * 0.6,
                0,
                width * 0.8,
                height * 0.6,
                350
            );

            glow2.addColorStop(0, "rgba(168,85,247,0.2)");
            glow2.addColorStop(1, "transparent");

            ctx.fillStyle = glow2;
            ctx.fillRect(0, 0, width, height);

        }

        function animate() {

            ctx.clearRect(0, 0, width, height);

            drawBackground();

            stars.forEach((star) => {

                star.y += star.speed;

                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

                ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
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