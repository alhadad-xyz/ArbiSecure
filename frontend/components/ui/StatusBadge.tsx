import { motion } from 'framer-motion';
import { Circle, CheckCircle2, AlertTriangle, Trophy } from 'lucide-react';

type DealStatus = 'pending' | 'funded' | 'completed';
type ContractStatus = 0 | 1 | 2 | 3 | 4;

interface StatusBadgeProps {
    status: DealStatus | ContractStatus;
    className?: string;
}

const statusConfig = {
    // Database statuses
    pending: { icon: <Circle className="w-2.5 h-2.5 fill-yellow-400" />, text: 'PENDING', color: 'text-yellow-400' },
    funded: { icon: <Circle className="w-2.5 h-2.5 fill-green-400" />, text: 'FUNDED', color: 'text-green-400' },
    completed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'COMPLETED', color: 'text-blue-400' },

    // Contract statuses (numeric)
    0: { icon: <Circle className="w-2.5 h-2.5 fill-yellow-400" />, text: 'PENDING', color: 'text-yellow-400' },
    1: { icon: <Circle className="w-2.5 h-2.5 fill-green-400" />, text: 'FUNDED', color: 'text-green-400' },
    2: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'RELEASED', color: 'text-blue-400' },
    3: { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'DISPUTED', color: 'text-red-400' },
    4: { icon: <Trophy className="w-3.5 h-3.5" />, text: 'RESOLVED', color: 'text-purple-400' }
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider border border-white/20 rounded-full bg-white/5 ${className}`}
        >
            <span className={config.color}>{config.icon}</span>
            <span className={config.color}>{config.text}</span>
        </motion.div>
    );
}
