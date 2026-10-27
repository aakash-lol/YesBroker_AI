"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Calendar, Brain, RefreshCw } from "lucide-react";
import type { UILead } from "@/lib/mappers";

type WAMessage = {
  id: string;
  phone: string;
  name: string;
  message: string;
  direction: "outbound" | "inbound";
  status: string;
  sent_at: string;
  type: string;
};

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads", { cache: "no-store" })
      .then((r) => r.json())
      .then((leads: UILead[]) => {
        const msgs: WAMessage[] = leads
          .filter((l) => l.whatsapp_sent || l.site_visit_interest)
          .map((l) => ({
            id: l.id,
            phone: l.phone_number,
            name: l.name,
            message: l.whatsapp_sent
              ? `WhatsApp confirmation sent to ${l.name}. ${l.next_action ?? "Follow up on property interest."}`
              : `Site visit interest: ${l.site_visit_interest}. ${l.interest} — Budget: ${l.budget}`,
            direction: "outbound" as const,
            status: l.whatsapp_sent ? "delivered" : "sent",
            sent_at: l.updated_at,
            type: l.whatsapp_sent ? "visit_confirmation" : "follow_up",
          }));
        setMessages(msgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const TYPE_CONFIG: Record<
    string,
    { label: string; color: string; icon: typeof MessageSquare }
  > = {
    visit_confirmation: {
      label: "Visit Confirm",
      color: "text-emerald-400",
      icon: Calendar,
    },
    follow_up: {
      label: "Follow-up",
      color: "text-blue-400",
      icon: MessageSquare,
    },
    call_summary: {
      label: "Call Summary",
      color: "text-amber-400",
      icon: Brain,
    },
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="text-champagne-400 text-sm font-medium uppercase tracking-widest">
            Twilio via n8n
          </span>
          <h1 className="text-4xl font-bold text-ivory-100 mt-2 mb-2">
            WhatsApp Activity
          </h1>
          <p className="text-gray-400">
            Outbound messages triggered by n8n on site visit booking and call
            completion (leads.whatsapp_sent).
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "WhatsApp Sent",
              value: messages.filter((m) => m.type === "visit_confirmation")
                .length,
              color: "text-emerald-400",
            },
            {
              label: "Follow-ups",
              value: messages.filter((m) => m.type === "follow_up").length,
              color: "text-blue-400",
            },
            {
              label: "Total",
              value: messages.length,
              color: "text-champagne-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="glass rounded-xl p-4 border border-champagne-500/10 text-center"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="glass rounded-2xl p-12 border border-champagne-500/10 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>
              No WhatsApp activity yet. Messages appear when n8n sends
              confirmations after site visit bookings.
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-champagne-500/10 divide-y divide-champagne-500/5">
            {messages.map((msg, i) => {
              const cfg = TYPE_CONFIG[msg.type] ?? TYPE_CONFIG.follow_up;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-6 py-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-champagne-500/20 to-champagne-600/20 rounded-full flex items-center justify-center text-champagne-400 font-bold text-sm shrink-0">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-ivory-100">
                        {msg.name}
                      </p>
                      <span
                        className={`text-xs ${cfg.color} flex items-center gap-1`}
                      >
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <Phone className="w-3 h-3" />
                      {msg.phone}
                    </p>
                    <p className="text-sm text-gray-300">{msg.message}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(msg.sent_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-xs text-emerald-400 capitalize">
                    {msg.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
