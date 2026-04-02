'use client'

import { motion } from 'framer-motion'
import {
  Search,
  Library,
  Star,
  Calendar,
  RefreshCcw,
  Download,
  ShieldCheck,
  Zap
} from 'lucide-react'

const features = [
  {
    icon: <Search className="w-6 h-6 text-blue-400" />,
    title: "Global Search",
    description: "Access millions of movies and TV shows powered by the TMDB database. Find detailed info, trailers, and more."
  },
  {
    icon: <Library className="w-6 h-6 text-purple-400" />,
    title: "Personal Library",
    description: "Organize your collection into Watched, Wishlist, or Favorite categories with a sleek, interactive interface."
  },
  {
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    title: "Deep Tracking",
    description: "Give your own ratings, log watch dates, and write personalized comments for every title in your collection."
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-emerald-400" />,
    title: "Instant Sync",
    description: "Metadata like release dates, posters, and TMDB ratings automatically sync every time you interact with your library."
  },
  {
    icon: <Download className="w-6 h-6 text-pink-400" />,
    title: "Data Freedom",
    description: "Export your entire collection to Excel with one click. Your data belongs to you, anywhere you go."
  },
  {
    icon: <Zap className="w-6 h-6 text-orange-400" />,
    title: "Sleek Experience",
    description: "Built with Next.js and Prisma for a fast, responsive, and secure experience across all your devices."
  }
]

export default function AboutPage() {
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
            About <br /> MovieMan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-2xl text-zinc-400 font-medium max-w-2xl leading-relaxed"
          >
            MovieMan is your premium personal multimedia command center.
            Track, collect, and share your favorite movies and TV series
            with a sleek, modern interface designed for the ultimate cinephile.
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
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Core Features</h2>
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
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                {feature.description}
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
          <h2 className="text-2xl sm:text-4xl font-bold mb-6 tracking-tight">The MovieMan Philosophy</h2>
          <p className="text-zinc-500 font-medium leading-relaxed italic">
            "We believe that a movie collection is more than just data. It's a journey through stories that shape us. MovieMan was built to make that journey more organized, beautiful, and accessible."
          </p>
        </motion.div>
      </section>
    </div>
  )
}