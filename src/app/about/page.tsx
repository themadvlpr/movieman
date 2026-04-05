'use client'

import { motion } from 'framer-motion'
import {
  Search,
  Library,
  Star,
  RefreshCcw,
  Download,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { useTranslation } from "@/providers/LocaleProvider"

const features = [
  {
    icon: <Search className="w-6 h-6 text-blue-400" />,
    title: "globalSearch",
    description: "globalSearchDescription"
  },
  {
    icon: <Library className="w-6 h-6 text-purple-400" />,
    title: "personalLibrary",
    description: "personalLibraryDescription"
  },
  {
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    title: "deepTracking",
    description: "deepTrackingDescription"
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-emerald-400" />,
    title: "instantSync",
    description: "instantSyncDescription"
  },
  {
    icon: <Download className="w-6 h-6 text-pink-400" />,
    title: "dataFreedom",
    description: "dataFreedomDescription"
  },
  {
    icon: <Zap className="w-6 h-6 text-orange-400" />,
    title: "sleekExperience",
    description: "sleekExperienceDescription"
  }
]

export default function AboutPage() {

  const { t } = useTranslation()

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-20 overflow-hidden">
        {/* Background Gradients */}

        <div className="relative z-10 max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 bg-linear-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent animate-shimmer uppercase w-fit"
          >
            {t("about", "title")}
            <br /> MovieMan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-2xl text-zinc-400 font-medium max-w-2xl leading-relaxed"
          >
            {t("about", "description")}
          </motion.p>
        </div>
      </section>

      {/* Functionality Section */}
      <section className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">{t("about", "coreFeatures")}</h2>
          <div className="h-px w-20 bg-linear-to-r from-zinc-500 to-transparent" />
        </motion.div>

        <motion.div
          variants={containerVars}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVars}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl"
            >
              <div className="mb-6 p-3 w-fit rounded-2xl bg-zinc-900 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-100 tracking-tight">
                {t("about", feature.title)}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                {t("about", feature.description)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Meta/Vision Statement */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 pb-40 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-linear-to-b from-zinc-900 to-zinc-950 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-center mb-8">
            <ShieldCheck className="w-12 h-12 text-zinc-500" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-6 tracking-tight">{t("about", "theMovieManPhilosophy")}</h2>
          <p className="text-zinc-500 font-medium leading-relaxed italic">
            {t("about", "theMovieManPhilosophyDescription")}
          </p>
        </motion.div>
      </section>
    </div>
  )
}