using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("OrderItems")]
    public class OrderItem : BaseModel
    {
        [PrimaryKey("id")] public long Id { get; set; }
        [Column("order_id")] public string OrderId { get; set; }
        [Column("item_name")] public string ItemName { get; set; }
        [Column("quantity")] public double Quantity { get; set; }
        [Column("price")] public double Price { get; set; }
    }
}