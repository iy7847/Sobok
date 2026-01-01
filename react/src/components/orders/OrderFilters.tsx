import React from 'react';
import { Calendar, Search } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface OrderFiltersProps {
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    activeTab: 'Active' | 'Completed' | 'All';
    setActiveTab: (tab: 'Active' | 'Completed' | 'All') => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
    startDate, endDate, setStartDate, setEndDate,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    activeTab, setActiveTab
}) => {
    return (
        <div className="glass p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> 조회 기간
                    </label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-11"
                            containerClassName="flex-1"
                        />
                        <span className="text-text-muted font-bold">~</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-11"
                            containerClassName="flex-1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                        <Search size={14} /> 고객명/연락처 검색
                    </label>
                    <Input
                        placeholder="이름 또는 전화번호..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search size={18} />}
                        className="h-11"
                    />
                </div>

                <Select
                    label="상태 필터"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11"
                    options={[
                        { value: "All", label: "전체 상태 보기" },
                        { value: "신규", label: "🔴 신규 주문" },
                        { value: "확인", label: "🟡 확인 중" },
                        { value: "완료", label: "🟢 처리 완료" },
                        { value: "취소", label: "⚪ 주문 취소" }
                    ]}
                />
            </div>

            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl overflow-x-auto custom-scrollbar no-scrollbar">
                {(['Active', 'Completed', 'All'] as const).map(tab => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? 'secondary' : 'ghost'}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-[80px] md:min-w-[120px] py-2.5 md:py-3 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold ${activeTab === tab ? 'shadow-sm text-primary' : 'text-text-muted hover:text-primary'}`}
                    >
                        {tab === 'Active' ? '미완료 주문' : tab === 'Completed' ? '처리 완료/취소' : '전체 내역'}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default OrderFilters;
