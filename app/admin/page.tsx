'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Building2, BarChart3, Activity, Settings, Bell, CheckCircle, AlertTriangle, TrendingUp, Brain, Zap } from 'lucide-react';

const activityLog = [
  { id: 1, event: 'New lead captured via AI Voice Agent', user: 'Ahmed Al-Rashid', time: '2 min ago', type: 'lead' },
  { id: 2, event: 'Site visit booked for Palm Jumeirah Villa', user: 'Sarah Mitchell', time: '15 min ago', type: 'visit' },
  { id: 3, event: 'AI Negotiation completed — Counter AED 4.9M', user: 'Emma Johnson', time: '32 min ago', type: 'negotiation' },
  { id: 4, event: 'WhatsApp confirmation sent via Twilio', user: 'System', time: '35 min ago', type: 'whatsapp' },
  { id: 5, event: 'Call escalated to senior agent', user: 'Mohammed Al-Farsi', time: '1h ago', type: 'escalation' },
  { id: 6, event: 'New property listed: Creek Harbour Residence', user: 'Admin', time: '2h ago', type: 'property' },
];

const users = [
  { name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', role: 'customer', status: 'active', joined: '2024-01-15' },
  { name: 'Sarah Mitchell', email: 'sarah@yesbroker.ai', role: 'agent', status: 'active', joined: '2023-12-01' },
  { name: 'Raj Patel', email: 'raj@example.com', role: 'customer', status: 'active', joined: '2024-01-13' },
  { name: 'Emma Johnson', email: 'emma@example.com', role: 'customer', status: 'inactive', joined: '2024-01-12' },
  { name: 'System Admin', email: 'admin@yesbroker.ai', role: 'admin', status: 'active', joined: '2023-01-01' },
];

const ROLE_CONFIG: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  agent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  customer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  owner: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const EVENT_CONFIG: Record<string, string> = {
  lead: 'text-emerald-400',
  visit: 'text-blue-400',
  negotiation: 'text-champagne-400',
  whatsapp: 'text-violet-400',
  escalation: 'text-amber-400',
  property: 'text-cyan-400',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview'|'users'|'logs'>('overview');

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-champagne-400 text-sm font-medium uppercase tracking-widest">System Control</span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />All Systems Online
            </span>
          </div>
          <h1 className="text-4xl font-bold text-ivory-100 mt-2 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Platform management, user control, and system monitoring.</p>
        </motion.div>

        {/* System Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Vapi Voice AI', status: 'online', icon: Zap },
            { label: 'n8n Workflows', status: 'online', icon: Activity },
            { label: 'Supabase DB', status: 'online', icon: Brain },
            { label: 'Twilio WhatsApp', status: 'online', icon: CheckCircle },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 border border-emerald-500/10">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="w-4 h-4 text-emerald-400" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <p className="text-xs font-medium text-ivory-100">{s.label}</p>
              <p className="text-xs text-emerald-400">● Online</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[['overview','Overview'],['users','User Management'],['logs','Activity Logs']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className={`text-sm px-4 py-2.5 rounded-xl transition-all font-medium ${activeTab === key ? 'bg-champagne-500 text-obsidian-900' : 'glass border border-champagne-500/10 text-gray-500 hover:text-ivory-100'}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Metrics */}
            <div className="glass rounded-2xl p-6 border border-champagne-500/10">
              <h3 className="text-sm font-medium text-ivory-100 mb-5 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-champagne-400" />Platform Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Users', value: '1,247', change: '+12%' },
                  { label: 'Active Agents', value: '23', change: '+3' },
                  { label: 'Properties Listed', value: '186', change: '+8' },
                  { label: 'Monthly Revenue', value: 'AED 4.2M', change: '+28%' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between py-2 border-b border-champagne-500/5">
                    <span className="text-sm text-gray-500">{m.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ivory-100">{m.value}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6 border border-champagne-500/10">
              <h3 className="text-sm font-medium text-ivory-100 mb-5 flex items-center gap-2"><Settings className="w-4 h-4 text-champagne-400" />Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Add Property', color: 'bg-champagne-500/10 text-champagne-400 border-champagne-500/20', icon: Building2 },
                  { label: 'Add Agent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Users },
                  { label: 'View Reports', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: TrendingUp },
                  { label: 'System Logs', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Activity },
                ].map(a => (
                  <button key={a.label} className={`flex items-center gap-2 p-4 rounded-xl border ${a.color} text-sm font-medium hover:opacity-80 transition-all text-left`}>
                    <a.icon className="w-4 h-4" />{a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass rounded-2xl border border-champagne-500/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-champagne-500/10 flex items-center justify-between">
              <h3 className="text-sm font-medium text-ivory-100">Platform Users</h3>
              <span className="text-xs text-gray-500">{users.length} total</span>
            </div>
            <div className="divide-y divide-champagne-500/5">
              {users.map((user, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.05 }}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-champagne-500/20 to-champagne-600/20 rounded-full flex items-center justify-center text-champagne-400 font-bold text-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ivory-100">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${ROLE_CONFIG[user.role] || ROLE_CONFIG.customer}`}>{user.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'active' ? 'text-emerald-400' : 'text-gray-500'}`}>● {user.status}</span>
                  <span className="text-xs text-gray-600 hidden sm:block">{user.joined}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="glass rounded-2xl border border-champagne-500/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-champagne-500/10">
              <h3 className="text-sm font-medium text-ivory-100">Activity Log</h3>
            </div>
            <div className="divide-y divide-champagne-500/5">
              {activityLog.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.05 }}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${EVENT_CONFIG[log.type] || 'text-gray-500'}`} style={{ background: 'currentColor' }} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{log.event}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.user}</p>
                  </div>
                  <span className="text-xs text-gray-600">{log.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
