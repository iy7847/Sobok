using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Newtonsoft.Json;

namespace ProfitMate_V2.Models
{
    [Table("BOMs")]
    public class BOM : BaseModel
    {
        [PrimaryKey("id")] public long Id { get; set; }
        [Column("parent_item_id")] public long ParentItemId { get; set; }
        [Column("child_item_id")] public long ChildItemId { get; set; }
        [Column("quantity")] public double Quantity { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }

        // [박일용] 추가: 나중을 위한 여유 필드 & 비고
        [Column("extra_1")] public string? Extra1 { get; set; }
        [Column("extra_2")] public string? Extra2 { get; set; }
        [Column("extra_3")] public string? Extra3 { get; set; }
        [Column("extra_4")] public string? Extra4 { get; set; }
        [Column("extra_5")] public string? Extra5 { get; set; }
        [Column("remarks")] public string? Remarks { get; set; }

        // 수동 조인용 속성 (DB 매핑 안 함)
        [JsonIgnore]
        public Item? ChildItem { get; set; }
    }
}