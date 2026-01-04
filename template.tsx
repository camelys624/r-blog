import React, { useState } from 'react';
import {
  Search,
  Menu,
  Clock,
  User,
  Share2,
  ArrowLeft,
  Github,
  Twitter,
  Instagram
} from 'lucide-react';

// --- 模拟数据 ---
const POSTS = [
  {
    id: 1,
    title: "探索极简主义设计的未来趋势",
    excerpt: "设计不仅仅是外观，更是功能。在当今信息爆炸的时代，如何通过减少视觉噪音来提升用户体验？本文将深入探讨极简主义在数字产品中的应用...",
    category: "设计",
    author: "张小白",
    date: "2023-10-24",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "React Server Components 深度解析",
    excerpt: "随着 React 18 的普及，服务器组件成为了开发者讨论的热点。它们如何改变我们的开发模式？性能提升的底层逻辑是什么？",
    category: "技术",
    author: "陈技术",
    date: "2023-10-22",
    readTime: "12 min",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "摄影的艺术：捕捉光影的瞬间",
    excerpt: "光影是摄影的灵魂。学会观察光线的方向、质感和色彩，能让你的作品从平庸变得富有故事感。这里有五个进阶摄影技巧分享给你。",
    category: "生活",
    author: "林光影",
    date: "2023-10-20",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"
  }
];

// --- 导航栏组件 ---
const Navbar = ({ onHome }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
      <div 
        className="text-2xl font-black tracking-tighter cursor-pointer" 
        onClick={onHome}
      >
        MIND<span className="text-indigo-600">POST</span>
      </div>
      
      <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-gray-600">
        <a href="#" className="hover:text-indigo-600 transition">首页</a>
        <a href="#" className="hover:text-indigo-600 transition">分类</a>
        <a href="#" className="hover:text-indigo-600 transition">专栏</a>
        <a href="#" className="hover:text-indigo-600 transition">关于</a>
      </div>

      <div className="flex items-center space-x-6">
        <button className="p-2 text-gray-400 hover:text-indigo-600 transition">
          <Search className="w-5 h-5" />
        </button>
        <button className="md:hidden p-2">
          <Menu className="w-6 h-6" />
        </button>
        <button className="hidden md:block px-5 py-2.5 bg-gray-900 text-white text-sm rounded-full font-medium hover:bg-gray-800 transition">
          订阅
        </button>
      </div>
    </div>
  </nav>
);

// --- 列表页组件 ---
const ListView = ({ onPostClick }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* 热门文章展示 */}
      <section className="mb-20">
        <div 
          className="group relative h-[500px] w-full rounded-3xl overflow-hidden cursor-pointer"
          onClick={() => onPostClick(POSTS[0])}
        >
          <img 
            src={POSTS[0].image} 
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
              {POSTS[0].category}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-3xl">
              {POSTS[0].title}
            </h2>
            <div className="flex items-center text-gray-300 text-sm space-x-4">
              <span className="flex items-center"><User className="w-4 h-4 mr-2" /> {POSTS[0].author}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {POSTS[0].readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {POSTS.slice(1).map(post => (
          <article key={post.id} className="group cursor-pointer" onClick={() => onPostClick(post)}>
            <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6">
              <img 
                src={post.image} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                alt={post.title} 
              />
            </div>
            <div className="space-y-3">
              <div className="text-indigo-600 text-xs font-bold uppercase tracking-widest">{post.category}</div>
              <h3 className="text-2xl font-bold group-hover:text-indigo-600 transition">{post.title}</h3>
              <p className="text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center pt-2 text-sm text-gray-400">
                <span>{post.date}</span>
                <span className="mx-2">·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// --- 详情页组件 ---
const PostDetail = ({ post, onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-indigo-600 mb-10 transition group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition" />
          返回列表
        </button>

        <header className="mb-12">
          <div className="text-indigo-600 font-bold mb-4 uppercase tracking-widest text-sm">{post.category}</div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between border-y border-gray-100 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${post.author}`} alt="avatar" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{post.author}</div>
                <div className="text-sm text-gray-400">{post.date} · {post.readTime}阅读</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>
        </header>

        <img src={post.image} className="w-full rounded-3xl mb-12" alt="Main" />

        <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
          <p className="mb-6 text-xl font-medium text-gray-900 leading-relaxed italic border-l-4 border-indigo-600 pl-6">
            “ {post.excerpt} ”
          </p>
          <p className="mb-6">
            极简主义不仅仅是视觉上的简洁，它更是一种对核心价值的追求。在设计中，这意味着我们要不断询问：这个元素是否真的必要？它是否为用户提供了价值？如果答案是否定的，我们就应该果断地将其移除。
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">减少噪音的艺术</h2>
          <p className="mb-6">
            在一个充满干扰的世界里，能够让用户集中注意力的产品才是真正成功的产品。我们通过留白、清晰的层级结构和直观的交互方式来实现这一点。这不仅仅是为了美观，更是为了减轻用户的认知负荷。
          </p>
          <div className="bg-gray-50 p-8 rounded-2xl my-10 flex items-center space-x-6">
             <div className="text-4xl font-serif text-indigo-300">“</div>
             <div className="text-gray-600">好的设计是尽可能少的设计，回归本源，回归纯粹。</div>
          </div>
        </div>

        <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-6 md:mb-0">
            <Github className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-900 transition" />
            <Twitter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-900 transition" />
            <Instagram className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-900 transition" />
          </div>
          <div className="text-gray-400 text-sm">© 2023 MindPost. All rights reserved.</div>
        </footer>
      </div>
    </div>
  );
};

// --- 主入口组件 ---
export default function App() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="font-sans antialiased text-gray-900 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar onHome={() => setSelectedPost(null)} />
      
      {selectedPost ? (
        <PostDetail 
          post={selectedPost} 
          onBack={() => setSelectedPost(null)} 
        />
      ) : (
        <ListView onPostClick={(post) => setSelectedPost(post)} />
      )}
    </div>
  );
}