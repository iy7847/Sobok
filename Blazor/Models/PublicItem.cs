using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Newtonsoft.Json;

namespace ProfitMate_V2.Models
{
    [Table("PublicItems")]
    public class PublicItem : BaseModel
    {
        [PrimaryKey("id")] public long Id { get; set; }
        [Column("user_id")] public string ShopId { get; set; }
        [Column("name")] public string Name { get; set; }
        [Column("selling_price")] public double SellingPrice { get; set; }

        // [중요] 화면에서 수량 계산용으로 사용 (DB 저장 안 함)
        [JsonIgnore]
        public double OrderQty { get; set; } = 0;
    }
}