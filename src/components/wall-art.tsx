
export default function WallArt() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/50"></div>
            <div className="absolute -top-24 -right-12 h-64 w-64 rounded-full bg-accent/50"></div>
            
            {/* Sun */}
            <div className="absolute top-16 left-16 h-24 w-24 rounded-full bg-yellow-300/50"></div>
    
            {/* Clouds */}
            <div className="absolute top-20 right-40 h-16 w-32 rounded-full bg-blue-200/50"></div>
            <div className="absolute top-28 right-32 h-12 w-24 rounded-full bg-blue-200/50"></div>
      </div>
    )
}
