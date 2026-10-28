"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { PastProject } from "@/types";

interface PastProjectsGalleryProps {
  initialProjects?: PastProject[];
  limit?: number;
}

export function PastProjectsGallery({
  initialProjects,
  limit,
}: PastProjectsGalleryProps) {
  const [projects, setProjects] = useState<PastProject[]>(initialProjects || []);
  const [loading, setLoading] = useState(!initialProjects);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) return;
    let isMounted = true;
    fetch("/api/past-projects")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => {
        if (isMounted) setProjects([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [initialProjects]);

  const displayedProjects = limit ? projects.slice(0, limit) : projects;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + displayedProjects.length) % displayedProjects.length,
    );
  }, [displayedProjects.length]);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % displayedProjects.length,
    );
  }, [displayedProjects.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, prevLightbox, nextLightbox]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse border border-border bg-surface-alt"
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    );
  }

  if (displayedProjects.length === 0) {
    return (
      <div className="relative overflow-hidden border border-dashed border-border bg-surface p-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple dark:bg-brand-yellow/10 dark:text-brand-yellow">
          <Sparkles size={24} />
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">
          Portfolio Gallery In Production
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Our team is currently documenting our latest corporate & custom client productions.
          Check back shortly or visit the studio dashboard to add past project photos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedProjects.map((project, index) => {
          return (
            <motion.div
              key={project.id}
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{
                duration: 0.5,
                delay: (index % 4) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={reduce ? undefined : { y: -6 }}
              className="group relative cursor-pointer overflow-hidden border border-border bg-surface-alt transition-shadow duration-300 hover:border-brand-purple hover:shadow-xl hover:shadow-brand-purple/10 dark:hover:border-brand-yellow dark:hover:shadow-brand-yellow/10"
              onClick={() => openLightbox(index)}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-black/5 dark:bg-white/5">
                <Image
                  src={project.image_url}
                  alt={project.caption || `Printiful Past Project ${index + 1}`}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Subtle gradient vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Top Quick Indicator */}
                <div className="absolute right-3 top-3 flex size-9 translate-y-2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Maximize2 size={16} />
                </div>

                {/* Bottom Caption Pill */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span className="font-ui text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                    Client Production
                  </span>
                  <p className="mt-1 line-clamp-2 font-body text-sm font-medium leading-snug">
                    {project.caption || "Custom Branding & Merch Production"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && displayedProjects[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Top Bar */}
            <div
              className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 sm:p-6 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="font-ui text-xs font-semibold uppercase tracking-wider text-brand-yellow">
                  Past Project
                </span>
                <span className="text-white/40">·</span>
                <span className="font-ui text-xs text-white/70">
                  {lightboxIndex + 1} of {displayedProjects.length}
                </span>
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close lightbox"
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Buttons */}
            {displayedProjects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevLightbox();
                  }}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white/90 backdrop-blur-sm transition hover:bg-brand-purple hover:text-white sm:left-8"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextLightbox();
                  }}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white/90 backdrop-blur-sm transition hover:bg-brand-purple hover:text-white sm:right-8"
                  aria-label="Next image"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}

            {/* Modal Image & Caption Container */}
            <div
              className="relative max-h-[85vh] max-w-4xl w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/5] max-h-[75vh] w-auto max-w-full overflow-hidden rounded-lg shadow-2xl">
                <Image
                  src={displayedProjects[lightboxIndex].image_url}
                  alt={
                    displayedProjects[lightboxIndex].caption ||
                    "Printiful Client Project"
                  }
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {displayedProjects[lightboxIndex].caption && (
                <p className="mt-4 max-w-xl text-center font-body text-sm font-medium text-white/90 sm:text-base">
                  {displayedProjects[lightboxIndex].caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
