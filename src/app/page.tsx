"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import styles from "./landing.module.css";
import PlaygroundCanvas from "@/components/playground/PlaygroundCanvas";

gsap.registerPlugin(SplitText);

export default function Home() {
  

  return (
    <div className={`${styles.page}`}>
       <PlaygroundCanvas />
    </div>
  );
}
