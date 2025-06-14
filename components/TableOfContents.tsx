"use client";

import { useEffect, useRef, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

interface TOCProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // ScrollSpy effect
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          break;
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "0px 0px -60% 0px",
      threshold: 0.1,
    });

    const headingElements = document.querySelectorAll("h2, h3, h4");
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Render nested list based on heading levels
  const renderNested = (items: Heading[]) => {
    const result: JSX.Element[] = [];
    let currentLevel = 2;
    let stack: JSX.Element[][] = [[]];

    for (const item of items) {
      const link = (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`block py-1 pr-2 transition-colors ${
            activeId === item.id
              ? "text-blue-600 font-medium"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {item.text}
        </a>
      );

      const levelDiff = item.level - currentLevel;

      if (levelDiff > 0) {
        // Going deeper (nesting)
        const nestedList = [link];
        stack.push(nestedList);
        currentLevel = item.level;
      } else if (levelDiff < 0) {
        // Climbing back up
        while (currentLevel > item.level && stack.length > 1) {
          const children = stack.pop();
          const parent = stack[stack.length - 1];

          parent.push(
            <ul className="pl-4 ml-4 border-l border-slate-200 dark:border-slate-700">
              {children}
            </ul>
          );

          currentLevel--;
        }
        stack[stack.length - 1].push(link);
        currentLevel = item.level;
      } else {
        // Same level
        stack[stack.length - 1].push(link);
      }
    }

    // Close remaining nested levels
    while (stack.length > 1) {
      const children = stack.pop();
      stack[stack.length - 1].push(
        <ul className="pl-4 ml-4 border-l border-slate-200 dark:border-slate-700">
          {children}
        </ul>
      );
    }

    return stack[0];
  };

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto text-sm hidden md:block">
      <p className="mb-2 font-semibold text-slate-900 dark:text-white">
        On this page
      </p>
      <nav className="space-y-1">{renderNested(headings)}</nav>
    </aside>
  );
}
