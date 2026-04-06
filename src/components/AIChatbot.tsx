import { useState, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User } from 'lucide-react'
import type { BuyerProfile } from '@/lib/types'

interface AIChatbotProps {
  buyerProfile: BuyerProfile
}

const WELCOME_MESSAGE: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hi! I'm your MN homebuying guide. I can help you understand programs like Minnesota Housing Start Up, the First-Gen DPA Fund, and what steps to take next. What questions do you have?",
    },
  ],
}

export function AIChatbot({ buyerProfile }: AIChatbotProps) {
  const [inputValue, setInputValue] = useState('')

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat', body: { buyerProfile } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: [WELCOME_MESSAGE],
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ role: 'user', parts: [{ type: 'text', text: inputValue }] })
    setInputValue('')
  }

  // Extract text from message parts
  const getMessageText = (msg: UIMessage): string => {
    if (!msg.parts?.length) return ''
    return msg.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join('')
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50 rounded-t-lg">
        <Bot className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-sm">MN Homebuying Coach</span>
        <span className="ml-auto text-xs text-slate-400">Powered by AI · Not financial advice</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                m.role === 'user' ? 'bg-blue-100' : 'bg-slate-100'
              }`}>
                {m.role === 'user'
                  ? <User className="h-4 w-4 text-blue-600" />
                  : <Bot className="h-4 w-4 text-slate-600" />}
              </div>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {getMessageText(m)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-slate-600" />
              </div>
              <div className="bg-slate-100 rounded-lg rounded-tl-none px-3 py-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ask about down payment help, credit, loan types…"
          disabled={isLoading}
          className="flex-1 text-sm"
        />
        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
