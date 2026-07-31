import { SquareTerminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LogKeeperFAB() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/logs')}
      className="absolute top-4 right-4 z-10 p-2.5 bg-[#2d312c]/95 backdrop-blur-md text-[#a4a89d] rounded-full shadow-lg border border-[#4a4b45]/50 hover:bg-[#3d413c] transition-all pointer-events-auto flex items-center justify-center"
      title="Log Keeper"
    >
      <SquareTerminal className="w-4 h-4" />
    </button>
  );
}
