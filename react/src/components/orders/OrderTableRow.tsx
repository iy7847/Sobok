import React from 'react';
import { Phone, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Order } from '../../types';
import { getStatusColor, getStatusLabel, formatDate, formatTime } from '../../utils/formatters';

interface OrderTableRowProps {
    order: Order;
    expanded: boolean;
    onClick: () => void;
    displayFields: { label: string; value: string }[];
}

const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending' || status === '신규') return <AlertCircle className="text-red-400" size={16} />;

    switch (status) {
        case '확인': return <Clock className="text-amber-400" size={16} />;
        case '완료': return <CheckCircle2 className="text-emerald-400" size={16} />;
        case '취소': return <XCircle className="text-gray-400" size={16} />;
        default: return null;
    }
};

const OrderTableRow: React.FC<OrderTableRowProps> = ({ order, expanded, onClick, displayFields }) => {
    return (
        <div
            onClick={onClick}
            className={`hidden md:grid grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-4 px-6 py-5 items-center cursor-pointer transition-all ${expanded ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
        >
            <div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                </span>
            </div>
            <div>
                <div className="font-bold text-lg">{order.customer_name}</div>
                <div className="text-xs text-text-muted flex items-center gap-1"><Phone size={10} /> {order.customer_phone}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-text-main">
                    {order.Items && order.Items.length > 0
                        ? `${order.Items[0].item_name} ${order.Items.length > 1 ? `외 ${order.Items.length - 1}건` : ''}`
                        : (order.custom_data?.selected_product?.name || '상품 정보 없음')
                    }
                </div>
                <div className="flex gap-1 mt-1">
                    {displayFields.slice(0, 2).map((c, i) => (
                        <span key={i} className="text-[10px] bg-gray-100/50 dark:bg-white/5 text-text-muted px-2 py-0.5 rounded border border-gray-200 dark:border-white/5">{c.value}</span>
                    ))}
                </div>
            </div>
            <div className="text-right">
                <div className="font-mono font-bold text-lg text-primary">{order.total_amount.toLocaleString()}원</div>
            </div>
            <div className="text-right flex flex-col items-end">
                <span className="text-xs font-bold text-text-muted">{formatDate(order.created_at)}</span>
                <span className="text-[10px] text-text-muted font-mono">{formatTime(order.created_at)}</span>
            </div>
        </div>
    );
};

export default OrderTableRow;
