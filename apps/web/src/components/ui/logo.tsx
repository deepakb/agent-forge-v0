import Image from 'next/image'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Image
        src="/logos/agent-forge.svg"
        alt="Agent Forge Logo"
        width={36}
        height={36}
        className="w-9 h-9"
        priority
      />
    </div>
  )
}
