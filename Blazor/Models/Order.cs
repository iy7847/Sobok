using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("Orders")]
    public class Order : BaseModel
    {
        [PrimaryKey("id")] public string Id { get; set; }
        [Column("shop_id")] public string ShopId { get; set; }
        [Column("customer_name")] public string CustomerName { get; set; }
        [Column("customer_phone")] public string CustomerPhone { get; set; }
        [Column("total_amount")] public double TotalAmount { get; set; }
        [Column("status")] public string Status { get; set; } = "신규";
        [Column("request_note")] public string RequestNote { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }

        // [중요] 동적 폼 데이터 저장용
        [Column("custom_data")] public object? CustomData { get; set; }
        [Column("remarks")] public string? Remarks { get; set; }

        [Reference(typeof(OrderItem))]
        public List<OrderItem> Items { get; set; } = new();
    }
}