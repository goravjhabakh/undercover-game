import Instructions from "./Instructions"

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-black tracking-[0.2em] text-primary transition-colors hover:text-primary/90 cursor-default select-none">
            UNDERCOVER
          </span>
        </div>
        
        <Instructions />
      </div>
    </nav>
  )
}
export default Navbar