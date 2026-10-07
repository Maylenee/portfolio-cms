/**
 * Konten BAWAAN (seed). Dipakai hanya saat KV masih kosong atau API tidak bisa dijangkau
 * (mis. saat dev lokal tanpa edge function). Konten asli diedit lewat panel /#/admin
 * dan disimpan di EdgeOne KV, jadi tidak perlu mengubah file ini.
 */
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const defaultContent = {
  settings: { accent: '#ffdb70', siteTitle: 'Lukman Adiyatna' },
  profile: { name: 'Lukman Adiyatna', avatar: '' },
  tabs: [
    { id: 'home', label: 'Home', visible: true },
    { id: 'resume', label: 'Resume', visible: true },
    { id: 'activity', label: 'Activity', visible: true },
    { id: 'lists', label: 'Lists', visible: true },
    { id: 'about', label: 'About', visible: true },
  ],
  posts: [
    {
      id: 'p1',
      title: 'Yang Menanam dan Yang Menyiram',
      excerpt: 'Untuk Ibu, yang menanamku. Untuk Bibi, yang menyiramku…',
      body: 'Untuk Ibu, yang menanamku.\n\nUntuk Bibi, yang menyiramku.\n\nTulisan ini bisa diganti dari panel admin.',
      image: '',
      publishedAt: hoursAgo(4),
      published: true,
    },
    {
      id: 'p2',
      title: 'Biru yang Kita Minum Pelan-Pelan',
      excerpt: 'Tentang masa remaja: cerah sekaligus sendu, dan baru…',
      body: 'Tentang masa remaja: cerah sekaligus sendu, dan baru dimengerti belakangan.\n\nTulisan ini bisa diganti dari panel admin.',
      image: '',
      publishedAt: hoursAgo(26),
      published: true,
    },
  ],
  resume: {
    sections: [
      {
        id: 's-edu',
        title: 'Education',
        items: [
          { id: 'e1', title: 'University school of the arts', period: '2007 — 2008', description: 'Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.' },
          { id: 'e2', title: 'New york academy of art', period: '2006 — 2007', description: 'Ratione voluptatem sequi nesciunt, facere quisquams facere menda ossimus, omnis voluptas assumenda est omnis..' },
          { id: 'e3', title: 'High school of art and design', period: '2002 — 2004', description: 'Duis aute irure dolor in reprehenderit in voluptate, quila voluptas mag odit aut fugit, sed consequuntur magni dolores eos.' },
        ],
      },
      {
        id: 's-exp',
        title: 'Experience',
        items: [
          { id: 'x1', title: 'Creative director', period: '2015 — Present', description: 'Nemo enim ipsam voluptatem blanditiis praesentium voluptum delenit atque corrupti, quos dolores et qvuas molestias exceptur.' },
          { id: 'x2', title: 'Art director', period: '2013 — 2015', description: 'Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.' },
          { id: 'x3', title: 'Web designer', period: '2010 — 2013', description: 'Nemo enims ipsam voluptatem, blanditiis praesentium voluptum delenit atque corrupti, quos dolores et quas molestias exceptur.' },
        ],
      },
    ],
  },
  activity: [
    { id: 'a1', text: 'Menerbitkan “Yang Menanam dan Yang Menyiram”', date: hoursAgo(4) },
    { id: 'a2', text: 'Menerbitkan “Biru yang Kita Minum Pelan-Pelan”', date: hoursAgo(26) },
    { id: 'a3', text: 'Memperbarui halaman Resume', date: hoursAgo(72) },
  ],
  lists: [
    { id: 'l1', title: 'Tulisan tentang keluarga', description: 'Koleksi', postIds: ['p1'] },
    { id: 'l2', title: 'Tulisan tentang masa remaja', description: 'Koleksi', postIds: ['p2'] },
  ],
  about: {
    paragraphs: [
      'Exploring the frontier of AI agents — building autonomous systems that reason, learn, and act intelligently.',
      "I'm endlessly curious about AI and love exploring what is possible with it. Every new model, tool, and technique feels like a new door to open, and I enjoy experimenting, breaking things, and learning by building.",
      'I am just as enthusiastic about sharing the journey, so I write articles often, turning what I learn about AI agents into clear, useful notes for anyone getting started.',
    ],
    servicesTitle: "What i'm doing",
    services: [
      { id: 'sv1', icon: 'bot', title: 'AI agents', description: 'Designing and building autonomous agents that reason, plan, and take action.' },
      { id: 'sv2', icon: 'article', title: 'Written articles', description: 'Writing articles often about AI agents, what I am learning, and how I build.' },
      { id: 'sv3', icon: 'code', title: 'LLM applications', description: 'Building applications powered by large language models, from prototype to production.' },
      { id: 'sv4', icon: 'workflow', title: 'Automation', description: 'Connecting tools and workflows so agents can handle repetitive work.' },
    ],
  },
};
