export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <img
        src="/logos/agent-forge.svg"
        alt="Agent Forge Logo"
        className={`w-9 h-9`}
      />
    </div>
  )
}
