import Skeleton from './Skeleton';

export default function MetricCard({ label, value, sub, color, icon, delay = 0, loaded }) {
  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3"
      style={{ animation: `fadeIn 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) both` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {loaded ? (
        <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      ) : (
        <Skeleton className="h-8 w-32" />
      )}
      {sub && (
        <p className="text-xs text-zinc-600">{sub}</p>
      )}
    </div>
  );
}