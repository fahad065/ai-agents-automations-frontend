"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { TrendingUp, Users, Globe, Clock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: TrendingUp, value: 4821, suffix: "+", label: "Tasks automated daily", color: "#7c3aed" },
  { icon: Users, value: 2400, suffix: "+", label: "Businesses using NexAgent", color: "#22c55e" },
  { icon: Globe, value: 47, suffix: "", label: "Countries served", color: "#3b82f6" },
  { icon: Clock, value: 98, suffix: "%", label: "Uptime guarantee", color: "#f59e0b" },
];

export function StatsSection() {
  const { colors } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const triggered = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          if (triggered.current) return;
          triggered.current = true;
          countersRef.current.forEach((el, i) => {
            if (!el) return;
            const target = stats[i].value;
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target, duration: 2.5, ease: "power2.out",
              onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString(); },
            });
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      padding: "80px 24px",
      borderTop: `1px solid ${colors.border}`,
      borderBottom: `1px solid ${colors.border}`,
      background: colors.bg,
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
        }}>
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} style={{
                textAlign: "center", padding: "24px",
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <IconComponent size={20} color={stat.color} />
                </div>
                <div style={{
                  fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800,
                  color: colors.text, lineHeight: 1, marginBottom: "8px",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  <span ref={(el) => { countersRef.current[i] = el; }}>0</span>
                  <span style={{ color: stat.color }}>{stat.suffix}</span>
                </div>
                <p style={{ color: colors.textMuted, fontSize: "14px" }}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}