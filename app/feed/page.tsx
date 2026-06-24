'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface FeedPost {
  id: string
  content: string
  photo: string
  likeCount: number
  likedByMe: boolean
  createdAt: string
  author: { id: string; name: string; avatar: string } | null
  pet: { id: string; name: string; breed: string; photo: string } | null
  comments: { id: string; text: string; author: { name: string; avatar: string } | null }[]
}

interface MyPet { id: string; name: string; photo: string }

function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000))
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  return hrs < 24 ? `${hrs}h` : `${Math.round(hrs / 24)}d`
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [myPets, setMyPets] = useState<MyPet[]>([])
  const [newPost, setNewPost] = useState({ petId: '', content: '' })
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    const [feedRes, petsRes] = await Promise.all([
      fetch('/api/feed'),
      fetch('/api/pets?mine=1'),
    ])
    if (feedRes.ok) setPosts((await feedRes.json()).posts)
    if (petsRes.ok) {
      const pets = (await petsRes.json()).pets as MyPet[]
      setMyPets(pets)
      setNewPost(p => ({ ...p, petId: p.petId || pets[0]?.id || '' }))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createPost = async () => {
    if (!newPost.content.trim() || !newPost.petId) return
    setPosting(true)
    const res = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    })
    if (res.ok) {
      setNewPost(p => ({ ...p, content: '' }))
      await load()
    }
    setPosting(false)
  }

  const toggleLike = async (postId: string) => {
    const res = await fetch(`/api/feed/${postId}/like`, { method: 'POST' })
    if (res.ok) {
      const { liked, likeCount } = await res.json()
      setPosts(ps => ps.map(p => (p.id === postId ? { ...p, likedByMe: liked, likeCount } : p)))
    }
  }

  const addComment = async (postId: string) => {
    const text = commentDrafts[postId]?.trim()
    if (!text) return
    const res = await fetch(`/api/feed/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (res.ok) {
      setCommentDrafts(d => ({ ...d, [postId]: '' }))
      await load()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />
      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Composer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          {myPets.length === 0 ? (
            <p className="text-sm text-gray-500">
              <Link href="/pets" className="text-rose-500 font-semibold">Add your first pet</Link> to start posting 🐾
            </p>
          ) : (
            <>
              <div className="flex gap-2 mb-2">
                <select
                  value={newPost.petId}
                  onChange={e => setNewPost(p => ({ ...p, petId: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                  aria-label="Post as pet"
                >
                  {myPets.map(p => <option key={p.id} value={p.id}>{p.photo} {p.name}</option>)}
                </select>
                <input
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && createPost()}
                  placeholder="What did your pet do today?"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <button
                onClick={createPost}
                disabled={posting || !newPost.content.trim()}
                className="w-full bg-rose-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-rose-600 disabled:opacity-50"
              >
                {posting ? 'Posting…' : 'Post 📸'}
              </button>
            </>
          )}
        </div>

        {loading && <p className="text-center text-gray-400 py-10">Loading feed…</p>}

        {posts.map(post => (
          <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-3">
              <span className="text-2xl">{post.author?.avatar ?? '🙂'}</span>
              <div className="flex-1">
                <span className="font-semibold text-sm text-gray-900">{post.author?.name}</span>
                {post.pet && (
                  <Link href={`/pets/${post.pet.id}`} className="text-xs text-rose-500 block">
                    {post.pet.photo} {post.pet.name} · {post.pet.breed}
                  </Link>
                )}
              </div>
              <span className="text-xs text-gray-300">{timeAgo(post.createdAt)}</span>
            </div>
            <div className="text-7xl text-center py-8 bg-gradient-to-br from-rose-50 to-purple-50 my-3">{post.photo}</div>
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-800 mb-2">{post.content}</p>
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => toggleLike(post.id)} className="text-sm font-medium" aria-label="Like post">
                  {post.likedByMe ? '❤️' : '🤍'} {post.likeCount}
                </button>
                <span className="text-sm text-gray-400">💬 {post.comments.length}</span>
              </div>
              {post.comments.map(c => (
                <p key={c.id} className="text-xs text-gray-600 mb-1">
                  <span className="font-semibold">{c.author?.name ?? '—'}</span> {c.text}
                </p>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  value={commentDrafts[post.id] ?? ''}
                  onChange={e => setCommentDrafts(d => ({ ...d, [post.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                  placeholder="Add a comment…"
                  className="flex-1 border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-300"
                />
                <button onClick={() => addComment(post.id)} className="text-rose-500 text-xs font-semibold">Send</button>
              </div>
            </div>
          </article>
        ))}

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-400 py-10">No posts yet — be the first! 🐾</p>
        )}

        <div className="text-center pb-4">
          <Link href="/pets" className="text-sm text-rose-500 font-semibold">Manage my pets →</Link>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
