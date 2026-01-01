import React from 'react';
import { Phone, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Order } from '../../types';
import { getStatusColor, getStatusLabel, formatDate } from '../../utils/formatters';

interface OrderCardProps {
    order: Order;
    expanded: boolean;
    onClick: () => void;
    displayFields: { label: string; value: string; type?: string }[];
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

const OrderCard: React.FC<OrderCardProps> = ({ order, expanded, onClick, displayFields }) => {
    return (
        <div
            onClick={onClick}
            className={`md:hidden p-4 space-y-4 cursor-pointer transition-all ${expanded ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono self-center">
                        {formatDate(order.created_at)}
                    </span>
                </div>
                <div className="font-mono font-bold text-primary">{order.total_amount.toLocaleString()}원</div>
            </div>

            <div className="space-y-1">
                <div className="font-bold text-lg">{order.customer_name}</div>
                <div className="text-xs text-text-muted flex items-center gap-1">
                    <Phone size={10} /> {order.customer_phone}
                </div>
            </div>

            <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-text-main line-clamp-1">
                    {order.Items && order.Items.length > 0
                        ? `${order.Items[0].item_name} ${order.Items.length > 1 ? `외 ${order.Items.length - 1}건` : ''}`
                        : (order.custom_data?.selected_product?.name || '상품 정보 없음')
                    }
                </div>
                <div className="flex flex-wrap gap-1">
                    {displayFields.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-[10px] bg-white/50 dark:bg-white/5 text-text-muted px-2 py-0.5 rounded border border-gray-200 dark:border-white/5">
                            {c.type === 'FileUpload' ? '📷 사진 첨부됨' : c.value}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
