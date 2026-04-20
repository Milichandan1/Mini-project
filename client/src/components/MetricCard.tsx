import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  detail: string;
  accent: string;
  icon: ReactNode;
}

export function MetricCard({ title, value, detail, accent, icon }: MetricCardProps) {
  return (
    <motion.article
      className="dashboard-shell p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{title}</p>
          <p className="mt-3 text-4xl font-black text-ink dark:text-white">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: `${accent}22`, color: accent }}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{detail}</p>
    </motion.article>
  );
}
