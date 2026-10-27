"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  FileText,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  Building2,
  User,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const deals = [
  {
    id: "1",
    property: "Palm Jumeirah Sea Villa",
    buyer: "Ahmed Al-Rashid",
    agent: "Sarah Mitchell",
    value: 26500000,
    currency: "AED",
    status: "negotiating",
    progress: 60,
  },
  {
    id: "2",
    property: "DIFC Sky Apartment",
    buyer: "Emma Johnson",
    agent: "System",
    value: 4100000,
    currency: "AED",
    status: "under-offer",
    progress: 80,
  },
  {
    id: "3",
    property: "Marina Gate Tower",
    buyer: "Raj Patel",
    agent: "Sarah Mitchell",
    value: 2050000,
    currency: "AED",
    status: "completed",
    progress: 100,
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  negotiating: {
    label: "Negotiating",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  "under-offer": {
    label: "Under Offer",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
};

const timeline = [
  { stage: "Initial Inquiry", done: true, date: "Jan 10" },
  { stage: "AI Voice Call", done: true, date: "Jan 11" },
  { stage: "Site Visit", done: true, date: "Jan 15" },
  { stage: "Offer Submitted", done: true, date: "Jan 16" },
  { stage: "AI Negotiation", done: true, date: "Jan 17" },
  { stage: "Payment", done: false, date: "Pending" },
  { stage: "Transfer", done: false, date: "Pending" },
];

export default function DealRoomPage() {
  const [selected, setSelected] = useState(deals[0]);

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="text-champagne-400 text-sm font-medium uppercase tracking-widest">
            Deal Management
          </span>
          <h1 className="text-4xl font-bold text-ivory-100 mt-2 mb-2">
            Deal Room
          </h1>
          <p className="text-gray-500">
            Track active deals, negotiations, documents, and transaction
            timelines.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Active Deals
            </h3>
            {deals.map((deal) => {
              const cfg = STATUS_CONFIG[deal.status];
              return (
                <button
                  key={deal.id}
                  onClick={() => setSelected(deal)}
                  className={`w-full text-left glass rounded-2xl p-5 border transition-all ${selected.id === deal.id ? "border-champagne-500/40 bg-champagne-500/5" : "border-champagne-500/10 hover:border-champagne-500/20"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-ivory-100 leading-tight">
                      {deal.property}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ml-2 shrink-0 ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-champagne-400 font-bold text-sm mb-3">
                    {formatPrice(deal.value, deal.currency)}
                  </p>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-champagne-600 to-champagne-400"
                      style={{ width: `${deal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {deal.progress}% complete
                  </p>
                </button>
              );
            })}
          </div>

          {/* Deal Detail */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div className="glass rounded-2xl p-6 border border-champagne-500/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-ivory-100">
                    {selected.property}
                  </h2>
                  <p className="text-champagne-400 font-bold text-2xl mt-1">
                    {formatPrice(selected.value, selected.currency)}
                  </p>
                </div>
                <span
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].color}`}
                >
                  {STATUS_CONFIG[selected.status].label}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Buyer", value: selected.buyer, icon: User },
                  { label: "Agent", value: selected.agent, icon: User },
                  {
                    label: "Deal Value",
                    value: formatPrice(selected.value, selected.currency),
                    icon: DollarSign,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="glass rounded-xl p-3 border border-white/5"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className="w-3 h-3 text-champagne-400" />
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                    <p className="text-sm font-medium text-ivory-100">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass rounded-2xl p-6 border border-champagne-500/10">
              <h3 className="text-sm font-semibold text-ivory-100 mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-champagne-400" />
                Deal Timeline
              </h3>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-champagne-500/10" />
                <div className="space-y-4">
                  {timeline.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 pl-8 relative"
                    >
                      <div
                        className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${step.done ? "bg-emerald-500/20 border-emerald-500" : "bg-obsidian-800 border-white/10"}`}
                      >
                        {step.done ? (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white/10" />
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <p
                          className={`text-sm ${step.done ? "text-ivory-100" : "text-gray-500"}`}
                        >
                          {step.stage}
                        </p>
                        <p
                          className={`text-xs ${step.done ? "text-champagne-400" : "text-gray-600"}`}
                        >
                          {step.date}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
