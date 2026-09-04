/*
 * Nexa.data — fictional seed/demo data for the Nexa AI concept product.
 * Everything here is invented. Timestamps are generated relative to the
 * moment the app loads, so the dashboard always reads as "live" no matter
 * when it's opened.
 */
(function () {
  "use strict";

  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const ago = (ms) => new Date(Date.now() - ms).toISOString();
  const minutesAgo = (n) => ago(n * MIN);
  const hoursAgo = (n) => ago(n * HOUR);
  const daysAgo = (n) => ago(n * DAY);

  const WORKSPACE = { name: "Brightloop Studio", plan: "Pro", seatsUsed: 5, seatsTotal: 8 };

  const USER = {
    name: "Sofia Marek",
    initials: "SM",
    role: "Content Lead",
    email: "sofia@brightloop.studio",
    workspace: WORKSPACE.name,
  };

  const TEAM = [
    { initials: "SM", name: "Sofia Marek", hue: "a" },
    { initials: "DK", name: "Diego Kade", hue: "b" },
    { initials: "PN", name: "Priya Nandi", hue: "c" },
    { initials: "TJ", name: "Theo James", hue: "d" },
    { initials: "LA", name: "Lina Ahn", hue: "e" },
  ];

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "grid" },
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "generator", label: "AI Generator", icon: "sparkle" },
    { id: "history", label: "Content History", icon: "clock" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "templates", label: "Templates", icon: "layout" },
    { id: "notifications", label: "Notifications", icon: "bell", badge: "notifications" },
    { id: "settings", label: "Settings", icon: "gear" },
  ];

  const STATUS_META = {
    active: { label: "Active", tone: "accent" },
    draft: { label: "Draft", tone: "neutral" },
    review: { label: "In review", tone: "warning" },
    archived: { label: "Archived", tone: "muted" },
  };

  const CONTENT_TYPES = [
    "Blog post",
    "Social caption",
    "Email",
    "Ad copy",
    "Product description",
    "Video script",
  ];

  const TONES = ["Professional", "Friendly", "Persuasive", "Playful", "Confident", "Empathetic"];

  const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese"];

  const PROJECTS = [
    {
      id: "prj-aurora",
      name: "Aurora Skincare — Launch Campaign",
      client: "Aurora Skincare",
      type: "Social caption",
      status: "active",
      progress: 68,
      contentCount: 24,
      owner: "SM",
      hue: "a",
      updated: hoursAgo(3),
    },
    {
      id: "prj-fintra",
      name: "Fintra Onboarding Emails",
      client: "Fintra",
      type: "Email",
      status: "active",
      progress: 42,
      contentCount: 11,
      owner: "TJ",
      hue: "d",
      updated: hoursAgo(7),
    },
    {
      id: "prj-pineforge",
      name: "Pineforge Blog Refresh",
      client: "Pineforge Outdoors",
      type: "Blog post",
      status: "review",
      progress: 90,
      contentCount: 18,
      owner: "SM",
      hue: "a",
      updated: minutesAgo(35),
    },
    {
      id: "prj-lumen",
      name: "Lumen Ad Sprint — Q3",
      client: "Lumen Home",
      type: "Ad copy",
      status: "active",
      progress: 55,
      contentCount: 33,
      owner: "LA",
      hue: "e",
      updated: hoursAgo(1),
    },
    {
      id: "prj-wanderly",
      name: "Wanderly Product Descriptions",
      client: "Wanderly Travel",
      type: "Product description",
      status: "draft",
      progress: 15,
      contentCount: 6,
      owner: "PN",
      hue: "c",
      updated: daysAgo(2),
    },
    {
      id: "prj-solstice",
      name: "Solstice CRM Sequences",
      client: "Solstice Wellness",
      type: "Email",
      status: "active",
      progress: 30,
      contentCount: 9,
      owner: "TJ",
      hue: "d",
      updated: daysAgo(1),
    },
    {
      id: "prj-havenly",
      name: "Havenly Rebrand Copy",
      client: "Havenly Interiors",
      type: "Blog post",
      status: "archived",
      progress: 100,
      contentCount: 27,
      owner: "DK",
      hue: "b",
      updated: daysAgo(19),
    },
    {
      id: "prj-nimbus",
      name: "Nimbus API Docs Voice",
      client: "Nimbus Cloud",
      type: "Blog post",
      status: "draft",
      progress: 8,
      contentCount: 2,
      owner: "DK",
      hue: "b",
      updated: daysAgo(4),
    },
    {
      id: "prj-ferro",
      name: "Ferro Fitness Socials",
      client: "Ferro Fitness",
      type: "Social caption",
      status: "active",
      progress: 76,
      contentCount: 41,
      owner: "LA",
      hue: "e",
      updated: minutesAgo(12),
    },
    {
      id: "prj-quill",
      name: "Quill & Co. Newsletter",
      client: "Quill & Co.",
      type: "Email",
      status: "review",
      progress: 84,
      contentCount: 15,
      owner: "PN",
      hue: "c",
      updated: hoursAgo(5),
    },
  ];

  const GENERATIONS = [
    {
      id: "gen-1",
      projectId: "prj-ferro",
      type: "Social caption",
      tone: "Playful",
      language: "English",
      prompt: "Announce our new resistance-band bundle to a fitness-focused audience.",
      excerpt:
        "New drop: the Ferro Resistance Set. Three bands, zero excuses. Built for the days you can't make it to the gym — and the days you don't want to.",
      wordCount: 42,
      createdAt: minutesAgo(12),
    },
    {
      id: "gen-2",
      projectId: "prj-pineforge",
      type: "Blog post",
      tone: "Confident",
      language: "English",
      prompt: "Outline a blog post on choosing a first backpacking tent.",
      excerpt:
        "Choosing your first backpacking tent comes down to three trade-offs: weight, weather resistance, and livable space. Here's how to weigh each one against how — and where — you actually camp.",
      wordCount: 68,
      createdAt: minutesAgo(35),
    },
    {
      id: "gen-3",
      projectId: "prj-lumen",
      type: "Ad copy",
      tone: "Persuasive",
      language: "English",
      prompt: "Short ad contrasting Lumen smart bulbs with a traditional bulb.",
      excerpt:
        "Your old bulb does one thing. Lumen does mornings, movie nights, and everything between — from your phone, in one tap.",
      wordCount: 27,
      createdAt: hoursAgo(1),
    },
    {
      id: "gen-4",
      projectId: "prj-fintra",
      type: "Email",
      tone: "Friendly",
      language: "English",
      prompt: "Welcome email for a new Fintra customer after signup.",
      excerpt:
        "Welcome to Fintra — you're one step from your first budget that actually sticks. Here's what happens next, and the two things worth doing today.",
      wordCount: 51,
      createdAt: hoursAgo(3),
    },
    {
      id: "gen-5",
      projectId: "prj-quill",
      type: "Email",
      tone: "Professional",
      language: "English",
      prompt: "Newsletter intro recapping this month's editorial picks.",
      excerpt:
        "Three stories worth your Sunday coffee this month: a founder's honest post-mortem, a design system teardown, and the pricing page that quietly doubled conversions.",
      wordCount: 58,
      createdAt: hoursAgo(5),
    },
    {
      id: "gen-6",
      projectId: "prj-solstice",
      type: "Email",
      tone: "Empathetic",
      language: "English",
      prompt: "Re-engagement email for members who haven't logged a session in 30 days.",
      excerpt:
        "It's been a minute. No guilt trip here — just a reminder that your plan is still exactly where you left it, and a five-minute session counts too.",
      wordCount: 49,
      createdAt: hoursAgo(7),
    },
    {
      id: "gen-7",
      projectId: "prj-aurora",
      type: "Social caption",
      tone: "Playful",
      language: "English",
      prompt: "Caption for a carousel post revealing the new packaging.",
      excerpt:
        "New look, same glow-up formula. Swipe to see the packaging redesign we've been sitting on for three months (it was hard to keep quiet).",
      wordCount: 34,
      createdAt: daysAgo(1),
    },
    {
      id: "gen-8",
      projectId: "prj-wanderly",
      type: "Product description",
      tone: "Confident",
      language: "English",
      prompt: "Product description for a 40L carry-on travel backpack.",
      excerpt:
        "40 litres, one bag, zero checked fees. The Wanderly Carry-On is built for the traveler who packs light and moves fast — laptop sleeve, compression straps, and a shell that shrugs off rain.",
      wordCount: 72,
      createdAt: daysAgo(2),
    },
    {
      id: "gen-9",
      projectId: "prj-havenly",
      type: "Blog post",
      tone: "Professional",
      language: "English",
      prompt: "Case study recap based on a client testimonial about a living-room redesign.",
      excerpt:
        "When the Alvarez family called Havenly, their living room hadn't changed in a decade. Six weeks later, the space does double duty as a home office — without losing an inch of warmth.",
      wordCount: 61,
      createdAt: daysAgo(6),
    },
    {
      id: "gen-10",
      projectId: "prj-ferro",
      type: "Social caption",
      tone: "Confident",
      language: "English",
      prompt: "Caption highlighting a member transformation story.",
      excerpt:
        "Twelve weeks, three sessions a week, no shortcuts. Marcus didn't change his life overnight — he just showed up. That part's on you.",
      wordCount: 29,
      createdAt: daysAgo(3),
    },
    {
      id: "gen-11",
      projectId: "prj-lumen",
      type: "Ad copy",
      tone: "Playful",
      language: "English",
      prompt: "Ad copy for a Lumen holiday bundle discount.",
      excerpt:
        "Your living room called. It wants mood lighting for the holidays and it's tired of asking twice. Bundle and save — through Sunday only.",
      wordCount: 31,
      createdAt: daysAgo(4),
    },
    {
      id: "gen-12",
      projectId: "prj-pineforge",
      type: "Blog post",
      tone: "Friendly",
      language: "English",
      prompt: "Intro paragraph for a beginner's guide to trail cooking.",
      excerpt:
        "You don't need a camp kitchen to eat well on trail — you need three ingredients you already like, one pot, and about ten minutes of patience.",
      wordCount: 44,
      createdAt: daysAgo(5),
    },
  ];

  const TEMPLATES = [
    {
      id: "tpl-launch",
      name: "Product Launch Announcement",
      description: "Hype-building caption for a new product drop.",
      category: "Social caption",
      uses: 214,
      icon: "sparkle",
    },
    {
      id: "tpl-newsletter",
      name: "Weekly Newsletter Intro",
      description: "Warm, on-brand opener for your weekly send.",
      category: "Email",
      uses: 158,
      icon: "mail",
    },
    {
      id: "tpl-seo",
      name: "SEO Blog Outline",
      description: "Structured outline with headings for a target keyword.",
      category: "Blog post",
      uses: 302,
      icon: "layout",
    },
    {
      id: "tpl-compare",
      name: "Feature Comparison Ad",
      description: "Short, punchy copy contrasting you vs. the status quo.",
      category: "Ad copy",
      uses: 96,
      icon: "chart",
    },
    {
      id: "tpl-pdp",
      name: "Product Description — E-commerce",
      description: "Benefit-led description for a store listing.",
      category: "Product description",
      uses: 187,
      icon: "tag",
    },
    {
      id: "tpl-case-study",
      name: "Customer Story Recap",
      description: "Turns a testimonial into a short case-study post.",
      category: "Blog post",
      uses: 71,
      icon: "stack",
    },
    {
      id: "tpl-video",
      name: "Video Script — 30s Explainer",
      description: "Hook, problem, solution, and a CTA in 30 seconds.",
      category: "Video script",
      uses: 54,
      icon: "globe",
    },
    {
      id: "tpl-winback",
      name: "Re-engagement Email",
      description: "Wins back inactive subscribers with a friendly nudge.",
      category: "Email",
      uses: 129,
      icon: "refresh",
    },
  ];

  const NOTIFICATIONS = [
    {
      id: "ntf-1",
      title: "Generation complete",
      body: 'Your blog outline for "Pineforge Blog Refresh" is ready to review.',
      type: "success",
      read: false,
      createdAt: minutesAgo(35),
    },
    {
      id: "ntf-2",
      title: "Credits running low",
      body: "You've used 82% of this month's word credits.",
      type: "warning",
      read: false,
      createdAt: hoursAgo(2),
    },
    {
      id: "ntf-3",
      title: "Project moved to review",
      body: '"Quill & Co. Newsletter" was marked In review by Priya Nandi.',
      type: "info",
      read: false,
      createdAt: hoursAgo(5),
    },
    {
      id: "ntf-4",
      title: "Weekly summary",
      body: "You generated 12,400 words across 6 projects last week.",
      type: "info",
      read: true,
      createdAt: daysAgo(1),
    },
    {
      id: "ntf-5",
      title: "New teammate joined",
      body: "Diego Kade joined Brightloop Studio.",
      type: "info",
      read: true,
      createdAt: daysAgo(2),
    },
    {
      id: "ntf-6",
      title: "Template updated",
      body: '"SEO Blog Outline" got a refreshed structure.',
      type: "info",
      read: true,
      createdAt: daysAgo(3),
    },
    {
      id: "ntf-7",
      title: "Generation complete",
      body: 'Ad copy for "Lumen Ad Sprint — Q3" is ready.',
      type: "success",
      read: true,
      createdAt: daysAgo(4),
    },
    {
      id: "ntf-8",
      title: "Billing reminder",
      body: "Your Pro plan renews in 5 days.",
      type: "warning",
      read: true,
      createdAt: daysAgo(5),
    },
  ];

  const ACTIVITY = [
    { id: "act-1", actor: "Sofia Marek", action: "generated", target: "3 social captions for Ferro Fitness", time: minutesAgo(12) },
    { id: "act-2", actor: "Priya Nandi", action: "moved", target: "Quill & Co. Newsletter to In review", time: hoursAgo(5) },
    { id: "act-3", actor: "Theo James", action: "generated", target: "a welcome email for Fintra", time: hoursAgo(3) },
    { id: "act-4", actor: "Sofia Marek", action: "updated", target: "the Pineforge Blog Refresh outline", time: minutesAgo(35) },
    { id: "act-5", actor: "Lina Ahn", action: "used template", target: "Product Launch Announcement", time: daysAgo(1) },
    { id: "act-6", actor: "Diego Kade", action: "archived", target: "Havenly Rebrand Copy", time: daysAgo(19) },
    { id: "act-7", actor: "Diego Kade", action: "created project", target: "Nimbus API Docs Voice", time: daysAgo(4) },
    { id: "act-8", actor: "Sofia Marek", action: "invited", target: "a new teammate to Brightloop Studio", time: daysAgo(2) },
  ];

  // Deterministic-looking but organic 90-day usage series (words / day).
  function buildUsageSeries(days) {
    const series = [];
    let base = 2400;
    for (let i = 0; i < days; i += 1) {
      const weekday = new Date(Date.now() - (days - i) * DAY).getDay();
      const weekendDip = weekday === 0 || weekday === 6 ? 0.55 : 1;
      const drift = Math.sin(i / 6) * 380 + Math.sin(i / 17) * 260;
      const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const jitter = (noise - Math.floor(noise)) * 520 - 260;
      base += 6.5; // slow upward trend
      const value = Math.max(300, Math.round((base + drift + jitter) * weekendDip));
      series.push(value);
    }
    return series;
  }

  const ANALYTICS = {
    usageByDay: buildUsageSeries(90),
    contentByType: [
      { type: "Blog post", value: 32 },
      { type: "Social caption", value: 27 },
      { type: "Email", value: 21 },
      { type: "Ad copy", value: 12 },
      { type: "Product description", value: 8 },
    ],
    performance: [
      { project: "Aurora Skincare", views: 18400, engagement: 6.8, ctr: 3.1 },
      { project: "Ferro Fitness", views: 24100, engagement: 8.4, ctr: 4.2 },
      { project: "Pineforge Outdoors", views: 12950, engagement: 5.1, ctr: 2.4 },
      { project: "Lumen Home", views: 15680, engagement: 4.6, ctr: 2.9 },
      { project: "Quill & Co.", views: 9200, engagement: 7.2, ctr: 3.6 },
      { project: "Fintra", views: 7100, engagement: 3.9, ctr: 2.1 },
    ],
    topContent: [
      { title: "Ferro Resistance Set launch caption", project: "Ferro Fitness", type: "Social caption", score: 94 },
      { title: "Backpacking tent buying guide", project: "Pineforge Outdoors", type: "Blog post", score: 89 },
      { title: "Holiday bundle ad — v2", project: "Lumen Home", type: "Ad copy", score: 85 },
      { title: "Packaging reveal carousel", project: "Aurora Skincare", type: "Social caption", score: 81 },
      { title: "Editorial picks — monthly", project: "Quill & Co.", type: "Email", score: 77 },
    ],
  };

  const STATS = [
    { id: "words", label: "Words generated", value: 128400, format: "compact", delta: 12.4, period: "vs. last 30 days" },
    { id: "projects", label: "Active projects", value: 14, format: "number", delta: 2, period: "new this month" },
    { id: "speed", label: "Avg. generation time", value: "3.2s", format: "raw", delta: -8.1, period: "faster than last month" },
    { id: "credits", label: "Credits remaining", value: 4200, total: 10000, format: "credits", period: "resets in 12 days" },
  ];

  window.Nexa = window.Nexa || {};
  window.Nexa.data = {
    WORKSPACE,
    USER,
    TEAM,
    NAV_ITEMS,
    STATUS_META,
    CONTENT_TYPES,
    TONES,
    LANGUAGES,
    PROJECTS,
    GENERATIONS,
    TEMPLATES,
    NOTIFICATIONS,
    ACTIVITY,
    ANALYTICS,
    STATS,
  };
})();
